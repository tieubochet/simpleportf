import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wallet, PriceData } from '../types';

interface AllocationChartProps {
  wallets: Wallet[];
  prices: PriceData;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

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
    // First, flatten and aggregate all assets from all wallets
    const allAssets = new Map<string, { id: string; name: string; symbol: string; amount: number }>();
    wallets.forEach(wallet => {
        wallet.assets.forEach(asset => {
            const existing = allAssets.get(asset.id);
            if (existing) {
                allAssets.set(asset.id, { ...existing, amount: existing.amount + asset.amount });
            } else {
                allAssets.set(asset.id, { id: asset.id, name: asset.name, symbol: asset.symbol, amount: asset.amount });
            }
        });
    });
    
    const aggregatedAssets = Array.from(allAssets.values());

    const totalValue = aggregatedAssets.reduce((acc, asset) => acc + asset.amount * (prices[asset.id]?.usd ?? 0), 0);
    if (totalValue === 0) return [];
    
    return aggregatedAssets
      .map(asset => ({
        name: asset.symbol.toUpperCase(),
        value: asset.amount * (prices[asset.id]?.usd ?? 0),
        percent: (asset.amount * (prices[asset.id]?.usd ?? 0) / totalValue) * 100,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
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