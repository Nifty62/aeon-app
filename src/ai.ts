import { GoogleGenAI } from "@google/genai";
import type {
    Currency,
    SourceSettings,
    ApiKey,
    AIModelSettings,
    RetrySettings,
    Indicator,
    IndicatorScores,
    Score,
    EconomicRecap,
    RecapStyle,
} from './types';
import { fetchWithProxy } from './services/scraperUtils';
import { cacheService } from './services/cacheService';
import scoringRules from './data/scoringRules.js';
import { getScoringPrompt, getCentralBankPrompt, getRecapPrompt } from './data/prompts.js';

// --- UTILITY FUNCTIONS ---

/**
 * A simple sleep utility for retries.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Strips HTML and reduces whitespace from a string.
 */
const cleanHtml = (html: string): string => {
    return html
        .replace(/<style[^>]*>.*<\/style>/gs, '') // Remove style blocks
        .replace(/<script[^>]*>.*<\/script>/gs, '') // Remove script blocks
        .replace(/<[^>]+>/g, ' ') // Remove all other tags
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
};

// --- CORE AI CALLER ---

/**
 * A generic function to call an AI provider.
 */
async function callAI(
    prompt: string,
    apiKey: ApiKey,
    aiModelSettings: AIModelSettings
): Promise<string> {
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    
    // Per @google/genai guidelines, Gemini API calls MUST exclusively use process.env.API_KEY.
    if (apiKey.provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = aiModelSettings.gemini || 'gemini-2.5-flash';
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });
            return response.text;
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    } else {
        // TODO: Implement other AI providers like OpenAI, DeepSeek, etc.
        // They would use apiKey.key for authentication.
        console.error(`AI provider "${apiKey.provider}" is not implemented.`);
        throw new Error(`AI provider "${apiKey.provider}" is not implemented.`);
    }
}

/**
 * Parses and validates the JSON response from the AI.
 */
function parseJsonResponse<T>(jsonString: string): T {
    try {
        // The AI might return JSON wrapped in markdown ```json ... ```
        const cleanedString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        return JSON.parse(cleanedString);
    } catch (error) {
        console.error("Failed to parse AI JSON response:", jsonString, error);
        throw new Error("AI returned a malformed JSON response.");
    }
}

// --- ANALYSIS FUNCTIONS ---

/**
 * Analyzes a single economic indicator for a currency.
 */
