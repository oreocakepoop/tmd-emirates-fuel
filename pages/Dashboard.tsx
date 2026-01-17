import React, { useEffect, useState } from 'react';
import { useData } from '../firebase';
import { Card, StatCard, Button } from '../components/UI';
import { Link } from 'react-router-dom';
import { InventoryItem, Delivery, Expense } from '../types';

const Dashboard = () => {
  // Realtime Firebase Data
  const items = useData<InventoryItem>('items');
  const deliveries = useData<Delivery>('deliveries');
  const expenses = useData<Expense>('expenses');

  const [stats, setStats] = useState({
    lowStock: 0,
    totalValue: 0,
    pendingDeliveries: 0,
    todayExpenses: 0
  });

  useEffect(() => {
    if (items) {
      const low = items.filter(i => i.currentQty <= i.reorderLevel).length;
      const value = items.reduce((acc, i) => acc + (i.currentQty * i.avgCost), 0);
      setStats(prev => ({ ...prev, lowStock: low, totalValue: value }));
    }
  }, [items]);

  useEffect(() => {
    if (deliveries) {
      const pending = deliveries.filter(d => d.status === 'pending').length;
      setStats(prev => ({ ...prev, pendingDeliveries: pending }));
    }
  }, [deliveries]);

  useEffect(() => {
    if (expenses) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTotal = expenses
        .filter(e => e.spentAt.startsWith(todayStr))
        .reduce((acc, curr) => acc + curr.amount, 0);
      setStats(prev => ({ ...prev, todayExpenses: todayTotal }));
    }
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Inventory Value" 
          value={`AED ${stats.totalValue.toLocaleString()}`} 
          icon="fa-coins" 
        />
        <StatCard 
          title="Today's Expenses" 
          value={`AED ${(stats.todayExpenses || 0).toLocaleString()}`} 
          icon="fa-money-bill-wave" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock} 
          icon="fa-triangle-exclamation"
          sub="Requires attention"
        />
        <StatCard 
          title="Pending Deliveries" 
          value={stats.pendingDeliveries} 
          icon="fa-truck-fast"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="col-span-1 md:col-span-1">
          <h3 className="font-heading font-bold text-lg mb-4 text-white">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/deliveries">
              <Button variant="primary" className="w-full justify-between mb-3">
                <span>Receive Delivery</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Button>
            </Link>
            <Link to="/expenses">
              <Button variant="secondary" className="w-full justify-between mb-3">
                <span>Log Expense</span>
                <i className="fa-solid fa-plus"></i>
              </Button>
            </Link>
            <Link to="/daily">
              <Button variant="secondary" className="w-full justify-between">
                <span>Close Shift Log</span>
                <i className="fa-solid fa-pen-to-square"></i>
              </Button>
            </Link>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-bold text-lg text-white">Critical Inventory</h3>
            <Link to="/inventory" className="text-sm text-tmd-orange hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-tmd-muted border-b border-tmd-border">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Current</th>
                  <th className="py-2">Reorder At</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items?.filter(i => i.currentQty <= i.reorderLevel).slice(0, 5).map(item => (
                  <tr key={item.id} className="border-b border-tmd-border/50">
                    <td className="py-3 font-medium text-white">{item.name}</td>
                    <td className="py-3">{item.currentQty} {item.unit}</td>
                    <td className="py-3">{item.reorderLevel} {item.unit}</td>
                    <td className="py-3">
                      <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">Low</span>
                    </td>
                  </tr>
                ))}
                {items && !items.some(i => i.currentQty <= i.reorderLevel) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-tmd-muted">
                      All stock levels are healthy.
                    </td>
                  </tr>
                )}
                {!items && (
                   <tr><td colSpan={4} className="py-8 text-center text-tmd-muted">Loading...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;