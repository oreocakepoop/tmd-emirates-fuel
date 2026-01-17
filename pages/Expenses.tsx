import React, { useState } from 'react';
import { useData, add } from '../firebase';
import { Expense } from '../types';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { useForm } from 'react-hook-form';
import { EXPENSE_CATEGORIES } from '../constants';

const Expenses = () => {
  const expenses = useData<Expense>('expenses');
  const sortedExpenses = expenses ? [...expenses].sort((a,b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime()) : [];
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset } = useForm<Expense>();

  const onSubmit = async (data: Expense) => {
    data.amount = Number(data.amount);
    await add('expenses', data);
    reset();
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading font-bold text-2xl text-white">Expenses</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'accent'}>
          {isAdding ? 'Cancel' : 'Add Expense'}
        </Button>
      </div>

      {isAdding && (
        <Card className="animate-slide-in">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="date" label="Date" {...register('spentAt', { required: true })} />
              <Input type="number" step="0.01" label="Amount (AED)" {...register('amount', { required: true })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Category" {...register('category', { required: true })}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Payment Method" {...register('method', { required: true })}>
                <option value="cash">Cash</option>
                <option value="card">Company Card</option>
                <option value="bank">Bank Transfer</option>
              </Select>
            </div>
            <Input label="Notes" {...register('notes')} />
            <Button type="submit" variant="primary">Save Expense</Button>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {sortedExpenses?.map(exp => (
          <div key={exp.id} className="bg-tmd-surface border border-tmd-border rounded-lg p-4 flex justify-between items-center">
             <div>
                <p className="font-bold text-white text-lg">{exp.category}</p>
                <p className="text-sm text-tmd-muted">{new Date(exp.spentAt).toLocaleDateString()} &bull; {exp.notes}</p>
             </div>
             <div className="text-right">
                <p className="text-xl font-bold text-tmd-orange">-{exp.amount.toFixed(2)}</p>
                <span className="text-xs uppercase text-tmd-muted bg-tmd-charcoal px-2 py-1 rounded">{exp.method}</span>
             </div>
          </div>
        ))}
        {expenses === null && <div className="text-tmd-muted">Loading...</div>}
      </div>
    </div>
  );
};

export default Expenses;