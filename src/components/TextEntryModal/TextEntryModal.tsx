import React, { useState, useEffect } from 'react';
import './TextEntryModal.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

interface TextEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: string) => void;
    title: string;
    label: string;
    initialValue: string;
}

const TextEntryModal: React.FC<TextEntryModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title,
    label,
    initialValue,
}) => {
    const { t } = useLocalization();
    const [text, setText] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setText(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSave = () => {
        onSave(text);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="text-entry-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 id="text-entry-modal-title">{title}</h2>
                    <button className="close-button" onClick={onClose} aria-label={t('settings.closeAriaLabel')}>&times;</button>
                </header>
                <div className="text-entry-modal-body">
                    <div className="form-group">
                        <label htmlFor="text-entry-textarea">{label}</label>
                        <textarea
                            id="text-entry-textarea"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={6}
                        />
                    </div>
                </div>
                <footer className="modal-footer">
                    <button className="cancel-button" onClick={onClose}>{t('settings.button.cancel')}</button>
                    <button className="save-button" onClick={handleSave}>{t('rationale.modal.saveButton')}</button>
                </footer>
            </div>
        </div>
    );
};

export default TextEntryModal;