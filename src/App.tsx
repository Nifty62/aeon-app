import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Header,
    AnalysisTable,
    SettingsModal,
    AnalysisModal,
    NotificationBar,
    StatusBar,
    WelcomeModal,
    TourModal,
    FeedbackModal,
    TextEntryModal,
} from './components';
import TradeJournalPage from './pages/TradeJournalPage/TradeJournalPage.tsx';
import ChartsPage from './pages/ChartsPage/ChartsPage.tsx';
import RiskSentimentPage from './pages/RiskSentimentPage/RiskSentimentPage.tsx';
import ScrapingLogPage from './pages/ScrapingLogPage/ScrapingLogPage.tsx';
import RecapPage from './pages/RecapPage/RecapPage.tsx';
import EventsPage from './pages/EventsPage/EventsPage.tsx';
import CurrencyPairsTable from './components/CurrencyPairsTable/CurrencyPairsTable.tsx';
import type {
    AnalysisData,
    SourceSettings,
    Indicator,
    Score,
    EconomicRecap,
    RecapStyle,
    AIModelSettings,
    RetrySettings,
    Trade,
    CurrencyAnalysis,
    HistoricalData,
    HistoricalSnapshot,
    FullAppState,
    RiskSentimentAnalysis,
    RiskSignal,
    Theme,
    RiskConviction
} from './types';
import { analyzeCurrency } from './ai.ts';
import { fetchAndAnalyzeRiskSentiment } from './services/riskAnalysis.ts';
import currencies from './data/currencies.ts';
import scoringRules from './data/scoringRules.ts';
import initialSources from './data/initialSources.ts';
import { aiModels } from './data/config.ts';
import { useLocalization } from './context/LocalizationContext.tsx';
import './App.css';


const initializeSources = (): SourceSettings => {
    const sources: SourceSettings = {};
    const { defaultSources, centralBankSources, sourceExceptions } = initialSources;

    currencies.forEach(currency => {
        sources[currency.code] = { ...defaultSources };
        // Assign Central Bank sources
        const cbSource = centralBankSources[currency.code as keyof typeof centralBankSources];
        if (cbSource) {
            sources[currency.code]['Central Bank'] = cbSource;
        }
    });

    // The exceptions are stored as objects with a `url` array property.
    sourceExceptions.forEach(exception => {
        if (sources[exception.currencyCode]) {
            sources[exception.currencyCode][exception.indicator] = exception.url;
        }
    });

    return sources;
};

const calculateMedian = (scores: (number | undefined)[]): number => {
    const validScores = scores.filter((s): s is number => typeof s === 'number').sort((a, b) => a - b);
    if (validScores.length === 0) return 0;

    const mid = Math.floor(validScores.length / 2);
    if (validScores.length % 2 === 0) {
        return (validScores[mid - 1] + validScores[mid]) / 2;
    } else {
        return validScores[mid];
    }
};

const getDirectionFromRelativeScore = (deviation: number): string => {
    if (deviation > 8) return 'Very Bullish';
    if (deviation >= 4) return 'Bullish';
    if (deviation < -8) return 'Very Bearish';
    if (deviation <= -4) return 'Bearish';
    return 'Neutral';
};

