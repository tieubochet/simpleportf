import React, { useMemo, useRef, useState, useEffect } from 'react';
import { HeatmapDataPoint } from '../types';

interface HeatmapProps {
  data: HeatmapDataPoint[];
}

interface LayoutItem extends HeatmapDataPoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

const formatMarketCap = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${Math.round(value / 1e3)}K`;
    return `$${value.toFixed(0)}`;
};

// Helper function to calculate the "worst" aspect ratio of a row of items.
// The goal is to keep this value low, meaning items are closer to squares.
const getWorstAspectRatio = (row: HeatmapDataPoint[], length: number) => {
    const totalArea = row.reduce((sum, item) => sum + item.value, 0);
    if (totalArea === 0 || length === 0) return Infinity;

    let minArea = Infinity;
    let maxArea = -Infinity;
    for (const item of row) {
        minArea = Math.min(minArea, item.value);
        maxArea = Math.max(maxArea, item.value);
    }
    const s2 = totalArea * totalArea;
    const l2 = length * length;
    return Math.max((l2 * maxArea) / s2, s2 / (l2 * minArea));
};

// The Squarified Treemap algorithm implementation.
const squarify = (
    items: HeatmapDataPoint[], 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    result: LayoutItem[]
) => {
    if (items.length === 0) return;
    
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    if (totalValue <= 0) return;

    if (items.length === 1) {
        result.push({ ...items[0], x, y, width, height });
        return;
    }

    const isHorizontal = width >= height;
    const length = isHorizontal ? height : width;

    // Find the best number of items to include in the current row/column.
    let i = 1;
    while (i < items.length) {
        if (getWorstAspectRatio(items.slice(0, i), length) < getWorstAspectRatio(items.slice(0, i + 1), length)) {
            break;
        }
        i++;
    }
    
    const currentRowItems = items.slice(0, i);
    const remainingItems = items.slice(i);
    const rowTotalValue = currentRowItems.reduce((sum, item) => sum + item.value, 0);

    // Layout the current row of items.
    if (isHorizontal) {
        const rowWidth = (rowTotalValue / totalValue) * width;
        let currentY = y;
        for (const item of currentRowItems) {
            const itemHeight = (item.value / rowTotalValue) * height;
            result.push({ ...item, x, y: currentY, width: rowWidth, height: itemHeight });
            currentY += itemHeight;
        }
        // Recurse into the remaining space with the remaining items.
        squarify(remainingItems, x + rowWidth, y, width - rowWidth, height, result);
    } else { // Vertical layout
        const rowHeight = (rowTotalValue / totalValue) * height;
        let currentX = x;
        for (const item of currentRowItems) {
            const itemWidth = (item.value / rowTotalValue) * width;
            result.push({ ...item, x: currentX, y, width: itemWidth, height: rowHeight });
            currentX += itemWidth;
        }
        squarify(remainingItems, x, y + rowHeight, width, height - rowHeight, result);
    }
}

// A memoized component for rendering a single block in the treemap.
const Block: React.FC<{ item: LayoutItem }> = React.memo(({ item }) => {
    const { name, value, change, x, y, width, height } = item;

    const color = change > 0 ? 'bg-green-500' : change < 0 ? 'bg-red-500' : 'bg-slate-500';
    
    // Determine font size based on block area, with constraints.
    const area = width * height;
    const fontSize = Math.max(12, Math.min(Math.sqrt(area) * 0.15, 48));

    // Hide text if the block is too small to be legible.
    const showText = width > 40 && height > 30;

    return (
        <div
            className={`absolute flex flex-col justify-center items-center text-white p-2 box-border overflow-hidden transition-all duration-300 ease-in-out border-2 border-white dark:border-slate-800 ${color}`}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
            }}
            title={`${name}: ${formatMarketCap(value)} (${change.toFixed(2)}%)`}
        >
            {showText && (
                <>
                    <span
                        className="font-bold tracking-tighter"
                        style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
                    >
                        {name}
                    </span>
                    <span
                        className="font-normal tracking-tight opacity-90"
                        style={{ fontSize: `${fontSize * 0.5}px`, marginTop: `${fontSize * 0.1}px` }}
                    >
                        {formatMarketCap(value)}
                    </span>
                </>
            )}
        </div>
    );
});


const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const layout = useMemo(() => {
        if (!data || data.length === 0 || dimensions.width <= 0 || dimensions.height <= 0) {
            return [];
        }
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        const result: LayoutItem[] = [];
        squarify(sortedData, 0, 0, dimensions.width, dimensions.height, result);
        return result;
    }, [data, dimensions]);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[440px]">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Market Cap Treemap</h3>
                <p className="text-slate-500 dark:text-slate-400">Add assets to see your portfolio treemap.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md min-h-[440px] flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Market Cap Treemap</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Block size represents asset market value in your portfolio.</p>
            </div>
            <div className="flex-1 w-full overflow-hidden">
                <div ref={containerRef} className="relative w-full h-full">
                    {layout.map(item => (
                        <Block key={item.name} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
