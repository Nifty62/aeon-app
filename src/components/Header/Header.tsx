import React from 'react';
import './Header.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

interface HeaderProps {
    onSettingsClick: () => void;
    onFeedbackClick: () => void;
    onAnalyzeAll: (force: boolean) => void;
    isAnalyzing: boolean;
    isAnalyzeDisabled: boolean;
    hasSelection: boolean;
    fetchOnly: boolean;
    onSetFetchOnly: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onSettingsClick, 
    onFeedbackClick,
    onAnalyzeAll, 
    isAnalyzing, 
    isAnalyzeDisabled, 
    hasSelection,
    fetchOnly,
    onSetFetchOnly
}) => {
    const { t } = useLocalization();

    const getButtonText = () => {
        if (isAnalyzing) return t('header.analyzingButton');
        const actionText = fetchOnly ? "Fetch Data" : "Analyze";
        const scopeText = hasSelection ? "Selected" : "All";
        return `${actionText} ${scopeText}`;
    };

    const handleAnalyzeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const force = event.shiftKey;
        onAnalyzeAll(force);
    };

    return (
        <header className="app-header" aria-labelledby="app-title">
             <h1 id="app-title" className="app-title" data-text={t('header.title')}>
                {t('header.title')}
            </h1>
            <div className="header-actions">
                <button className="settings-button" onClick={onFeedbackClick}>{t('header.feedbackButton')}</button>
                <div className="analyze-action-group">
                    <div className="analyze-controls">
                            <div className="fetch-only-toggle">
                            <input 
                                type="checkbox" 
                                id="fetch-only-checkbox" 
                                checked={fetchOnly} 
                                onChange={e => onSetFetchOnly(e.target.checked)} 
                            />
                            <label htmlFor="fetch-only-checkbox">Fetch Data Only</label>
                        </div>
                        <button 
                            className="analyze-button" 
                            onClick={handleAnalyzeClick}
                            disabled={isAnalyzing || isAnalyzeDisabled}
                            title={isAnalyzeDisabled ? t('header.analyzeButtonDisabledTooltip') : "Click to run. Shift-click to bypass cache and force re-analysis."}
                        >
                            {getButtonText()}
                        </button>
                    </div>
                    {isAnalyzeDisabled && !isAnalyzing && (
                        <p className="no-key-warning">{t('header.analyzeButton.noKeyWarning')}</p>
                    )}
                </div>
                <button 
                    className="icon-button" 
                    onClick={onSettingsClick} 
                    aria-label={t('header.settingsButton')} 
                    title={t('header.settingsButton')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Header;