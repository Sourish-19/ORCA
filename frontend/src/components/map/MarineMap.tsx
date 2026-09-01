import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation, AlertTriangle, Layers } from 'lucide-react';
import { PFZZone, Hazard } from '../../types';

interface MarineMapProps {
  pfzZones?: PFZZone[];
  activeHazard?: Hazard | null;
  selectedZone?: PFZZone | null;
  isVeto?: boolean;
}

export const MarineMap: React.FC<MarineMapProps> = ({
  pfzZones = [],
  activeHazard,
  selectedZone,
  isVeto = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  
  const [layers, setLayers] = useState({
    baseMap: true,
    pfz: true,
    sst: true,
    chl: true,
    waves: true,
    wind: true,
    hazards: true,
    ports: true,
    route: true,
    depth: false,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    const styleUrl = apiKey
      ? `https://api.maptiler.com/maps/ocean/style.json?key=${apiKey}`
      : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [80.2707, 13.0827], // Chennai Harbour / Bay of Bengal
      zoom: 9.2,
      pitch: 30,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Add Kasimedu Harbour Marker
      new maplibregl.Marker({ color: '#38bdf8' })
        .setLngLat([80.295, 13.125])
        .setPopup(new maplibregl.Popup().setHTML('<strong style="color:#0f172a">Kasimedu Fishing Harbour</strong>'))
        .addTo(map);

      // Add PFZ Primary Zone Layer
      map.addSource('pfz-primary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: 'Chennai Offshore East (Zone #12A)', score: '88%' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [80.52, 13.18],
                [80.75, 13.15],
                [80.78, 12.98],
                [80.55, 12.95],
                [80.52, 13.18]
              ]
            ]
          }
        }
      });

      map.addLayer({
        id: 'pfz-fill',
        type: 'fill',
        source: 'pfz-primary',
        paint: {
          'fill-color': '#4edea3',
          'fill-opacity': 0.25
        }
      });

      map.addLayer({
        id: 'pfz-line',
        type: 'line',
        source: 'pfz-primary',
        paint: {
          'line-color': '#4edea3',
          'line-width': 2.5
        }
      });

      // Add Navigation Route Line Layer
      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [80.295, 13.125], // Kasimedu
              [80.62, 13.06]   // Primary Zone Center
            ]
          }
        }
      });

      map.addLayer({
        id: 'route-line-layer',
        type: 'line',
        source: 'route-line',
        paint: {
          'line-color': '#4cd7f6',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });

      // Add Cyclone Hazard Zone if Veto / Hazard active
      if (isVeto) {
        map.addSource('hazard-zone', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { warning: 'IMD Severe Cyclone Zone' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [80.40, 12.85],
                  [80.85, 12.85],
                  [80.85, 12.50],
                  [80.40, 12.50],
                  [80.40, 12.85]
                ]
              ]
            }
          }
        });

        map.addLayer({
          id: 'hazard-fill',
          type: 'fill',
          source: 'hazard-zone',
          paint: {
            'fill-color': '#ef4444',
            'fill-opacity': 0.35
          }
        });

        map.addLayer({
          id: 'hazard-line',
          type: 'line',
          source: 'hazard-zone',
          paint: {
            'line-color': '#ffb4ab',
            'line-width': 2,
            'line-dasharray': [4, 4]
          }
        });
      }
    });

    return () => {
      map.remove();
    };
  }, [isVeto]);

  return (
    <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[460px]">
      
      {/* Top Map Layer Control Bar */}
      <div className="bg-[#070f1e] px-3 py-2 border-b border-[#1b2b45] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1 font-mono">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            Marine GIS Map — MapLibre GL Vector Engine
          </span>
        </div>

        {/* Independently Toggleable Layer Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-[11px]">
          <button
            onClick={() => toggleLayer('pfz')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.pfz ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            PFZ
          </button>
          <button
            onClick={() => toggleLayer('sst')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.sst ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            SST
          </button>
          <button
            onClick={() => toggleLayer('chl')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.chl ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            CHL
          </button>
          <button
            onClick={() => toggleLayer('wind')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.wind ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            WIND
          </button>
          <button
            onClick={() => toggleLayer('hazards')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.hazards ? 'bg-red-950 text-red-300 border-red-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            HAZARDS
          </button>
          <button
            onClick={() => toggleLayer('route')}
            className={`px-2 py-0.5 rounded border transition font-mono ${
              layers.route ? 'bg-teal-950 text-teal-300 border-teal-800' : 'bg-[#0d1728] text-slate-500 border-[#1b2b45]'
            }`}
          >
            ROUTE
          </button>
        </div>
      </div>

      {/* Main Map Container for MapLibre GL */}
      <div className="relative flex-1 bg-[#040a16] overflow-hidden min-h-[380px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Active Hazard Veto Overlay */}
        {isVeto && layers.hazards && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-950/90 border-2 border-red-500 p-3.5 rounded-xl max-w-sm text-center backdrop-blur-md shadow-2xl">
            <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-1 animate-bounce" />
            <h4 className="font-bold text-xs text-red-300 uppercase tracking-wider font-mono">
              CYCLONE HAZARD ZONE ACTIVE
            </h4>
            <p className="text-[11px] text-red-200 mt-1">
              IMD Severe Cyclonic Storm Warning • Gale winds 45-55 kts
            </p>
          </div>
        )}

        {/* Selected Zone Information Box */}
        {selectedZone && !isVeto && (
          <div className="absolute top-4 left-4 z-20 bg-[#070f1e]/90 border border-cyan-500/50 p-3 rounded-lg max-w-xs shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                RECOMMENDED ZONE
              </span>
              <span className="font-bold text-emerald-400 text-xs">{selectedZone.strengthScore}%</span>
            </div>
            <h4 className="font-bold text-slate-100 text-xs">{selectedZone.sectorName}</h4>
            <p className="text-[10px] text-slate-400 mt-1">
              {selectedZone.distanceKm} km at bearing {selectedZone.bearingDeg}° from {selectedZone.nearestHarbour}
            </p>
          </div>
        )}

        {/* Map Legend Footer */}
        <div className="absolute bottom-3 right-3 z-20 bg-[#070f1e]/90 border border-[#1b2b45] px-3 py-1.5 rounded-md text-[10px] text-slate-300 flex items-center gap-3 backdrop-blur-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span>PFZ Zone #12A</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
            <span>Kasimedu Port</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-400"></span>
            <span>Bearing Line</span>
          </div>
        </div>

      </div>
    </div>
  );
};
