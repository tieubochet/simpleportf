
import React from 'react';

interface PortfolioSummaryProps {
  totalValue: number;
  changeData: {
    changeValue: number;
    changePercentage: number;
  };
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

    const formattedPercentage = `(${sign}${Math.abs(percentage).toFixed(2)}%)`;
    
    // Handle the case where change is effectively zero to avoid showing "-$0.00"
    if (Math.abs(value) < 0.01) {
         return (
            <div className="text-right">
               <p className="text-lg font-semibold text-slate-300">$0.00</p>
               <p className="text-sm font-mono text-slate-400">(0.00%)</p>
            </div>
        );
    }

    return (
        <div className={`text-right ${colorClass}`}>
            <p className="text-lg font-semibold">{formattedValue}</p>
            <p className="text-sm font-mono">{formattedPercentage}</p>
        </div>
    );
};


const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ totalValue, changeData, isLoading }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalValue);

  const showLoadingSkeleton = isLoading && totalValue === 0;

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-medium text-slate-400 mb-2">Total Portfolio Value</h2>
          {showLoadingSkeleton ? (
            <div className="h-10 bg-slate-700 rounded-md animate-pulse w-48"></div>
          ) : (
            <p className="text-4xl font-bold text-white tracking-tight">{formattedValue}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-lg font-medium text-slate-400 mb-2">24h Change</h2>
           {showLoadingSkeleton ? (
             <div className="flex flex-col items-end space-y-2">
                <div className="h-6 bg-slate-700 rounded-md animate-pulse w-24"></div>
                <div className="h-4 bg-slate-700 rounded-md animate-pulse w-16"></div>
             </div>
          ) : (
            totalValue > 0 && <ChangeDisplay value={changeData.changeValue} percentage={changeData.changePercentage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;