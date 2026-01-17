import React, { useState } from 'react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../components/UI';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'tmduser' && password === 'Score@8520') {
      login();
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-tmd-charcoal flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tmd-green to-emerald-600 mx-auto flex items-center justify-center text-white font-bold font-heading text-3xl mb-4 shadow-2xl shadow-tmd-green/20">
          T
        </div>
        <h1 className="font-heading font-bold text-2xl text-white tracking-tight">TMD Emirates Fuel</h1>
        <p className="text-tmd-muted mt-2">Operations Dashboard</p>
      </div>

      <Card className="w-full max-w-md bg-tmd-surface/50 backdrop-blur-lg border-tmd-border shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input 
              label="Username" 
              value={username} 
              onChange={(e:any) => setUsername(e.target.value)} 
              placeholder="Enter username"
            />
          </div>
          <div>
            <Input 
              type="password" 
              label="Password" 
              value={password} 
              onChange={(e:any) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-3">
            Sign In
          </Button>

          <p className="text-xs text-center text-tmd-muted pt-4 border-t border-tmd-border">
            <i className="fa-solid fa-lock mr-1"></i> Authorized Personnel Only
          </p>
        </form>
      </Card>
      
      {/* MVP NOTE: Security Warning */}
      <div className="mt-8 text-[10px] text-tmd-muted/50 text-center max-w-xs">
        MVP DEMO BUILD. AUTHENTICATION IS LOCAL ONLY.<br/>
        DO NOT USE IN PRODUCTION WITHOUT BACKEND SECURITY.
      </div>
    </div>
  );
};

export default Login;
