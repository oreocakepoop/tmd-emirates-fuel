import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, update, remove, get } from "firebase/database";
import { useState, useEffect } from "react";
import { InventoryItem } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyA-N9rEN7rJqPm-4OAbxw9PO6b2PctUqfQ",
  authDomain: "damean-confessions.firebaseapp.com",
  databaseURL: "https://damean-confessions-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "damean-confessions",
  storageBucket: "damean-confessions.firebasestorage.app",
  messagingSenderId: "785971151202",
  appId: "1:785971151202:web:dc0663196b5ee13f9a6c3b",
  measurementId: "G-P32D5K3SP7"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Generic Hook for Realtime Data
export function useData<T>(path: string): T[] | null {
  const [data, setData] = useState<T[] | null>(null);

  useEffect(() => {
    const dataRef = ref(db, path);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const list = Object.entries(val).map(([key, value]) => ({
          id: key,
          ...(value as any)
        }));
        setData(list as T[]);
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, [path]);

  return data;
}

// Helper to get single item once
export const getItem = async <T>(path: string): Promise<T | null> => {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
        return { id: snapshot.key, ...snapshot.val() } as T;
    }
    return null;
}

// CRUD Operations
export const add = async (path: string, data: any) => {
    return await push(ref(db, path), data);
};

export const updateRecord = async (path: string, id: string, data: any) => {
    return await update(ref(db, `${path}/${id}`), data);
};

export const removeRecord = async (path: string, id: string) => {
    return await remove(ref(db, `${path}/${id}`));
};

// Seed function for Admin use only
export const seedDatabase = async () => {
    // Suppliers
    const s1Ref = await add('suppliers', { name: 'Emirates Bulk Fuels', contact: '+971 50 000 0000' });
    const s2Ref = await add('suppliers', { name: 'Al Marai Snacks', contact: '+971 50 111 1111' });

    const s1 = s1Ref.key;
    const s2 = s2Ref.key;

    const items: InventoryItem[] = [
      { type: 'fuel', name: 'Super 98', unit: 'L', currentQty: 12500, reorderLevel: 5000, avgCost: 2.85, sellPrice: 3.15, category: 'Fuel', updatedAt: new Date().toISOString(), supplierId: s1! },
      { type: 'fuel', name: 'Special 95', unit: 'L', currentQty: 8000, reorderLevel: 6000, avgCost: 2.75, sellPrice: 3.03, category: 'Fuel', updatedAt: new Date().toISOString(), supplierId: s1! },
      { type: 'fuel', name: 'Diesel', unit: 'L', currentQty: 22000, reorderLevel: 10000, avgCost: 2.90, sellPrice: 3.20, category: 'Fuel', updatedAt: new Date().toISOString(), supplierId: s1! },
      { type: 'shop', name: 'Water 500ml', unit: 'pcs', currentQty: 150, reorderLevel: 50, avgCost: 0.50, sellPrice: 1.50, category: 'Beverage', updatedAt: new Date().toISOString(), supplierId: s2! },
      { type: 'shop', name: 'Engine Oil 4L', unit: 'pcs', currentQty: 12, reorderLevel: 10, avgCost: 45.00, sellPrice: 85.00, category: 'Automotive', updatedAt: new Date().toISOString(), supplierId: s2! },
    ];

    for (const item of items) {
        await add('items', item);
    }

    await add('expenses', { spentAt: new Date().toISOString(), category: 'Utilities', amount: 450, method: 'bank', notes: 'Monthly DEWA bill' });
};

// Dangerous: Wipe DB
export const wipeDatabase = async () => {
    await set(ref(db), null);
}