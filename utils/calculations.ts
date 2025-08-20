import { Wallet, PriceData, Transaction, PortfolioAsset, HistoricalDataPoint, PerformerData } from '../types';

/**
 * Calculates key metrics for a single asset based on its transaction history and current price.
 * @param transactions - An array of buy/sell/transfer transactions for the asset.
 * @param currentPrice - The current market price of the asset.
 * @returns An object containing currentQuantity, avgBuyPrice, marketValue, and unrealizedPL.
 */
export const getAssetMetrics = (transactions: Transaction[], currentPrice: number) => {
  let totalQuantityBought = 0;
  let totalCostBasisWithFees = 0; // Cost basis from 'buy' transactions only, including fees
  let totalQuantitySold = 0;
  let totalQuantityTransferredIn = 0;
  let totalQuantityTransferredOut = 0;

  for (const tx of transactions) {
    const fee = tx.fee || 0;
    switch (tx.type) {
      case 'buy':
        totalQuantityBought += tx.quantity;
        totalCostBasisWithFees += (tx.quantity * tx.pricePerUnit) + fee;
        break;
      case 'sell':
        totalQuantitySold += tx.quantity;
        break;
      case 'transfer_in':
        totalQuantityTransferredIn += tx.quantity;
        break;
      case 'transfer_out':
        totalQuantityTransferredOut += tx.quantity;
        break;
    }
  }

  const currentQuantity = totalQuantityBought + totalQuantityTransferredIn - totalQuantitySold - totalQuantityTransferredOut;
  
  // Average buy price now includes fees to reflect true cost per unit.
  const avgBuyPrice = totalQuantityBought > 0 ? totalCostBasisWithFees / totalQuantityBought : 0;
  
  // The cost of the assets currently held.
  const costOfCurrentHoldings = currentQuantity * avgBuyPrice;
  
  const marketValue = currentQuantity * currentPrice;
  
  // P/L is only calculated if there's a cost basis from 'buy' transactions.
  const unrealizedPL = totalQuantityBought > 0 ? marketValue - costOfCurrentHoldings : 0;

  return {
    currentQuantity,
    avgBuyPrice,
    marketValue,
    unrealizedPL,
  };
};

/**
 * Calculates the total market value of all assets across all wallets.
 * @param wallets - An array of wallets.
 * @param prices - An object mapping asset IDs to their current prices.
 * @returns The total portfolio value in USD.
 */
export const calculateTotalValue = (wallets: Wallet[], prices: PriceData): number => {
    return wallets.reduce((total, wallet) => {
        return total + wallet.assets.reduce((walletTotal, asset) => {
            const currentPrice = prices[asset.id]?.usd ?? 0;
            const { marketValue } = getAssetMetrics(asset.transactions, currentPrice);
            return walletTotal + marketValue;
        }, 0);
    }, 0);
};

/**
 * Calculates the portfolio's change in value over the last 24 hours.
 * @param wallets An array of wallets.
 * @param prices An object with current prices and 24h change data.
 * @returns An object with the change in value and percentage.
 */
export const calculatePortfolio24hChange = (wallets: Wallet[], prices: PriceData): { changeValue: number; changePercentage: number } => {
  let totalValueNow = 0;
  let totalValue24hAgo = 0;

  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      const priceInfo = prices[asset.id];
      if (!priceInfo) return; // Skip if no price data

      const { usd: currentPrice, usd_24h_change: changePercent } = priceInfo;
      const { currentQuantity } = getAssetMetrics(asset.transactions, currentPrice);

      if (currentQuantity > 0) {
        const marketValueNow = currentQuantity * currentPrice;
        totalValueNow += marketValueNow;
        
        // Only calculate 24h ago value if change data is available
        if (typeof changePercent === 'number') {
          // Formula: price_24h_ago = currentPrice / (1 + (changePercent / 100))
          const price24hAgo = currentPrice / (1 + (changePercent / 100));
          const marketValue24hAgo = currentQuantity * price24hAgo;
          totalValue24hAgo += marketValue24hAgo;
        } else {
          // If no 24h change data, assume its value 24h ago was the same as now.
          // This prevents new assets from skewing the percentage change downwards.
          totalValue24hAgo += marketValueNow;
        }
      }
    });
  });

  if (totalValue24hAgo === 0) {
    return { changeValue: 0, changePercentage: 0 };
  }

  const changeValue = totalValueNow - totalValue24hAgo;
  const changePercentage = (changeValue / totalValue24hAgo) * 100;
  
  return { changeValue, changePercentage };
};

/**
 * Calculates a single wallet's change in value over the last 24 hours.
 * @param wallet A single wallet.
 * @param prices An object with current prices and 24h change data.
 * @returns An object with the change in value and percentage.
 */
