import React, { useState, useCallback, useEffect } from 'react';
import type {
    AnalysisData,
    ApiKey,
    SourceSettings,
    AIModelSettings,
    RecapStyle,
    RetrySettings,
    EconomicRecap,
    IndicatorScores,
    EventModifier,
} from '../../types';
import { generateRecap } from '../../ai';
import { useLocalization } from '../../context/LocalizationContext';
import currencies from '../../data/currencies';
import './RecapPage.css';

interface RecapPageProps {
    analysisData: AnalysisData;
    sourceSettings: SourceSettings;
    apiKey: ApiKey | undefined;
    aiModelSettings: AIModelSettings;
    recapStyle: RecapStyle;
    retrySettings: RetrySettings;
    onUpdateRecap: (currencyCode: string, recapData: EconomicRecap) => void;
}

const BLANK_RECAP: EconomicRecap = {
    bias: 'Neutral',
    narrativeReasoning: '',
    scoreModifier: 0,
    modifierRecommendation: '',
    eventModifiers: [],
    rawData: {},
    sources: [],
};

const RecapPage: React.FC<RecapPageProps> = ({
    analysisData,
    apiKey,
    aiModelSettings,
    recapStyle,
    retrySettings,
    onUpdateRecap,
}) => {
    const { t } = useLocalization();
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0].code);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableRecap, setEditableRecap] = useState<EconomicRecap | null>(null);

    const currentRecap = analysisData[selectedCurrency]?.recap;

    // Reset editing state when currency changes
    useEffect(() => {
        setIsEditing(false);
        setEditableRecap(null);
    }, [selectedCurrency]);


    const handleGenerateRecap = useCallback(async (currencyCode: string) => {
        if (!apiKey) {
            setError(t('analysisModal.recap.apiKeyWarning'));
            return;
        }

        const currencyData = analysisData[currencyCode];
        if (!currencyData || Object.keys(currencyData.scores).length === 0) {
            setError(`No scoring data available for ${currencyCode} to generate a recap.`);
            return;
        }

        setIsLoading(currencyCode);
        setError(null);
        
        const attempts = retrySettings.generateRecap.enabled ? retrySettings.generateRecap.attempts : 1;
        for (let i = 0; i < attempts; i++) {
            try {
                if (attempts > 1) {
                    console.log(t('analysis.recap.generating.attempt', { current: String(i + 1), max: String(attempts) }));
                }

                const recapResult = await generateRecap(
                    currencyCode,
                    currencyData.scores as IndicatorScores,
                    apiKey,
                    aiModelSettings,
                    recapStyle
                );
                
                onUpdateRecap(currencyCode, recapResult);
                setIsLoading(null);
                return; // Success
            } catch (err) {
                console.error(`Attempt ${i + 1} failed for ${currencyCode} recap:`, err);
                if (i === attempts - 1) {
                    setError(err instanceof Error ? err.message : t('analysisModal.recap.error.generic'));
                }
            }
        }
        setIsLoading(null);
    }, [apiKey, analysisData, aiModelSettings, recapStyle, retrySettings, onUpdateRecap, t]);

    const handleEdit = () => {
        setEditableRecap(JSON.parse(JSON.stringify(currentRecap || BLANK_RECAP)));
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditableRecap(null);
    };

    const handleSave = () => {
        if (editableRecap) {
            onUpdateRecap(selectedCurrency, editableRecap);
        }
        setIsEditing(false);
        setEditableRecap(null);
    };

    const handleRecapChange = (field: keyof EconomicRecap, value: any) => {
        setEditableRecap(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleEventChange = (index: number, field: keyof EventModifier, value: string) => {
        setEditableRecap(prev => {
            if (!prev) return null;
            const newEvents = [...prev.eventModifiers];
            newEvents[index] = { ...newEvents[index], [field]: value };
            return { ...prev, eventModifiers: newEvents };
        });
    };

    const addEvent = () => {
        const newEvent: EventModifier = { id: crypto.randomUUID(), heading: '', flag: 'Yellow Flag', description: '' };
        setEditableRecap(prev => prev ? { ...prev, eventModifiers: [...prev.eventModifiers, newEvent] } : null);
    };

    const removeEvent = (index: number) => {
        setEditableRecap(prev => prev ? { ...prev, eventModifiers: prev.eventModifiers.filter((_, i) => i !== index) } : null);
    };
    
    const renderEditView = () => {
        if (!editableRecap) return null;
        return (
            <div className="recap-edit-view">
                 <h3>{t('recap.editingTitle', { currencyCode: selectedCurrency })}</h3>
                 <div className="form-grid-two">
                    <div className="form-group">
                        <label>Bias</label>
                        <select value={editableRecap.bias} onChange={e => handleRecapChange('bias', e.target.value)}>
                            <option>Hawkish</option>
                            <option>Dovish</option>
                            <option>Neutral</option>
                            <option>Risk-On</option>
                            <option>Risk-Off</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Score Modifier</label>
                         <select value={editableRecap.scoreModifier} onChange={e => handleRecapChange('scoreModifier', parseInt(e.target.value))}>
                            <option value={1}>+1</option>
                            <option value={0}>0</option>
                            <option value={-1}>-1</option>
                        </select>
                    </div>
                 </div>
                <div className="form-group">
                    <label>Narrative Reasoning</label>
                    <textarea value={editableRecap.narrativeReasoning} onChange={e => handleRecapChange('narrativeReasoning', e.target.value)} rows={6} />
                </div>
                 <div className="form-group">
                    <label>Modifier Recommendation Rationale</label>
                    <textarea value={editableRecap.modifierRecommendation} onChange={e => handleRecapChange('modifierRecommendation', e.target.value)} rows={3} />
                </div>

                <div className="recap-section">
                    <h3>Notable Event Modifiers</h3>
                    <div className="event-modifiers-list-edit">
                        {editableRecap.eventModifiers.map((event, index) => (
                            <div key={event.id || index} className="event-modifier-edit-item">
                                <div className="event-edit-grid">
                                    <input type="text" placeholder="Heading" value={event.heading} onChange={e => handleEventChange(index, 'heading', e.target.value)} />
                                    <input type="date" placeholder="Date" value={event.date || ''} onChange={e => handleEventChange(index, 'date', e.target.value)} />
                                    <select value={event.flag} onChange={e => handleEventChange(index, 'flag', e.target.value)}>
                                        <option>Green Flag</option>
                                        <option>Yellow Flag</option>
                                        <option>Red Flag</option>
                                    </select>
                                </div>
                                <textarea placeholder="Description" value={event.description} onChange={e => handleEventChange(index, 'description', e.target.value)} rows={3}/>
                                <button className="remove-event-button" onClick={() => removeEvent(index)}>&times;</button>
                            </div>
                        ))}
                    </div>
                    <button className="add-event-button" onClick={addEvent}>{t('recap.addEventButton')}</button>
                </div>

                <div className="edit-actions">
                    <button className="cancel-button" onClick={handleCancel}>{t('recap.cancelButton')}</button>
                    <button className="save-button" onClick={handleSave}>{t('recap.saveButton')}</button>
                </div>
            </div>
        )
    };

    const renderDisplayView = () => (
        <>
            {!currentRecap ? (
                <div className="placeholder">
                    <p>{t('analysisModal.recap.notGenerated')}</p>
                </div>
            ) : (
                <div className="recap-details">
                    <div className="recap-grid">
                        <div className="recap-card">
                            <h3>Bias</h3>
                            <p>{currentRecap.bias}</p>
                        </div>
                        <div className="recap-card">
                            <h3>AI Recommended Modifier</h3>
                            <p className={`modifier-value ${currentRecap.scoreModifier > 0 ? 'positive' : currentRecap.scoreModifier < 0 ? 'negative' : ''}`}>
                                {currentRecap.scoreModifier > 0 ? `+${currentRecap.scoreModifier}` : currentRecap.scoreModifier}
                            </p>
                            <p className="modifier-rationale">{currentRecap.modifierRecommendation}</p>
                        </div>
                    </div>

                    <div className="recap-section">
                        <h3>Narrative Reasoning</h3>
                        <p>{currentRecap.narrativeReasoning}</p>
                    </div>

                    {currentRecap.eventModifiers && currentRecap.eventModifiers.length > 0 && (
                        <div className="recap-section">
                            <h3>Notable Event Modifiers</h3>
                            <div className="event-modifiers-list">
                                {currentRecap.eventModifiers.map((event, i) => (
                                    <div className="event-modifier-item" key={i}>
                                        <div className="event-modifier-header">
                                            <h4>{event.heading}<span className="event-date">{event.date}</span></h4>
                                            <span className={`event-flag flag-${event.flag.toLowerCase().replace(' ', '-')}`}>{event.flag}</span>
                                        </div>
                                        <p>{event.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );

    return (
        <div className="recap-page">
            <header className="recap-page-header">
                <div className="recap-page-header-content">
                    <h2>Economic Recap</h2>
                    <p>Select a currency to view, edit, or generate its AI-powered economic summary.</p>
                </div>
                 <div className="recap-page-header-actions">
                    <button className="edit-recap-button" onClick={handleEdit} disabled={isEditing}>{t('recap.editButton')}</button>
                    <button
                        className="recap-action-button"
                        onClick={() => handleGenerateRecap(selectedCurrency)}
                        disabled={!!isLoading || !apiKey || isEditing}
                        title={!apiKey ? t('analysisModal.recap.apiKeyWarning') : ''}
                    >
                        {isLoading === selectedCurrency ? t('analysisModal.recap.button.loading') : 
                         currentRecap ? t('analysisModal.recap.button.regenerate') : t('analysisModal.recap.button.generate')}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </div>
            </header>
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

            <div className="recap-content-area">
                {isEditing ? renderEditView() : renderDisplayView()}
            </div>
        </div>
    );
};

export default RecapPage;