
import { Wallet, PriceData, Transaction, PortfolioAsset } from '../types';

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
 * Extracts a flat, unique list of all asset IDs from all wallets.
 * @param wallets - An array of wallets.
 * @returns A string array of unique asset IDs.
 */
export const getAssetIds = (wallets: Wallet[]): string[] => {
    const ids = new Set<string>();
    wallets.forEach(w => w.assets.forEach(a => ids.add(a.id)));
    return Array.from(ids);
};