export const calculateWallet24hChange = (wallet: Wallet, prices: PriceData): { changeValue: number; changePercentage: number } => {
  let totalValueNow = 0;
  let totalValue24hAgo = 0;

  wallet.assets.forEach(asset => {
    const priceInfo = prices[asset.id];
    if (!priceInfo) return; // Skip if no price data

    const { usd: currentPrice, usd_24h_change: changePercent } = priceInfo;
    const { currentQuantity } = getAssetMetrics(asset.transactions, currentPrice);

    if (currentQuantity > 0) {
      const marketValueNow = currentQuantity * currentPrice;
      totalValueNow += marketValueNow;

      if (typeof changePercent === 'number') {
        const price24hAgo = currentPrice / (1 + (changePercent / 100));
        const marketValue24hAgo = currentQuantity * price24hAgo;
        totalValue24hAgo += marketValue24hAgo;
      } else {
        totalValue24hAgo += marketValueNow;
      }
    }
  });

  if (totalValue24hAgo === 0) {
    return { changeValue: 0, changePercentage: 0 };
  }

  const changeValue = totalValueNow - totalValue24hAgo;
  const changePercentage = (changeValue / totalValue24hAgo) * 100;

  return { changeValue, changePercentage };
};

/**
 * Calculates the total profit/loss for the entire portfolio.
 * @param wallets - An array of wallets.
 * @param prices - An object mapping asset IDs to their current prices.
 * @returns An object with the total P/L value and percentage.
 */
export const calculateTotalPL = (wallets: Wallet[], prices: PriceData): { plValue: number; plPercentage: number } => {
  let totalMarketValue = 0;
  let totalCostBasis = 0; // Total capital invested, including all fees
  let totalValueRealized = 0; // Net proceeds from sales

  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      const currentPrice = prices[asset.id]?.usd ?? 0;
      
      let currentQuantity = 0;
      
      asset.transactions.forEach(tx => {
        const fee = tx.fee || 0;
        switch (tx.type) {
          case 'buy':
            currentQuantity += tx.quantity;
            totalCostBasis += (tx.quantity * tx.pricePerUnit) + fee;
            break;
          case 'sell':
            currentQuantity -= tx.quantity;
            totalValueRealized += (tx.quantity * tx.pricePerUnit) - fee;
            break;
          case 'transfer_in':
            currentQuantity += tx.quantity;
            totalCostBasis += fee; // Fees on transfers are a cost
            break;
          case 'transfer_out':
            currentQuantity -= tx.quantity;
            totalCostBasis += fee; // Fees on transfers are a cost
            break;
        }
      });

      if (currentQuantity > 0) {
        totalMarketValue += currentQuantity * currentPrice;
      }
    });
  });

  if (totalCostBasis === 0) {
    // If nothing was ever bought or invested, P/L is 0. Avoid division by zero.
    return { plValue: 0, plPercentage: 0 };
  }

  const plValue = totalMarketValue + totalValueRealized - totalCostBasis;
  const plPercentage = (plValue / totalCostBasis) * 100;

  return { plValue, plPercentage };
};


/**
 * Extracts a flat, unique list of all asset IDs from all wallets.
 * @param wallets - An array of wallets.
 * @returns A string array of unique asset IDs.
 */
export const getAssetIds = (wallets: Wallet[]): string[] => {
    const ids = new Set<string>();
    wallets.forEach(w => w.assets.forEach(a => ids.add(a.id)));
    return Array.from(ids);
};

/**
 * Finds the asset with the highest positive 24-hour change.
 * @param wallets - An array of wallets.
 * @param prices - An object with current prices and 24h change data.
 * @returns A PerformerData object for the top performer, or null if none.
 */
export const findTopPerformer = (wallets: Wallet[], prices: PriceData): PerformerData | null => {
  let topPerformer: PerformerData | null = null;
  let maxChange = -Infinity;

  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      const priceInfo = prices[asset.id];
      const { currentQuantity } = getAssetMetrics(asset.transactions, priceInfo?.usd ?? 0);

      if (priceInfo && typeof priceInfo.usd_24h_change === 'number' && currentQuantity > 0) {
        if (priceInfo.usd_24h_change > maxChange) {
          maxChange = priceInfo.usd_24h_change;
          topPerformer = {
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol,
            change: priceInfo.usd_24h_change,
          };
        }
      }
    });
  });

  return topPerformer;
};

/**
 * Finds the asset with the most negative 24-hour change (top loser).
 * @param wallets - An array of wallets.
 * @param prices - An object with current prices and 24h change data.
 * @returns A PerformerData object for the top loser, or null if there are no assets with negative change.
 */
