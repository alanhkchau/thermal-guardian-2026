import React from 'react';
import { Vehicle } from '../types';
import { Thermometer, Activity, ShieldCheck, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onClick: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, isSelected, onClick }) => {
  const getStatusColor = () => {
    switch (vehicle.status) {
      case 'CRITICAL': return 'text-red-500';
      case 'WARNING': return 'text-yellow-500';
      case 'SENSOR_DRIFT': return 'text-purple-500';
      default: return 'text-[#66fcf1]';
    }
  };

  const getStatusBg = () => {
    switch (vehicle.status) {
      case 'CRITICAL': return 'bg-red-500/10 border-red-500/30';
      case 'WARNING': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'SENSOR_DRIFT': return 'bg-purple-500/10 border-purple-500/30';
      default: return 'bg-[#1f2833]/50 border-[#1f2833]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        getStatusBg(),
        isSelected ? "ring-2 ring-[#66fcf1] ring-offset-2 ring-offset-[#0b0c10]" : ""
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{vehicle.name}</h3>
          <p className="text-[10px] text-[#45a29e] font-mono">{vehicle.vin}</p>
        </div>
        <div className={cn("p-1.5 rounded-lg bg-black/20", getStatusColor())}>
          <Activity size={16} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] text-[#45a29e] uppercase font-bold tracking-tighter">Battery Temp</p>
          <div className="flex items-center gap-1">
            <Thermometer size={12} className={getStatusColor()} />
            <span className="text-lg font-mono font-bold text-white">{vehicle.batteryTemp.toFixed(1)}°C</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#45a29e] uppercase font-bold tracking-tighter">Thermal Delta</p>
          <div className="flex items-center gap-1">
            <span className={cn("text-lg font-mono font-bold", vehicle.deltaT > 25 ? "text-orange-500" : "text-white")}>
              Δ{vehicle.deltaT.toFixed(1)}°C
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-[#45a29e]" />
          <span className="text-[11px] text-[#c5c6c7]">Health: <span className="font-bold">{vehicle.healthScore}%</span></span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-[#45a29e]" />
          <span className="text-[10px] text-[#45a29e] font-mono">
            {vehicle.location.lat.toFixed(2)}, {vehicle.location.lon.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
