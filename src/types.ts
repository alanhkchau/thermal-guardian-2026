export interface Vehicle {
  id: string;
  name: string;
  vin: string;
  batteryTemp: number;
  ambientTemp: number;
  meteoTemp?: number;
  deltaT: number;
  healthScore: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SENSOR_DRIFT';
  lastUpdate: Date;
  location: {
    lat: number;
    lon: number;
  };
}

export interface Alert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'CRITICAL' | 'WARNING' | 'SENSOR_DRIFT';
  message: string;
  timestamp: Date;
}

export interface FleetStats {
  avgDeltaT: number;
  criticalCount: number;
  warningCount: number;
  driftCount: number;
  totalVehicles: number;
}

export interface TrendData {
  timestamp: number;
  avgDeltaT: number;
}
