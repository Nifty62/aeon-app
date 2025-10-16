
import React, { useState, useEffect } from 'react';
import type { Trade, TradeDirection, TradeStatus } from '../../types.ts';
import './TradeFormModal.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

interface TradeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trade: Trade) => void;
    trade: Trade | null;
}

const TradeFormModal: React.FC<TradeFormModalProps> = ({ isOpen, onClose, onSave, trade }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Partial<Trade>>({});

    useEffect(() => {
        if (trade) {
            setFormData(trade);
        } else {
            // Default values for a new trade
            setFormData({
                id: `trade-${Date.now()}`,
                entryDate: new Date().toISOString().slice(0, 16),
                direction: 'Long',
                status: 'Open',
                pair: 'EURUSD'
            });
        }
    }, [trade, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty string or valid number
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.pair || !formData.entryPrice) {
            alert('Please fill in at least the Pair and Entry Price.');
            return;
        }
        onSave(formData as Trade);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="trade-form-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{trade ? t('journal.form.title.edit') : t('journal.form.title.new')}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="trade-form">
                    <div className="form-grid-three">
                        <div className="form-group">
                            <label htmlFor="entryDate">{t('journal.form.entryDate')}</label>
                            <input
                                type="datetime-local"
                                id="entryDate"
                                name="entryDate"
                                value={formData.entryDate || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pair">{t('journal.form.pair')}</label>
                            <input
                                type="text"
                                id="pair"
                                name="pair"
                                value={formData.pair || ''}
                                onChange={handleChange}
                                placeholder="e.g., EURUSD"
                                required
                                style={{textTransform: 'uppercase'}}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="direction">{t('journal.form.direction')}</label>
                            <select
                                id="direction"
                                name="direction"
                                value={formData.direction || 'Long'}
                                onChange={handleChange}
                            >
                                <option value="Long">{t('journal.form.direction.long')}</option>
                                <option value="Short">{t('journal.form.direction.short')}</option>
                            </select>
                        </div>
                    </div>

                     <div className="form-grid-three">
                        <div className="form-group">
                            <label htmlFor="entryPrice">{t('journal.form.entryPrice')}</label>
                            <input
                                type="number"
                                id="entryPrice"
                                name="entryPrice"
                                value={formData.entryPrice ?? ''}
                                onChange={handleNumberChange}
                                step="any"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="stopLoss">{t('journal.form.stopLoss')}</label>
                            <input
                                type="number"
                                id="stopLoss"
                                name="stopLoss"
                                value={formData.stopLoss ?? ''}
                                onChange={handleNumberChange}
                                step="any"
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="takeProfit">{t('journal.form.takeProfit')}</label>
                            <input
                                type="number"
                                id="takeProfit"
                                name="takeProfit"
                                value={formData.takeProfit ?? ''}
                                onChange={handleNumberChange}
                                step="any"
                            />
                        </div>
                    </div>

                    <div className="form-grid-three">
                         <div className="form-group">
                            <label htmlFor="status">{t('journal.form.status')}</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status || 'Open'}
                                onChange={handleChange}
                            >
                                <option value="Open">{t('journal.form.status.open')}</option>
                                <option value="Closed">{t('journal.form.status.closed')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exitPrice">{t('journal.form.exitPrice')}</label>
                            <input
                                type="number"
                                id="exitPrice"
                                name="exitPrice"
                                value={formData.exitPrice ?? ''}
                                onChange={handleNumberChange}
                                step="any"
                                disabled={formData.status !== 'Closed'}
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="pnl">{t('journal.form.pnl')}</label>
                            <input
                                type="number"
                                id="pnl"
                                name="pnl"
                                value={formData.pnl ?? ''}
                                onChange={handleNumberChange}
                                step="any"
                                disabled={formData.status !== 'Closed'}
                            />
                        </div>
                    </div>
                     <div className="form-group">
                        <label htmlFor="positionSize">{t('journal.form.positionSize')}</label>
                        <input
                            type="number"
                            id="positionSize"
                            name="positionSize"
                            value={formData.positionSize ?? ''}
                            onChange={handleNumberChange}
                            step="any"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">{t('journal.form.notes')}</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            rows={5}
                        />
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="cancel-button" onClick={onClose}>{t('journal.form.button.cancel')}</button>
                        <button type="submit" className="save-button">{t('journal.form.button.save')}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default TradeFormModal;
