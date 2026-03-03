import React from 'react';
import { Vehicle } from '../types';
import { 
  Thermometer, 
  Wind, 
  CloudRain, 
  AlertCircle, 
  ShieldCheck, 
  Zap,
  Clock,
  Navigation
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MainStatsProps {
  vehicle: Vehicle | null;
}

export const MainStats: React.FC<MainStatsProps> = ({ vehicle }) => {
  if (!vehicle) {
    return (
      <div className="h-full flex items-center justify-center bg-[#151a21] rounded-2xl border border-[#1f2833] p-10">
        <div className="text-center space-y-4">
          <Zap size={48} className="mx-auto text-[#1f2833]" />
          <p className="text-[#45a29e] text-lg font-medium">Select a vehicle to view detailed diagnostics</p>
        </div>
      </div>
    );
  }

  const getHealthColor = (score: number) => {
    if (score > 80) return 'text-green-500';
    if (score > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full bg-[#151a21] rounded-2xl border border-[#1f2833] overflow-hidden flex flex-col">
      <div className="p-6 border-b border-[#1f2833] bg-gradient-to-r from-[#151a21] to-[#1c232d] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#66fcf1]/10 text-[#66fcf1]">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{vehicle.name}</h2>
            <p className="text-sm text-[#45a29e] font-mono">{vehicle.vin}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-[#45a29e] uppercase font-bold tracking-widest mb-1">Health Score</p>
            <p className={cn("text-2xl font-mono font-bold", getHealthColor(vehicle.healthScore))}>
              {vehicle.healthScore}<span className="text-sm opacity-50">%</span>
            </p>
          </div>
          <div className="h-10 w-px bg-[#1f2833]" />
          <div className="text-right">
            <p className="text-[10px] text-[#45a29e] uppercase font-bold tracking-widest mb-1">Status</p>
            <p className={cn(
              "text-sm font-bold px-3 py-1 rounded-full",
              vehicle.status === 'CRITICAL' ? "bg-red-500/20 text-red-500" :
              vehicle.status === 'WARNING' ? "bg-yellow-500/20 text-yellow-500" :
              vehicle.status === 'SENSOR_DRIFT' ? "bg-purple-500/20 text-purple-500" :
              "bg-green-500/20 text-green-500"
            )}>
              {vehicle.status.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-3 gap-6">
        {/* Thermal Diagnostics */}
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer size={18} className="text-[#66fcf1]" />
                <h3 className="text-xs font-bold text-[#c5c6c7] uppercase tracking-wider">Battery Core</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-bold text-white">{vehicle.batteryTemp.toFixed(1)}</span>
                <span className="text-xl text-[#45a29e]">°C</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    vehicle.batteryTemp > 55 ? "bg-red-500" : vehicle.batteryTemp > 45 ? "bg-yellow-500" : "bg-[#66fcf1]"
                  )} 
                  style={{ width: `${Math.min(100, (vehicle.batteryTemp / 80) * 100)}%` }} 
                />
              </div>
            </div>

            <div className="bg-black/20 p-5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-orange-500" />
                <h3 className="text-xs font-bold text-[#c5c6c7] uppercase tracking-wider">Thermal Delta (ΔT)</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-bold text-white">{vehicle.deltaT.toFixed(1)}</span>
                <span className="text-xl text-[#45a29e]">°C</span>
              </div>
              <p className="mt-2 text-[10px] text-[#45a29e] italic">
                Threshold: {vehicle.deltaT > 35 ? "CRITICAL" : vehicle.deltaT > 25 ? "WARNING" : "OPTIMAL"}
              </p>
            </div>
          </div>

          <div className="bg-black/20 p-5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wind size={18} className="text-[#45a29e]" />
                <h3 className="text-xs font-bold text-[#c5c6c7] uppercase tracking-wider">Ambient Sync</h3>
              </div>
              {vehicle.status === 'SENSOR_DRIFT' && (
                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 animate-pulse">
                  DRIFT DETECTED
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-[10px] text-[#45a29e] uppercase mb-2">OAT Sensor</p>
                <p className="text-2xl font-mono font-bold text-white">{vehicle.ambientTemp.toFixed(1)}°C</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-px w-full bg-white/10 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#151a21] px-2 text-[10px] text-[#45a29e] font-mono">
                    VS
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-[#45a29e] uppercase mb-2">Open-Meteo</p>
                <p className="text-2xl font-mono font-bold text-[#66fcf1]">
                  {vehicle.meteoTemp !== undefined ? `${vehicle.meteoTemp.toFixed(1)}°C` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Context */}
        <div className="space-y-4">
          <div className="bg-black/40 p-5 rounded-xl border border-white/5 h-full">
            <h3 className="text-xs font-bold text-[#c5c6c7] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Navigation size={16} className="text-[#66fcf1]" />
              Location Context
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#45a29e]">Latitude</span>
                <span className="text-xs font-mono text-white">{vehicle.location.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#45a29e]">Longitude</span>
                <span className="text-xs font-mono text-white">{vehicle.location.lon.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#45a29e]">Last Update</span>
                <div className="flex items-center gap-1 text-xs font-mono text-white">
                  <Clock size={12} />
                  {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="text-xs font-bold text-white">Security Status</span>
                </div>
                <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                  <p className="text-[10px] text-green-500 leading-tight">
                    Vehicle is within thermal safety parameters. No immediate intervention required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
