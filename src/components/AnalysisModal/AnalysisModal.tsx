import React, { useState, useEffect } from 'react';
import type { AnalysisData, SourceSettings, Score, Indicator } from '../../types';
import CentralBankAnalyzer from '../CentralBankAnalyzer/CentralBankAnalyzer.tsx';
import './AnalysisModal.css';
import currencies from '../../data/currencies.ts';
import config from '../../data/config.ts';
import { useLocalization } from '../../context/LocalizationContext.tsx';
import { getTranslationKey } from '../../utils/localization.ts';


interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: { type: 'currency' | 'indicator'; value: string; selected?: string };
    analysisData: AnalysisData;
    onUpdateScore: (currencyCode: string, indicator: Indicator, scoreData: Score | number) => void;
    sourceSettings: SourceSettings;
    scoringRules: Record<string, string[]>;
}

const getScoreColorClass = (score: number | undefined | ''): string => {
    if (score === undefined || score === '') return '';
    if (score > 1) return 'score-plus-2';
    if (score > 0) return 'score-plus-1';
    if (score > -1) return 'score-zero';
    if (score > -2) return 'score-minus-1';
    return 'score-minus-2';
};

const getModifierColorClass = (score: number | undefined): string => {
    if (score === undefined) return '';
    if (score > 0) return 'modifier-positive';
    if (score < 0) return 'modifier-negative';
    return 'modifier-neutral';
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({
    isOpen,
    onClose,
    content,
    analysisData,
    onUpdateScore,
    sourceSettings,
    scoringRules,
}) => {
    const { t } = useLocalization();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // State for manual editing
    const [editableScore, setEditableScore] = useState<number | ''>('');
    const [editableRationale, setEditableRationale] = useState('');

    const { type, value, selected } = content;

    useEffect(() => {
        if (!isOpen) return;
        
        let initialSelection: string | null = null;
        if (type === 'currency') {
            const currencyData = analysisData[value];
            const availableIndicators = new Set([
                ...Object.keys(currencyData?.scores || {}),
                ...Object.keys(sourceSettings[value] || {})
            ]);

            const sortedIndicators = config.indicators.filter(indicator =>
                availableIndicators.has(indicator)
            ) as Indicator[];

            initialSelection = selected && sortedIndicators.includes(selected as Indicator)
                ? selected
                : sortedIndicators[0] || null;
            
        } else {
            initialSelection = selected || currencies[0]?.code || null;
        }

        setSelectedItem(initialSelection);

        // Update editable state when selection changes
        if (type === 'currency' && initialSelection) {
            const scoreData = analysisData[value]?.scores[initialSelection as Indicator];
            setEditableScore(scoreData?.score ?? '');
            setEditableRationale(scoreData?.rationale || '');
        } else {
             setEditableScore('');
             setEditableRationale('');
        }

    }, [content, isOpen, analysisData, sourceSettings, selected, type, value]);

    const handleSaveScore = (currencyCode: string, indicator: Indicator) => {
        if (editableScore === '') return;
        const currentScoreData = analysisData[currencyCode]?.scores[indicator];
        const newScoreData: Score = {
            score: editableScore,
            rationale: editableRationale.trim() || 'Manual entry.',
            rawData: currentScoreData?.rawData // Preserve original raw data if it exists
        };
        onUpdateScore(currencyCode, indicator, newScoreData);
        // Optionally, close the modal or give feedback
        // For now, we'll just let the main table update
    };

    const renderIndicatorList = () => {
        const currencyCode = value;
        const currencyData = analysisData[currencyCode];
        // Get all indicators that have either a score or a configured source for this currency.
        const availableIndicators = new Set([
            ...Object.keys(currencyData?.scores || {}),
            ...Object.keys(sourceSettings[currencyCode] || {})
        ]);

        // Filter the master indicator list (which is in the correct order) to only show available ones.
        const sortedIndicators = config.indicators.filter(indicator =>
            availableIndicators.has(indicator)
        );

        return (
            <ul>
                {sortedIndicators.map(indicator => {
                    const score = currencyData?.scores[indicator as Indicator]?.score;
                    return (
                        <li key={indicator} className={selectedItem === indicator ? 'active' : ''}>
                            <button onClick={() => setSelectedItem(indicator)}>
                                <span className="item-label">{t(getTranslationKey(indicator))}</span>
                                <span className={`score-badge ${getScoreColorClass(score)}`}>{score ?? '-'}</span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        );
    };

    const renderCurrencyList = () => {
        const indicator = value as Indicator;
        return (
            <ul>
                {currencies.map(currency => {
                    const score = analysisData[currency.code]?.scores[indicator]?.score;
                    const modifier = analysisData[currency.code]?.eventModifierScore;
                    return (
                        <li key={currency.code} className={selectedItem === currency.code ? 'active' : ''}>
                            <button onClick={() => setSelectedItem(currency.code)}>
                                <span className="item-label">
                                    <span className="currency-flag">{currency.flag}</span>
                                    {currency.code}
                                </span>
                                {indicator === 'Event Modifier' 
                                    ? <span className={`score-badge ${getModifierColorClass(modifier)}`}>{modifier ?? '0'}</span>
                                    : <span className={`score-badge ${getScoreColorClass(score)}`}>{score ?? '-'}</span>
                                }
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderIndicatorDetails = () => {
        if (!selectedItem) return null;
        const currencyCode = value;
        const indicator = selectedItem as Indicator;
        const scoreData = analysisData[currencyCode]?.scores[indicator];

        return (
            <div className="analysis-details">
                <h3>{t(getTranslationKey(indicator))}</h3>
                <div className="detail-section">
                    <h4>AI Analysis / Rationale</h4>
                    <div className="ai-reco">
                         <span className={`score-badge ${getScoreColorClass(scoreData?.score)}`}>{scoreData?.score ?? '-'}</span>
                         <p>{scoreData?.rationale || t('analysisModal.indicator.noRationale')}</p>
                    </div>
                </div>

                 <div className="detail-section manual-override">
                     <h4>{t('analysisModal.indicator.manualOverride')}</h4>
                     <div className="manual-override-grid">
                        <div className="form-group">
                             <label htmlFor="score-override">{t('analysisModal.indicator.selectScore')}</label>
                            <select
                                id="score-override"
                                value={editableScore}
                                onChange={(e) => setEditableScore(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            >
                                <option value="" disabled>{t('analysisModal.indicator.selectScore')}</option>
                                <option value="2">+2</option>
                                <option value="1">+1</option>
                                <option value="0">0</option>
                                <option value="-1">-1</option>
                                <option value="-2">-2</option>
                            </select>
                        </div>
                        <div className="form-group rationale-group">
                            <label htmlFor="rationale-override">Rationale</label>
                            <textarea
                                id="rationale-override"
                                value={editableRationale}
                                onChange={e => setEditableRationale(e.target.value)}
                                placeholder={t('analysisModal.indicator.rationalePlaceholder')}
                                rows={4}
                            />
                        </div>
                     </div>
                     <button 
                        className="save-score-button" 
                        onClick={() => handleSaveScore(currencyCode, indicator)}
                        disabled={editableScore === ''}
                     >
                        {t('analysisModal.indicator.saveButton')}
                    </button>
                 </div>
                 
                 {scoreData?.rawData && (
                    <div className="detail-section">
                        <h4>{t('analysisModal.indicator.rawData')}</h4>
                        <p className="raw-data">{typeof scoreData.rawData === 'object' ? JSON.stringify(scoreData.rawData, null, 2) : scoreData.rawData}</p>
                    </div>
                 )}

                 <div className="detail-section">
                     <h4>{t('analysisModal.indicator.sources')}</h4>
                     <ul className="source-url-list">
                         {(sourceSettings[currencyCode]?.[indicator] || []).map((url, i) => (
                             <li key={i}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
                         ))}
                     </ul>
                 </div>

                {scoringRules[indicator] && (
                    <div className="detail-section">
                        <h4>{t('analysisModal.indicator.scoringRules')}</h4>
                        <ul className="criteria-list">{scoringRules[indicator].map((rule, i) => <li key={i}>{rule}</li>)}</ul>
                    </div>
                )}
            </div>
        );
    };

    const renderEventModifierDetails = () => {
        if (!selectedItem) return null;
        const currencyCode = selectedItem;
        const currencyData = analysisData[currencyCode];
        const recap = currencyData?.recap;
        const modifier = currencyData?.eventModifierScore ?? 0;

        return (
             <div className="analysis-details">
                <h3>{t('analysisModal.eventModifier.title')} for {currencyCode}</h3>
                <div className="detail-section">
                    <h4>{t('analysisModal.eventModifier.currentValue')}</h4>
                    <div className="ai-reco">
                         <span className={`score-badge ${getModifierColorClass(modifier)}`}>{modifier > 0 ? `+${modifier}`: modifier}</span>
                         <p>{recap?.modifierRecommendation || t('analysisModal.eventModifier.noRecap')}</p>
                    </div>
                </div>

                {recap?.eventModifiers && recap.eventModifiers.length > 0 ? (
                    <div className="recap-section">
                        <h3>Notable Event Modifiers</h3>
                        <div className="event-modifiers-list">
                            {recap.eventModifiers.map((event, i) => (
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
                ) : (
                    <div className="placeholder"><p>{t('analysisModal.eventModifier.noRecap')}</p></div>
                )}
            </div>
        );
    }

    const renderCurrencyDetails = () => {
        if (!selectedItem) return null;
        const indicator = value as Indicator;
        const currencyCode = selectedItem;
        const currencyInfo = currencies.find(c => c.code === currencyCode);
        const scoreData = analysisData[currencyCode]?.scores[indicator];

        return (
             <div className="analysis-details">
                <h3>{currencyInfo?.flag} {currencyCode}</h3>
                <div className="detail-section">
                    <h4>Analysis for "{t(getTranslationKey(indicator))}"</h4>
                    <div className="ai-reco">
                         <span className={`score-badge ${getScoreColorClass(scoreData?.score)}`}>{scoreData?.score ?? '-'}</span>
                         <p>{scoreData?.rationale || t('analysisModal.indicator.noRationale')}</p>
                    </div>
                </div>
                 {scoreData?.rawData && (
                    <div className="detail-section">
                        <h4>{t('analysisModal.indicator.rawData')}</h4>
                        <p className="raw-data">{typeof scoreData.rawData === 'object' ? JSON.stringify(scoreData.rawData, null, 2) : scoreData.rawData}</p>
                    </div>
                 )}
                <div className="detail-section">
                     <h4>{t('analysisModal.indicator.sources')}</h4>
                     <ul className="source-url-list">
                         {(sourceSettings[currencyCode]?.[indicator] || []).map((url, i) => (
                             <li key={i}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
                         ))}
                     </ul>
                 </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="analysis-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 id="analysis-modal-title">
                        {type === 'currency'
                            ? `${t('analysisModal.title.currencyAnalysis')} ${currencies.find(c => c.code === value)?.flag} ${value}`
                            : `${t('analysisModal.title.indicatorAnalysis')} "${t(getTranslationKey(value))}"`}
                    </h2>
                    <button className="close-button" onClick={onClose} aria-label={t('settings.closeAriaLabel')}>&times;</button>
                </header>

                <div className="analysis-modal-body-container">
                    <div className="analysis-panes">
                        <div className="left-pane">
                            {type === 'currency' ? renderIndicatorList() : renderCurrencyList()}
                        </div>
                        <div className="right-pane">
                            {selectedItem 
                                ? (
                                    value === 'Event Modifier' 
                                        ? renderEventModifierDetails()
                                        : type === 'currency' ? renderIndicatorDetails() : renderCurrencyDetails()
                                )
                                : <div className="placeholder"><p>Select an item from the list to see details.</p></div>
                            }
                        </div>
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="cancel-button" onClick={onClose}>{t('settings.button.close')}</button>
                </footer>
            </div>
        </div>
    );
};

export default AnalysisModal;