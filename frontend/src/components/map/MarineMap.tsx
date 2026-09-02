import React from 'react';
import { MapView } from '../../map/MapView';
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
  return (
    <div className="w-full h-full">
      <MapView isVeto={isVeto} />
    </div>
  );
};
