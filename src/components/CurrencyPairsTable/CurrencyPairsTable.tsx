import React from 'react';
import type { AnalysisData } from '../../types';
import currencies from '../../data/currencies';
import './CurrencyPairsTable.css';
import { useLocalization } from '../../context/LocalizationContext';

interface CurrencyPairsTableProps {
    analysisData: AnalysisData;
}

const calculateMedian = (scores: (number | undefined)[]): number => {
    const validScores = scores.filter((s): s is number => typeof s === 'number').sort((a, b) => a - b);
    if (validScores.length === 0) return 0;

    const mid = Math.floor(validScores.length / 2);
    if (validScores.length % 2 === 0) {
        return (validScores[mid - 1] + validScores[mid]) / 2;
    } else {
        return validScores[mid];
    }
};

const getBiasFromSpread = (spread: number): string => {
    if (spread > 8) return 'Very Bullish';
    if (spread >= 4) return 'Bullish';
    if (spread < -8) return 'Very Bearish';
    if (spread <= -4) return 'Bearish';
    return 'Neutral';
};

const getDirectionClass = (direction: string | undefined): string => {
    if (!direction) return '';
    return `direction-${direction.toLowerCase().replace(/\s+/g, '-')}`;
};

const CurrencyPairsTable: React.FC<CurrencyPairsTableProps> = ({ analysisData }) => {
    const { t } = useLocalization();
    
    const currenciesWithData = currencies.filter(c => {
        const data = analysisData[c.code];
        return data && typeof (data.sigmaScore + data.eventModifierScore + data.riskModifier) === 'number';
    });
    
    const baseScores = currenciesWithData.map(c => {
        const data = analysisData[c.code]!;
        return data.sigmaScore;
    });

    const medianScore = calculateMedian(baseScores);
    
    const deviations = new Map<string, number>();
    currenciesWithData.forEach(c => {
        const data = analysisData[c.code]!;
        const finalScore = data.sigmaScore + data.eventModifierScore + data.riskModifier;
        deviations.set(c.code, finalScore - medianScore);
    });

    const pairs = [];
    for (const baseCurrency of currenciesWithData) {
        for (const quoteCurrency of currenciesWithData) {
            if (baseCurrency.code === quoteCurrency.code) continue;

            const baseDeviation = deviations.get(baseCurrency.code) ?? 0;
            const quoteDeviation = deviations.get(quoteCurrency.code) ?? 0;
            const spread = baseDeviation - quoteDeviation;
            const bias = getBiasFromSpread(spread);

            pairs.push({
                name: `${baseCurrency.code}/${quoteCurrency.code}`,
                bias: bias,
                spread: spread
            });
        }
    }

    // Sort pairs by absolute spread descending
    pairs.sort((a, b) => Math.abs(b.spread) - Math.abs(a.spread));


    return (
        <div className="table-container">
            <table className="currency-pairs-table">
                <thead>
                    <tr>
                        <th>{t('pairs.table.header.pair')}</th>
                        <th>{t('pairs.table.header.bias')}</th>
                        <th>{t('pairs.table.header.deviationSpread')}</th>
                    </tr>
                </thead>
                <tbody>
                    {pairs.map(pair => (
                        <tr key={pair.name}>
                            <td>{pair.name}</td>
                            <td className={getDirectionClass(pair.bias)}>{pair.bias}</td>
                            <td>{pair.spread.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CurrencyPairsTable;