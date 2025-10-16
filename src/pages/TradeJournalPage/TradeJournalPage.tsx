import React, { useState, useEffect } from 'react';
import type { Trade } from '../../types.ts';
import TradeList from '../../components/TradeList/TradeList.tsx';
import TradeFormModal from '../../components/TradeFormModal/TradeFormModal.tsx';
import './TradeJournalPage.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

interface TradeJournalPageProps {
    trades: Trade[];
    onSaveTrade: (trade: Trade) => void;
    onDeleteTrade: (tradeId: string) => void;
    onModalToggle: (isOpen: boolean) => void;
}

const TradeJournalPage: React.FC<TradeJournalPageProps> = ({ trades, onSaveTrade, onDeleteTrade, onModalToggle }) => {
    const { t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

    useEffect(() => {
        onModalToggle(isModalOpen);
    }, [isModalOpen, onModalToggle]);

    const handleOpenModal = (trade: Trade | null = null) => {
        setEditingTrade(trade);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTrade(null);
    };

    return (
        <div className="trade-journal-page">
            <header className="journal-header">
                <h2>{t('journal.title')}</h2>
                <button className="add-trade-button" onClick={() => handleOpenModal()}>
                    {t('journal.addTrade')}
                </button>
            </header>

            <TradeList 
                trades={trades}
                onEdit={handleOpenModal}
                onDelete={onDeleteTrade}
            />

            {isModalOpen && (
                <TradeFormModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={onSaveTrade}
                    trade={editingTrade}
                />
            )}
        </div>
    );
};

export default TradeJournalPage;