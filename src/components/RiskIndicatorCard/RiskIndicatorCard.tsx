import React from 'react';
import type { IndicatorAnalysis, RiskSignal } from '../../types';
import MiniChart from '../MiniChart/MiniChart.tsx';
import './RiskIndicatorCard.css';

interface RiskIndicatorCardProps {
    analysis: IndicatorAnalysis;
    indicatorKey: string;
    onUpdateOverride: (indicatorKey: string, override: RiskSignal | null) => void;
}

const signalConfig: { [key in RiskSignal]: { className: string; color: string } } = {
    'Risk-On': { className: 'risk-on', color: '#50E3C2' },
    'Risk-Off': { className: 'risk-off', color: '#E94E77' },
    'Neutral': { className: 'neutral', color: '#B0B0B0' },
};

const RiskIndicatorCard: React.FC<RiskIndicatorCardProps> = ({ analysis, indicatorKey, onUpdateOverride }) => {
    
    const displaySignal = analysis.userOverrideSignal ?? analysis.signal;
    const isOverride = !!analysis.userOverrideSignal;
    const config = signalConfig[displaySignal];

    const handleOverrideChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onUpdateOverride(indicatorKey, value === 'auto' ? null : value as RiskSignal);
    };

    return (
        <div className="risk-indicator-card">
            <header className="card-header">
                <div>
                    <h3 className="card-title">
                        {analysis.name}
                        {isOverride && <span className="override-indicator">(Manual)</span>}
                    </h3>
                    <p className="card-role">{analysis.role}</p>
                </div>
                 <select
                    className={`signal-select ${config.className}`}
                    value={isOverride ? displaySignal : 'auto'}
                    onChange={handleOverrideChange}
                    aria-label={`Override signal for ${analysis.name}`}
                >
                    <option value="auto">Auto — {analysis.signal}</option>
                    <option value="Risk-On">Risk-On</option>
                    <option value="Risk-Off">Risk-Off</option>
                    <option value="Neutral">Neutral</option>
                </select>
            </header>
            <div className="card-chart">
                 <MiniChart 
                    data={analysis.data}
                    sma20={analysis.sma20}
                    sma50={analysis.sma50}
                    levels={analysis.levels}
                    color={config.color}
                />
            </div>
            <footer className="card-footer">
                <p className="card-rationale">{analysis.rationale}</p>
            </footer>
        </div>
    );
};

export default RiskIndicatorCard;