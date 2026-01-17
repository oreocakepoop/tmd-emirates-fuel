import React from 'react';
import { motion } from 'framer-motion';

export const Card: React.FC<{ children?: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-tmd-surface border border-tmd-border rounded-xl p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = 'primary', className = '', type = 'button', disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-tmd-green hover:bg-emerald-700 text-white shadow-lg shadow-tmd-green/20",
    secondary: "bg-tmd-border hover:bg-gray-700 text-white",
    accent: "bg-tmd-orange hover:bg-orange-600 text-white shadow-lg shadow-tmd-orange/20",
    danger: "bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800",
    ghost: "bg-transparent hover:bg-tmd-border text-tmd-muted hover:text-white"
  };
  
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

export const Input = ({ label, error, ...props }: any) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-sm font-medium text-tmd-muted">{label}</label>}
    <input 
      {...props} 
      className={`bg-[#0B0F0E] border ${error ? 'border-red-500' : 'border-tmd-border'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-tmd-green transition-colors`}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

export const Select = ({ label, error, children, ...props }: any) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-sm font-medium text-tmd-muted">{label}</label>}
    <select 
      {...props} 
      className={`bg-[#0B0F0E] border ${error ? 'border-red-500' : 'border-tmd-border'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-tmd-green transition-colors appearance-none`}
    >
      {children}
    </select>
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

export const StatCard = ({ title, value, sub, icon, trend }: any) => (
  <Card>
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 rounded-lg bg-tmd-charcoal border border-tmd-border">
        <i className={`fa-solid ${icon} text-tmd-green`}></i>
      </div>
      {trend && (
        <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-tmd-muted text-sm font-medium">{title}</h3>
    <p className="text-2xl font-heading font-bold text-white mt-1">{value}</p>
    {sub && <p className="text-xs text-tmd-muted mt-1">{sub}</p>}
  </Card>
);

export const Badge: React.FC<{ children?: React.ReactNode, color?: 'green'|'orange'|'red'|'gray' }> = ({ children, color = 'green' }) => {
  const colors = {
    green: 'bg-green-900/30 text-green-400 border-green-900',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-900',
    red: 'bg-red-900/30 text-red-400 border-red-900',
    gray: 'bg-gray-800 text-gray-400 border-gray-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};