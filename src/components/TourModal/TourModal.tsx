import React from 'react';
import './TourModal.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';
import type { AnalysisTabName } from '../../App.tsx';

interface TourModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEndTour: () => void;
    tourStepId: AnalysisTabName;
}

const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose, onEndTour, tourStepId }) => {
    const { t } = useLocalization();

    if (!isOpen) {
        return null;
    }

    const titleKey = `tour.${tourStepId}.title`;
    const contentKey = `tour.${tourStepId}.content`;

    // Split content by newline characters to render paragraphs
    const contentParagraphs = t(contentKey).split('\n').filter(p => p.trim() !== '');

    return (
        <div className="modal-overlay tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-modal-title">
            <div className="tour-modal-content">
                <header className="modal-header">
                    <h2 id="tour-modal-title">{t(titleKey)}</h2>
                </header>
                <div className="tour-modal-body">
                    {contentParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                <footer className="modal-footer">
                    <button className="end-tour-button" onClick={onEndTour}>
                        {t('tour.button.end')}
                    </button>
                    <button className="next-tour-button" onClick={onClose}>
                        {t('tour.button.next')}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TourModal;