export type ItemType = 'fuel' | 'shop';
export type UnitType = 'L' | 'pcs';
export type DeliveryStatus = 'pending' | 'received';
export type PaymentMethod = 'cash' | 'card' | 'bank';

export interface Supplier {
  id?: string;
  name: string;
  contact: string;
}

export interface InventoryItem {
  id?: string;
  type: ItemType;
  name: string;
  unit: UnitType;
  currentQty: number;
  reorderLevel: number;
  avgCost: number;
  sellPrice: number;
  supplierId?: string;
  category: string;
  updatedAt: string; // ISO Date
}

export interface DeliveryItem {
  inventoryItemId: string;
  qty: number;
  unitCost: number;
  lineTotal: number;
}

export interface Delivery {
  id?: string;
  supplierId: string;
  referenceNo: string;
  deliveredAt: string; // ISO Date
  status: DeliveryStatus;
  items: DeliveryItem[];
  totalCost: number;
}

export interface Expense {
  id?: string;
  spentAt: string; // ISO Date
  category: string;
  amount: number;
  method: PaymentMethod;
  notes: string;
}

export interface Incident {
  time: string;
  description: string;
}

export interface DailyLog {
  id?: string;
  date: string; // YYYY-MM-DD
  openingCash: number;
  closingCash: number;
  notes: string;
  incidents: Incident[];
}

export interface UserSession {
  username: string;
  expiry: number;
}