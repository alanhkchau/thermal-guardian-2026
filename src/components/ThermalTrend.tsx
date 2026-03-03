import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendData } from '../types';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ThermalTrendProps {
  data: TrendData[];
}

export const ThermalTrend: React.FC<ThermalTrendProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => format(new Date(d.timestamp), 'HH:mm')),
    datasets: [
      {
        label: 'Fleet Avg ΔT (°C)',
        data: data.map(d => d.avgDeltaT),
        borderColor: '#66fcf1',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(102, 252, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(102, 252, 241, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2833',
        titleColor: '#66fcf1',
        bodyColor: '#c5c6c7',
        borderColor: '#45a29e',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Avg Delta: ${context.parsed.y.toFixed(1)}°C`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#45a29e',
          font: {
            size: 10,
            family: 'monospace',
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(197, 198, 199, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#45a29e',
          font: {
            size: 10,
            family: 'monospace',
          },
          callback: (value: any) => `${value}°C`,
        },
      },
    },
  };

  return (
    <div className="h-full w-full bg-[#151a21] rounded-2xl border border-[#1f2833] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Thermal Stress</h2>
          <p className="text-[10px] text-[#45a29e] font-mono">24-Hour Rolling Average Delta</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#66fcf1]" />
            <span className="text-[10px] text-[#c5c6c7] font-bold uppercase">Avg ΔT</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
