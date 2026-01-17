import React from 'react';
import { seedDatabase, wipeDatabase, db, add, removeRecord } from '../firebase';
import { Card, Button } from '../components/UI';
import { useAuth } from '../App';
import { ref, get, set } from 'firebase/database';

const Admin = () => {
  const { user } = useAuth();

  const handleExportBackup = async () => {
    // Fetch all data
    const snapshot = await get(ref(db));
    const data = snapshot.val();
    
    if (!data) {
        alert("Database is empty");
        return;
    }

    const backup = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tmd_backup_${new Date().toISOString()}.json`;
    link.click();
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!confirm('This will OVERWRITE all current data. Are you sure?')) return;
        
        await set(ref(db), data);
        alert('Database restored successfully.');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm('DANGER: This will wipe all data permanently!')) {
      await wipeDatabase();
      alert('Database wiped.');
    }
  };

  const handleSeed = async () => {
      if (confirm('This will add demo data to your Firebase. Continue?')) {
          await seedDatabase();
          alert('Demo data added.');
      }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="font-heading font-bold text-2xl text-white">Admin Console</h2>
      
      <Card>
        <h3 className="text-lg font-bold text-white mb-2">Data Management</h3>
        <p className="text-tmd-muted text-sm mb-4">Export your data regularly to keep a safe backup.</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Button onClick={handleExportBackup} variant="primary" className="flex-1">
            <i className="fa-solid fa-download"></i> Download Backup (JSON)
          </Button>
          
          <div className="flex-1 relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportBackup} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="secondary" className="w-full">
              <i className="fa-solid fa-upload"></i> Restore from Backup
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-red-900/50">
        <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
        <p className="text-tmd-muted text-sm mb-4">Irreversible actions.</p>
        
        <div className="space-y-3">
           <Button onClick={handleReset} variant="danger" className="w-full">
             <i className="fa-solid fa-trash"></i> Wipe All Data
           </Button>
           <Button onClick={handleSeed} variant="secondary" className="w-full border border-gray-600">
             <i className="fa-solid fa-database"></i> Re-seed Demo Data
           </Button>
        </div>
      </Card>

      <div className="text-center text-xs text-tmd-muted">
         Logged in as: {user?.username} <br/>
         Session Expires: {new Date(user?.expiry || 0).toLocaleString()}
      </div>
    </div>
  );
};

export default Admin;