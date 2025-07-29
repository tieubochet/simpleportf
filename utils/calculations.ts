
import { Wallet, PriceData, Transaction, PortfolioAsset, HistoricalDataPoint, PerformerData } from '../types';

/**
 * Calculates key metrics for a single asset based on its transaction history and current price.
 * @param transactions - An array of buy/sell/transfer transactions for the asset.
 * @param currentPrice - The current market price of the asset.
 * @returns An object containing currentQuantity, avgBuyPrice, marketValue, and unrealizedPL.
 */
export const getAssetMetrics = (transactions: Transaction[], currentPrice: number) => {
  let totalQuantityBought = 0;
  let totalCostBasis = 0; // Cost basis from 'buy' transactions only
  let totalQuantitySold = 0;
  let totalQuantityTransferredIn = 0;
  let totalQuantityTransferredOut = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case 'buy':
        totalQuantityBought += tx.quantity;
        totalCostBasis += tx.quantity * tx.pricePerUnit;
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
  
  // Average buy price is based only on what was purchased.
  const avgBuyPrice = totalQuantityBought > 0 ? totalCostBasis / totalQuantityBought : 0;
  
  // The cost of the assets currently held.
  const costOfCurrentHoldings = currentQuantity * avgBuyPrice;
  
  const marketValue = currentQuantity * currentPrice;
  
  // P/L is only calculated if there's a cost basis from 'buy' transactions.
  // Otherwise, it's considered neutral (0) for assets that were only transferred in.
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
 * Calculates the total profit/loss for the entire portfolio.
 * @param wallets - An array of wallets.
 * @param prices - An object mapping asset IDs to their current prices.
 * @returns An object with the total P/L value and percentage.
 */
export const calculateTotalPL = (wallets: Wallet[], prices: PriceData): { plValue: number; plPercentage: number } => {
  let totalMarketValue = 0;
  let totalCostOfPurchases = 0;
  let totalValueFromSales = 0;

  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      const currentPrice = prices[asset.id]?.usd ?? 0;
      
      let currentQuantity = 0;
      
      asset.transactions.forEach(tx => {
        switch (tx.type) {
          case 'buy':
            currentQuantity += tx.quantity;
            totalCostOfPurchases += tx.quantity * tx.pricePerUnit;
            break;
          case 'sell':
            currentQuantity -= tx.quantity;
            totalValueFromSales += tx.quantity * tx.pricePerUnit;
            break;
          case 'transfer_in':
            currentQuantity += tx.quantity;
            break;
          case 'transfer_out':
            currentQuantity -= tx.quantity;
            break;
        }
      });

      if (currentQuantity > 0) {
        totalMarketValue += currentQuantity * currentPrice;
      }
    });
  });

  if (totalCostOfPurchases === 0) {
    // If nothing was ever bought, P/L is 0. Avoid division by zero.
    // This handles portfolios that only have transferred-in assets.
    return { plValue: 0, plPercentage: 0 };
  }

  const plValue = totalMarketValue + totalValueFromSales - totalCostOfPurchases;
  const plPercentage = (plValue / totalCostOfPurchases) * 100;

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
 * @param wallets The user's wallets with all transaction data.
 * @param historicalPrices A record mapping coin IDs to their historical price data from CoinGecko.
 * @returns An array of [timestamp, value] tuples for charting.
 */
export const calculateHistoricalPortfolioValue = (
  wallets: Wallet[],
  historicalPrices: Record<string, [number, number][]>
): HistoricalDataPoint[] => {
  const assetIds = Object.keys(historicalPrices);
  if (assetIds.length === 0 || !historicalPrices[assetIds[0]] || historicalPrices[assetIds[0]].length === 0) {
    return [];
  }

  // Use the timestamps from the first asset's data as the reference timeline
  const timeline = historicalPrices[assetIds[0]].map(p => p[0]);
  const portfolioValues = new Array(timeline.length).fill(0);

  // Combine all transactions for each asset across all wallets
  const allAssetsMap = new Map<string, Transaction[]>();
  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      const existingTxs = allAssetsMap.get(asset.id) || [];
      allAssetsMap.set(asset.id, [...existingTxs, ...asset.transactions]);
    });
  });

  // For each asset we hold, calculate its value over time and add it to the total
  allAssetsMap.forEach((transactions, assetId) => {
    const assetPriceHistory = historicalPrices[assetId];
    if (!assetPriceHistory || assetPriceHistory.length !== timeline.length) {
      // Skip if data is missing or length doesn't match the timeline
      return;
    }

    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let txIndex = 0;
    let currentQuantity = 0;

    // Iterate through each point in our timeline
    for (let i = 0; i < timeline.length; i++) {
      const currentTimestamp = timeline[i];
      
      // Update quantity by processing all transactions that occurred up to this point in time
      while (txIndex < sortedTransactions.length && new Date(sortedTransactions[txIndex].date).getTime() <= currentTimestamp) {
        const tx = sortedTransactions[txIndex];
        switch (tx.type) {
          case 'buy':
          case 'transfer_in':
            currentQuantity += tx.quantity;
            break;
          case 'sell':
          case 'transfer_out':
            currentQuantity -= tx.quantity;
            break;
        }
        txIndex++;
      }
      
      // If we hold any quantity of the asset at this time, calculate its value and add to the portfolio total for that timestamp
      if (currentQuantity > 0) {
        const price = assetPriceHistory[i][1];
        portfolioValues[i] += currentQuantity * price;
      }
    }
  });
  
  return timeline.map((timestamp, i) => [timestamp, portfolioValues[i]]);
};
