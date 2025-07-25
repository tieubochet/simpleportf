import React from 'react';
import { PerformerData } from '../types';
import { TrophyIcon } from './icons';

interface TopPerformerProps {
  performer: PerformerData | null;
  isLoading: boolean;
}

const LoadingSkeleton = () => (
  <div className="flex items-center space-x-4 animate-pulse">
    <div className="bg-slate-700 rounded-full p-3">
      <div className="h-8 w-8 bg-slate-600 rounded-full"></div>
    </div>
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-slate-700 rounded w-3/4"></div>
      <div className="h-6 bg-slate-700 rounded w-1/2"></div>
    </div>
  </div>
);

const Content: React.FC<{ performer: PerformerData | null }> = ({ performer }) => {
  if (!performer) {
    return (
      <div className="text-center text-slate-400 py-4">
        <p>No assets with positive gains in the last 24h.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="bg-yellow-500/10 rounded-full p-3">
        <TrophyIcon className="h-8 w-8 text-yellow-400" />
      </div>
      <div>
        <p className="font-bold text-lg text-white">{performer.name} <span className="text-slate-400 text-sm uppercase">{performer.symbol}</span></p>
        <p className="text-2xl font-bold text-green-400">
          +{performer.change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

const TopPerformer: React.FC<TopPerformerProps> = ({ performer, isLoading }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Top Performer (24h)</h3>
      {isLoading ? <LoadingSkeleton /> : <Content performer={performer} />}
    </div>
  );
};

export default TopPerformer;
