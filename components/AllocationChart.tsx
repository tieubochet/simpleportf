
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, PriceData, PortfolioAsset } from '../types';
import { getAssetMetrics } from '../utils/calculations';

interface AllocationChartProps {
  wallets: Wallet[];
  prices: PriceData;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#64748b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-700 p-3 rounded-lg border border-slate-600 shadow-lg">
        <p className="font-bold text-white">{`${data.name}`}</p>
        <p className="text-slate-300">{`Value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.value)}`}</p>
        <p className="text-cyan-400">{`Allocation: ${data.percent.toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

const AllocationChart: React.FC<AllocationChartProps> = ({ wallets, prices }) => {
  const chartData = useMemo(() => {
    const allAssets = new Map<string, { name: string; symbol: string; transactions: any[] }>();
    
    // Aggregate transactions for each unique asset across all wallets
    wallets.forEach(wallet => {
        wallet.assets.forEach(asset => {
            const existing = allAssets.get(asset.id);
            if (existing) {
                existing.transactions.push(...asset.transactions);
            } else {
                allAssets.set(asset.id, { 
                    name: asset.name, 
                    symbol: asset.symbol, 
                    transactions: [...asset.transactions] 
                });
            }
        });
    });

    const aggregatedAssets = Array.from(allAssets.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
    
    const assetValues = aggregatedAssets.map(asset => {
        const { marketValue } = getAssetMetrics(asset.transactions, prices[asset.id]?.usd ?? 0);
        return {
            name: asset.symbol.toUpperCase(),
            value: marketValue
        };
    });

    const totalValue = assetValues.reduce((acc, asset) => acc + asset.value, 0);
    if (totalValue === 0) return [];

    const assetsWithPercent = assetValues
      .map(asset => ({
        ...asset,
        percent: (asset.value / totalValue) * 100,
      }))
      .filter(item => item.value > 0);
      
    const mainAssets = assetsWithPercent.filter(asset => asset.percent > 2);
    const otherAssets = assetsWithPercent.filter(asset => asset.percent <= 2);
    
    let finalChartData = [...mainAssets];
    
    if (otherAssets.length > 0) {
        const othersTotalValue = otherAssets.reduce((sum, asset) => sum + asset.value, 0);
        const othersTotalPercent = otherAssets.reduce((sum, asset) => sum + asset.percent, 0);
        finalChartData.push({
            name: 'Others',
            value: othersTotalValue,
            percent: othersTotalPercent,
        });
    }

    return finalChartData.sort((a, b) => b.value - a.value);
      
  }, [wallets, prices]);

  if (chartData.length === 0) {
    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-xl font-semibold text-white mb-4">Overall Allocation</h3>
            <p className="text-slate-400">Not enough data to display chart.</p>
        </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Overall Allocation</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AllocationChart;
