import type { Indicator, IndicatorScores, RecapStyle } from '../types';

export const getScoringPrompt = (indicator: Indicator, currencyCode: string, scoringRules: string, rawData: string) => {
    return `
Analyze the following economic data for ${currencyCode} regarding the "${indicator}" indicator.
Based on the data and the provided scoring rules, determine a score from -2 to +2.

**Scoring Rules:**
${scoringRules}

**Raw Data:**
\`\`\`
${rawData}
\`\`\`

Your response MUST be a JSON object with the following structure, and nothing else:
{
  "score": <number between -2 and 2>,
  "rationale": "<brief reasoning for the score, max 2 sentences>",
  "rawData": "<the provided raw data as a string>"
}
`;
};

export const getRecapPrompt = (currencyCode: string, recapStyle: RecapStyle, indicatorData: IndicatorScores) => {
    const indicatorText = Object.entries(indicatorData)
        .filter(([, data]) => data && typeof data.score === 'number') // Ensure data exists
        .map(([indicator, data]) => `- ${indicator}: Score ${data.score}, Rationale: ${data.rationale}`)
        .join('\n');

    const simplifiedStylePrompt = `
You are an economic analyst explaining the situation to a student.
Use simple, clear language. Focus on the main takeaways.
Explain the overall economic bias (e.g., Hawkish, Dovish, Neutral, Risk-On, Risk-Off) and why.
Identify up to 3 major recent news events/data releases that are influencing the currency.
For each event, provide a heading, a date if available, a flag ('Green Flag' for positive, 'Yellow Flag' for neutral/mixed, 'Red Flag' for negative), and a brief description.
Recommend a score modifier (+1, 0, or -1) to apply to the currency's base score based on these recent events.
`;

    const defaultStylePrompt = `
You are a professional economic analyst providing a summary for a trading desk.
Provide a concise, data-driven narrative.
State the overall economic bias (e.g., Hawkish, Dovish, Neutral, Risk-On, Risk-Off) and justify it with data points.
Identify up to 3 significant recent news events or data releases.
For each event, provide a professional heading, a date if available, an impact flag ('Green Flag', 'Yellow Flag', 'Red Flag'), and a brief, professional description of its market implications.
Recommend a score modifier (+1, 0, or -1) to apply to the currency's base score based on the net impact of these events.
`;

    const stylePrompt = recapStyle === 'simplified' ? simplifiedStylePrompt : defaultStylePrompt;

    return `
Analyze the following scored economic indicator data for ${currencyCode}:
${indicatorText}

**Instructions:**
${stylePrompt}

Your response MUST be a JSON object with the following structure, and nothing else. Do not include markdown formatting.
{
  "scoreModifier": <number, either -1, 0, or 1>,
  "bias": "<string, e.g., Hawkish, Dovish, Neutral>",
  "narrativeReasoning": "<string, your detailed analysis>",
  "eventModifiers": [
    {
      "heading": "<string>",
      "date": "<string, optional, e.g., YYYY-MM-DD>",
      "flag": "<'Green Flag' | 'Yellow Flag' | 'Red Flag'>",
      "description": "<string>"
    }
  ],
  "modifierRecommendation": "<string, brief reasoning for the score modifier>"
}
`;
};

export const getCentralBankPrompt = (currencyCode: string, documentText: string) => {
  return `
Analyze the following text from ${currencyCode}'s central bank.
Determine the overall monetary policy sentiment.
Your analysis should result in a score from -2 (Very Dovish) to +2 (Very Hawkish).

**Scoring Rules:**
+2 (Very Hawkish): Explicitly guiding for or executing rate hikes, active quantitative tightening (QT).
+1 (Hawkish): Leaning towards tightening, concerned about inflation overgrowth.
0 (Neutral): Data-dependent, holding rates, no clear bias.
-1 (Dovish): Leaning towards easing, concerned about growth over inflation.
-2 (Very Dovish): Explicitly guiding for or executing rate cuts, active quantitative easing (QE).

**Document Text:**
\`\`\`
${documentText}
\`\`\`

Your response MUST be a JSON object with the following structure, and nothing else:
{
  "score": <number between -2 and 2>,
  "rationale": "<brief reasoning for the score, max 2 sentences, citing key phrases>",
  "rawData": "<a key quote or data point from the text that supports your rationale>"
}
`;
};