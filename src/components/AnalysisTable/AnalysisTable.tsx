

import React, { useRef, useEffect } from 'react';
import type { AnalysisData, Indicator } from '../../types.ts';
import './AnalysisTable.css';
import currencies from '../../data/currencies.js';
import config from '../../data/config.js';
import { useLocalization } from '../../context/LocalizationContext.tsx';
import { getTranslationKey } from '../../utils/localization.ts';

const { tableHeaders, indicators } = config;

type AnalysisTab = 'scores' | 'risk' | 'pairs' | 'charts' | 'recap' | 'events' | 'journal' | 'log';

interface AnalysisTableProps {
    isAnalyzing: boolean;
    analysisData: AnalysisData;
    onOpenModal: (type: 'currency' | 'indicator', value: string, selected?: string) => void;
    selectedCurrencies: Set<string>;
    onToggleCurrencySelection: (currencyCode: string) => void;
    onUpdateEventModifier: (currencyCode: string, newModifier: number) => void;
    onOpenEventModifierRationaleModal: (currencyCode: string, currentRationale: string) => void;
    selectedCells: Set<string>;
    onToggleCellSelection: (currencyCode: string, indicator: Indicator) => void;
    onClearAllSelections: () => void;
    onSelectColumn: (indicator: Indicator) => void;
    onSwitchTab: (tab: AnalysisTab) => void;
}

const getScoreColorClass = (score: number | undefined | null): string => {
    if (score === undefined || score === null) return '';
    if (score > 1) return 'score-plus-2';
    if (score > 0) return 'score-plus-1';
    if (score > -1) return 'score-zero';
    if (score > -2) return 'score-minus-1';
    return 'score-minus-2';
};

const getDirectionClass = (direction: string | undefined): string => {
    if (!direction) return '';
    return `direction-${direction.toLowerCase().replace(/\s+/g, '-')}`;
}

const getModifierColorClass = (score: number | undefined | null): string => {
    if (score === undefined || score === null) return '';
    if (score > 0) return 'modifier-positive';
    if (score < 0) return 'modifier-negative';
    return 'modifier-neutral';
}

const calculateMedian = (scores: (number | undefined)[]): number | null => {
    const validScores = scores.filter((s): s is number => typeof s === 'number').sort((a, b) => a - b);
    if (validScores.length === 0) return null;

    const mid = Math.floor(validScores.length / 2);
    if (validScores.length % 2 === 0) {
        return (validScores[mid - 1] + validScores[mid]) / 2;
    } else {
        return validScores[mid];
    }
};


