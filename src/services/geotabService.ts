import { Vehicle } from '../types';
import { calculateDeltaT, getStatus, calculateHealthScore } from '../utils';

// Geotab Diagnostic IDs
const DIAGNOSTIC_BATTERY_TEMP = 'DiagnosticInternalBatteryTemperatureId';
const DIAGNOSTIC_AMBIENT_TEMP = 'DiagnosticAmbientAirTemperatureId';

export class GeotabService {
  private api: any = null;

  setApi(api: any) {
    this.api = api;
  }

  async fetchFleetData(isDemoMode: boolean): Promise<Vehicle[]> {
    if (isDemoMode || !this.api) {
      return this.generateMockData();
    }

    try {
      // Use the Geotab Add-In API object (multiCall)
      const result = await new Promise<any>((resolve, reject) => {
        this.api.multiCall([
          ['Get', { typeName: 'Device' }],
          ['Get', { typeName: 'StatusData', search: { diagnosticSearch: { id: DIAGNOSTIC_BATTERY_TEMP } } }],
          ['Get', { typeName: 'StatusData', search: { diagnosticSearch: { id: DIAGNOSTIC_AMBIENT_TEMP } } }],
          ['Get', { typeName: 'LogRecord', search: { last: true } }]
        ], (results: any) => {
          resolve(results);
        }, (error: any) => {
          reject(error);
        });
      });

      const [devices, batteryData, ambientData, logRecords] = result;

      const vehicles: Vehicle[] = await Promise.all(devices.map(async (device: any) => {
        const battery = batteryData.find((d: any) => d.device.id === device.id)?.data || 25;
        const ambient = ambientData.find((d: any) => d.device.id === device.id)?.data || 20;
        const log = logRecords.find((l: any) => l.device.id === device.id);
        
        let meteoTemp: number | undefined;
        if (log) {
          meteoTemp = await this.fetchMeteoTemp(log.latitude, log.longitude);
        }

        const deltaT = calculateDeltaT(battery, ambient);
        const status = getStatus(deltaT, battery, ambient, meteoTemp);
        
        return {
          id: device.id,
          name: device.name,
          vin: device.vin || 'N/A',
          batteryTemp: battery,
          ambientTemp: ambient,
          meteoTemp,
          deltaT,
          healthScore: calculateHealthScore([{ deltaT, timestamp: Date.now() }]),
          status,
          lastUpdate: new Date(),
          location: {
            lat: log?.latitude || 0,
            lon: log?.longitude || 0
          }
        };
      }));

      return vehicles;
    } catch (error) {
      console.error('Error fetching Geotab data via Add-In API:', error);
      return this.generateMockData(); // Fallback to mock on error
    }
  }

  private async fetchMeteoTemp(lat: number, lon: number): Promise<number | undefined> {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`);
      const data = await response.json();
      return data.current?.temperature_2m;
    } catch (error) {
      return undefined;
    }
  }

  private generateMockData(): Vehicle[] {
    const names = ['EV-Titan 01', 'EV-Titan 02', 'EV-Titan 03', 'EV-Titan 04', 'EV-Titan 05'];
    return names.map((name, i) => {
      const battery = 40 + Math.random() * 20;
      const ambient = 20 + Math.random() * 5;
      const deltaT = battery - ambient;
      const meteo = ambient + (Math.random() - 0.5) * 4;
      
      let status: Vehicle['status'] = 'NORMAL';
      if (Math.abs(ambient - meteo) > 8) status = 'SENSOR_DRIFT';
      else if (deltaT > 35 || battery > 55) status = 'CRITICAL';
      else if (deltaT > 25 || battery > 45) status = 'WARNING';

      return {
        id: `mock-${i}`,
        name,
        vin: `VIN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        batteryTemp: battery,
        ambientTemp: ambient,
        meteoTemp: meteo,
        deltaT,
        healthScore: Math.max(0, 100 - (deltaT > 25 ? (deltaT - 25) * 5 : 0)),
        status,
        lastUpdate: new Date(),
        location: {
          lat: 34.0522 + (Math.random() - 0.5) * 0.1,
          lon: -118.2437 + (Math.random() - 0.5) * 0.1
        }
      };
    });
  }
}

export const geotabService = new GeotabService();
