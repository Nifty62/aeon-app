import React, { useMemo } from 'react';
import './HistoryChart.css';

interface ChartDataset {
    label: string;
    data: { x: string, y: number | null }[];
    color: string;
}

interface HistoryChartProps {
    datasets: ChartDataset[];
}

const PADDING = { top: 20, right: 20, bottom: 60, left: 50 };
const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;

const HistoryChart: React.FC<HistoryChartProps> = ({ datasets }) => {
    const chartData = useMemo(() => {
        const allYValues = datasets.flatMap(ds => ds.data.map(d => d.y)).filter((y): y is number => y !== null);
        // FIX: Explicitly provide generic type to Array.from to correct type inference issues in some TypeScript environments.
        const allXValues: string[] = Array.from<string>(new Set(datasets.flatMap(ds => ds.data.map(d => d.x)))).sort();
        
        if (allXValues.length === 0) return null;

        const yMin = Math.min(...allYValues, 0);
        const yMax = Math.max(...allYValues, 0);

        const yRange = yMax - yMin;
        const yAxisMin = Math.floor(yMin - yRange * 0.1);
        const yAxisMax = Math.ceil(yMax + yRange * 0.1);
        
        const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
        const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;

        const xScale = (x: string) => {
            const index = allXValues.indexOf(x);
            return PADDING.left + (index / (allXValues.length - 1 || 1)) * chartWidth;
        };

        const yScale = (y: number) => {
            return PADDING.top + chartHeight - ((y - yAxisMin) / (yAxisMax - yAxisMin || 1)) * chartHeight;
        };
        
        const paths = datasets.map(ds => {
            let pathData = '';
            ds.data.forEach((point, i) => {
                if (point.y !== null) {
                    const x = xScale(point.x);
                    const y = yScale(point.y);
                    if (pathData === '' || ds.data[i - 1]?.y === null) {
                        pathData += `M ${x} ${y}`;
                    } else {
                        pathData += ` L ${x} ${y}`;
                    }
                }
            });
            return pathData;
        });
        
        // Ticks
        const numYTicks = 6;
        const yTicks = Array.from({ length: numYTicks + 1 }).map((_, i) => {
            const value = yAxisMin + (i / numYTicks) * (yAxisMax - yAxisMin);
            return { value: parseFloat(value.toFixed(2)), y: yScale(value) };
        });

        const numXTicks = Math.min(allXValues.length, 10);
        const xTickIndexes = Array.from({ length: numXTicks }).map((_, i) => Math.floor(i * (allXValues.length - 1) / (numXTicks - 1 || 1)));
        // FIX: Use Array.from to fix a type inference issue where spreading a Set results in an unknown[] type.
        const xTicks = Array.from(new Set(xTickIndexes)).map((index: number) => {
            const value = allXValues[index];
            return { value, x: xScale(value) };
        });

        return { xScale, yScale, paths, xTicks, yTicks, allXValues };
    }, [datasets]);

    if (!chartData) {
        return <div className="history-chart-container" style={{ width: '100%', height: '100%' }}><p>Select a metric to display.</p></div>;
    }

    const { xScale, yScale, paths, xTicks, yTicks } = chartData;

    return (
        <div className="history-chart-container">
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
                {/* Grid Lines */}
                <g className="grid">
                    {yTicks.map(tick => (
                        <line key={tick.value} x1={PADDING.left} y1={tick.y} x2={SVG_WIDTH - PADDING.right} y2={tick.y} />
                    ))}
                    {xTicks.map(tick => (
                         <line key={tick.value} x1={tick.x} y1={PADDING.top} x2={tick.x} y2={SVG_HEIGHT - PADDING.bottom} />
                    ))}
                </g>

                {/* Axes */}
                <g className="axes">
                    <line x1={PADDING.left} y1={SVG_HEIGHT - PADDING.bottom} x2={SVG_WIDTH - PADDING.right} y2={SVG_HEIGHT - PADDING.bottom} />
                    <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={SVG_HEIGHT - PADDING.bottom} />
                </g>
                
                {/* Ticks and Labels */}
                <g className="labels">
                    {yTicks.map(tick => (
                        <text key={tick.value} x={PADDING.left - 8} y={tick.y} textAnchor="end" alignmentBaseline="middle">{tick.value}</text>
                    ))}
                    {xTicks.map(tick => (
                         <text key={tick.value} x={tick.x} y={SVG_HEIGHT - PADDING.bottom + 20} textAnchor="middle">{tick.value}</text>
                    ))}
                </g>

                {/* Data Paths */}
                {datasets.map((ds, index) => (
                    <g key={ds.label}>
                         <path d={paths[index]} fill="none" stroke={ds.color} strokeWidth="2" />
                         {ds.data.map(point => point.y !== null && (
                            <circle key={point.x} cx={xScale(point.x)} cy={yScale(point.y)} r="3" fill={ds.color} />
                         ))}
                    </g>
                ))}
            </svg>
            <div className="chart-legend">
                {datasets.map(ds => (
                    <div key={ds.label} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: ds.color }}></span>
                        <span className="legend-label">{ds.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryChart;