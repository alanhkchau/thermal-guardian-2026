import { Vehicle, Alert, FleetStats } from './types';

export const calculateDeltaT = (battery: number, ambient: number) => battery - ambient;

export const getStatus = (deltaT: number, battery: number, ambient: number, meteo?: number): Vehicle['status'] => {
  if (meteo !== undefined && Math.abs(ambient - meteo) > 8) {
    return 'SENSOR_DRIFT';
  }
  if (deltaT > 35 || battery > 55) {
    return 'CRITICAL';
  }
  if (deltaT > 25 || battery > 45) {
    return 'WARNING';
  }
  return 'NORMAL';
};

export const calculateHealthScore = (history: { deltaT: number; timestamp: number }[]): number => {
  let score = 100;
  // Logic: Deduct 2 points for every 1°C the ΔT stays above 25°C for more than 10 minutes.
  // For simplicity in this demo, we'll look at the current state and recent history if available.
  // In a real app, this would be a rolling calculation.
  
  const highTempEvents = history.filter(h => h.deltaT > 25);
  if (highTempEvents.length > 0) {
    // This is a simplified version of the "stays above 25 for 10 mins" logic
    // We'll calculate based on the average delta above 25 in the history
    const avgOver = highTempEvents.reduce((acc, h) => acc + (h.deltaT - 25), 0) / highTempEvents.length;
    score -= Math.round(avgOver * 2);
  }
  
  return Math.max(0, Math.min(100, score));
};
