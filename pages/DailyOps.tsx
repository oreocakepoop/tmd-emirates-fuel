import React from 'react';
import { useData, add } from '../firebase';
import { Card, Button, Input } from '../components/UI';
import { useForm, useFieldArray } from 'react-hook-form';
import { DailyLog } from '../types';

const DailyOps = () => {
  const today = new Date().toISOString().split('T')[0];
  const logs = useData<DailyLog>('dailyLogs');
  const sortedLogs = logs ? [...logs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 7) : [];
  
  const { register, control, handleSubmit, reset } = useForm<DailyLog>({
    defaultValues: {
      date: today,
      openingCash: 0,
      closingCash: 0,
      notes: '',
      incidents: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "incidents"
  });

  const onSubmit = async (data: DailyLog) => {
    await add('dailyLogs', data);
    reset();
    alert('Log saved successfully');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="font-heading font-bold text-2xl text-white mb-6">New Daily Log</h2>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input type="date" label="Date" {...register('date')} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" step="0.01" label="Opening Cash (AED)" {...register('openingCash')} />
              <Input type="number" step="0.01" label="Closing Cash (AED)" {...register('closingCash')} />
            </div>

            <div>
              <label className="text-sm font-medium text-tmd-muted mb-1 block">Shift Notes</label>
              <textarea 
                {...register('notes')}
                className="w-full bg-[#0B0F0E] border border-tmd-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-tmd-green min-h-[100px]"
              ></textarea>
            </div>

            <div className="border-t border-tmd-border pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-white">Incidents / Issues</label>
                <Button onClick={() => append({ time: '', description: '' })} variant="secondary" className="!py-1 text-xs">Add Incident</Button>
              </div>
              
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input 
                      type="time" 
                      {...register(`incidents.${index}.time`)}
                      className="bg-tmd-charcoal border border-tmd-border rounded px-2 py-1 text-white text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Description"
                      {...register(`incidents.${index}.description`)}
                      className="flex-1 bg-tmd-charcoal border border-tmd-border rounded px-2 py-1 text-white text-sm"
                    />
                    <button type="button" onClick={() => remove(index)} className="text-red-400"><i className="fa-solid fa-trash"></i></button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-4">Save Daily Log</Button>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="font-heading font-bold text-2xl text-white mb-6">Recent Logs</h2>
        <div className="space-y-4">
          {sortedLogs?.map(log => (
            <Card key={log.id}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{new Date(log.date).toLocaleDateString()}</h3>
                <span className={`text-xs px-2 py-1 rounded ${log.closingCash >= log.openingCash ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  Net: {(log.closingCash - log.openingCash).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-tmd-muted line-clamp-2">{log.notes || 'No notes.'}</p>
              {log.incidents?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-tmd-border/50">
                  <p className="text-xs text-red-400">{log.incidents.length} Incident(s) reported</p>
                </div>
              )}
            </Card>
          ))}
          {logs === null && <div className="text-tmd-muted">Loading...</div>}
        </div>
      </div>
    </div>
  );
};

export default DailyOps;