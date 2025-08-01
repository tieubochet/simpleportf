
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
 * This robust version creates a master timeline from all assets to handle unsynchronized data.
 * @param wallets The user's wallets with all transaction data.
 * @param historicalPrices A record mapping coin IDs to their historical price data from CoinGecko.
 * @returns An array of [timestamp, value] tuples for charting.
 */
export const calculateHistoricalPortfolioValue = (
  wallets: Wallet[],
  historicalPrices: Record<string, [number, number][]>
): HistoricalDataPoint[] => {
  const assetIdsWithData = Object.keys(historicalPrices).filter(
    id => historicalPrices[id] && historicalPrices[id].length > 0
  );

  if (assetIdsWithData.length === 0) {
    return [];
  }

  // 1. Create a unified, sorted timeline from all unique timestamps.
  const allTimestamps = new Set<number>();
  assetIdsWithData.forEach(id => {
    historicalPrices[id].forEach(pricePoint => allTimestamps.add(pricePoint[0]));
  });
  const masterTimeline = Array.from(allTimestamps).sort((a, b) => a - b);
  
  if (masterTimeline.length === 0) {
    return [];
  }

  // 2. Combine all transactions for each asset across all wallets and create price maps.
  const allAssetsMap = new Map<string, { transactions: Transaction[], priceMap: Map<number, number> }>();
  wallets.forEach(wallet => {
    wallet.assets.forEach(asset => {
      if (assetIdsWithData.includes(asset.id)) {
        let existing = allAssetsMap.get(asset.id);
        if (!existing) {
          existing = { 
            transactions: [],
            priceMap: new Map(historicalPrices[asset.id]),
          };
          allAssetsMap.set(asset.id, existing);
        }
        existing.transactions.push(...asset.transactions);
      }
    });
  });

  // 3. Initialize portfolio values for each timestamp.
  const portfolioValues = new Map<number, number>();
  masterTimeline.forEach(ts => portfolioValues.set(ts, 0));

  // 4. For each asset, calculate its value over time and add it to the portfolio total.
  allAssetsMap.forEach(({ transactions, priceMap }) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let txIndex = 0;
    let currentQuantity = 0;
    let lastKnownPrice = 0;

    // Iterate through the unified timeline
    for (const timestamp of masterTimeline) {
      // Update quantity based on transactions that occurred up to this point in time
      while (txIndex < sortedTransactions.length && new Date(sortedTransactions[txIndex].date).getTime() <= timestamp) {
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

      // Update price: if a price exists for this exact timestamp, use it. Otherwise, keep the last known price (forward-fill).
      const priceAtTimestamp = priceMap.get(timestamp);
      if (priceAtTimestamp !== undefined) {
          lastKnownPrice = priceAtTimestamp;
      }

      if (currentQuantity > 0 && lastKnownPrice > 0) {
        const value = currentQuantity * lastKnownPrice;
        portfolioValues.set(timestamp, (portfolioValues.get(timestamp) || 0) + value);
      }
    }
  });
  
  // 5. Convert the final values map to the required array format.
  return Array.from(portfolioValues.entries());
};