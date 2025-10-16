import type { IndicatorDataPoint, MarketDataApiKey } from "../types";

const API_BASE_URL = 'https://www.alphavantage.co/query';
const CACHE: { [key: string]: { data: IndicatorDataPoint[], timestamp: number } } = {};
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Helper to check cache
const getFromCache = (key: string): IndicatorDataPoint[] | null => {
    const cached = CACHE[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

// Helper to set cache
const setCache = (key: string, data: IndicatorDataPoint[]) => {
    CACHE[key] = { data, timestamp: Date.now() };
};

const fetchData = async (params: URLSearchParams): Promise<any> => {
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Alpha Vantage API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data['Error Message'] || data['Information']) {
        throw new Error(`Alpha Vantage API error: ${data['Error Message'] || data['Information']}`);
    }
    return data;
};

export const fetchStockData = async (symbol: string, apiKey: MarketDataApiKey): Promise<IndicatorDataPoint[]> => {
    const cacheKey = `${symbol}-${apiKey.key.slice(-4)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: 'compact', // ~100 data points
        apikey: apiKey.key,
    });
    
    const data = await fetchData(params);
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) throw new Error(`No time series data found for ${symbol}`);
    
    const parsedData: IndicatorDataPoint[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        value: parseFloat(values['4. close']),
    })).reverse(); // API returns descending, we want ascending

    setCache(cacheKey, parsedData);
    return parsedData;
};

export const fetchFxData = async (from: string, to: string, apiKey: MarketDataApiKey): Promise<IndicatorDataPoint[]> => {
    const symbol = `${from}${to}`;
    const cacheKey = `${symbol}-${apiKey.key.slice(-4)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        function: 'FX_DAILY',
        from_symbol: from,
        to_symbol: to,
        outputsize: 'compact',
        apikey: apiKey.key,
    });
    
    const data = await fetchData(params);
    const timeSeries = data['Time Series FX (Daily)'];
    if (!timeSeries) throw new Error(`No FX time series data found for ${symbol}`);
    
    const parsedData: IndicatorDataPoint[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        value: parseFloat(values['4. close']),
    })).reverse();

    setCache(cacheKey, parsedData);
    return parsedData;
};

export const fetchYieldData = async (apiKey: MarketDataApiKey): Promise<IndicatorDataPoint[]> => {
    const symbol = 'US10Y';
    const cacheKey = `${symbol}-${apiKey.key.slice(-4)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        function: 'TREASURY_YIELD',
        interval: 'daily',
        maturity: '10year',
        apikey: apiKey.key,
    });
    
    const response = await fetchData(params);
    const data = response.data;
    if (!data || !Array.isArray(data)) throw new Error(`No treasury yield data found`);

    const parsedData: IndicatorDataPoint[] = data.map((item: any) => ({
        date: item.date,
        value: parseFloat(item.value),
    })).filter(d => !isNaN(d.value)).reverse(); // API seems to return descending

    setCache(cacheKey, parsedData);
    return parsedData;
};