export const findTopLoser = (wallets: Wallet[], prices: PriceData): PerformerData | null => {
  let topLoser: PerformerData | null = null;
  let minChange = 0; // Find the most negative change, so start from 0

  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      const priceInfo = prices[asset.id];
      const { currentQuantity } = getAssetMetrics(asset.transactions, priceInfo?.usd ?? 0);

      // We are looking for a negative change, so we check priceInfo.usd_24h_change < minChange
      if (priceInfo && typeof priceInfo.usd_24h_change === 'number' && currentQuantity > 0) {
        if (priceInfo.usd_24h_change < minChange) {
          minChange = priceInfo.usd_24h_change;
          topLoser = {
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol,
            change: priceInfo.usd_24h_change,
          };
        }
      }
    });
  });

  return topLoser;
};


/**
 * Calculates the historical total value of a portfolio over time.
 * This robust version iterates through a master timeline and calculates the precise quantity
 * and forward-filled price for each asset at each timestamp, ensuring accuracy even with
 * assets that have non-aligned price histories.
 * @param wallets The user's wallets with all transaction data.
 * @param historicalPrices A record mapping coin IDs to their historical price data.
 * @returns An array of [timestamp, value] tuples for charting.
 */
export const calculateHistoricalPortfolioValue = (
  wallets: Wallet[],
  historicalPrices: Record<string, [number, number][]>
): HistoricalDataPoint[] => {
  const assetIdsWithData = Object.keys(historicalPrices).filter(
    id => historicalPrices[id] && historicalPrices[id].length > 0
  );

  if (assetIdsWithData.length === 0) return [];

  // 1. Create a unified, sorted timeline from all unique timestamps.
  const allTimestamps = new Set<number>();
  assetIdsWithData.forEach(id => {
    historicalPrices[id].forEach(pricePoint => allTimestamps.add(pricePoint[0]));
  });
  const masterTimeline = Array.from(allTimestamps).sort((a, b) => a - b);
  if (masterTimeline.length === 0) return [];

  // 2. Combine all transactions for each asset and sort them by date once.
  const allAssetsMap = new Map<string, { transactions: Transaction[] }>();
  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      if (!assetIdsWithData.includes(asset.id)) return;

      if (!allAssetsMap.has(asset.id)) {
        allAssetsMap.set(asset.id, { transactions: [] });
      }
      allAssetsMap.get(asset.id)!.transactions.push(...asset.transactions);
    });
  });

  allAssetsMap.forEach(data => {
    data.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // 3. Helper function to get the latest price at or before a given timestamp (forward-fill).
  const getPriceAt = (priceHistory: [number, number][], timestamp: number): number => {
    let lastKnownPrice = 0;
    // Price history is sorted, so we can iterate and stop when we pass the timestamp.
    for (const pricePoint of priceHistory) {
      if (pricePoint[0] <= timestamp) {
        lastKnownPrice = pricePoint[1];
      } else {
        break;
      }
    }
    return lastKnownPrice;
  };

  const portfolioHistory: HistoricalDataPoint[] = [];
  const VIRTUAL_ZERO = 1e-9;

  // 4. Iterate through the master timeline. For each point, calculate the total portfolio value.
  for (const timestamp of masterTimeline) {
    let portfolioValueAtTimestamp = 0;

    // For each asset, determine its value at this specific timestamp.
    allAssetsMap.forEach(({ transactions }, assetId) => {
      // a) Calculate quantity held at this timestamp.
      let quantity = 0;
      for (const tx of transactions) {
        if (new Date(tx.date).getTime() > timestamp) {
          break; // Transactions are sorted, no need to check further.
        }
        switch (tx.type) {
          case 'buy':
          case 'transfer_in':
            quantity += tx.quantity;
            break;
          case 'sell':
          case 'transfer_out':
            quantity -= tx.quantity;
            break;
        }
      }

      // b) Find the asset's price at this timestamp.
      if (quantity > VIRTUAL_ZERO) {
        const price = getPriceAt(historicalPrices[assetId], timestamp);
        if (price > 0) {
          portfolioValueAtTimestamp += quantity * price;
        }
      }
    });

    portfolioHistory.push([timestamp, portfolioValueAtTimestamp]);
  }
  
  // 5. Post-processing: Find the first point with a non-trivial value to start the chart cleanly.
  const firstMeaningfulPointIndex = portfolioHistory.findIndex(point => point[1] > 0.01);

  if (firstMeaningfulPointIndex === -1) {
    // Portfolio never had significant value, or not enough data.
    return []; 
  }

  const finalData = portfolioHistory.slice(firstMeaningfulPointIndex);

  // Prepend a zero-value point just before the first real data point to make the chart rise from the axis.
  if (firstMeaningfulPointIndex > 0) {
    const precedingTimestamp = portfolioHistory[firstMeaningfulPointIndex - 1][0];
    finalData.unshift([precedingTimestamp, 0]);
  } else if (finalData.length > 0) {
    // If the very first point has value, create a synthetic start point 1 hour before.
    const firstTimestamp = finalData[0][0];
    finalData.unshift([firstTimestamp - 3600000, 0]);
  }

  return finalData;
};