export type AnalysisTabName = 'scores' | 'risk' | 'pairs' | 'charts' | 'recap' | 'events' | 'journal' | 'log';

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const { t } = useLocalization();

    // Main View
    const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTabName>('scores');

    // Theme
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) return savedTheme;
        // Default to user's system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    });


    // Analysis Data
    const [analysisData, setAnalysisData] = useState<AnalysisData>(() => {
        try {
            const saved = localStorage.getItem('analysisData');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error("Failed to load analysisData from localStorage", error);
            return {};
        }
    });

     const [historicalData, setHistoricalData] = useState<HistoricalData>(() => {
        try {
            const saved = localStorage.getItem('historicalData');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load historicalData from localStorage", error);
            return [];
        }
    });

    const [riskSentiment, setRiskSentiment] = useState<RiskSentimentAnalysis | null>(() => {
        try {
            const saved = localStorage.getItem('riskSentiment');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error("Failed to load riskSentiment from localStorage", error);
            return null;
        }
    });
    const [isRiskAnalysisLoading, setIsRiskAnalysisLoading] = useState(false);

    // Settings
    const [sourceSettings, setSourceSettings] = useState<SourceSettings>(() => {
        try {
            const saved = localStorage.getItem('sourceSettings');
            return saved ? JSON.parse(saved) : initializeSources();
        } catch (error) {
            console.error("Failed to load sourceSettings from localStorage", error);
            return initializeSources();
        }
    });
    


    const [recapStyle, setRecapStyle] = useState<RecapStyle>(() => {
        return (localStorage.getItem('recapStyle') as RecapStyle) || 'default';
    });

    const [aiModelSettings, setAiModelSettings] = useState<AIModelSettings>(() => {
        const defaults: AIModelSettings = {
            gemini: aiModels.gemini[0] || '',
            openai: aiModels.openai[0] || '',
            deepseek: aiModels.deepseek[0] || '',
            anthropic: '',
            openrouter: aiModels.openrouter.free[0] || '',
        };
        try {
            const saved = localStorage.getItem('aiModelSettings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (error) {
            return defaults;
        }
    });

    const [retrySettings, setRetrySettings] = useState<RetrySettings>(() => {
        const defaults: RetrySettings = {
            analyzeAll: { enabled: true, attempts: 2 },
            generateRecap: { enabled: true, attempts: 2 },
        };
        try {
            const saved = localStorage.getItem('retrySettings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (error) {
            return defaults;
        }
    });

    const [useScoreModifier, setUseScoreModifier] = useState<boolean>(() => {
        return localStorage.getItem('useScoreModifier') === 'true';
    });

    const [useRiskModifier, setUseRiskModifier] = useState<boolean>(() => {
        return localStorage.getItem('useRiskModifier') === 'true'; // Default to false now
    });


    // Trade Journal Data
    const [trades, setTrades] = useState<Trade[]>(() => {
        try {
            const saved = localStorage.getItem('trades');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });
    
    // Scraping Log
    const [scrapingLog, setScrapingLog] = useState<string>(() => {
        try {
            const saved = localStorage.getItem('scrapingLog');
            return saved ? saved : '';
        } catch (error) {
            console.error("Failed to load scrapingLog from localStorage", error);
            return '';
        }
    });

    // UI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fetchOnly, setFetchOnly] = useState(false);
    const [analysisStatusMessage, setAnalysisStatusMessage] = useState<string | null>(null);
    const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set());
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ type: 'currency' | 'indicator'; value: string; selected?: string }>({ type: 'currency', value: 'USD' });
    const [missingData, setMissingData] = useState<Map<string, Indicator[]>>(new Map());
    const [isNotificationDismissed, setIsNotificationDismissed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [textEntryModalState, setTextEntryModalState] = useState<{
        isOpen: boolean;
        title: string;
        label: string;
        initialValue: string;
        onSave: (value: string) => void;
    } | null>(null);

    // Tour State
    const [isTourActive, setIsTourActive] = useState(() => localStorage.getItem('isTourActive') === 'true');
    const [visitedTourSteps, setVisitedTourSteps] = useState<Set<AnalysisTabName>>(() => {
        const saved = localStorage.getItem('visitedTourSteps');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });


    // --- Modal Scroll Lock ---
    useEffect(() => {
        const isTourModalEffectivelyOpen = isTourActive && !visitedTourSteps.has(activeAnalysisTab);

        const isAnyModalOpen = isSettingsModalOpen || isAnalysisModalOpen || showWelcomeScreen || isTourModalEffectivelyOpen || isTradeModalOpen || isFeedbackModalOpen || textEntryModalState?.isOpen;

        if (isAnyModalOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isSettingsModalOpen, isAnalysisModalOpen, showWelcomeScreen, isTourActive, visitedTourSteps, activeAnalysisTab, isTradeModalOpen, isFeedbackModalOpen, textEntryModalState]);


    // --- LOCALSTORAGE & THEME SYNC ---
    useEffect(() => { localStorage.setItem('analysisData', JSON.stringify(analysisData)); }, [analysisData]);
    useEffect(() => { localStorage.setItem('historicalData', JSON.stringify(historicalData)); }, [historicalData]);
    useEffect(() => { localStorage.setItem('riskSentiment', JSON.stringify(riskSentiment)); }, [riskSentiment]);
    useEffect(() => { localStorage.setItem('sourceSettings', JSON.stringify(sourceSettings)); }, [sourceSettings]);

    useEffect(() => { localStorage.setItem('recapStyle', recapStyle); }, [recapStyle]);
    useEffect(() => { localStorage.setItem('aiModelSettings', JSON.stringify(aiModelSettings)); }, [aiModelSettings]);
    useEffect(() => { localStorage.setItem('retrySettings', JSON.stringify(retrySettings)); }, [retrySettings]);
    useEffect(() => { localStorage.setItem('useScoreModifier', String(useScoreModifier)); }, [useScoreModifier]);
    useEffect(() => { localStorage.setItem('useRiskModifier', String(useRiskModifier)); }, [useRiskModifier]);
    useEffect(() => { localStorage.setItem('trades', JSON.stringify(trades)); }, [trades]);
    useEffect(() => { localStorage.setItem('scrapingLog', scrapingLog); }, [scrapingLog]);

    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
    }, [theme]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Check for first visit to show welcome screen
    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        if (!hasVisited) {
            setShowWelcomeScreen(true);
        }
    }, []);

    const handleCloseWelcomeScreen = () => {
        localStorage.setItem('hasVisitedBefore', 'true');
        setShowWelcomeScreen(false);
    };
    
    // --- TOUR HANDLERS ---
    const handleStartTour = () => {
        handleCloseWelcomeScreen();
        setIsTourActive(true);
        localStorage.setItem('isTourActive', 'true');
        // The first step ('scores') will automatically show since it's the default active tab.
    };

    const handleSkipTour = () => {
        handleCloseWelcomeScreen();
        setIsTourActive(false);
        localStorage.setItem('isTourActive', 'false');
    };

    const handleCompleteTourStep = (step: AnalysisTabName) => {
        const newVisited = new Set(visitedTourSteps).add(step);
        setVisitedTourSteps(newVisited);
        localStorage.setItem('visitedTourSteps', JSON.stringify(Array.from(newVisited)));
    };

    const handleEndTour = () => {
        setIsTourActive(false);
        localStorage.setItem('isTourActive', 'false');
        // Mark all tabs as visited so the tour doesn't restart on refresh
        const allSteps = new Set(tabConfig.map(t => t.key));
        setVisitedTourSteps(allSteps);
        localStorage.setItem('visitedTourSteps', JSON.stringify(Array.from(allSteps)));
    };


    // --- DATA COMPUTATION ---


    const calculateBaseSigmaScore = (scores: { [key in Indicator]?: Score }): number => {
        // Separate PMI scores from the rest
        const manufacturingPMIScore = scores['Manufacturing PMI']?.score;
        const servicesPMIScore = scores['Services PMI']?.score;
        
        let pmiValue = 0;
        const hasManufacturingPMI = typeof manufacturingPMIScore === 'number';
        const hasServicesPMI = typeof servicesPMIScore === 'number';

        if (hasManufacturingPMI && hasServicesPMI) {
            // Average them if both exist
            pmiValue = (manufacturingPMIScore! + servicesPMIScore!) / 2;
        } else if (hasManufacturingPMI) {
            // Use the one that exists
            pmiValue = manufacturingPMIScore!;
        } else if (hasServicesPMI) {
            // Use the one that exists
            pmiValue = servicesPMIScore!;
        }

        // Sum the other scores
        let otherScoresSum = 0;
        for (const indicator in scores) {
            if (indicator !== 'Manufacturing PMI' && indicator !== 'Services PMI') {
                const scoreData = scores[indicator as Indicator];
                if (scoreData && typeof scoreData.score === 'number') {
                    otherScoresSum += scoreData.score;
                }
            }
        }
        
        return pmiValue + otherScoresSum;
    };
    
    // --- DIRECTION LOGIC ---
    const updateAllDirections = useCallback((data: AnalysisData): AnalysisData => {
        const baseScores = currencies.map(c => {
            const currencyData = data[c.code];
            if (!currencyData) return undefined;
            return currencyData.sigmaScore;
        });
        
        if (baseScores.filter(s => typeof s === 'number').length === 0) return data;

        const median = calculateMedian(baseScores);
        const newData = { ...data };

        currencies.forEach(c => {
            const currencyData = newData[c.code];
            if (currencyData) {
                const finalScore = currencyData.sigmaScore + currencyData.eventModifierScore + currencyData.riskModifier;
                const deviation = finalScore - median;
                currencyData.direction = getDirectionFromRelativeScore(deviation);
            }
        });

        return newData;
    }, []);

     // --- RISK SENTIMENT LOGIC ---
    const recalculateOverallSentiment = useCallback((analysis: RiskSentimentAnalysis | null): RiskSentimentAnalysis | null => {
        if (!analysis) return null;
    
        const indicators = [analysis.spx, analysis.vix, analysis.audjpy, analysis.us10y];
        const signals = indicators.map(i => i.userOverrideSignal ?? i.signal);
    
        const summary = {
            on: signals.filter(s => s === 'Risk-On').length,
            off: signals.filter(s => s === 'Risk-Off').length,
            neutral: signals.filter(s => s === 'Neutral').length,
        };
    
        let calculatedSignal: RiskSignal = 'Neutral';
        let calculatedConviction: 'High' | 'Medium' | 'Uncertain' = 'Uncertain';
    
        if (summary.on >= 3) {
            calculatedSignal = 'Risk-On';
            calculatedConviction = 'High';
        } else if (summary.off >= 3) {
            calculatedSignal = 'Risk-Off';
            calculatedConviction = 'High';
        } else if (summary.on === 2 && summary.off <= 1) {
            calculatedSignal = 'Risk-On';
            calculatedConviction = 'Medium';
        } else if (summary.off === 2 && summary.on <= 1) {
            calculatedSignal = 'Risk-Off';
            calculatedConviction = 'Medium';
        }
    
        return { 
            ...analysis, 
            summary, 
            overallSignal: analysis.userOverrideSignal ?? calculatedSignal, 
            conviction: analysis.userOverrideConviction ?? calculatedConviction 
        };
    }, []);

    const handleRunRiskAnalysis = useCallback(async () => {
        if (!import.meta.env.VITE_ALPHA_VANTAGE_API_KEY) {
            alert(t('risk.noApiKey'));
            setRiskSentiment(null);
            return;
        }

        setIsRiskAnalysisLoading(true);
        try {
            const sentiment = await fetchAndAnalyzeRiskSentiment();
            setRiskSentiment(prev => {
                const newState = { ...sentiment };
                if (prev) { // Preserve existing overrides on refresh
                    (Object.keys(newState) as Array<keyof RiskSentimentAnalysis>).forEach(key => {
                        const indicator = newState[key];
                        const prevIndicator = prev[key];
                        if (
                            typeof indicator === 'object' && indicator !== null && 'signal' in indicator &&
                            typeof prevIndicator === 'object' && prevIndicator !== null && 'userOverrideSignal' in prevIndicator
                        ) {
                             indicator.userOverrideSignal = prevIndicator.userOverrideSignal;
                        }
                    });
                    newState.userOverrideSignal = prev.userOverrideSignal;
                    newState.userOverrideConviction = prev.userOverrideConviction;
                }
                return recalculateOverallSentiment(newState);
            });
        } catch (error) {
            console.error("Failed to fetch or analyze risk sentiment:", error);
            setRiskSentiment(null); // Clear on error
        } finally {
            setIsRiskAnalysisLoading(false);
        }
    }, [recalculateOverallSentiment, t]);


    const handleUpdateIndicatorOverride = useCallback((indicatorKey: string, override: RiskSignal | null) => {
        setRiskSentiment(prev => {
            if (!prev) return null;
    
            const newState = { ...prev };
            const indicatorToUpdate = newState[indicatorKey as keyof RiskSentimentAnalysis];
    
            if (typeof indicatorToUpdate === 'object' && indicatorToUpdate !== null && 'signal' in indicatorToUpdate) {
                if (override === null) {
                    delete indicatorToUpdate.userOverrideSignal;
                } else {
                    indicatorToUpdate.userOverrideSignal = override;
                }
            }
            return recalculateOverallSentiment(newState);
        });
    }, [recalculateOverallSentiment]);

    const handleUpdateOverallSentimentOverride = useCallback((overrides: { signal: RiskSignal | null, conviction: RiskConviction | null }) => {
        setRiskSentiment(prev => {
            if (!prev) return null;
            const newState = { ...prev };
            if (overrides.signal === null) {
                delete newState.userOverrideSignal;
            } else {
                newState.userOverrideSignal = overrides.signal;
            }
            if (overrides.conviction === null) {
                delete newState.userOverrideConviction;
            } else {
                newState.userOverrideConviction = overrides.conviction;
            }
            return recalculateOverallSentiment(newState);
        });
    }, [recalculateOverallSentiment]);

    // Apply risk modifiers whenever sentiment or analysis data changes
    useEffect(() => {
        const RISK_ON_CURRENCIES = ['AUD', 'NZD', 'CAD'];
        const SAFE_HAVEN_CURRENCIES = ['JPY', 'CHF'];
    
        const signal = riskSentiment?.overallSignal;
        const conviction = riskSentiment?.conviction;
    
        setAnalysisData(currentData => {
            const newData = { ...currentData };
            let needsUpdate = false;
    
            currencies.forEach(c => {
                const currencyData = newData[c.code];
                if (!currencyData) return;
    
                let newRiskModifier = 0;
                if (useRiskModifier && conviction && conviction !== 'Uncertain' && signal) {
                    const modifierValue = conviction === 'High' ? 2 : 1;
                    if (signal === 'Risk-On') {
                        if (RISK_ON_CURRENCIES.includes(c.code)) newRiskModifier = modifierValue;
                        if (SAFE_HAVEN_CURRENCIES.includes(c.code)) newRiskModifier = -modifierValue;
                    } else if (signal === 'Risk-Off') {
                        if (RISK_ON_CURRENCIES.includes(c.code)) newRiskModifier = -modifierValue;
                        if (SAFE_HAVEN_CURRENCIES.includes(c.code)) newRiskModifier = modifierValue;
                    }
                }
                
                if (currencyData.riskModifier !== newRiskModifier) {
                    currencyData.riskModifier = newRiskModifier;
                    needsUpdate = true;
                }
            });
    
            return needsUpdate ? updateAllDirections(newData) : currentData;
        });
    }, [riskSentiment, useRiskModifier, updateAllDirections]);


    const saveSnapshot = useCallback((currentData: AnalysisData) => {
        setHistoricalData(prev => {
            const today = new Date().toISOString().split('T')[0];
            const newSnapshot: HistoricalSnapshot = { date: today, data: currentData };
            
            const todayIndex = prev.findIndex(snapshot => snapshot.date === today);

            if (todayIndex !== -1) {
                // Fix: Corrected an undefined variable 'newHistory' error.
                // Create a new array from the previous state to ensure immutability.
                const newHistory = [...prev];
                newHistory[todayIndex] = newSnapshot;
                return newHistory;
            } else {
                return [...prev, newSnapshot];
            }
        });
    }, []);

    const checkForMissingData = useCallback((data: AnalysisData, analyzedCurrencies: string[]) => {
        const missing = new Map<string, Indicator[]>();
        for (const currencyCode of analyzedCurrencies) {
            const currencySources = sourceSettings[currencyCode];
            const currencyScores = data[currencyCode]?.scores;
            if (!currencySources) continue;

            const missingForCurrency: Indicator[] = [];
            for (const indicator in currencySources) {
                const hasSource = (currencySources[indicator]?.length ?? 0) > 0;
                const hasScore = currencyScores && currencyScores[indicator as Indicator];
                if (hasSource && !hasScore) {
                    missingForCurrency.push(indicator as Indicator);
                }
            }
            if (missingForCurrency.length > 0) {
                missing.set(currencyCode, missingForCurrency);
            }
        }
        if (missing.size > 0) {
            setMissingData(missing);
            setIsNotificationDismissed(false);
        } else {
            setMissingData(new Map());
        }
    }, [sourceSettings]);
    
    // --- ANALYSIS LOGIC ---
    const runAnalysis = useCallback(async (analysisMap: Map<string, Indicator[] | 'all'>, isFetchOnly: boolean, force: boolean = false) => {
        if (!isFetchOnly && !import.meta.env.VITE_GEMINI_API_KEY) {
            alert('VITE_GEMINI_API_KEY is not configured. Please set it in your environment.');
            return;
        }
    
        setIsAnalyzing(true);
        setMissingData(new Map());
        setAnalysisStatusMessage(isFetchOnly ? 'Fetching data...' : 'Starting analysis...');
        setScrapingLog(`--- New Run Started at ${new Date().toLocaleString()} (Mode: ${isFetchOnly ? 'Fetch Only' : 'Fetch & Analyze'}, Force: ${force}) ---\n\n`);
        
        for (const [currencyCode, indicators] of analysisMap.entries()) {
            const currency = currencies.find(c => c.code === currencyCode);
            if (!currency) continue;

            try {
                const indicatorsToRun = indicators === 'all' ? undefined : indicators;
                const newScores = await analyzeCurrency(
                    currency,
                    sourceSettings,
                    aiModelSettings,
                    retrySettings,
                    setAnalysisStatusMessage,
                    (logEntry: string) => setScrapingLog(prev => prev + logEntry),
                    indicatorsToRun,
                    !isFetchOnly, // runScoring
                    // FIX: Pass the 'scores' object from the currency data, not the entire 'CurrencyAnalysis' object.
                    analysisData[currency.code]?.scores, // existingCurrencyData
                    force
                );
                
                setAnalysisStatusMessage(`Processing results for ${currency.code}...`);

                setAnalysisData(currentAnalysisData => {
                    const existingData = currentAnalysisData[currency.code] ? { ...currentAnalysisData[currency.code]! } : { direction: 'Neutral', scores: {}, sigmaScore: 0, eventModifierScore: 0, riskModifier: 0 };
                    existingData.scores = { ...existingData.scores, ...newScores };
                    
                    if (!isFetchOnly) {
                        existingData.sigmaScore = calculateBaseSigmaScore(existingData.scores);
                    }
                    
                    const updatedData = { ...currentAnalysisData, [currency.code]: existingData as CurrencyAnalysis };
                    return updateAllDirections(updatedData);
                });

            } catch (error) {
                console.error(`Failed to analyze ${currencyCode}:`, error);
                setAnalysisStatusMessage(`Error processing ${currencyCode}. Check console for details.`);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Show error for a bit
            }
        }
    
        setAnalysisStatusMessage('Finalizing and saving data...');
        const analyzedCurrencyCodes = Array.from(analysisMap.keys());
        setAnalysisData(currentData => {
            if (!isFetchOnly) { // Only save snapshots and check for missing data after a scoring run
                saveSnapshot(currentData);
                checkForMissingData(currentData, analyzedCurrencyCodes);
            }
            return currentData;
        });
    
        setIsAnalyzing(false);
        setAnalysisStatusMessage(null);
    }, [sourceSettings, aiModelSettings, retrySettings, analysisData, updateAllDirections, saveSnapshot, checkForMissingData]);

    const handleAnalyzeAll = useCallback((force: boolean = false) => {
        const analysisMap = new Map<string, 'all' | Indicator[]>();
        if (selectedCells.size > 0) {
            for (const cellId of selectedCells) {
                const [currencyCode, indicator] = cellId.split('_');
                if (!analysisMap.has(currencyCode)) {
                    analysisMap.set(currencyCode, []);
                }
                (analysisMap.get(currencyCode) as Indicator[]).push(indicator as Indicator);
            }
        } else if (selectedCurrencies.size > 0) {
            for (const currencyCode of selectedCurrencies) {
                analysisMap.set(currencyCode, 'all');
            }
        } else {
            for (const currency of currencies) {
                analysisMap.set(currency.code, 'all');
            }
        }
        runAnalysis(analysisMap, fetchOnly, force);
        setSelectedCells(new Set());
    }, [runAnalysis, selectedCells, selectedCurrencies, fetchOnly]);
    
    const handleRetryMissing = useCallback(() => {
        runAnalysis(missingData, false); // Always run scoring on retries
        setIsNotificationDismissed(true);
    }, [missingData, runAnalysis]);

    const handleOpenModal = (type: 'currency' | 'indicator', value: string, selected?: string) => {
        setModalContent({ type, value, selected });
        setIsAnalysisModalOpen(true);
    };

    const handleUpdateScore = useCallback((currencyCode: string, indicator: Indicator, scoreData: Score | number) => {
        setAnalysisData(prevData => {
            const newData = { ...prevData };
            const currencyData: CurrencyAnalysis = newData[currencyCode] ? { ...newData[currencyCode]! } : { scores: {}, sigmaScore: 0, direction: 'Neutral', eventModifierScore: 0, riskModifier: 0 };
            
            const newScore = typeof scoreData === 'number' 
                ? { score: scoreData, rationale: 'Manual override.' }
                : scoreData;

            currencyData.scores = { ...currencyData.scores, [indicator]: newScore };
            currencyData.sigmaScore = calculateBaseSigmaScore(currencyData.scores);
            
            newData[currencyCode] = currencyData;
            return updateAllDirections(newData);
        });
    }, [updateAllDirections]);

    const handleUpdateRecap = useCallback((currencyCode: string, recapData: EconomicRecap) => {
        setAnalysisData(prevData => {
            const newData = { ...prevData };
            const currencyData = newData[currencyCode];
            if (currencyData) {
                const updatedCurrencyData: CurrencyAnalysis = {
                    ...currencyData,
                    recap: recapData,
                };
                if (useScoreModifier && recapData.scoreModifier !== 0) {
                     updatedCurrencyData.eventModifierScore = recapData.scoreModifier;
                }
                newData[currencyCode] = updatedCurrencyData;
            }
            return updateAllDirections(newData);
        });
    }, [useScoreModifier, updateAllDirections]);

    const handleUpdateEventModifier = useCallback((currencyCode: string, newModifier: number) => {
        setAnalysisData(prevData => {
            const newData = { ...prevData };
            if (newData[currencyCode]) {
                const currencyData = newData[currencyCode]!;
                // If the user sets the modifier back to what the AI recommended (or 0), clear the rationale.
                if (newModifier === (currencyData.recap?.scoreModifier ?? 0)) {
                    delete currencyData.eventModifierRationale;
                }
                currencyData.eventModifierScore = newModifier;
            }
            return updateAllDirections(newData);
        });
    }, [updateAllDirections]);

    const handleSaveEventModifierRationale = useCallback((currencyCode: string, rationale: string) => {
        setAnalysisData(prevData => {
            const newData = { ...prevData };
            if (newData[currencyCode]) {
                // Create a new object for the currency to ensure state update is detected
                const currencyData = { ...newData[currencyCode]! };
                currencyData.eventModifierRationale = rationale;
                newData[currencyCode] = currencyData;
            }
            return newData; // No direction update needed for just a rationale change
        });
        setTextEntryModalState(null);
    }, []);

    const handleOpenEventModifierRationaleModal = useCallback((currencyCode: string, currentRationale: string) => {
        setTextEntryModalState({
            isOpen: true,
            title: t('rationale.modal.title', { currency: currencyCode }),
            label: t('rationale.modal.label'),
            initialValue: currentRationale,
            onSave: (rationale: string) => handleSaveEventModifierRationale(currencyCode, rationale),
        });
    }, [t, handleSaveEventModifierRationale]);


    const handleToggleCurrencySelection = (currencyCode: string) => {
        setSelectedCurrencies(prev => {
            const newSet = new Set(prev);
            newSet.has(currencyCode) ? newSet.delete(currencyCode) : newSet.add(currencyCode);
            return newSet;
        });
    };

    const handleToggleCellSelection = (currencyCode: string, indicator: Indicator) => {
        setSelectedCells(prev => {
            const newSet = new Set(prev);
            const cellId = `${currencyCode}_${indicator}`;
            newSet.has(cellId) ? newSet.delete(cellId) : newSet.add(cellId);
            return newSet;
        });
    };
    
    const handleClearAllSelections = useCallback(() => {
        setSelectedCells(new Set());
        setSelectedCurrencies(new Set());
    }, []);

    const handleSelectColumn = useCallback((indicator: Indicator) => {
        setSelectedCells(prev => {
            const newSet = new Set(prev);
            const columnCellIds = currencies.map(c => `${c.code}_${indicator}`);
            const allSelected = columnCellIds.every(id => prev.has(id));

            if (allSelected) {
                columnCellIds.forEach(id => newSet.delete(id));
            } else {
                columnCellIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    }, []);

    const handleSaveSettings = (
        newSources: SourceSettings,
        newRecapStyle: RecapStyle,
        newAiModelSettings: AIModelSettings,
        newRetrySettings: RetrySettings,
        newUseScoreModifier: boolean,
        newUseRiskModifier: boolean,
        newTheme: Theme
    ) => {
        setSourceSettings(newSources);
        setRecapStyle(newRecapStyle);
        setAiModelSettings(newAiModelSettings);
        setRetrySettings(newRetrySettings);
        setUseScoreModifier(newUseScoreModifier);
        setUseRiskModifier(newUseRiskModifier);
        setTheme(newTheme);
        setIsSettingsModalOpen(false);
    };

    const handleImportAllData = (importedData: FullAppState) => {
        if (importedData.sourceSettings) setSourceSettings(importedData.sourceSettings);
        if (importedData.recapStyle) setRecapStyle(importedData.recapStyle);
        if (importedData.aiModelSettings) setAiModelSettings(prev => ({ ...prev, ...importedData.aiModelSettings }));
        if (importedData.retrySettings) setRetrySettings(prev => ({ ...prev, ...importedData.retrySettings }));
        if (typeof importedData.useScoreModifier === 'boolean') setUseScoreModifier(importedData.useScoreModifier);
        if (typeof importedData.useRiskModifier === 'boolean') setUseRiskModifier(importedData.useRiskModifier);
        if (importedData.theme) setTheme(importedData.theme);
    
        if (importedData.analysisData) setAnalysisData(updateAllDirections(importedData.analysisData));
        if (importedData.historicalData) setHistoricalData(importedData.historicalData);
        if (importedData.trades) setTrades(importedData.trades);
        if (importedData.riskSentiment) setRiskSentiment(recalculateOverallSentiment(importedData.riskSentiment));
    
        setIsSettingsModalOpen(false); 
        alert(t('settings.data.import.success'));
    };

    const handleSaveTrade = (trade: Trade) => {
        setTrades(prevTrades => {
            const index = prevTrades.findIndex(t => t.id === trade.id);
            if (index > -1) {
                const newTrades = [...prevTrades];
                newTrades[index] = trade;
                return newTrades;
            }
            return [...prevTrades, trade];
        });
    };

    const handleDeleteTrade = (tradeId: string) => {
        if (window.confirm('Are you sure you want to delete this trade?')) {
            setTrades(prev => prev.filter(t => t.id !== tradeId));
        }
    };
    
    const tabConfig: { key: AnalysisTabName, labelKey: string }[] = [
        { key: 'scores', labelKey: 'app.tab.scores' },
        { key: 'risk', labelKey: 'app.tab.risk' },
        { key: 'recap', labelKey: 'app.tab.recap' },
        { key: 'events', labelKey: 'app.tab.events' },
        { key: 'pairs', labelKey: 'app.tab.pairs' },
        { key: 'charts', labelKey: 'app.tab.charts' },
        { key: 'journal', labelKey: 'app.tab.journal' },
        { key: 'log', labelKey: 'app.tab.scrapinglog' },
    ];
    
    const handleTabClick = (tab: AnalysisTabName) => {
        setActiveAnalysisTab(tab);
        setIsMobileMenuOpen(false);
    };

    const activeTabLabel = tabConfig.find(tab => tab.key === activeAnalysisTab)?.labelKey || 'app.tab.scores';

    // --- RENDER ---
    const isAnalyzeDisabled = !import.meta.env.VITE_GEMINI_API_KEY && !fetchOnly;
    return (
        <div className="app-container">
            {showWelcomeScreen && (
                <WelcomeModal
                    isOpen={showWelcomeScreen}
                    onClose={handleCloseWelcomeScreen}
                    onStartTour={handleStartTour}
                    onSkipTour={handleSkipTour}
                />
            )}
             {isTourActive && !visitedTourSteps.has(activeAnalysisTab) && (
                <TourModal
                    isOpen={true}
                    tourStepId={activeAnalysisTab}
                    onClose={() => handleCompleteTourStep(activeAnalysisTab)}
                    onEndTour={handleEndTour}
                />
            )}
             {missingData.size > 0 && !isNotificationDismissed && (
                <NotificationBar
                    message={`It appears not all the scoring data was retrieved. Would you like to try again for the ${missingData.size > 1 ? `${missingData.size} currencies` : `1 currency`} with missing data?`}
                    onConfirm={handleRetryMissing}
                    onDismiss={() => setIsNotificationDismissed(true)}
                />
            )}
            <Header
                onSettingsClick={() => setIsSettingsModalOpen(true)}
                onFeedbackClick={() => setIsFeedbackModalOpen(true)}
                onAnalyzeAll={handleAnalyzeAll}
                isAnalyzing={isAnalyzing}
                isAnalyzeDisabled={isAnalyzeDisabled}
                hasSelection={selectedCurrencies.size > 0 || selectedCells.size > 0}
                fetchOnly={fetchOnly}
                onSetFetchOnly={setFetchOnly}
            />
            {isAnalyzing && analysisStatusMessage && <StatusBar message={analysisStatusMessage} />}
            <main>
                <nav className="main-navigation">
                    {/* Desktop Tabs */}
                    <div className="analysis-tabs">
                        {tabConfig.map(tab => (
                            <button
                                key={tab.key}
                                className={`analysis-tab-button ${activeAnalysisTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveAnalysisTab(tab.key)}
                            >
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Nav Dropdown */}
                    <div className="mobile-nav" ref={mobileMenuRef}>
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(prev => !prev)}
                            aria-haspopup="true"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-tabs-dropdown"
                        >
                            <span>{t(activeTabLabel)}</span>
                            <svg className={`chevron ${isMobileMenuOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        {isMobileMenuOpen && (
                            <div className="mobile-tabs-dropdown" id="mobile-tabs-dropdown">
                                {tabConfig.map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`analysis-tab-button ${activeAnalysisTab === tab.key ? 'active' : ''}`}
                                        onClick={() => handleTabClick(tab.key)}
                                    >
                                        {t(tab.labelKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>


                {activeAnalysisTab === 'scores' && (
                    <AnalysisTable
                        isAnalyzing={isAnalyzing}
                        analysisData={analysisData}
                        onOpenModal={handleOpenModal}
                        selectedCurrencies={selectedCurrencies}
                        onToggleCurrencySelection={handleToggleCurrencySelection}
                        onUpdateEventModifier={handleUpdateEventModifier}
                        onOpenEventModifierRationaleModal={handleOpenEventModifierRationaleModal}
                        selectedCells={selectedCells}
                        onToggleCellSelection={handleToggleCellSelection}
                        onClearAllSelections={handleClearAllSelections}
                        onSelectColumn={handleSelectColumn}
                        onSwitchTab={setActiveAnalysisTab}
                    />
                )}
                {activeAnalysisTab === 'risk' && (
                    <RiskSentimentPage 
                        analysis={riskSentiment} 
                        isLoading={isRiskAnalysisLoading}
                        onUpdateIndicatorOverride={handleUpdateIndicatorOverride}
                        onUpdateOverallSentimentOverride={handleUpdateOverallSentimentOverride}
                        onRunAnalysis={handleRunRiskAnalysis}
                    />
                )}
                {activeAnalysisTab === 'pairs' && <CurrencyPairsTable analysisData={analysisData} />}
                {activeAnalysisTab === 'recap' && (
                    <RecapPage
                        analysisData={analysisData}
                        sourceSettings={sourceSettings}
                        aiModelSettings={aiModelSettings}
                        recapStyle={recapStyle}
                        retrySettings={retrySettings}
                        onUpdateRecap={handleUpdateRecap}
                    />
                )}
                {activeAnalysisTab === 'events' && <EventsPage analysisData={analysisData} />}
                {activeAnalysisTab === 'charts' && <ChartsPage historicalData={historicalData} />}
                {activeAnalysisTab === 'journal' && (
                    <TradeJournalPage 
                        trades={trades}
                        onSaveTrade={handleSaveTrade}
                        onDeleteTrade={handleDeleteTrade}
                        onModalToggle={setIsTradeModalOpen}
                    />
                )}
                {activeAnalysisTab === 'log' && <ScrapingLogPage log={scrapingLog} />}
            </main>

            {isSettingsModalOpen && (
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    sourceSettings={sourceSettings}
                    recapStyle={recapStyle}
                    aiModelSettings={aiModelSettings}
                    retrySettings={retrySettings}
                    useScoreModifier={useScoreModifier}
                    useRiskModifier={useRiskModifier}
                    theme={theme}
                    analysisData={analysisData}
                    historicalData={historicalData}
                    trades={trades}
                    riskSentiment={riskSentiment}
                    onSave={handleSaveSettings}
                    onImportAllData={handleImportAllData}
                />
            )}
            
            {isAnalysisModalOpen && (
                 <AnalysisModal
                    isOpen={isAnalysisModalOpen}
                    onClose={() => setIsAnalysisModalOpen(false)}
                    content={modalContent}
                    analysisData={analysisData}
                    onUpdateScore={handleUpdateScore}
                    sourceSettings={sourceSettings}
                    scoringRules={scoringRules as Record<string, string[]>}
                />
            )}

            {isFeedbackModalOpen && (
                <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    appState={{
                        analysisData,
                        historicalData,
                        riskSentiment,
                        sourceSettings,
                        trades,
                    }}
                />
            )}

            {textEntryModalState?.isOpen && (
                <TextEntryModal
                    isOpen={textEntryModalState.isOpen}
                    onClose={() => setTextEntryModalState(null)}
                    onSave={textEntryModalState.onSave}
                    title={textEntryModalState.title}
                    label={textEntryModalState.label}
                    initialValue={textEntryModalState.initialValue}
                />
            )}
        </div>
    );
};

export default App;