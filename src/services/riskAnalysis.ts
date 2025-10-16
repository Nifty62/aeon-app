import { fetchStockData, fetchFxData, fetchYieldData } from "../api/marketApi";
import type { IndicatorDataPoint, RiskSignal, RiskSentimentAnalysis, MarketDataApiKey, IndicatorAnalysis } from "../types";

// --- CALCULATION UTILITIES ---

const calculateSMA = (data: IndicatorDataPoint[], period: number): IndicatorDataPoint[] => {
    if (data.length < period) return [];
    const sma: IndicatorDataPoint[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.value, 0);
        sma.push({
            date: data[i].date,
            value: sum / period,
        });
    }
    return sma;
};

// --- SIGNAL ANALYSIS FUNCTIONS ---

const analyzeSpx = (data: IndicatorDataPoint[]): Omit<IndicatorAnalysis, 'name' | 'role'> => {
    const sma20 = calculateSMA(data, 20);
    const sma50 = calculateSMA(data, 50);

    const latestPrice = data[data.length - 1]?.value;
    const latestSma20 = sma20[sma20.length - 1]?.value;
    const latestSma50 = sma50[sma50.length - 1]?.value;

    let signal: RiskSignal = 'Neutral';
    let rationale = 'Conditions for a clear trend are not met.';

    if (latestPrice > latestSma20 && latestSma20 > latestSma50) {
        signal = 'Risk-On';
        rationale = 'Price > 20 SMA, and 20 SMA > 50 SMA.';
    } else if (latestPrice < latestSma20 && latestSma20 < latestSma50) {
        signal = 'Risk-Off';
        rationale = 'Price < 20 SMA, and 20 SMA < 50 SMA.';
    }

    return { signal, rationale, data, sma20, sma50 };
};

const analyzeVix = (data: IndicatorDataPoint[]): Omit<IndicatorAnalysis, 'name' | 'role'> => {
    const latestValue = data[data.length - 1]?.value;
    const levels = { low: 20, high: 25 };
    let signal: RiskSignal = 'Neutral';
    let rationale = `VIX is between ${levels.low} and ${levels.high}.`;

    if (latestValue < levels.low) {
        signal = 'Risk-On';
        rationale = `VIX is below the key level of ${levels.low}.`;
    } else if (latestValue > levels.high) {
        signal = 'Risk-Off';
        rationale = `VIX is above the key level of ${levels.high}.`;
    }

    return { signal, rationale, data, levels };
};

const analyzeAudJpy = (data: IndicatorDataPoint[]): Omit<IndicatorAnalysis, 'name' | 'role'> => {
    // Re-uses the same logic as SPX
    const analysis = analyzeSpx(data);
    return { ...analysis, rationale: analysis.rationale.replace('Price', 'AUD/JPY') };
};

const analyzeUs10y = (data: IndicatorDataPoint[]): Omit<IndicatorAnalysis, 'name' | 'role'> => {
    const sma10 = calculateSMA(data, 10);
    const sma30 = calculateSMA(data, 30);
    
    const latestValue = data[data.length - 1]?.value;
    const latestSma10 = sma10[sma10.length - 1]?.value;
    const latestSma30 = sma30[sma30.length - 1]?.value;

    let signal: RiskSignal = 'Neutral';
    let rationale = 'Yield is moving sideways or trend is unclear.';

    if (latestValue > latestSma10 && latestSma10 > latestSma30) {
        signal = 'Risk-On';
        rationale = 'Yield is in a clear uptrend (rising).';
    } else if (latestValue < latestSma10 && latestSma10 < latestSma30) {
        signal = 'Risk-Off';
        rationale = 'Yield is in a clear downtrend (falling).';
    }
    
    return { signal, rationale, data, sma20: sma10, sma50: sma30 };
};

// --- AGGREGATION AND MAIN FUNCTION ---

const getOverallSentiment = (analyses: { [key: string]: IndicatorAnalysis }): Partial<RiskSentimentAnalysis> => {
    const signals = Object.values(analyses).map(a => a.signal);
    const summary = {
        on: signals.filter(s => s === 'Risk-On').length,
        off: signals.filter(s => s === 'Risk-Off').length,
        neutral: signals.filter(s => s === 'Neutral').length,
    };

    let overallSignal: RiskSignal = 'Neutral';
    let conviction: 'High' | 'Medium' | 'Uncertain' = 'Uncertain';

    if (summary.on >= 3) {
        overallSignal = 'Risk-On';
        conviction = 'High';
    } else if (summary.off >= 3) {
        overallSignal = 'Risk-Off';
        conviction = 'High';
    } else if (summary.on === 2 && summary.off <= 1) {
        overallSignal = 'Risk-On';
        conviction = 'Medium';
    } else if (summary.off === 2 && summary.on <= 1) {
        overallSignal = 'Risk-Off';
        conviction = 'Medium';
    }

    return { conviction, overallSignal, summary };
};

export const fetchAndAnalyzeRiskSentiment = async (): Promise<RiskSentimentAnalysis> => {
    const apiKey: MarketDataApiKey = {
        provider: 'alphavantage',
        key: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
    };

    const [spxData, vixData, audjpyData, us10yData] = await Promise.all([
        fetchStockData('SPY', apiKey),       // S&P 500 ETF
        fetchStockData('VIXY', apiKey),      // VIX ETF as proxy
        fetchFxData('AUD', 'JPY', apiKey),
        fetchYieldData(apiKey),
    ]);

    const analyses: { [key: string]: IndicatorAnalysis } = {
        spx: { name: "S&P 500 Index", role: "The Market Trend", ...analyzeSpx(spxData) },
        vix: { name: "VIX Index", role: "The Fear Gauge", ...analyzeVix(vixData) },
        audjpy: { name: "AUD/JPY", role: "The Risk Barometer", ...analyzeAudJpy(audjpyData) },
        us10y: { name: "US 10-Year Yield", role: "The Economic Outlook", ...analyzeUs10y(us10yData) },
    };

    const overall = getOverallSentiment(analyses);

    return {
        ...analyses,
        ...overall,
    } as RiskSentimentAnalysis;
};
