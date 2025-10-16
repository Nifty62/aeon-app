import React, { useMemo } from 'react';
import type { IndicatorDataPoint } from '../../types';
import './MiniChart.css';

interface MiniChartProps {
    data: IndicatorDataPoint[];
    sma20?: IndicatorDataPoint[];
    sma50?: IndicatorDataPoint[];
    levels?: { [key: string]: number };
    color: string;
}

const PADDING = { top: 10, right: 5, bottom: 5, left: 5 };
const SVG_WIDTH = 300;
const SVG_HEIGHT = 150;

const MiniChart: React.FC<MiniChartProps> = ({ data, sma20, sma50, levels, color }) => {

    const chartData = useMemo(() => {
        const allYValues = [
            ...data.map(d => d.value),
            ...(sma20?.map(d => d.value) || []),
            ...(sma50?.map(d => d.value) || []),
            ...(levels ? Object.values(levels) : [])
        ].filter((y): y is number => y !== null);

        if (allYValues.length === 0 || data.length < 2) return null;

        const yMin = Math.min(...allYValues);
        const yMax = Math.max(...allYValues);
        const yRange = yMax - yMin;

        const yAxisMin = yMin - yRange * 0.1;
        const yAxisMax = yMax + yRange * 0.1;

        const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
        const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;

        const xScale = (index: number) => PADDING.left + (index / (data.length - 1)) * chartWidth;
        const yScale = (y: number) => PADDING.top + chartHeight - ((y - yAxisMin) / (yAxisMax - yAxisMin || 1)) * chartHeight;

        const generatePath = (pathData: IndicatorDataPoint[]) => {
            if (pathData.length === 0) return '';
            const startIndex = data.findIndex(d => d.date === pathData[0].date);
            if (startIndex === -1) return '';
            
            return pathData.map((point, i) => {
                const x = xScale(startIndex + i);
                const y = yScale(point.value);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');
        };
        
        return {
            yScale,
            mainPath: generatePath(data),
            sma20Path: sma20 ? generatePath(sma20) : '',
            sma50Path: sma50 ? generatePath(sma50) : '',
        };

    }, [data, sma20, sma50, levels]);

    if (!chartData) {
        return <div className="mini-chart-container" style={{ width: '100%', height: '150px' }}><p>Not enough data to display chart.</p></div>;
    }

    const { yScale, mainPath, sma20Path, sma50Path } = chartData;

    return (
        <div className="mini-chart-container">
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
                {/* Level Lines */}
                {levels && Object.entries(levels).map(([key, value]) => (
                    <line
                        key={key}
                        x1={PADDING.left}
                        y1={yScale(value)}
                        x2={SVG_WIDTH - PADDING.right}
                        y2={yScale(value)}
                        className={`level-line ${key}-level`}
                    />
                ))}

                {/* SMA Paths */}
                {sma50Path && <path d={sma50Path} className="sma-path sma50" />}
                {sma20Path && <path d={sma20Path} className="sma-path sma20" />}

                {/* Main Data Path */}
                <path d={mainPath} className="main-path" style={{ stroke: color }} />
            </svg>
        </div>
    );
};

export default MiniChart;