const AnalysisTable: React.FC<AnalysisTableProps> = ({ 
    isAnalyzing, 
    analysisData, 
    onOpenModal, 
    selectedCurrencies, 
    onToggleCurrencySelection, 
    onUpdateEventModifier,
    onOpenEventModifierRationaleModal,
    selectedCells, 
    onToggleCellSelection, 
    onClearAllSelections, 
    onSelectColumn,
    onSwitchTab
 }) => {
    const { t } = useLocalization();
    const tableRef = useRef<HTMLDivElement>(null);

    const baseScores = currencies.map(c => analysisData[c.code]?.sigmaScore);
    const baseScoreMedian = calculateMedian(baseScores);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Prevent clearing selection when clicking on any control in the header or the tabs.
            if (target.closest('.app-header') || target.closest('.analysis-tabs')) {
                return;
            }

            if (tableRef.current && !tableRef.current.contains(target)) {
                if (selectedCells.size > 0 || selectedCurrencies.size > 0) {
                    onClearAllSelections();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClearAllSelections, selectedCells.size, selectedCurrencies.size]);

    return (
        <div className="table-container" ref={tableRef}>
            <table className="analysis-table" aria-live="polite">
                <thead>
                    <tr>
                        {tableHeaders.map((header) => {
                             const isClickableIndicator = indicators.includes(header) || header === 'Event Modifier';
                             return (
                                <th scope="col" key={header}>
                                    <button
                                        className="header-button"
                                        onClick={(e) => {
                                            if (header === 'Event Modifier') {
                                                onSwitchTab('events');
                                            } else if (indicators.includes(header)) {
                                                if (e.shiftKey) {
                                                    e.preventDefault();
                                                    onSelectColumn(header as Indicator);
                                                } else {
                                                    onOpenModal('indicator', header);
                                                }
                                            }
                                        }}
                                        disabled={!isClickableIndicator}
                                        title={
                                            header === 'Event Modifier' ? "Go to Events tab" 
                                            : indicators.includes(header) ? "Click for indicator details. Shift-click to select column." 
                                            : ""
                                        }
                                    >
                                        {t(getTranslationKey(header))}
                                    </button>
                                </th>
                             )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {currencies.map((currency) => {
                        const data = analysisData[currency.code];
                        const isSelected = selectedCurrencies.has(currency.code);
                        const finalScore = data ? data.sigmaScore + data.eventModifierScore + data.riskModifier : undefined;
                        const scoreTooltip = data ? `Base: ${data.sigmaScore.toFixed(2)} | Event: ${data.eventModifierScore} | Risk: ${data.riskModifier}` : '';
                        return (
                            <tr key={currency.code} className={isSelected ? 'selected' : ''}>
                                <th scope="row">
                                    <button 
                                        className="currency-button" 
                                        onClick={(e) => {
                                            if (e.shiftKey) {
                                                e.preventDefault();
                                                onToggleCurrencySelection(currency.code);
                                            } else {
                                                onOpenModal('currency', currency.code);
                                            }
                                        }}
                                        title="Click to see details. Shift-click to select for targeted analysis."
                                    >
                                        <span className="currency-flag" role="img" aria-label={`${currency.code} flag`}>{currency.flag}</span>
                                        {currency.code}
                                    </button>
                                </th>
                                <td data-label={t(getTranslationKey('Direction'))} className={getDirectionClass(data?.direction)}>
                                    {data?.direction ?? (isAnalyzing ? '...' : '-')}
                                </td>
                                <td data-label={t(getTranslationKey('Modified Score'))} className={getScoreColorClass(finalScore)} title={scoreTooltip}>
                                    {finalScore?.toFixed(2) ?? (isAnalyzing ? '...' : '-')}
                                </td>
                                <td data-label={t(getTranslationKey('Event Modifier'))}>
                                    <div className="modifier-cell-content">
                                        {data ? (
                                             <select
                                                className={`modifier-select ${getModifierColorClass(data?.eventModifierScore)}`}
                                                value={data.eventModifierScore ?? 0}
                                                onChange={(e) => onUpdateEventModifier(currency.code, parseInt(e.target.value))}
                                                aria-label={`Set event modifier for ${currency.code}`}
                                            >
                                                <option value="1">+1</option>
                                                <option value="0">0</option>
                                                <option value="-1">-1</option>
                                            </select>
                                        ) : (isAnalyzing ? '...' : '-')}
                                        {data && (
                                            <button 
                                                className="rationale-button" 
                                                onClick={() => onOpenEventModifierRationaleModal(currency.code, data.eventModifierRationale || '')}
                                                title={data.eventModifierRationale || t('rationale.modal.tooltip')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td data-label={t(getTranslationKey('Risk Modifier'))} className={getModifierColorClass(data?.riskModifier)}>
                                    {data?.riskModifier ?? (isAnalyzing ? '...' : '-')}
                                </td>
                                <td data-label={t(getTranslationKey('Base Score'))} className={getScoreColorClass(data?.sigmaScore)}>
                                    {data?.sigmaScore?.toFixed(2) ?? (isAnalyzing ? '...' : '-')}
                                </td>
                                {indicators.map((indicator) => {
                                    const scoreData = data?.scores[indicator];
                                    const translatedIndicator = t(getTranslationKey(indicator));
                                    const cellId = `${currency.code}_${indicator}`;
                                    const isCellSelected = selectedCells.has(cellId);
                                    return (
                                        <td key={indicator} data-label={translatedIndicator} className={`${getScoreColorClass(scoreData?.score)} ${isCellSelected ? 'cell-selected' : ''}`}>
                                            <button 
                                                className="score-button" 
                                                title={scoreData?.rationale || "Click to see details. Shift-click to select for re-analysis."}
                                                onClick={(e) => {
                                                    if (e.shiftKey) {
                                                        e.preventDefault();
                                                        onToggleCellSelection(currency.code, indicator);
                                                    } else {
                                                        onOpenModal('currency', currency.code, indicator);
                                                    }
                                                }}
                                            >
                                                {scoreData?.score ?? (isAnalyzing ? '...' : '-')}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <th scope="row" colSpan={5}>Median</th>
                        <td className={getScoreColorClass(baseScoreMedian)}>
                            {baseScoreMedian?.toFixed(2) ?? (isAnalyzing ? '...' : '-')}
                        </td>
                        <td colSpan={tableHeaders.length - 6} className="median-placeholder"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default AnalysisTable;