
import React, { useState } from 'react';
import './WelcomeModal.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';
import type { AIProvider, Language } from '../../types';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void; // This can now be considered a generic close/skip action
    onStartTour: () => void;
    onSkipTour: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onStartTour, onSkipTour }) => {
    const { t, language, setLanguage } = useLocalization();
    const [activeInstruction, setActiveInstruction] = useState<AIProvider | null>(null);

    if (!isOpen) {
        return null;
    }

    const toggleInstruction = (provider: AIProvider) => {
        setActiveInstruction(prev => prev === provider ? null : provider);
    };

    const providers: AIProvider[] = ['gemini', 'openai', 'deepseek', 'openrouter'];

    const renderInstructions = (provider: AIProvider) => {
        const steps = [];
        let i = 1;
        while (true) {
            const stepKey = `welcome.instructions.${provider}.step${i}`;
            const stepText = t(stepKey);
            if (stepText === stepKey) { // Key doesn't exist
                break;
            }
            steps.push(<li key={i}>{stepText}</li>);
            i++;
        }
        return <ol className="instruction-list">{steps}</ol>;
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
            <div className="welcome-modal-content">
                <header className="modal-header">
                    <h2 id="welcome-modal-title">{t('welcome.title')}</h2>
                     <div className="language-selector-welcome">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            aria-label="Select language"
                        >
                            <option value="en">English</option>
                            <option value="nl">Dutch</option>
                        </select>
                    </div>
                </header>
                <div className="welcome-modal-body">
                    <p className="welcome-intro">{t('welcome.intro')}</p>

                    <div className="api-key-sections">
                        <div className="api-key-section">
                            <h3>{t('welcome.aiApi.title')}</h3>
                            <p>{t('welcome.aiApi.description')}</p>
                        </div>
                        <div className="api-key-section">
                            <h3>{t('welcome.marketApi.title')}</h3>
                            <p>
                                {t('welcome.marketApi.description')}
                                <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer">
                                    {t('welcome.alphaVantageLink')}
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="instruction-section">
                        <h4>{t('welcome.getApiKeyTitle')}</h4>
                        <div className="instruction-accordion">
                            {providers.map(provider => (
                                <div className="instruction-item" key={provider}>
                                    <button
                                        className="instruction-toggle"
                                        onClick={() => toggleInstruction(provider)}
                                        aria-expanded={activeInstruction === provider}
                                    >
                                        {t(`welcome.instructions.${provider}.title`)}
                                        <span className={`chevron ${activeInstruction === provider ? 'open' : ''}`}>&#9660;</span>
                                    </button>
                                    {activeInstruction === provider && (
                                        <div className="instruction-content">
                                            {renderInstructions(provider)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                <footer className="modal-footer">
                    <button className="settings-button" onClick={onSkipTour}>
                        {t('welcome.button.skipTour')}
                    </button>
                    <button className="start-button" onClick={onStartTour}>
                        {t('welcome.button.startTour')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default WelcomeModal;