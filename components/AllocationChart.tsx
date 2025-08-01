
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, PriceData } from '../types';
import { getAssetMetrics } from '../utils/calculations';

interface AllocationChartProps {
  wallets: Wallet[];
  prices: PriceData;
  isPrivacyMode: boolean;
}

const COLORS = ['#d946ef', '#f97316', '#facc15', '#fb923c', '#e11d48', '#f472b6', '#a78bfa', '#818cf8', '#60a5fa', '#22d3ee', '#34d399', '#a3e635'];

// Custom legend component
const CustomLegend = ({ payload, onToggleViewAll, showAll, hasOthers, hoveredItem, setHoveredItem }: any) => {
  return (
    <div className="text-sm w-full">
      <ul>
        {payload.map((entry: any, index: number) => (
          <li
            key={`item-${index}`}
            className="flex items-center justify-between mb-2 cursor-pointer transition-opacity duration-200"
            style={{ opacity: hoveredItem && hoveredItem !== entry.value ? 0.5 : 1 }}
            onMouseEnter={() => setHoveredItem(entry.value)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-center truncate">
              <span className="h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-300 truncate" title={entry.value}>{entry.value}</span>
            </div>
            <span className="font-mono text-slate-400 pl-2">{`${entry.payload.percent.toFixed(2)}%`}</span>
          </li>
        ))}
      </ul>
      {hasOthers && (
        <button
            onClick={onToggleViewAll}
            className="text-cyan-400 hover:text-cyan-500 mt-2 text-left w-full"
            onMouseEnter={() => setHoveredItem(null)}
            onMouseLeave={() => setHoveredItem(null)}
        >
          {showAll ? 'View Less' : 'View All'}
        </button>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, isPrivacyMode }: { active?: boolean; payload?: any[], isPrivacyMode: boolean }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.value;
    const percent = data.percent;
    const name = data.name;

    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

    return (
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-white mb-1">{name}</p>
        <p className="text-slate-300">{isPrivacyMode ? '$ ****' : formattedValue}</p>
        <p className="text-slate-400">{`${percent.toFixed(2)}% of portfolio`}</p>
      </div>
    );
  }

  return null;
};


const AllocationChart: React.FC<AllocationChartProps> = ({ wallets, prices, isPrivacyMode }) => {
  const [showAll, setShowAll] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { allAssetsData, groupedChartData } = useMemo(() => {
    const allAssetsMap = new Map<string, { name: string; symbol: string; transactions: any[] }>();
    
    wallets.forEach(wallet => {
        wallet.assets.forEach(asset => {
            const existing = allAssetsMap.get(asset.id);
            if (existing) {
                existing.transactions.push(...asset.transactions);
            } else {
                allAssetsMap.set(asset.id, { 
                    name: asset.name, 
                    symbol: asset.symbol, 
                    transactions: [...asset.transactions] 
                });
            }
        });
    });
    
    const assetValues = Array.from(allAssetsMap.entries()).map(([id, data]) => {
      const { marketValue } = getAssetMetrics(data.transactions, prices[id]?.usd ?? 0);
      return {
          name: data.symbol.toUpperCase(),
          value: marketValue,
      };
    });

    const totalValue = assetValues.reduce((acc, asset) => acc + asset.value, 0);
    if (totalValue === 0) return { allAssetsData: [], groupedChartData: [] };

    const assetsWithPercent = assetValues
      .map(asset => ({
        ...asset,
        percent: (asset.value / totalValue) * 100,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const LEGEND_LIMIT = 12;
    const mainAssets = assetsWithPercent.slice(0, LEGEND_LIMIT);
    const otherAssets = assetsWithPercent.slice(LEGEND_LIMIT);
    
    let finalGroupedData = [...mainAssets];
    
    if (otherAssets.length > 0) {
        const othersTotalValue = otherAssets.reduce((sum, asset) => sum + asset.value, 0);
        const othersTotalPercent = otherAssets.reduce((sum, asset) => sum + asset.percent, 0);
        finalGroupedData.push({
            name: 'Others',
            value: othersTotalValue,
            percent: othersTotalPercent,
        });
    }

    return { allAssetsData: assetsWithPercent, groupedChartData: finalGroupedData };
      
  }, [wallets, prices]);
  
  const legendDataToShow = showAll ? allAssetsData : groupedChartData;
  const pieDataToShow = groupedChartData;
  const hasOthers = pieDataToShow.some(d => d.name === 'Others');

  const onToggleViewAll = () => {
    setShowAll(prev => !prev);
  }

  if (pieDataToShow.length === 0) {
    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[440px]">
            <h3 className="text-xl font-semibold text-white mb-4">Overall Allocation</h3>
            <p className="text-slate-400">Not enough data to display chart.</p>
        </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6">Overall Allocation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip isPrivacyMode={isPrivacyMode} />} cursor={{ fill: 'transparent' }} />
              <Pie
                data={pieDataToShow}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="100%"
                fill="#8884d8"
                paddingAngle={pieDataToShow.length > 1 ? 2 : 0}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={false}
                onMouseEnter={(data) => setHoveredItem(data.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {pieDataToShow.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="focus:outline-none transition-opacity duration-200"
                    style={{ opacity: hoveredItem && hoveredItem !== entry.name ? 0.5 : 1 }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="max-h-[300px] overflow-y-auto pr-2">
          <CustomLegend 
            payload={legendDataToShow.map((entry, index) => ({ value: entry.name, color: COLORS[index % COLORS.length], payload: entry }))} 
            onToggleViewAll={onToggleViewAll} 
            showAll={showAll}
            hasOthers={hasOthers}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
          />
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;
