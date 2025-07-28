import React from 'react';
import { PerformerData } from '../types';
import { TrophyIcon } from './icons';

interface TopPerformerProps {
  performer: PerformerData | null;
  isLoading: boolean;
}

const TopPerformer: React.FC<TopPerformerProps> = ({ performer, isLoading }) => {
  const showLoadingSkeleton = isLoading && !performer;

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <TrophyIcon className="h-6 w-6 mr-3 text-amber-400" />
        Top Performer (24h)
      </h3>
      {showLoadingSkeleton ? (
        <div className="animate-pulse flex items-center space-x-4">
          <div className="flex-grow space-y-2">
            <div className="h-5 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : performer ? (
        <div>
          <p className="text-2xl font-bold text-white">{performer.name}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-lg font-mono text-green-400">
              +{performer.change.toFixed(2)}%
            </p>
            <p className="text-slate-400 uppercase">{performer.symbol}</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-400">No performance data available.</p>
      )}
    </div>
  );
};

export default TopPerformer;