async function analyzeIndicator(
    currencyCode: string,
    indicator: Indicator,
    urls: string[],
    apiKey: ApiKey,
    aiModelSettings: AIModelSettings,
    log: (entry: string) => void
): Promise<Score> {
    log(`--- Analyzing ${indicator} for ${currencyCode} ---\n`);
    if (urls.length === 0) {
        log(`Status: SKIPPED (No URLs configured)\n\n`);
        throw new Error("No sources configured.");
    }

    let allContent = '';
    for (const url of urls) {
        log(`Fetching URL: ${url}\n`);
        try {
            const html = await fetchWithProxy(url);
            const content = cleanHtml(html);
            allContent += content.substring(0, 5000) + '\n\n'; // Limit content per URL
            log(`Status: SUCCESS\n`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log(`Status: FAILURE - ${errorMessage}\n`);
            // Continue to next URL even if one fails
        }
    }

    if (!allContent.trim()) {
        log(`No content could be fetched for any URL.\n\n`);
        throw new Error("Failed to fetch content from any source.");
    }
    
    log(`Content fetched, sending to AI for analysis...\n`);
    const rules = scoringRules[indicator as keyof typeof scoringRules]?.join('\n') || 'No specific rules provided.';
    const prompt = getScoringPrompt(indicator, currencyCode, rules, allContent.substring(0, 15000));
    
    const responseText = await callAI(prompt, apiKey, aiModelSettings);
    log(`AI Response received.\n\n`);
    
    const result = parseJsonResponse<Score>(responseText);

    // Basic validation
    if (typeof result.score !== 'number' || typeof result.rationale !== 'string') {
        throw new Error('AI response is missing required fields.');
    }
    
    return result;
}

/**
 * Main function to orchestrate the analysis of a currency.
 */
export async function analyzeCurrency(
    currency: Currency,
    sourceSettings: SourceSettings,
    apiKey: ApiKey | undefined,
    aiModelSettings: AIModelSettings,
    retrySettings: RetrySettings,
    setStatusMessage: (message: string) => void,
    log: (entry: string) => void,
    indicatorsToRun?: Indicator[],
    runScoring: boolean = true,
    existingScores?: IndicatorScores,
    force: boolean = false
): Promise<IndicatorScores> {
    if (runScoring && !apiKey) {
        throw new Error("API key is required for scoring analysis.");
    }
    
    const currencySources = sourceSettings[currency.code] || {};
    const indicators = indicatorsToRun || (Object.keys(currencySources) as Indicator[]);
    const newScores: IndicatorScores = {};

    for (const indicator of indicators) {
        // Skip Central Bank as it has a special analyzer component
        if (indicator === 'Central Bank') continue;

        const cacheKey = cacheService.createKey('indicator', { currency: currency.code, indicator });

        if (!force) {
            const cached = cacheService.get<Score>(cacheKey);
            if (cached) {
                newScores[indicator] = cached;
                log(`--- Using cached result for ${indicator} for ${currency.code} ---\n\n`);
                continue;
            }
        }
        
        // Skip scoring if fetch-only mode, but if there's no existing score, we can't do anything.
        if (!runScoring) {
            if (existingScores && existingScores[indicator]) {
                newScores[indicator] = existingScores[indicator];
            }
            continue;
        }

        const urls = currencySources[indicator];
        if (!urls || urls.length === 0) continue;

        setStatusMessage(`Analyzing ${currency.code} - ${indicator}...`);

        const attempts = retrySettings.analyzeAll.enabled ? retrySettings.analyzeAll.attempts : 1;
        for (let i = 0; i < attempts; i++) {
            try {
                // apiKey is checked for undefined at the top of the function if runScoring is true
                const score = await analyzeIndicator(currency.code, indicator, urls, apiKey!, aiModelSettings, log);
                newScores[indicator] = score;
                cacheService.set(cacheKey, score);
                break; // Success, exit retry loop
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                log(`*** ERROR analyzing ${indicator} for ${currency.code} (Attempt ${i + 1}/${attempts}): ${errorMessage} ***\n\n`);
                if (i === attempts - 1) {
                    // This was the last attempt, so we don't set a score
                    setStatusMessage(`Failed to analyze ${currency.code} - ${indicator} after ${attempts} attempts.`);
                    await sleep(2000);
                } else {
                    await sleep(1000); // Wait before retrying
                }
            }
        }
    }
    return newScores;
}

/**
 * Analyzes central bank documents.
 */
export async function analyzeCentralBank(
    currencyCode: string,
    apiKey: ApiKey,
    aiModelSettings: AIModelSettings,
    urls: string[],
    files: File[]
): Promise<Score> {
    let combinedText = '';

    for (const url of urls) {
        try {
            const html = await fetchWithProxy(url);
            combinedText += cleanHtml(html).substring(0, 8000) + '\n\n';
        } catch (error) {
            console.error(`Failed to fetch from URL ${url}:`, error);
            // Don't throw, just skip this source
        }
    }

    for (const file of files) {
        try {
            const text = await file.text();
            combinedText += text.substring(0, 8000) + '\n\n';
        } catch (error) {
            console.error(`Failed to read file ${file.name}:`, error);
        }
    }

    if (!combinedText.trim()) {
        throw new Error("No content from URLs or files could be processed.");
    }
    
    const prompt = getCentralBankPrompt(currencyCode, combinedText.substring(0, 18000));
    const responseText = await callAI(prompt, apiKey, aiModelSettings);
    const result = parseJsonResponse<Score>(responseText);

    if (typeof result.score !== 'number' || typeof result.rationale !== 'string' || typeof result.rawData !== 'string') {
        throw new Error('AI response is missing required fields for central bank analysis.');
    }

    return result;
}

/**
 * Generates an economic recap for a currency.
 */
export async function generateRecap(
    currencyCode: string,
    analysisData: IndicatorScores,
    apiKey: ApiKey,
    aiModelSettings: AIModelSettings,
    recapStyle: RecapStyle
): Promise<EconomicRecap> {
     const prompt = getRecapPrompt(currencyCode, recapStyle, analysisData);
     const responseText = await callAI(prompt, apiKey, aiModelSettings);
     const result = parseJsonResponse<EconomicRecap>(responseText);

     // Basic validation
     if (typeof result.scoreModifier !== 'number' || typeof result.bias !== 'string' || !Array.isArray(result.eventModifiers)) {
         throw new Error('AI response is missing required fields for recap.');
     }

     return result;
}
