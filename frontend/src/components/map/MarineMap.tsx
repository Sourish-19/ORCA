import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?worker&url';
import { Navigation, AlertTriangle } from 'lucide-react';
import { MAP_CONFIG } from '../../config/map';
import { PFZZone, Hazard } from '../../types';

// Set Vite self-contained worker URL for MapLibre GL
maplibregl.setWorkerUrl(workerUrl);

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

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

    try {
      const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || MAP_CONFIG.mapTilerKey;
      const styleUrl = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${apiKey}`;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [80.2707, 13.0827], // Chennai Harbour / Bay of Bengal
        zoom: 8.8,
        pitch: 20,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        setMapLoaded(true);

        try {
          // Kasimedu Harbour Marker
          new maplibregl.Marker({ color: '#38bdf8' })
            .setLngLat([80.295, 13.125])
            .setPopup(new maplibregl.Popup().setHTML('<strong style="color:#0f172a">Kasimedu Harbour</strong>'))
            .addTo(map);

          // Primary PFZ Polygon Layer
          map.addSource('pfz-primary', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { name: 'Chennai Offshore East' },
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
              'fill-opacity': 0.35
            }
          });

          map.addLayer({
            id: 'pfz-line',
            type: 'line',
            source: 'pfz-primary',
            paint: {
              'line-color': '#34d399',
              'line-width': 2.5
            }
          });

          // Route Line
          map.addSource('route-line', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [80.295, 13.125],
                  [80.62, 13.06]
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
                'fill-opacity': 0.4
              }
            });
          }
        } catch (e) {
          console.warn('MapLibre overlay notice:', e);
        }
      });

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn('MapLibre GL init notice:', err);
      setMapError(true);
    }
  }, [isVeto]);

  return (
    <div className="bg-[#0b172a] border border-[#1b2b45] rounded-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[460px] w-full">
      
      {/* Top Map Layer Toolbar */}
      <div className="bg-[#070f1e] px-3 py-2 border-b border-[#1b2b45] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1 font-mono">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            MapTiler Vector Ocean Map — Key: lS81bxNfs...
          </span>
        </div>

        {/* Layer Buttons */}
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

      {/* Main Vector Map Container */}
      <div className="relative flex-1 bg-[#040a16] overflow-hidden min-h-[380px] flex flex-col justify-between p-4">
        
        {/* MapLibre DOM Node */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Fallback Vector Canvas */}
        {(!mapLoaded || mapError) && (
          <div className="absolute inset-0 opacity-80 pointer-events-none z-0">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 450">
              <defs>
                <linearGradient id="mapHeat" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
                  <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {layers.sst && <rect x="0" y="0" width="800" height="450" fill="url(#mapHeat)" />}

              <path
                d="M 280,50 Q 320,180 340,280 Q 360,350 420,400 Q 480,350 500,280 Q 560,180 620,80"
                fill="none"
                stroke="#0b172a"
                strokeWidth="24"
              />
              <path
                d="M 280,50 Q 320,180 340,280 Q 360,350 420,400 Q 480,350 500,280 Q 560,180 620,80"
                fill="none"
                stroke="#1e293b"
                strokeWidth="8"
              />

              {layers.pfz && (
                <path d="M 500,280 L 580,260 L 590,310 L 510,320 Z" fill="#10b981" fillOpacity="0.35" stroke="#34d399" strokeWidth="2" />
              )}

              {layers.route && (
                <path d="M 500,280 L 580,260" stroke="#4cd7f6" strokeWidth="2.5" strokeDasharray="6,4" />
              )}

              {layers.ports && (
                <>
                  <circle cx="500" cy="280" r="7" fill="#38bdf8" stroke="#040a16" strokeWidth="2" />
                  <text x="440" y="275" fill="#dce3f0" fontSize="10" fontWeight="bold">Kasimedu Harbour</text>
                </>
              )}
            </svg>
          </div>
        )}

        {/* Active Hazard Veto Overlay */}
        {isVeto && layers.hazards && (
          <div className="relative z-20 my-auto self-center bg-red-950/90 border-2 border-red-500 p-3.5 rounded-xl max-w-sm text-center backdrop-blur-md shadow-2xl">
            <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-1 animate-bounce" />
            <h4 className="font-bold text-xs text-red-300 uppercase tracking-wider font-mono">
              CYCLONE HAZARD ZONE ACTIVE
            </h4>
            <p className="text-[11px] text-red-200 mt-1">
              IMD Severe Cyclonic Storm Warning • Gale winds 45-55 kts
            </p>
          </div>
        )}

        {/* Map Legend Footer */}
        <div className="relative z-20 self-end bg-[#070f1e]/90 border border-[#1b2b45] px-3 py-1.5 rounded-md text-[10px] text-slate-300 flex items-center gap-3 backdrop-blur-xs font-mono">
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
