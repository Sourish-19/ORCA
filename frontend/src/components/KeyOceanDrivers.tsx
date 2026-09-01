import React from 'react';
import { MarineWeather, OceanObservation } from '../types';

interface KeyOceanDriversProps {
  weather?: MarineWeather | null;
  sstC?: number;
  chlorophyll?: number;
  dataMode?: string;
}

export const KeyOceanDrivers: React.FC<KeyOceanDriversProps> = ({
  weather,
  sstC = 28.4,
  chlorophyll = 1.2,
  dataMode = 'LIVE'
}) => {
  const sstVal = weather?.latitude ? sstC : 28.4;
  const waveVal = weather?.wave_height_m || 1.1;
  const windVal = weather?.wind_speed_knots || 14;

  return (
    <div className="bg-[#0e1622] border border-[#1c2838] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          KEY OCEAN DRIVERS
        </h4>
        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
          ● {dataMode}
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* SST Driver */}
        <div>
          <div className="flex justify-between text-slate-300 font-semibold mb-1">
            <span>SST (Sea Surface Temp)</span>
            <span className="font-mono text-cyan-300">{sstVal}°C</span>
          </div>
          <div className="w-full bg-[#152233] h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full w-[82%]"></div>
          </div>
        </div>

        {/* Chlorophyll-a Driver */}
        <div>
          <div className="flex justify-between text-slate-300 font-semibold mb-1">
            <span>Chlorophyll-a</span>
            <span className="font-mono text-emerald-400">{chlorophyll} mg/m³</span>
          </div>
          <div className="w-full bg-[#152233] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-[75%]"></div>
          </div>
        </div>

        {/* Wave Height Driver */}
        <div>
          <div className="flex justify-between text-slate-300 font-semibold mb-1">
            <span>Wave Height</span>
            <span className="font-mono text-teal-300">{waveVal} m</span>
          </div>
          <div className="w-full bg-[#152233] h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-400 h-full rounded-full w-[40%]"></div>
          </div>
        </div>

        {/* Wind Speed Driver */}
        <div>
          <div className="flex justify-between text-slate-300 font-semibold mb-1">
            <span>Wind Speed</span>
            <span className="font-mono text-blue-300">{windVal} km/h</span>
          </div>
          <div className="w-full bg-[#152233] h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full w-[35%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
