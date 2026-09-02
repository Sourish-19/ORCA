export const MAP_CONFIG = {
  mapProvider: 'MapTiler / MapLibre GL',
  defaultCenter: [80.2707, 13.0827] as [number, number], // Chennai / Bay of Bengal
  defaultZoom: 9.2,
  attribution: '&copy; MapTiler &copy; OpenStreetMap contributors &copy; INCOIS &copy; MOSDAC',
  layers: {
    baseMap: true,
    pfz: true,
    sst: true,
    chl: true,
    waves: true,
    wind: true,
    hazards: true,
    ports: true,
    route: true,
    vessels: true,
  }
};
