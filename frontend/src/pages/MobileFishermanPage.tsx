import React from 'react';
import { FishermanPage } from './FishermanPage';
import { ORCAResponse } from '../types';

interface MobileFishermanPageProps {
  response: ORCAResponse | null;
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

export const MobileFishermanPage: React.FC<MobileFishermanPageProps> = (props) => {
  return <FishermanPage {...props} />;
};
