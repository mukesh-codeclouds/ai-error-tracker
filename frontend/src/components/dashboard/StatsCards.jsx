import React from 'react';
import { AlertCircle, AlertTriangle, Info, Zap, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
  <div className="card p-5 flex items-start gap-4 hover:border-white/10 transition-all duration-300">
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
      {subtext && <p className="text-[10px] text-slate-500 mt-1">{subtext}</p>}
    </div>
  </div>
);

export default function StatsCards({ stats }) {
  const { total = 0, critical = 0, high = 0, medium = 0, low = 0, parseTime = 0 } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard 
        title="Total Errors" 
        value={total} 
        icon={Activity} 
        colorClass="bg-blue-500 text-blue-400" 
        subtext="Across all uploaded logs"
      />
      <StatCard 
        title="Critical" 
        value={critical} 
        icon={Zap} 
        colorClass="bg-red-500 text-red-400" 
        subtext="Requires immediate action"
      />
      <StatCard 
        title="High Severity" 
        value={high} 
        icon={AlertCircle} 
        colorClass="bg-orange-500 text-orange-400" 
      />
      <StatCard 
        title="Medium / Low" 
        value={medium + low} 
        icon={AlertTriangle} 
        colorClass="bg-yellow-500 text-yellow-400" 
      />
      <StatCard 
        title="Avg Parse Time" 
        value={`${parseTime}ms`} 
        icon={Info} 
        colorClass="bg-emerald-500 text-emerald-400" 
        subtext="Deterministic regex speed"
      />
    </div>
  );
}
