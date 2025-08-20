import React from 'react';
import { HeatmapDataPoint } from '../types';

interface HeatmapProps {
  data: HeatmapDataPoint[];
}

const getColorForChange = (change: number): string => {
  if (change >= 3) return 'bg-green-600 hover:bg-green-500';
  if (change > 0) return 'bg-green-500 hover:bg-green-400';
  if (change <= -3) return 'bg-red-600 hover:bg-red-500';
  if (change < 0) return 'bg-red-500 hover:bg-red-400';
  return 'bg-slate-500 hover:bg-slate-400';
};

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[440px]">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Portfolio Heatmap (24h)</h3>
        <p className="text-slate-500 dark:text-slate-400">Add assets to see your portfolio heatmap.</p>
      </div>
    );
  }

  // Sort by market value to have bigger blocks first, which generally looks better
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md min-h-[440px] flex flex-col">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Portfolio Heatmap (24h)</h3>
      <div className="flex flex-wrap flex-grow content-start gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-md">
        {sortedData.map(item => (
          <div
            key={item.name}
            className={`flex flex-col justify-center items-center text-white font-bold p-2 rounded transition-colors duration-200 text-center break-words ${getColorForChange(item.change)}`}
            style={{
              flexGrow: item.value,
              flexBasis: '80px', // Minimum base width before growing
              minWidth: '50px', // Prevent extreme shrinking
              minHeight: '50px',
            }}
            title={`${item.name}: ${item.change.toFixed(2)}%`}
          >
            <span className="text-lg leading-tight">{item.name}</span>
            <span className="text-xs font-mono mt-1">{item.change.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;