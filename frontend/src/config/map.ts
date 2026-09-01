export const MAP_CONFIG = {
  mapProvider: 'MapTiler / MapLibre GL',
  mapTilerKey: 'lS81bxNfsCkR3LhnRl99',
  mapStyle: 'https://api.maptiler.com/maps/ocean/style.json?key=lS81bxNfsCkR3LhnRl99',
  defaultCenter: [80.2707, 13.0827] as [number, number], // Chennai / Bay of Bengal
  defaultZoom: 8.5,
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
    depth: false,
  }
};
