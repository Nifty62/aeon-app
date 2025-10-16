import React from 'react';
import type { RiskSentimentAnalysis, RiskSignal, RiskConviction } from '../../types';
import { RiskIndicatorCard } from '../../components';
import { useLocalization } from '../../context/LocalizationContext';
import './RiskSentimentPage.css';

interface RiskSentimentPageProps {
    analysis: RiskSentimentAnalysis | null;
    isLoading: boolean;
    onUpdateIndicatorOverride: (indicatorKey: string, override: RiskSignal | null) => void;
    onUpdateOverallSentimentOverride: (overrides: { signal: RiskSignal | null, conviction: RiskConviction | null }) => void;
    onRunAnalysis: () => void;
}

const RiskSentimentPage: React.FC<RiskSentimentPageProps> = ({ analysis, isLoading, onUpdateIndicatorOverride, onUpdateOverallSentimentOverride, onRunAnalysis }) => {
    const { t } = useLocalization();

    const renderContent = () => {
        if (isLoading) {
            return <div className="risk-placeholder"><h3>{t('risk.loading')}</h3></div>;
        }

        if (!analysis) {
             return (
                <div className="risk-placeholder">
                    <h3>{t('risk.prompt.title')}</h3>
                    <p>{t('risk.prompt.description')}</p>
                </div>
            );
        }
        
        const { summary, overallSignal, conviction, spx, vix, audjpy, us10y } = analysis;
        const indicators = { spx, vix, audjpy, us10y };

        const convictionText = conviction === 'Uncertain' ? 'Neutral' : `${conviction} ${overallSignal}`;
        const convictionClass = `conviction-${conviction.toLowerCase()}`;
        const signalClass = `signal-${overallSignal.replace('-', '').toLowerCase()}`;

        return (
            <>
                <div className={`conviction-meter ${signalClass}`}>
                    <div className="conviction-main">
                        <div className="conviction-details">
                            <h3 className="conviction-label">{t('risk.conviction')}</h3>
                            <p className={`conviction-text ${convictionClass}`}>{convictionText}</p>
                        </div>
                        <div className="conviction-summary">
                            {t('risk.summary', { on: summary.on.toString(), neutral: summary.neutral.toString(), off: summary.off.toString() })}
                        </div>
                    </div>
                    <div className="conviction-overrides">
                         <div className="form-group">
                            <label htmlFor="override-signal">{t('risk.overrideSignal')}</label>
                            <select 
                                id="override-signal"
                                value={analysis.userOverrideSignal || 'auto'}
                                onChange={(e) => onUpdateOverallSentimentOverride({ 
                                    signal: e.target.value === 'auto' ? null : e.target.value as RiskSignal, 
                                    conviction: analysis.userOverrideConviction || null
                                })}
                            >
                                <option value="auto">{t('risk.autoSignal', { signal: overallSignal })}</option>
                                <option value="Risk-On">Risk-On</option>
                                <option value="Risk-Off">Risk-Off</option>
                                <option value="Neutral">Neutral</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="override-conviction">{t('risk.overrideConviction')}</label>
                            <select
                                id="override-conviction"
                                value={analysis.userOverrideConviction || 'auto'}
                                onChange={(e) => onUpdateOverallSentimentOverride({
                                    signal: analysis.userOverrideSignal || null,
                                    conviction: e.target.value === 'auto' ? null : e.target.value as RiskConviction
                                })}
                            >
                                <option value="auto">{conviction}</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Uncertain">Uncertain</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="indicators-grid">
                    {(Object.keys(indicators) as Array<keyof typeof indicators>).map(key => (
                        <RiskIndicatorCard 
                            key={key}
                            indicatorKey={key}
                            analysis={indicators[key]}
                            onUpdateOverride={onUpdateIndicatorOverride}
                        />
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="risk-sentiment-page">
            <header className="risk-header">
                <div className="risk-header-content">
                    <h2>{t('risk.title')}</h2>
                    <p>{t('risk.description')}</p>
                </div>
                <button 
                    className="run-analysis-button" 
                    onClick={onRunAnalysis} 
                    disabled={isLoading}
                >
                    {isLoading ? t('risk.refreshingButton') : t('risk.refreshButton')}
                </button>
            </header>
            {renderContent()}
        </div>
    );
};

export default RiskSentimentPage;