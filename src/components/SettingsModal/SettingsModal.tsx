
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { SourceSettings, ApiKey, AnalysisData, RecapStyle, AIProvider, AIModelSettings, RetrySettings, HistoricalData, Trade, FullAppState, Language, MarketDataApiKey, RiskSentimentAnalysis, Theme } from '../../types.ts';
import './SettingsModal.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';
import { sourceIndicatorConfig, aiModels } from '../../data/config.js';
import currencies from '../../data/currencies.js';
import { getTranslationKey } from '../../utils/localization.ts';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceSettings: SourceSettings;
    apiKeys: ApiKey[];
    selectedApiKeyId: string | null;
    marketDataApiKey?: MarketDataApiKey;
    recapStyle: RecapStyle;
    aiModelSettings: AIModelSettings;
    retrySettings: RetrySettings;
    useScoreModifier: boolean;
    useRiskModifier: boolean;
    theme: Theme;
    analysisData: AnalysisData;
    historicalData: HistoricalData;
    trades: Trade[];
    riskSentiment: RiskSentimentAnalysis | null;
    onSave: (
        newSources: SourceSettings,
        newApiKeys: ApiKey[],
        newSelectedKeyId: string | null,
        newMarketDataApiKey: MarketDataApiKey | undefined,
        newRecapStyle: RecapStyle,
        newAiModelSettings: AIModelSettings,
        newRetrySettings: RetrySettings,
        newUseScoreModifier: boolean,
        newUseRiskModifier: boolean,
        newTheme: Theme
    ) => void;
    onImportAllData: (data: FullAppState) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    sourceSettings: initialSourceSettings,
    apiKeys: initialApiKeys,
    selectedApiKeyId: initialSelectedApiKeyId,
    marketDataApiKey: initialMarketDataApiKey,
    recapStyle: initialRecapStyle,
    aiModelSettings: initialAiModelSettings,
    retrySettings: initialRetrySettings,
    useScoreModifier: initialUseScoreModifier,
    useRiskModifier: initialUseRiskModifier,
    theme: initialTheme,
    analysisData,
    historicalData,
    trades,
    riskSentiment,
    onSave,
    onImportAllData
}) => {
    const { t, language, setLanguage } = useLocalization();
    const [activeTab, setActiveTab] = useState<'sources' | 'apiKeys' | 'aiSettings' | 'appearance' | 'localization' | 'data'>('sources');

    const [sourceSettings, setSourceSettings] = useState<SourceSettings>(initialSourceSettings);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
    const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(initialSelectedApiKeyId);
    const [marketDataApiKey, setMarketDataApiKey] = useState<MarketDataApiKey | undefined>(initialMarketDataApiKey);
    const [recapStyle, setRecapStyle] = useState<RecapStyle>(initialRecapStyle);
    const [aiModelSettings, setAiModelSettings] = useState<AIModelSettings>(initialAiModelSettings);
    const [retrySettings, setRetrySettings] = useState<RetrySettings>(initialRetrySettings);
    const [useScoreModifier, setUseScoreModifier] = useState(initialUseScoreModifier);
    const [useRiskModifier, setUseRiskModifier] = useState(initialUseRiskModifier);
    const [theme, setTheme] = useState<Theme>(initialTheme);

    const [selectedCurrency, setSelectedCurrency] = useState<string>(currencies[0].code);
    const [newApiKey, setNewApiKey] = useState({ name: '', key: '', provider: 'gemini' as AIProvider });
    
    const importBackupRef = useRef<HTMLInputElement>(null);

    const prettyProviderNames: Record<string, string> = useMemo(() => ({
        google: 'Google',
        mistral: 'Mistral',
        meta: 'Meta',
        anthropic: 'Anthropic',
        deepseek: 'DeepSeek',
        openai: 'OpenAI',
        openrouter: 'OpenRouter',
    }), []);
    
    useEffect(() => {
        setSourceSettings(initialSourceSettings);
        setApiKeys(initialApiKeys);
        setSelectedApiKeyId(initialSelectedApiKeyId);
        setMarketDataApiKey(initialMarketDataApiKey);
        setRecapStyle(initialRecapStyle);
        setAiModelSettings(initialAiModelSettings);
        setRetrySettings(initialRetrySettings);
        setUseScoreModifier(initialUseScoreModifier);
        setUseRiskModifier(initialUseRiskModifier);
        setTheme(initialTheme);
    }, [isOpen, initialSourceSettings, initialApiKeys, initialSelectedApiKeyId, initialMarketDataApiKey, initialRecapStyle, initialAiModelSettings, initialRetrySettings, initialUseScoreModifier, initialUseRiskModifier, initialTheme]);

    const handleSave = () => {
        onSave(sourceSettings, apiKeys, selectedApiKeyId, marketDataApiKey, recapStyle, aiModelSettings, retrySettings, useScoreModifier, useRiskModifier, theme);
    };

    const handleAddApiKey = () => {
        if (newApiKey.name && newApiKey.key && newApiKey.provider) {
            const newKey: ApiKey = { ...newApiKey, id: `key-${Date.now()}` };
            const newKeys = [...apiKeys, newKey];
            setApiKeys(newKeys);
            if (apiKeys.length === 0) {
                setSelectedApiKeyId(newKey.id);
            }
            setNewApiKey({ name: '', key: '', provider: 'gemini' });
        } else {
            alert(t('settings.apiKeys.add.addError'));
        }
    };
    
    const handleRemoveApiKey = (id: string) => {
        const newKeys = apiKeys.filter(key => key.id !== id);
        setApiKeys(newKeys);
        if (selectedApiKeyId === id) {
            // If the deleted key was selected, select the first available key, or null if none are left.
            setSelectedApiKeyId(newKeys[0]?.id || null);
        }
    };

    const handleExport = (data: any, filename: string) => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = filename;
        link.click();
    };

    const handleExportAllData = () => {
        const fullState: FullAppState = {
            // Settings from local state (which are copies of props on open)
            sourceSettings,
            apiKeys,
            selectedApiKeyId,
            marketDataApiKey,
            recapStyle,
            aiModelSettings,
            retrySettings,
            useScoreModifier,
            useRiskModifier,
            theme,
            // Other data from props
            analysisData,
            historicalData,
            trades,
            riskSentiment,
            // Language from context
            language,
        };
        handleExport(fullState, 'aeon-complete-backup.json');
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read");
                const parsed = JSON.parse(text);

                // Validate structure of the unified backup file
                if (
                    'sourceSettings' in parsed && 'apiKeys' in parsed &&
                    'analysisData' in parsed && 'historicalData' in parsed &&
                    'trades' in parsed && 'language' in parsed
                ) {
                    if (parsed.language === 'en' || parsed.language === 'nl') {
                        setLanguage(parsed.language as Language);
                    }
                    onImportAllData(parsed as FullAppState);
                } else {
                    throw new Error(t('settings.data.import.error.format'));
                }
            } catch (error) {
                alert(`${t('settings.data.import.error')}: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    if (!isOpen) return null;

    const renderUrlListEditor = (urls: string[], onChange: (newUrls: string[]) => void, placeholder: string) => {
        const handleUrlChange = (index: number, value: string) => {
            const newUrls = [...urls];
            newUrls[index] = value;
            onChange(newUrls);
        };
        const addUrl = () => onChange([...urls, '']);
        const removeUrl = (index: number) => {
            const newUrls = urls.filter((_, i) => i !== index);
            onChange(newUrls);
        };
    
        return (
            <div className="url-list-editor">
                {urls.map((url, index) => (
                    <div key={index} className="url-input-wrapper">
                        <input type="url" value={url} onChange={e => handleUrlChange(index, e.target.value)} placeholder={placeholder} />
                        <button onClick={() => removeUrl(index)} className="remove-url-button" aria-label={t('settings.sources.removeUrlAriaLabel')}>&times;</button>
                    </div>
                ))}
                <button type="button" onClick={addUrl} className="add-url-button">{t('settings.sources.addUrl')}</button>
            </div>
        );
    };

    const renderSourcesTab = () => {
        const handleSourceChange = (indicator: string, newUrls: string[]) => {
            setSourceSettings(prev => ({
                ...prev,
                [selectedCurrency]: {
                    ...(prev[selectedCurrency] || {}),
                    [indicator]: newUrls
                }
            }));
        };

        const currentSources = sourceSettings[selectedCurrency] || {};

        return (
            <div className="tab-content">
                <section className="settings-section">
                    <h3>{t('settings.sources.title')}</h3>
                    <p className="description">{t('settings.sources.description')}</p>
                    <div className="currency-selector">
                        {currencies.map(c => (
                            <button
                                key={c.code}
                                className={`currency-selector-button ${selectedCurrency === c.code ? 'active' : ''}`}
                                onClick={() => setSelectedCurrency(c.code)}
                            >
                                <span role="img" aria-label={`${c.code} flag`}>{c.flag}</span>
                                {c.code}
                            </button>
                        ))}
                    </div>
                    
                    {sourceIndicatorConfig.groups.map(group => {
                        // Filter indicators in the group that are applicable to the selected currency
                        const applicableIndicators = group.indicators.filter(indicatorObj => {
                            if (typeof indicatorObj === 'string') return true; // Applies to all
                            return indicatorObj.currencies.includes(selectedCurrency);
                        }).map(indicatorObj => typeof indicatorObj === 'string' ? indicatorObj : indicatorObj.name);

                        if (applicableIndicators.length === 0) return null; // Don't render group if no indicators apply

                        return (
                            <div className="source-group" key={group.name}>
                                <h4 className="source-group-title">{t(getTranslationKey(group.name))}</h4>
                                <div className="form-grid">
                                    {applicableIndicators.map(indicator => (
                                        <div className="form-group" key={indicator}>
                                            <label>{t(getTranslationKey(indicator)) || indicator}</label>
                                            {renderUrlListEditor(
                                                currentSources[indicator] || [],
                                                (newUrls) => handleSourceChange(indicator, newUrls),
                                                t('settings.sources.urlPlaceholder')
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>
        );
    };
    
    const renderApiKeysTab = () => (
        <div className="tab-content">
            <section className="settings-section">
                <h3>{t('settings.apiKeys.manage.title')}</h3>
                <p className="description">{t('settings.apiKeys.manage.description')}</p>
                <div className="api-key-list">
                    {apiKeys.length === 0 && <p>{t('settings.apiKeys.manage.noKeys')}</p>}
                    {apiKeys.map(key => (
                        <div className="api-key-item" key={key.id}>
                            <input
                                type="radio"
                                id={`key-radio-${key.id}`}
                                name="selectedApiKey"
                                checked={selectedApiKeyId === key.id}
                                onChange={() => setSelectedApiKeyId(key.id)}
                            />
                            <label htmlFor={`key-radio-${key.id}`}>
                                <span className={`provider-badge provider-${key.provider}`}>{key.provider}</span>
                                {key.name}
                            </label>
                            <span className="api-key-value">{key.key.substring(0, 4)}...{key.key.slice(-4)}</span>
                            <button onClick={() => handleRemoveApiKey(key.id)} className="remove-button" aria-label={t('settings.apiKeys.manage.removeAriaLabel')}>&times;</button>
                        </div>
                    ))}
                </div>
            </section>
            <section className="settings-section">
                <h3>{t('settings.apiKeys.add.title')}</h3>
                 <div className="add-api-key-form">
                    <div className="form-grid-three">
                        <div className="form-group">
                            <label htmlFor="new-key-provider">{t('settings.apiKeys.add.provider')}</label>
                            <select
                                id="new-key-provider"
                                value={newApiKey.provider}
                                onChange={e => setNewApiKey({ ...newApiKey, provider: e.target.value as AIProvider })}
                            >
                                <option value="gemini">Gemini</option>
                                <option value="openai">OpenAI</option>
                                <option value="deepseek">DeepSeek</option>
                                <option value="openrouter">OpenRouter</option>
                            </select>
                        </div>
                        <div className="form-group">
                             <label htmlFor="new-key-name">{t('settings.apiKeys.add.namePlaceholder')}</label>
                            <input
                                type="text"
                                id="new-key-name"
                                value={newApiKey.name}
                                onChange={e => setNewApiKey({ ...newApiKey, name: e.target.value })}
                                placeholder={t('settings.apiKeys.add.namePlaceholder')}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new-key-value">{t('settings.apiKeys.add.keyPlaceholder')}</label>
                            <input
                                type="password"
                                id="new-key-value"
                                value={newApiKey.key}
                                onChange={e => setNewApiKey({ ...newApiKey, key: e.target.value })}
                                placeholder={t('settings.apiKeys.add.keyPlaceholder')}
                            />
                        </div>
                    </div>
                    <button onClick={handleAddApiKey} className="add-button">{t('settings.apiKeys.add.addButton')}</button>
                 </div>
            </section>
             <section className="settings-section">
                <h3>Market Data API Key</h3>
                <p className="description">Provide an API key for fetching live market data from Alpha Vantage. This is required for the Risk Sentiment Dashboard.</p>
                <div className="add-api-key-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="market-data-provider">Provider</label>
                            <select id="market-data-provider" value={marketDataApiKey?.provider || 'alphavantage'} disabled>
                                <option value="alphavantage">Alpha Vantage</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="market-data-key">API Key</label>
                            <input
                                type="password"
                                id="market-data-key"
                                value={marketDataApiKey?.key || ''}
                                onChange={e => setMarketDataApiKey({ provider: 'alphavantage', key: e.target.value })}
                                placeholder="Enter Alpha Vantage Key"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    const renderAiSettingsTab = () => {
        const handleRetryChange = (
            target: 'analyzeAll' | 'generateRecap',
            field: 'enabled' | 'attempts',
            value: boolean | number
        ) => {
            setRetrySettings(prev => ({
                ...prev,
                [target]: {
                    ...prev[target],
                    [field]: value
                }
            }));
        };

        const groupModelsByProvider = (models: string[]): Record<string, string[]> => {
            return models.reduce((acc, model) => {
                const [providerName] = model.split('/');
                const groupLabel = prettyProviderNames[providerName] || providerName;
                if (!acc[groupLabel]) {
                    acc[groupLabel] = [];
                }
                acc[groupLabel].push(model);
                return acc;
            }, {} as Record<string, string[]>);
        };
        
        const groupedFreeModels = groupModelsByProvider(aiModels.openrouter.free);
        const groupedPaidModels = groupModelsByProvider(aiModels.openrouter.paid);

        return (
            <div className="tab-content">
                <section className="settings-section">
                    <h3>{t('settings.ai.model.title')}</h3>
                    <p className="description">{t('settings.ai.model.description')}</p>
                    <div className="form-grid-two">
                        {/* Gemini */}
                        {aiModels.gemini.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="gemini-model-select">{t('settings.ai.model.gemini')}</label>
                                <select
                                    id="gemini-model-select"
                                    value={aiModelSettings.gemini}
                                    onChange={e => setAiModelSettings(prev => ({ ...prev, gemini: e.target.value }))}
                                >
                                    {aiModels.gemini.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* OpenAI */}
                        {aiModels.openai.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="openai-model-select">{t('settings.ai.model.openai')}</label>
                                <select
                                    id="openai-model-select"
                                    value={aiModelSettings.openai}
                                    onChange={e => setAiModelSettings(prev => ({ ...prev, openai: e.target.value }))}
                                >
                                    {aiModels.openai.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* DeepSeek */}
                        {aiModels.deepseek.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="deepseek-model-select">{t('settings.ai.model.deepseek')}</label>
                                <select
                                    id="deepseek-model-select"
                                    value={aiModelSettings.deepseek}
                                    onChange={e => setAiModelSettings(prev => ({ ...prev, deepseek: e.target.value }))}
                                >
                                    {aiModels.deepseek.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {/* OpenRouter */}
                        {(aiModels.openrouter.free.length > 0 || aiModels.openrouter.paid.length > 0) && (
                             <div className="form-group">
                                <label htmlFor="openrouter-model-select">{t('settings.ai.model.openrouter')}</label>
                                <select
                                    id="openrouter-model-select"
                                    value={aiModelSettings.openrouter}
                                    onChange={e => setAiModelSettings(prev => ({ ...prev, openrouter: e.target.value }))}
                                >
                                    {Object.entries(groupedFreeModels).map(([groupName, models]) => (
                                        <optgroup key={`free-${groupName}`} label={`${groupName} (${t('settings.ai.model.openrouter.free')})`}>
                                            {models.map(model => (
                                                <option key={model} value={model}>
                                                    {model.split('/')[1]?.replace(':online', '') || model}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    {Object.entries(groupedPaidModels).map(([groupName, models]) => (
                                        <optgroup key={`paid-${groupName}`} label={`${groupName} (${t('settings.ai.model.openrouter.paid')})`}>
                                            {models.map(model => (
                                                <option key={model} value={model}>
                                                    {model.split('/')[1]?.replace(':online', '') || model}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </section>
                 <section className="settings-section">
                    <h3>{t('settings.ai.scoreModification.title')}</h3>
                    <div className="switch-control">
                        <input 
                            type="checkbox" 
                            id="use-score-modifier-enabled"
                            checked={useScoreModifier}
                            onChange={e => setUseScoreModifier(e.target.checked)}
                        />
                        <label htmlFor="use-score-modifier-enabled">{t('settings.ai.scoreModification.autoApplyEvent')}</label>
                    </div>
                    <p className="description" style={{marginTop: '0.5rem', fontSize: '0.85rem'}}>
                        {t('settings.ai.scoreModification.descriptionEvent')}
                    </p>

                    <div className="switch-control" style={{marginTop: '1rem'}}>
                        <input
                            type="checkbox"
                            id="use-risk-modifier-enabled"
                            checked={useRiskModifier}
                            onChange={e => setUseRiskModifier(e.target.checked)}
                        />
                        <label htmlFor="use-risk-modifier-enabled">{t('settings.ai.scoreModification.autoApplyRisk')}</label>
                    </div>
                     <p className="description" style={{marginTop: '0.5rem', fontSize: '0.85rem'}}>
                        {t('settings.ai.scoreModification.descriptionRisk')}
                    </p>
                </section>
                <section className="settings-section">
                    <h3>{t('settings.ai.recapStyle.title')}</h3>
                    <p className="description">{t('settings.ai.recapStyle.description')}</p>
                    <div className="form-group">
                        <label htmlFor="recap-style-select">{t('settings.ai.recapStyle.label')}</label>
                        <select id="recap-style-select" value={recapStyle} onChange={e => setRecapStyle(e.target.value as RecapStyle)}>
                            <option value="default">{t('settings.ai.recapStyle.option.default')}</option>
                            <option value="simplified">{t('settings.ai.recapStyle.option.simplified')}</option>
                        </select>
                         <p className="description" style={{marginTop: '0.5rem', fontSize: '0.85rem'}}>
                            {recapStyle === 'simplified'
                                ? t('settings.ai.recapStyle.option.simplified.description')
                                : t('settings.ai.recapStyle.option.default.description')}
                        </p>
                    </div>
                </section>
                <section className="settings-section">
                    <h3>{t('settings.ai.retry.title')}</h3>
                    <p className="description">{t('settings.ai.retry.description')}</p>
                    <div className="retry-settings">
                        {/* Analyze All */}
                        <div className="retry-group">
                            <h4>{t('settings.ai.retry.analyzeAll.title')}</h4>
                            <div className="switch-control">
                                <input 
                                    type="checkbox" 
                                    id="retry-analyze-all-enabled"
                                    checked={retrySettings.analyzeAll.enabled}
                                    onChange={e => handleRetryChange('analyzeAll', 'enabled', e.target.checked)}
                                />
                                <label htmlFor="retry-analyze-all-enabled">{t('settings.ai.retry.enable')}</label>
                            </div>
                             <div className="form-group">
                                <label htmlFor="retry-analyze-all-attempts">{t('settings.ai.retry.attempts')}</label>
                                <input 
                                    type="number" 
                                    id="retry-analyze-all-attempts"
                                    min="1" max="5"
                                    value={retrySettings.analyzeAll.attempts}
                                    disabled={!retrySettings.analyzeAll.enabled}
                                    onChange={e => handleRetryChange('analyzeAll', 'attempts', parseInt(e.target.value, 10))}
                                />
                            </div>
                        </div>
                         {/* Generate Recap */}
                        <div className="retry-group">
                             <h4>{t('settings.ai.retry.generateRecap.title')}</h4>
                            <div className="switch-control">
                                <input 
                                    type="checkbox" 
                                    id="retry-recap-enabled"
                                    checked={retrySettings.generateRecap.enabled}
                                    onChange={e => handleRetryChange('generateRecap', 'enabled', e.target.checked)}
                                />
                                <label htmlFor="retry-recap-enabled">{t('settings.ai.retry.enable')}</label>
                            </div>
                             <div className="form-group">
                                <label htmlFor="retry-recap-attempts">{t('settings.ai.retry.attempts')}</label>
                                <input 
                                    type="number" 
                                    id="retry-recap-attempts"
                                    min="1" max="5"
                                    value={retrySettings.generateRecap.attempts}
                                    disabled={!retrySettings.generateRecap.enabled}
                                    onChange={e => handleRetryChange('generateRecap', 'attempts', parseInt(e.target.value, 10))}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    };

    const renderAppearanceTab = () => (
        <div className="tab-content">
            <section className="settings-section">
                <h3>{t('settings.appearance.theme.title')}</h3>
                <p className="description">{t('settings.appearance.theme.description')}</p>
                <div className="theme-selector">
                    <button
                        className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                        aria-pressed={theme === 'light'}
                    >
                        <div className="theme-preview light"></div>
                        {t('settings.appearance.theme.light')}
                    </button>
                    <button
                        className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                        aria-pressed={theme === 'dark'}
                    >
                        <div className="theme-preview dark"></div>
                        {t('settings.appearance.theme.dark')}
                    </button>
                </div>
            </section>
        </div>
    );

    const renderLocalizationTab = () => (
        <div className="tab-content">
            <section className="settings-section">
                <h3>{t('settings.localization.language.title')}</h3>
                <p className="description">{t('settings.localization.language.description')}</p>
                <div className="form-group">
                    <label htmlFor="language-select">{t('settings.localization.language.selectLabel')}</label>
                    <select id="language-select" value={language} onChange={e => setLanguage(e.target.value as Language)}>
                        <option value="en">English</option>
                        <option value="nl">Dutch</option>
                    </select>
                </div>
            </section>
        </div>
    );

    const renderDataTab = () => (
        <div className="tab-content">
            <section className="settings-section">
                <h3>{t('settings.data.backup.title')}</h3>
                <p className="description">{t('settings.data.backup.description')}</p>
                <div className="data-actions">
                    <button onClick={handleExportAllData}>
                        {t('settings.data.backup.exportButton')}
                    </button>
                    <button onClick={() => importBackupRef.current?.click()}>
                        {t('settings.data.backup.importButton')}
                    </button>
                    <input type="file" accept=".json" ref={importBackupRef} onChange={handleFileImport} style={{ display: 'none' }} />
                </div>
            </section>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 id="settings-modal-title">{t('settings.title')}</h2>
                    <button className="close-button" onClick={onClose} aria-label={t('settings.closeAriaLabel')}>&times;</button>
                </header>
                <div className="settings-modal-body">
                    <nav className="settings-modal-tabs">
                        <button className={`tab-button ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>{t('settings.tab.sources')}</button>
                        <button className={`tab-button ${activeTab === 'apiKeys' ? 'active' : ''}`} onClick={() => setActiveTab('apiKeys')}>{t('settings.tab.apiKeys')}</button>
                        <button className={`tab-button ${activeTab === 'aiSettings' ? 'active' : ''}`} onClick={() => setActiveTab('aiSettings')}>{t('settings.tab.aiSettings')}</button>
                        <button className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>{t('settings.tab.appearance')}</button>
                        <button className={`tab-button ${activeTab === 'localization' ? 'active' : ''}`} onClick={() => setActiveTab('localization')}>{t('settings.tab.localization')}</button>
                        <button className={`tab-button ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>{t('settings.tab.data')}</button>
                    </nav>
                    {activeTab === 'sources' && renderSourcesTab()}
                    {activeTab === 'apiKeys' && renderApiKeysTab()}
                    {activeTab === 'aiSettings' && renderAiSettingsTab()}
                    {activeTab === 'appearance' && renderAppearanceTab()}
                    {activeTab === 'localization' && renderLocalizationTab()}
                    {activeTab === 'data' && renderDataTab()}
                </div>
                <footer className="modal-footer">
                    <button className="cancel-button" onClick={onClose}>{t('settings.button.cancel')}</button>
                    <button className="save-button" onClick={handleSave}>{t('settings.button.save')}</button>
                </footer>
            </div>
        </div>
    );
};

export default SettingsModal;