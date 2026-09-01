import React from 'react';
import { MarineMap } from '../components/map/MarineMap';
import { ORCAResponse } from '../types';

interface MarineMapPageProps {
  response: ORCAResponse | null;
}

export const MarineMapPage: React.FC<MarineMapPageProps> = ({ response }) => {
  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-2">
      <MarineMap
        isVeto={response?.safety?.veto_triggered}
      />
    </div>
  );
};
