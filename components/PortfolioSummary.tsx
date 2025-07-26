
import React from 'react';
import { PerformerData } from '../types';
import { TrophyIcon } from './icons';

interface PortfolioSummaryProps {
  totalValue: number;
  changeData: {
    changeValue: number;
    changePercentage: number;
  };
  change7dData: {
    changeValue: number;
    changePercentage: number;
  };
  plData: {
    plValue: number;
    plPercentage: number;
  };
  performer: PerformerData | null;
  isLoading: boolean;
}

const ChangeDisplay: React.FC<{ value: number; percentage: number }> = ({ value, percentage }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
    const sign = isPositive ? '+' : '';

    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        signDisplay: 'exceptZero'
    }).format(value);

    const formattedPercentage = `(${sign}${Math.abs(percentage || 0).toFixed(2)}%)`;
    
    if (isNaN(value) || isNaN(percentage)) {
        return (
            <div>
               <p className="text-lg font-semibold text-slate-300">-</p>
               <p className="text-sm font-mono text-slate-400">(-)</p>
            </div>
        );
    }

    return (
        <div className={colorClass}>
            <p className="text-lg font-semibold">{formattedValue}</p>
            <p className="text-sm font-mono">{formattedPercentage}</p>
        </div>
    );
};

const LoadingSkeletonBlock = () => (
    <>
        <div className="h-6 bg-slate-700 rounded-md animate-pulse w-24"></div>
        <div className="h-4 bg-slate-700 rounded-md animate-pulse w-16 mt-2"></div>
    </>
);


const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ totalValue, changeData, change7dData, plData, performer, isLoading }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalValue);

  const showLoadingSkeleton = isLoading && totalValue === 0;

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {/* Block 1: Total Value */}
        <div>
          <h2 className="text-lg font-medium text-slate-400 mb-2">Total Portfolio Value</h2>
          {showLoadingSkeleton ? (
            <div className="h-10 bg-slate-700 rounded-md animate-pulse w-48"></div>
          ) : (
            <p className="text-4xl font-bold text-white tracking-tight">{formattedValue}</p>
          )}
        </div>
        
        {/* Block 2: Performance (24h & 7d) */}
        <div>
          <h2 className="text-lg font-medium text-slate-400 mb-2">Performance</h2>
           {showLoadingSkeleton ? (
             <LoadingSkeletonBlock />
          ) : (
             <div className="flex space-x-4 md:space-x-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">24H</h3>
                    <ChangeDisplay value={changeData.changeValue} percentage={changeData.changePercentage} />
                </div>
                <div className="w-px bg-slate-700"></div> {/* Divider */}
                <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">7D</h3>
                    <ChangeDisplay value={change7dData.changeValue} percentage={change7dData.changePercentage} />
                </div>
             </div>
          )}
        </div>

        {/* Block 3: Total P/L */}
        <div>
          <h2 className="text-lg font-medium text-slate-400 mb-2">Total P/L</h2>
           {showLoadingSkeleton ? (
             <LoadingSkeletonBlock />
          ) : (
             <ChangeDisplay value={plData.plValue} percentage={plData.plPercentage} />
          )}
        </div>

        {/* Block 4: Top Performer */}
        <div>
            <h2 className="text-lg font-medium text-slate-400 mb-2 flex items-center space-x-2">
                <TrophyIcon className="h-5 w-5 text-yellow-400" />
                <span>Top Performer (24h)</span>
            </h2>
            {showLoadingSkeleton ? (
                <LoadingSkeletonBlock />
            ) : performer ? (
                <div>
                    <p className="text-lg font-semibold text-white truncate" title={performer.name}>{performer.name}</p>
                    <p className="text-sm font-mono text-green-400">
                        +{performer.change.toFixed(2)}%
                    </p>
                </div>
            ) : (
                <div>
                    <p className="text-lg font-semibold text-slate-300">-</p>
                    <p className="text-sm font-mono text-slate-400">N/A</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;