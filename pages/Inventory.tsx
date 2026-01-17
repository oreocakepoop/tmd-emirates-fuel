import React, { useState } from 'react';
import { useData, add, updateRecord, removeRecord } from '../firebase';
import { InventoryItem, Supplier } from '../types';
import { Card, Button, Input, Badge, Select } from '../components/UI';
import { useForm } from 'react-hook-form';
import { ITEM_CATEGORIES } from '../constants';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'shop'>('fuel');
  const [searchTerm, setSearchTerm] = useState('');
  
  const items = useData<InventoryItem>('items');
  const suppliers = useData<Supplier>('suppliers');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = items?.filter(i => 
    i.type === activeTab &&
    (i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-tmd-surface p-1 rounded-lg border border-tmd-border">
          <button 
            onClick={() => setActiveTab('fuel')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'fuel' ? 'bg-tmd-green text-white shadow-md' : 'text-tmd-muted hover:text-white'}`}
          >
            Fuel
          </button>
          <button 
            onClick={() => setActiveTab('shop')} 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'shop' ? 'bg-tmd-green text-white shadow-md' : 'text-tmd-muted hover:text-white'}`}
          >
            Shop Items
          </button>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search items..." 
            className="bg-tmd-surface border border-tmd-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-tmd-green w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleCreate} variant="accent" className="shrink-0">
            <i className="fa-solid fa-plus"></i> <span className="hidden md:inline">Add Item</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems?.map(item => (
          <Card key={item.id} className="flex flex-col gap-3 group hover:border-tmd-green/50 transition-colors cursor-pointer relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={() => handleEdit(item)} variant="secondary" className="!p-2 text-xs">
                <i className="fa-solid fa-pen"></i>
              </Button>
            </div>
            
            <div className="flex justify-between items-start pr-10">
              <div>
                <span className="text-xs text-tmd-muted uppercase tracking-wider">{item.category}</span>
                <h3 className="font-heading font-bold text-lg text-white">{item.name}</h3>
              </div>
              {item.currentQty <= item.reorderLevel && <Badge color="red">Low Stock</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="bg-tmd-charcoal p-3 rounded-lg border border-tmd-border">
                <p className="text-xs text-tmd-muted">Stock</p>
                <p className={`text-xl font-bold ${item.currentQty <= item.reorderLevel ? 'text-red-400' : 'text-tmd-green'}`}>
                  {item.currentQty} <span className="text-xs font-normal text-tmd-muted">{item.unit}</span>
                </p>
              </div>
              <div className="bg-tmd-charcoal p-3 rounded-lg border border-tmd-border">
                <p className="text-xs text-tmd-muted">Price</p>
                <p className="text-xl font-bold text-white">{item.sellPrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-auto pt-2 border-t border-tmd-border flex justify-between text-xs text-tmd-muted">
              <span>Cost: {item.avgCost.toFixed(2)}</span>
              <span>Reorder: {item.reorderLevel}</span>
            </div>
          </Card>
        ))}
        {filteredItems?.length === 0 && (
          <div className="col-span-full py-12 text-center text-tmd-muted">
            <i className="fa-solid fa-box-open text-4xl mb-4 opacity-50"></i>
            <p>No items found.</p>
          </div>
        )}
      </div>

      {isDrawerOpen && (
        <InventoryDrawer 
          item={editingItem} 
          onClose={() => setIsDrawerOpen(false)} 
          type={activeTab} 
          suppliers={suppliers || []}
        />
      )}
    </div>
  );
};

const InventoryDrawer = ({ item, onClose, type, suppliers }: any) => {
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryItem>({
    defaultValues: item || {
      type: type,
      name: '',
      unit: type === 'fuel' ? 'L' : 'pcs',
      currentQty: 0,
      reorderLevel: 10,
      avgCost: 0,
      sellPrice: 0,
      category: type === 'fuel' ? 'Fuel' : 'Snacks'
    }
  });

  const onSubmit = async (data: InventoryItem) => {
    data.currentQty = Number(data.currentQty);
    data.reorderLevel = Number(data.reorderLevel);
    data.avgCost = Number(data.avgCost);
    data.sellPrice = Number(data.sellPrice);
    data.updatedAt = new Date().toISOString();
    
    if (item?.id) {
      await updateRecord('items', item.id, data);
    } else {
      await add('items', data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (item?.id && confirm('Are you sure you want to delete this item?')) {
      await removeRecord('items', item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full md:w-[400px] bg-tmd-surface h-full shadow-2xl p-6 overflow-y-auto border-l border-tmd-border flex flex-col animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-bold text-xl text-white">{item ? 'Edit Item' : 'New Item'}</h2>
          <button onClick={onClose} className="text-tmd-muted hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
          <Input label="Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
          
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" {...register('category')}>
              {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Unit" {...register('unit')}>
              <option value="L">Liters (L)</option>
              <option value="pcs">Pieces (pcs)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input type="number" step="any" label="Current Stock" {...register('currentQty', { required: true, min: 0 })} />
             <Input type="number" step="any" label="Reorder Level" {...register('reorderLevel', { required: true, min: 0 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Input type="number" step="0.01" label="Avg Cost (AED)" {...register('avgCost', { required: true, min: 0 })} />
             <Input type="number" step="0.01" label="Sell Price (AED)" {...register('sellPrice', { required: true, min: 0 })} />
          </div>

          <Select label="Supplier" {...register('supplierId')}>
             <option value="">Select Supplier...</option>
             {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          <div className="pt-6 flex flex-col gap-3 mt-auto">
            <Button type="submit" variant="primary" className="w-full">Save Changes</Button>
            {item && (
              <Button type="button" onClick={handleDelete} variant="danger" className="w-full">Delete Item</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventory;