

import React from 'react';
import type { Trade } from '../../types.ts';
import './TradeList.css';
import { useLocalization } from '../../context/LocalizationContext.tsx';

interface TradeListProps {
    trades: Trade[];
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete }) => {
    const { t } = useLocalization();

    if (trades.length === 0) {
        return <div className="no-trades-placeholder">{t('journal.noTrades')}</div>;
    }

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    };

    return (
        <div className="table-container">
            <table className="trade-list-table">
                <thead>
                    <tr>
                        <th>{t('journal.table.date')}</th>
                        <th>{t('journal.table.pair')}</th>
                        <th>{t('journal.table.direction')}</th>
                        <th>{t('journal.table.status')}</th>
                        <th>{t('journal.table.entry')}</th>
                        <th>{t('journal.table.exit')}</th>
                        <th>{t('journal.table.size')}</th>
                        <th>{t('journal.table.pnl')}</th>
                        <th className="notes-column">{t('journal.table.notes')}</th>
                        <th>{t('journal.table.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {trades.map(trade => (
                        <tr key={trade.id}>
                            <td data-label={t('journal.table.date')}>{formatDateTime(trade.entryDate)}</td>
                            <td data-label={t('journal.table.pair')}>{trade.pair.toUpperCase()}</td>
                            <td data-label={t('journal.table.direction')} className={trade.direction === 'Long' ? 'direction-long' : 'direction-short'}>
                                {t(trade.direction === 'Long' ? 'journal.form.direction.long' : 'journal.form.direction.short')}
                            </td>
                            <td data-label={t('journal.table.status')}>
                                <span className={`status-badge status-${trade.status.toLowerCase()}`}>
                                    {t(trade.status === 'Open' ? 'journal.form.status.open' : 'journal.form.status.closed')}
                                </span>
                            </td>
                            <td data-label={t('journal.table.entry')}>{trade.entryPrice}</td>
                            <td data-label={t('journal.table.exit')}>{trade.exitPrice ?? '-'}</td>
                            <td data-label={t('journal.table.size')}>{trade.positionSize ?? '-'}</td>
                            <td data-label={t('journal.table.pnl')} className={trade.pnl ? (trade.pnl > 0 ? 'pnl-positive' : 'pnl-negative') : ''}>
                                {trade.pnl ?? '-'}
                            </td>
                            <td data-label={t('journal.table.notes')} className="notes-column"><p>{trade.notes ?? '-'}</p></td>
                            <td data-label={t('journal.table.actions')}>
                                <div className="action-buttons">
                                    <button className="action-button edit-button" onClick={() => onEdit(trade)}>Edit</button>
                                    <button className="action-button delete-button" onClick={() => onDelete(trade.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TradeList;
