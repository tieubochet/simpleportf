import { useState, useEffect, useCallback } from 'react';
import { PortfolioAsset, Wallet, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';

const STORAGE_KEY = 'cryptoPortfolioWallets_v2';

export function usePortfolio() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------------------------------------------------
  // 1. DATA FETCHING & AUTH SYNC
  // -------------------------------------------------------------------------

  // Hàm tải dữ liệu từ LocalStorage (Chế độ Guest)
  const fetchLocalData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWallets(JSON.parse(stored));
      } else {
        setWallets([]);
      }
    } catch (error) {
      console.error("Failed to load local wallets", error);
    }
  }, []);

  // Hàm tải dữ liệu từ Supabase (Chế độ Cloud)
  const fetchSupabaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select(`
          id,
          name,
          assets (
            id,
            coin_id,
            symbol,
            name,
            transactions (
              id,
              type,
              quantity,
              price_per_unit,
              fee,
              date,
              notes
            )
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        // Map dữ liệu từ cấu trúc DB phẳng sang cấu trúc lồng nhau của App
        const formattedWallets: Wallet[] = data.map((w: any) => ({
          id: w.id,
          name: w.name,
          assets: w.assets.map((a: any) => ({
            id: a.coin_id, // Quan trọng: App dùng coin_id (vd: 'bitcoin') làm định danh
            symbol: a.symbol,
            name: a.name,
            transactions: a.transactions.map((t: any) => ({
              id: t.id,
              type: t.type,
              quantity: Number(t.quantity),
              pricePerUnit: Number(t.price_per_unit),
              fee: Number(t.fee),
              date: t.date,
              notes: t.notes
            }))
          }))
        }));
        setWallets(formattedWallets);
      }
    } catch (err) {
      console.error("Error fetching data from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect chính để theo dõi Auth và load dữ liệu
  useEffect(() => {
    // 1. Kiểm tra session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSupabaseData();
      } else {
        fetchLocalData();
      }
    });

    // 2. Lắng nghe thay đổi Auth (Đăng nhập/Đăng xuất)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSupabaseData();
      } else {
        setWallets([]); // Clear data cũ trước khi load local
        fetchLocalData();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchLocalData, fetchSupabaseData]);

  // -------------------------------------------------------------------------
  // 2. CRUD ACTIONS (HYBRID: LOCAL + CLOUD)
  // -------------------------------------------------------------------------

  // --- ADD WALLET ---
  const addWallet = useCallback(async (name: string) => {
    if (!name.trim()) return;

    if (user) {
      // Cloud
      const { error } = await supabase
        .from('wallets')
        .insert([{ name: name.trim(), user_id: user.id }]);
      
      if (!error) fetchSupabaseData();
    } else {
      // Local
      const newWallet: Wallet = {
        id: uuidv4(),
        name: name.trim(),
        assets: [],
      };
      setWallets(prev => {
        const updated = [...prev, newWallet];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, fetchSupabaseData]);

  // --- REMOVE WALLET ---
  const removeWallet = useCallback(async (walletId: string) => {
    if (!window.confirm("Are you sure you want to delete this wallet?")) return;

    if (user) {
      // Cloud: Xóa wallet (Cascade sẽ tự xóa assets và transactions liên quan)
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', walletId);

      if (!error) fetchSupabaseData();
    } else {
      // Local
      setWallets(prev => {
        const updated = prev.filter(w => w.id !== walletId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, fetchSupabaseData]);

  // --- ADD ASSET ---
  const addAssetToWallet = useCallback(async (walletId: string, newAsset: PortfolioAsset) => {
    if (user) {
      // Cloud
      // 1. Insert Asset
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .insert([{
          wallet_id: walletId,
          coin_id: newAsset.id,
          name: newAsset.name,
          symbol: newAsset.symbol
        }])
        .select()
        .single();

      // 2. Insert Initial Transaction (if any)
      if (!assetError && assetData && newAsset.transactions.length > 0) {
        const tx = newAsset.transactions[0];
        await supabase.from('transactions').insert([{
          asset_id: assetData.id, // Dùng UUID vừa tạo
          type: tx.type,
          quantity: tx.quantity,
          price_per_unit: tx.pricePerUnit,
          fee: tx.fee || 0,
          date: tx.date,
          notes: tx.notes
        }]);
      }
      
      fetchSupabaseData();
    } else {
      // Local
      setWallets(prev => {
        const updated = prev.map(wallet => {
          if (wallet.id === walletId) {
            // Kiểm tra trùng lặp
            if (wallet.assets.some(a => a.id === newAsset.id)) return wallet;
            return { ...wallet, assets: [...wallet.assets, newAsset] };
          }
          return wallet;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, fetchSupabaseData]);

  // --- REMOVE ASSET ---
  const removeAssetFromWallet = useCallback(async (walletId: string, assetId: string) => {
    if (!window.confirm("Remove this asset and all history?")) return;

    if (user) {
      // Cloud: Cần xóa asset dựa trên wallet_id và coin_id (vì frontend dùng coin_id)
      const { error } = await supabase
        .from('assets')
        .delete()
        .match({ wallet_id: walletId, coin_id: assetId });

      if (!error) fetchSupabaseData();
    } else {
      // Local
      setWallets(prev => {
        const updated = prev.map(wallet => {
          if (wallet.id === walletId) {
            return { ...wallet, assets: wallet.assets.filter(a => a.id !== assetId) };
          }
          return wallet;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, fetchSupabaseData]);

  // --- ADD TRANSACTION ---
  const addTransactionToAsset = useCallback(async (walletId: string, assetId: string, transaction: Transaction) => {
    if (user) {
      // Cloud
      // 1. Cần tìm UUID thực của asset trong DB (vì assetId ở frontend là 'bitcoin')
      const { data: assetData, error: findError } = await supabase
        .from('assets')
        .select('id')
        .match({ wallet_id: walletId, coin_id: assetId })
        .single();

      if (!findError && assetData) {
        // 2. Insert Transaction
        const { error: insertError } = await supabase.from('transactions').insert([{
          asset_id: assetData.id,
          type: transaction.type,
          quantity: transaction.quantity,
          price_per_unit: transaction.pricePerUnit,
          fee: transaction.fee || 0,
          date: transaction.date,
          notes: transaction.notes
        }]);
        
        if (!insertError) fetchSupabaseData();
      }
    } else {
      // Local
      setWallets(prev => {
        const updated = prev.map(wallet => {
          if (wallet.id === walletId) {
            const updatedAssets = wallet.assets.map(asset => {
              if (asset.id === assetId) {
                return { ...asset, transactions: [...asset.transactions, transaction] };
              }
              return asset;
            });
            return { ...wallet, assets: updatedAssets };
          }
          return wallet;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, fetchSupabaseData]);

  // --- IMPORT / EXPORT ---
  const exportWallets = useCallback(() => {
    if (wallets.length === 0) {
      alert("Portfolio is empty.");
      return;
    }
    const dataStr = JSON.stringify(wallets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crypto-portfolio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [wallets]);

  const importWallets = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            
            // Validate sơ bộ
            if (!Array.isArray(importedData)) {
              alert("Invalid file format.");
              return;
            }

            if (user) {
              // Cloud Import: Lặp và insert (Khá nặng nếu file lớn, nhưng an toàn cho MVP)
              if (!window.confirm("Importing will add these wallets to your Cloud account. Continue?")) return;
              
              setIsLoading(true);
              for (const w of importedData) {
                // 1. Tạo Wallet
                const { data: wData } = await supabase
                  .from('wallets')
                  .insert([{ name: w.name, user_id: user.id }])
                  .select()
                  .single();
                
                if (wData && w.assets) {
                  for (const a of w.assets) {
                    // 2. Tạo Asset
                    const { data: aData } = await supabase
                      .from('assets')
                      .insert([{ wallet_id: wData.id, coin_id: a.id, name: a.name, symbol: a.symbol }])
                      .select()
                      .single();

                    if (aData && a.transactions) {
                      // 3. Tạo Transactions
                      const txsToInsert = a.transactions.map((t: any) => ({
                        asset_id: aData.id,
                        type: t.type,
                        quantity: t.quantity,
                        price_per_unit: t.pricePerUnit,
                        fee: t.fee || 0,
                        date: t.date,
                        notes: t.notes
                      }));
                      await supabase.from('transactions').insert(txsToInsert);
                    }
                  }
                }
              }
              setIsLoading(false);
              fetchSupabaseData();
              alert("Cloud import complete!");
            } else {
              // Local Import
              if (window.confirm("This will replace your current local portfolio. Are you sure?")) {
                setWallets(importedData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
              }
            }
          } catch (error) {
            console.error(error);
            alert("Error parsing file.");
            setIsLoading(false);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [user, fetchSupabaseData]);

  return {
    wallets,
    user,
    isLoading,
    addWallet,
    removeWallet,
    addAssetToWallet,
    removeAssetFromWallet,
    addTransactionToAsset,
    importWallets,
    exportWallets
  };
}