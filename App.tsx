
import React, { useState, useEffect, useCallback } from 'react';
import { MarketIndicesData } from './types';
import { useTheme } from './hooks/useTheme';
import { fetchMarketIndices } from './services/marketData';

import MarketIndices from './components/MarketIndices';
import AdvancedMarketStats from './components/AdvancedMarketStats';

export default function App() {
  useTheme(); // Initialize theme logic
  
  const [marketIndices, setMarketIndices] = useState<MarketIndicesData | null>(null);
  const [isIndicesLoading, setIsIndicesLoading] = useState(true);
  
  const updateMarketIndices = useCallback(async () => {
      setIsIndicesLoading(true);
      try {
          const indices = await fetchMarketIndices();
          setMarketIndices(indices);
      } catch (err) {
          console.error("Failed to fetch market indices:", err);
      } finally {
          setIsIndicesLoading(false);
      }
  }, []);

  useEffect(() => {
      updateMarketIndices();
      const interval = setInterval(updateMarketIndices, 300000); // Update every 5 minutes
      return () => clearInterval(interval);
  }, [updateMarketIndices]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <main className="container mx-auto p-4 md:p-8">
        
        {/* Main 2-column dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Col 1: Indices (Wider) */}
          <div className="lg:col-span-3">
            <MarketIndices data={marketIndices} isLoading={isIndicesLoading} />
          </div>
          
          {/* Col 2: Advanced Stats (stacked) */}
          <div className="lg:col-span-2">
            <AdvancedMarketStats data={marketIndices} isLoading={isIndicesLoading} />
          </div>
        </div>

      </main>
    </div>
  );
}