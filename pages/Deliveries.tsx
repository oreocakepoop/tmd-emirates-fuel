import React, { useState } from 'react';
import { useData, add, updateRecord, getItem } from '../firebase';
import { Delivery, DeliveryItem, InventoryItem, Supplier } from '../types';
import { Card, Button, Input, Select, Badge } from '../components/UI';

const Deliveries = () => {
  const deliveries = useData<Delivery>('deliveries');
  const suppliers = useData<Supplier>('suppliers');
  const items = useData<InventoryItem>('items');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort locally
  const sortedDeliveries = deliveries ? [...deliveries].sort((a,b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime()) : [];

  const handleReceive = async (delivery: Delivery) => {
    if (!confirm('Mark as received and update inventory?')) return;
    
    // Process items sequentially for MVP
    for (const item of delivery.items) {
       // Fetch latest state to ensure accuracy
       const invItem = await getItem<InventoryItem>(`items/${item.inventoryItemId}`);
       if (invItem && invItem.id) {
           const totalValue = (invItem.currentQty * invItem.avgCost) + (item.qty * item.unitCost);
           const newQty = invItem.currentQty + item.qty;
           const newAvg = totalValue / newQty;

           await updateRecord('items', invItem.id, {
             currentQty: newQty,
             avgCost: newAvg,
             updatedAt: new Date().toISOString()
           });
       }
    }
    
    if (delivery.id) {
        await updateRecord('deliveries', delivery.id, { status: 'received' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading font-bold text-2xl text-white">Deliveries</h2>
        <Button onClick={() => setIsModalOpen(true)} variant="accent">
          <i className="fa-solid fa-plus"></i> New Delivery
        </Button>
      </div>

      <div className="space-y-4">
        {sortedDeliveries?.map(d => (
          <Card key={d.id} className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-tmd-muted">{new Date(d.deliveredAt).toLocaleDateString()}</span>
                <Badge color={d.status === 'received' ? 'green' : 'orange'}>{d.status.toUpperCase()}</Badge>
              </div>
              <h3 className="font-bold text-lg text-white">
                {suppliers?.find(s => s.id === d.supplierId)?.name || 'Unknown Supplier'}
              </h3>
              <p className="text-sm text-tmd-muted">Ref: {d.referenceNo}</p>
              
              <div className="mt-3 pl-4 border-l-2 border-tmd-border">
                {d.items.map((it, idx) => {
                   const name = items?.find(i => i.id === it.inventoryItemId)?.name;
                   return (
                     <div key={idx} className="text-sm text-gray-400">
                       {it.qty} x {name} @ {it.unitCost}
                     </div>
                   )
                })}
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between gap-4">
              <p className="text-xl font-bold text-white">AED {d.totalCost.toLocaleString()}</p>
              {d.status === 'pending' && (
                <Button onClick={() => handleReceive(d)} variant="primary" className="w-full md:w-auto text-sm">
                  Receive & Update Stock
                </Button>
              )}
            </div>
          </Card>
        ))}
        {deliveries === null && <div className="text-tmd-muted">Loading...</div>}
      </div>

      {isModalOpen && items && suppliers && (
        <NewDeliveryModal 
          onClose={() => setIsModalOpen(false)} 
          items={items} 
          suppliers={suppliers} 
        />
      )}
    </div>
  );
};

const NewDeliveryModal = ({ onClose, items, suppliers }: any) => {
  const [form, setForm] = useState<Partial<Delivery>>({
    referenceNo: '',
    supplierId: suppliers[0]?.id,
    deliveredAt: new Date().toISOString().split('T')[0],
    items: []
  });
  
  const [currentItem, setCurrentItem] = useState<Partial<DeliveryItem>>({ qty: 0, unitCost: 0 });

  const addItem = () => {
    if (!currentItem.inventoryItemId || !currentItem.qty) return;
    const newItem = { ...currentItem, lineTotal: (currentItem.qty || 0) * (currentItem.unitCost || 0) } as DeliveryItem;
    setForm(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    setCurrentItem({ qty: 0, unitCost: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.items?.length) return alert('Add at least one item');
    
    const totalCost = form.items.reduce((acc, i) => acc + i.lineTotal, 0);
    
    await add('deliveries', {
      supplierId: String(form.supplierId),
      referenceNo: form.referenceNo!,
      deliveredAt: new Date(form.deliveredAt!).toISOString(),
      status: 'pending',
      items: form.items,
      totalCost
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-heading font-bold text-xl text-white mb-4">Create Delivery Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier" value={form.supplierId} onChange={(e:any) => setForm({...form, supplierId: e.target.value})}>
              <option value="">Select Supplier</option>
              {suppliers.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input label="Reference / Invoice #" value={form.referenceNo} onChange={(e:any) => setForm({...form, referenceNo: e.target.value})} required />
          </div>
          <Input type="date" label="Date" value={form.deliveredAt} onChange={(e:any) => setForm({...form, deliveredAt: e.target.value})} />

          <div className="border border-tmd-border p-4 rounded-lg bg-tmd-charcoal">
            <h4 className="text-sm font-bold text-white mb-2">Add Items</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <Select value={currentItem.inventoryItemId || ''} onChange={(e:any) => setCurrentItem({...currentItem, inventoryItemId: e.target.value})}>
                  <option value="">Select Item</option>
                  {items.map((i:any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </Select>
              </div>
              <Input type="number" placeholder="Qty" value={currentItem.qty || ''} onChange={(e:any) => setCurrentItem({...currentItem, qty: Number(e.target.value)})} />
              <Input type="number" placeholder="Cost" value={currentItem.unitCost || ''} onChange={(e:any) => setCurrentItem({...currentItem, unitCost: Number(e.target.value)})} />
            </div>
            <Button onClick={addItem} variant="secondary" className="w-full mt-2 text-sm">+ Add Line Item</Button>
          </div>

          <div className="space-y-2">
            {form.items?.map((it, idx) => (
              <div key={idx} className="flex justify-between text-sm bg-tmd-surface p-2 rounded">
                <span>{items.find((i:any) => i.id === it.inventoryItemId)?.name} (x{it.qty})</span>
                <span>{it.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-tmd-border">
            <Button onClick={onClose} variant="ghost">Cancel</Button>
            <Button type="submit" variant="primary">Create Record</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Deliveries;