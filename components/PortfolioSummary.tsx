
import React from 'react';

interface PortfolioSummaryProps {
  totalValue: number;
  isLoading: boolean;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ totalValue, isLoading }) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalValue);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-medium text-slate-400 mb-2">Total Portfolio Value</h2>
      {isLoading && totalValue === 0 ? (
        <div className="h-10 bg-slate-700 rounded-md animate-pulse w-3/4"></div>
      ) : (
        <p className="text-4xl font-bold text-white tracking-tight">{formattedValue}</p>
      )}
    </div>
  );
};

export default PortfolioSummary;
