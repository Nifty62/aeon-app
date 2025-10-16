import React, { useState, useMemo } from 'react';
import type { HistoricalData } from '../../types';
import { HistoryChart } from '../../components';
import currencies from '../../data/currencies';
import config from '../../data/config';
import { useLocalization } from '../../context/LocalizationContext';
import { getTranslationKey } from '../../utils/localization';
import './ChartsPage.css';

const PRESET_COLORS = [
    '#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#BD10E0', 
    '#B8E986', '#7ED321', '#9013FE', '#417505', '#E94E77'
];

interface ChartsPageProps {
    historicalData: HistoricalData;
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

const ChartsPage: React.FC<ChartsPageProps> = ({ historicalData }) => {
    const { t } = useLocalization();
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]?.code || 'USD');
    const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(() => new Set(['Sigma Score']));
    
    const handleMetricToggle = (metric: string) => {
        setSelectedMetrics(prev => {
            const newSet = new Set(prev);
            if (newSet.has(metric)) {
                newSet.delete(metric);
            } else {
                newSet.add(metric);
            }
            return newSet;
        });
    };

    const chartDatasets = useMemo(() => {
        if (historicalData.length === 0) return [];
        
        const datasets: { label: string, data: { x: string, y: number | null }[], color: string }[] = [];
        let colorIndex = 0;

        const metricFunctions: { [key: string]: (snapshot: typeof historicalData[0], median: number | null) => number | null } = {
            // FIX: The `median` variable was not defined in this scope. Changed to correctly accept and return the `median` parameter.
            'Median Score': (snapshot, median) => median,
            'Sigma Score': (snapshot) => snapshot.data[selectedCurrency]?.sigmaScore ?? null,
            'Deviation': (snapshot, median) => {
                const score = snapshot.data[selectedCurrency]?.sigmaScore;
                return (score !== undefined && score !== null && median !== null) ? score - median : null;
            },
            ...Object.fromEntries(config.indicators.map(ind => [
                ind,
                (snapshot: typeof historicalData[0]) => snapshot.data[selectedCurrency]?.scores[ind]?.score ?? null
            ]))
        };

        selectedMetrics.forEach(metric => {
            const dataPoints: { x: string, y: number | null }[] = [];
            for (const snapshot of historicalData) {
                const allScores = currencies.map(c => snapshot.data[c.code]?.sigmaScore);
                const median = calculateMedian(allScores);
                dataPoints.push({
                    x: snapshot.date,
                    y: metricFunctions[metric](snapshot, median)
                });
            }
            datasets.push({
                label: metric,
                data: dataPoints,
                color: PRESET_COLORS[colorIndex % PRESET_COLORS.length]
            });
            colorIndex++;
        });

        return datasets;
    }, [historicalData, selectedCurrency, selectedMetrics]);

    if (historicalData.length === 0) {
        return (
            <div className="charts-placeholder">
                <h3>{t('charts.noData')}</h3>
            </div>
        );
    }
    
    const generalMetrics = ['Sigma Score', 'Deviation', 'Median Score'];

    return (
        <div className="charts-page">
            <header className="charts-header">
                <h2>{t('charts.title')}</h2>
                <p>{t('charts.description')}</p>
            </header>
            <div className="charts-container">
                <aside className="charts-controls">
                    <div className="control-group">
                        <label htmlFor="currency-select">{t('charts.selectCurrency')}</label>
                        <select id="currency-select" value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)}>
                            {currencies.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                        </select>
                    </div>

                    <div className="control-group">
                        <label>{t('charts.selectMetrics')}</label>
                        <div className="metrics-list">
                            <h4 className="metric-group-title">{t('charts.generalMetrics')}</h4>
                             {generalMetrics.map(metric => (
                                <div key={metric} className="metric-item">
                                    <input 
                                        type="checkbox" 
                                        id={`metric-${metric}`} 
                                        checked={selectedMetrics.has(metric)}
                                        onChange={() => handleMetricToggle(metric)}
                                    />
                                    <label htmlFor={`metric-${metric}`}>{t(metric === 'Deviation' ? 'charts.metric.deviation' : metric === 'Sigma Score' ? 'charts.metric.sigmaScore' : 'charts.metric.median')}</label>
                                </div>
                            ))}
                            <h4 className="metric-group-title">{t('charts.indicators')}</h4>
                            {config.indicators.map(indicator => (
                                 <div key={indicator} className="metric-item">
                                    <input 
                                        type="checkbox" 
                                        id={`metric-${indicator}`} 
                                        checked={selectedMetrics.has(indicator)}
                                        onChange={() => handleMetricToggle(indicator)}
                                    />
                                    <label htmlFor={`metric-${indicator}`}>{t(getTranslationKey(indicator))}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <main className="chart-area">
                    <HistoryChart datasets={chartDatasets} />
                </main>
            </div>
        </div>
    );
};

export default ChartsPage;