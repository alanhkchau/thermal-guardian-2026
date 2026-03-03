import React from 'react';
import { AlertCircle, AlertTriangle, Thermometer } from 'lucide-react';
import { Alert } from '../types';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  alerts: Alert[];
}

export const Sidebar: React.FC<SidebarProps> = ({ alerts }) => {
  return (
    <div className="w-80 bg-[#0b0c10] border-r border-[#1f2833] h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#1f2833] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#66fcf1] uppercase tracking-wider">Active Alerts</h2>
        <span className="bg-[#1f2833] text-[#66fcf1] text-[10px] px-2 py-0.5 rounded-full font-mono">
          {alerts.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-10 text-[#45a29e] text-sm italic">
            No active alerts detected.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-lg border bg-[#151a21] transition-all hover:bg-[#1c232d]",
                alert.type === 'CRITICAL' ? "border-red-500/30" : 
                alert.type === 'WARNING' ? "border-yellow-500/30" : "border-purple-500/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-0.5",
                  alert.type === 'CRITICAL' ? "text-red-500" : 
                  alert.type === 'WARNING' ? "text-yellow-500" : "text-purple-500"
                )}>
                  {alert.type === 'CRITICAL' ? <AlertCircle size={16} /> : 
                   alert.type === 'WARNING' ? <AlertTriangle size={16} /> : <Thermometer size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xs font-bold text-white truncate">{alert.vehicleName}</h3>
                    <span className="text-[10px] text-[#45a29e] font-mono">
                      {format(alert.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#c5c6c7] leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
