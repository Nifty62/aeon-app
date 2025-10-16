import React, { useState, useMemo } from 'react';
import './FeedbackModal.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

// A subset of FullAppState for system info
interface AppStateForFeedback {
    analysisData: any;
    historicalData: any;
    riskSentiment: any;
    sourceSettings: any;
    trades: any;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    appState: AppStateForFeedback;
}

type FeedbackType = 'bug' | 'feature' | 'general';

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, appState }) => {
    const { t } = useLocalization();
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [attachInfo, setAttachInfo] = useState(true);

    const isFormValid = useMemo(() => {
        return subject.trim() !== '' && description.trim() !== '';
    }, [subject, description]);

    const getSystemInfo = () => {
        try {
            const info = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timestamp: new Date().toISOString(),
                ...appState
            };
            // Use a replacer to handle large objects or circular references if needed,
            // and truncate large arrays to keep the mailto link from getting too long.
            const replacer = (key, value) => {
                if (Array.isArray(value) && value.length > 50) {
                    return `Array with ${value.length} items (truncated)`;
                }
                return value;
            };

            return JSON.stringify(info, replacer, 2);
        } catch (error) {
            return `Error collecting system info: ${error instanceof Error ? error.message : String(error)}`;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const mailto = 'feedback@aeon-app.dev';
        const mailSubject = `[AEON Feedback - ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)}] ${subject}`;
        
        let body = `Type: ${feedbackType}\n`;
        body += `Subject: ${subject}\n`;
        if (email) {
            body += `User Email: ${email}\n`;
        }
        body += `\n--- Description ---\n${description}\n`;

        if (attachInfo) {
            body += `\n\n--- System Info ---\n${getSystemInfo()}`;
        }

        const mailtoLink = `mailto:${mailto}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink, '_blank');
        
        alert(t('feedback.alert.submitted'));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 id="feedback-modal-title">{t('feedback.title')}</h2>
                    <button className="close-button" onClick={onClose} aria-label={t('settings.closeAriaLabel')}>&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-group">
                        <label htmlFor="feedback-type">{t('feedback.type.label')}</label>
                        <select id="feedback-type" value={feedbackType} onChange={e => setFeedbackType(e.target.value as FeedbackType)}>
                            <option value="bug">{t('feedback.type.bug')}</option>
                            <option value="feature">{t('feedback.type.feature')}</option>
                            <option value="general">{t('feedback.type.general')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="feedback-subject">{t('feedback.subject.label')}</label>
                        <input
                            type="text"
                            id="feedback-subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder={t('feedback.subject.placeholder')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="feedback-description">{t('feedback.description.label')}</label>
                        <textarea
                            id="feedback-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t('feedback.description.placeholder')}
                            rows={8}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="feedback-email">{t('feedback.email.label')}</label>
                        <input
                            type="email"
                            id="feedback-email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t('feedback.email.placeholder')}
                        />
                    </div>
                     <div className="switch-control">
                        <input 
                            type="checkbox" 
                            id="feedback-attach-info"
                            checked={attachInfo}
                            onChange={e => setAttachInfo(e.target.checked)}
                        />
                        <label htmlFor="feedback-attach-info">{t('feedback.attachInfo.label')}</label>
                    </div>
                     <p className="description">
                        {t('feedback.attachInfo.description')}
                    </p>
                    <footer className="modal-footer">
                        <button type="button" className="cancel-button" onClick={onClose}>{t('settings.button.cancel')}</button>
                        <button type="submit" className="save-button" disabled={!isFormValid}>{t('feedback.button.submit')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;