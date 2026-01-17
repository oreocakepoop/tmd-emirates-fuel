import React from 'react';
import { useData } from '../firebase';
import { InventoryItem, Expense } from '../types';
import { Card, Button } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Reports = () => {
  const items = useData<InventoryItem>('items');
  const expenses = useData<Expense>('expenses');
  
  // Aggregate Inventory Value by Category
  const inventoryData = items?.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.category);
    const val = item.currentQty * item.avgCost;
    if (existing) existing.value += val;
    else acc.push({ name: item.category, value: val });
    return acc;
  }, []) || [];

  const handleExportCSV = async () => {
    if (!items) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Type,Name,Category,Qty,Unit,Cost,Price\n"
      + items.map(e => `${e.id},${e.type},${e.name},${e.category},${e.currentQty},${e.unit},${e.avgCost},${e.sellPrice}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tmd_inventory.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-heading font-bold text-2xl text-white">Reports</h2>
        <Button onClick={handleExportCSV} variant="secondary">
          <i className="fa-solid fa-file-csv"></i> Export Inventory
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80">
          <h3 className="font-bold text-lg text-white mb-4">Inventory Value by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryData}>
              <XAxis dataKey="name" stroke="#9FB0A7" fontSize={12} />
              <YAxis stroke="#9FB0A7" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111815', borderColor: '#1F2A25', color: '#fff' }}
                itemStyle={{ color: '#0E6B3B' }}
              />
              <Bar dataKey="value" fill="#0E6B3B" radius={[4, 4, 0, 0]}>
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0E6B3B' : '#0B522D'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
            <h3 className="font-bold text-lg text-white mb-4">Expense Breakdown</h3>
             <div className="space-y-4">
                 {expenses?.slice(0, 5).map(e => (
                     <div key={e.id} className="flex justify-between items-center border-b border-tmd-border pb-2 last:border-0">
                         <span>{e.category}</span>
                         <span className="font-mono text-tmd-orange">{e.amount.toFixed(2)}</span>
                     </div>
                 ))}
                 <div className="pt-4 text-center text-sm text-tmd-muted">
                    Total Expenses: AED {expenses?.reduce((a,b) => a + b.amount, 0).toLocaleString()}
                 </div>
                 {expenses === null && <div className="text-center text-tmd-muted">Loading...</div>}
             </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;