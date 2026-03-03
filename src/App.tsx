/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { VehicleCard } from './components/VehicleCard';
import { MainStats } from './components/MainStats';
import { ThermalTrend } from './components/ThermalTrend';
import { Vehicle, Alert, TrendData } from './types';
import { geotabService } from './services/geotabService';
import { Activity, Shield, RefreshCw, Settings, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const REFRESH_INTERVAL = 30000; // 30 seconds
const TREND_STORAGE_KEY = 'thermal_guardian_trend_data';

interface AppProps {
  hasApi?: boolean;
}

export default function App({ hasApi = false }: AppProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isDemoMode, setIsDemoMode] = useState(!hasApi); // Default to demo if no API

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await geotabService.fetchFleetData(isDemoMode);
      
      setVehicles(data);
      if (data.length > 0 && !selectedVehicleId) {
        setSelectedVehicleId(data[0].id);
      }

      // Generate alerts
      const newAlerts: Alert[] = data
        .filter(v => v.status !== 'NORMAL')
        .map(v => ({
          id: `${v.id}-${Date.now()}`,
          vehicleId: v.id,
          vehicleName: v.name,
          type: v.status as any,
          message: v.status === 'CRITICAL' ? `Critical Thermal Stress: ΔT ${v.deltaT.toFixed(1)}°C` :
                   v.status === 'WARNING' ? `High Thermal Load: ΔT ${v.deltaT.toFixed(1)}°C` :
                   `Sensor Drift Detected: OAT vs Meteo > 8°C`,
          timestamp: new Date()
        }));
      
      setAlerts(prev => {
        const combined = [...newAlerts, ...prev];
        return combined.slice(0, 20); // Keep last 20 alerts
      });

      // Update Trend Data
      if (data.length > 0) {
        const avgDelta = data.reduce((acc, v) => acc + v.deltaT, 0) / data.length;
        const newTrendPoint = { timestamp: Date.now(), avgDeltaT: avgDelta };
        
        setTrendData(prev => {
          const updated = [...prev, newTrendPoint];
          // Keep only last 24 hours (assuming data every 30s, that's 2880 points)
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          const filtered = updated.filter(p => p.timestamp > oneDayAgo);
          localStorage.setItem(TREND_STORAGE_KEY, JSON.stringify(filtered));
          return filtered;
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, selectedVehicleId]);

  useEffect(() => {
    // Load trend data from storage
    const stored = localStorage.getItem(TREND_STORAGE_KEY);
    if (stored) {
      try {
        setTrendData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored trend data");
      }
    }

    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex h-screen w-full bg-[#0b0c10] text-[#c5c6c7] font-sans selection:bg-[#66fcf1]/30">
      {/* Sidebar */}
      <Sidebar alerts={alerts} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#1f2833] flex items-center justify-between px-8 bg-[#0b0c10]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#66fcf1]/10 text-[#66fcf1]">
                <Shield size={20} />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                THERMAL <span className="text-[#66fcf1]">GUARDIAN</span> <span className="text-[10px] opacity-50 font-mono">v2.5</span>
              </h1>
            </div>
            <div className="h-4 w-px bg-[#1f2833]" />
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#45a29e] uppercase tracking-widest">
              <Activity size={12} className="animate-pulse" />
              Fleet Status: <span className="text-[#66fcf1]">Operational</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                isDemoMode ? "bg-purple-500/20 text-purple-500 border-purple-500/30" : "bg-[#1f2833] text-[#45a29e] border-[#1f2833]"
              }`}
            >
              {isDemoMode ? "DEMO MODE ACTIVE" : "REAL DATA MODE"}
            </button>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#45a29e]">
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
              Last Sync: {lastRefresh.toLocaleTimeString()}
            </div>
            <button className="p-2 rounded-lg hover:bg-[#1f2833] transition-colors text-[#45a29e]">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Top Grid: Critical Cards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#45a29e] uppercase tracking-[0.2em]">Critical Fleet Overview</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[9px] font-bold text-red-500 uppercase">Critical: {vehicles.filter(v => v.status === 'CRITICAL').length}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="text-[9px] font-bold text-yellow-500 uppercase">Warning: {vehicles.filter(v => v.status === 'WARNING').length}</span>
                </div>
              </div>
            </div>
            
            {vehicles.length === 0 && !isLoading ? (
              <div className="p-12 border-2 border-dashed border-[#1f2833] rounded-2xl text-center space-y-4">
                <AlertTriangle size={48} className="mx-auto text-yellow-500/50" />
                <div className="max-w-md mx-auto">
                  <h3 className="text-white font-bold mb-2">Geotab Connection Required</h3>
                  <p className="text-sm text-[#45a29e]">
                    Please configure your Geotab credentials in the environment variables to view real-time fleet data. 
                    Alternatively, enable <b>Demo Mode</b> in the header to see simulated data.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {vehicles.slice(0, 5).map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isSelected={selectedVehicleId === vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Middle Section: Main Stats */}
          <section className="grid grid-cols-1 h-[450px]">
            <MainStats vehicle={selectedVehicle} />
          </section>

          {/* Bottom Section: Trend Graph */}
          <section className="h-[300px]">
            <ThermalTrend data={trendData} />
          </section>
        </div>
      </main>
    </div>
  );
}
