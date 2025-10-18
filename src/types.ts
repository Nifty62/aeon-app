import config from './data/config.ts';

export type RecapStyle = 'default' | 'simplified';

export type AIProvider = 'gemini' | 'openai' | 'deepseek' | 'anthropic' | 'openrouter';

export type Language = 'en' | 'nl';

export type Theme = 'light' | 'dark';

export type GeminiModel = string;

export interface AIModelSettings {
    gemini: GeminiModel;
    openai: string;
    deepseek: string;
    anthropic: string;
    openrouter: string;
}

export interface RetrySettings {
    analyzeAll: {
        enabled: boolean;
        attempts: number;
    };
    generateRecap: {
        enabled: boolean;
        attempts: number;
    };
}

export interface Currency {
    code: string;
    flag: string;
}

export interface Score {
    score: number;
    rationale: string;
    rawData?: string;
}

export type Indicator = (typeof config.indicators)[number];

export type IndicatorScores = {
    [key in Indicator]?: Score;
};

export interface CurrencyAnalysis {
    scores: IndicatorScores;
    sigmaScore: number;
    direction: string;
    recap?: EconomicRecap;
    eventModifierScore: number;
    eventModifierRationale?: string;
    riskModifier: number;
}

export type AnalysisData = {
    [currencyCode: string]: CurrencyAnalysis | undefined;
};

export interface HistoricalSnapshot {
    date: string; // YYYY-MM-DD
    data: AnalysisData;
}

export type HistoricalData = HistoricalSnapshot[];

export interface SourceSettings {
    [currencyCode: string]: {
        [indicator in string]?: string[];
    };
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    provider: AIProvider;
}

export interface MarketDataApiKey {
    provider: 'alphavantage';
    key: string;
}

export interface DataPoint {
    name: string;
    value: string;
}

export type EventFlag = 'Green Flag' | 'Yellow Flag' | 'Red Flag';

export interface EventModifier {
    id?: string;
    heading: string;
    date?: string;
    flag: EventFlag;
    description: string;
}
  
export interface EconomicRecap {
    scoreModifier: number;
    bias: string;
    narrativeReasoning: string;
    rawData: Record<string, DataPoint[]>;
    eventModifiers: EventModifier[];
    modifierRecommendation: string;
    sources: {
        name: string;
        url: string;
    }[];
}

// Trade Journal Types
export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Open' | 'Closed';

export interface Trade {
    id: string;
    entryDate: string; // ISO string for datetime-local input
    pair: string;
    direction: TradeDirection;
    status: TradeStatus;
    entryPrice: number;
    exitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;
    pnl?: number; // Profit/Loss
    notes?: string;
}

// Risk Sentiment Types
export type RiskSignal = 'Risk-On' | 'Risk-Off' | 'Neutral';
export type RiskConviction = 'High' | 'Medium' | 'Uncertain';


export interface IndicatorDataPoint {
    date: string;
    value: number;
}

export interface IndicatorAnalysis {
    name: string;
    role: string;
    signal: RiskSignal;
    rationale: string;
    data: IndicatorDataPoint[];
    sma20?: IndicatorDataPoint[];
    sma50?: IndicatorDataPoint[];
    levels?: { [key: string]: number };
    userOverrideSignal?: RiskSignal;
}

export type RiskSentimentSymbols = {
    spx: string;
    vix: string;
    audjpy_base: string;
    audjpy_quote: string;
    us10y: string;
}

export interface RiskSentimentAnalysis {
    spx: IndicatorAnalysis;
    vix: IndicatorAnalysis;
    audjpy: IndicatorAnalysis;
    us10y: IndicatorAnalysis;
    conviction: RiskConviction;
    overallSignal: RiskSignal;
    summary: { on: number; off: number; neutral: number };
    userOverrideSignal?: RiskSignal;
    userOverrideConviction?: RiskConviction;
}

export interface FullAppState {
    sourceSettings: SourceSettings;
    apiKeys?: ApiKey[];
    selectedApiKeyId?: string | null;
    marketDataApiKey?: MarketDataApiKey;
    recapStyle: RecapStyle;
    aiModelSettings: AIModelSettings;
    retrySettings: RetrySettings;
    useScoreModifier: boolean;
    useRiskModifier: boolean;
    language: Language;
    theme: Theme;
    analysisData: AnalysisData;
    historicalData: HistoricalData;
    trades: Trade[];
    riskSentiment?: RiskSentimentAnalysis | null;
}