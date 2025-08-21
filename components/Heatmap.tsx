import React from 'react';
import { HeatmapDataPoint } from '../types';

interface HeatmapProps {
  data: HeatmapDataPoint[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[440px]">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">24h Performance Heatmap</h3>
        <p className="text-slate-500 dark:text-slate-400">Add assets to see your portfolio heatmap.</p>
      </div>
    );
  }

  // Sort by the absolute value of change to have bigger blocks (bigger movers) first.
  const sortedData = [...data].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // Use more distinct colors for larger changes
  const getDynamicColor = (change: number): string => {
    const absChange = Math.abs(change);
    if (change > 0) { // Green for gains
        if (absChange > 10) return 'bg-green-700 hover:bg-green-600';
        if (absChange > 5) return 'bg-green-600 hover:bg-green-500';
        return 'bg-green-500 hover:bg-green-400';
    }
    if (change < 0) { // Red for losses
        if (absChange > 10) return 'bg-red-700 hover:bg-red-600';
        if (absChange > 5) return 'bg-red-600 hover:bg-red-500';
        return 'bg-red-500 hover:bg-red-400';
    }
    return 'bg-slate-500 hover:bg-slate-400'; // Neutral for no change
  };


  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md min-h-[440px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">24h Performance Heatmap</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Block size represents magnitude of price change.</p>
      </div>
      <div className="flex flex-wrap flex-grow content-stretch gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-md">
        {sortedData.map(item => (
          <div
            key={item.name}
            className={`flex flex-col justify-center items-center text-white font-bold p-2 rounded transition-colors duration-200 text-center break-words ${getDynamicColor(item.change)}`}
            style={{
              // Using flex-grow with a basis of 0 makes block width proportional to its change magnitude within its row.
              // A base value is added to ensure items with small/zero change are still visible.
              flexGrow: Math.abs(item.change) + 0.2,
              flexBasis: 0,
              minWidth: 0, // ensure flex-basis is respected
            }}
            title={`${item.name}: ${item.change.toFixed(2)}%`}
          >
            <span className="text-lg leading-tight drop-shadow-sm">{item.name}</span>
            <span className="text-xs font-mono mt-1 drop-shadow-sm">{item.change.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
