import { ORCAResponse, DemoScenario } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const marineApi = {
  async processQuery(query: string): Promise<ORCAResponse> {
    const res = await fetch(`${API_BASE_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) {
      throw new Error(`Marine API request failed: ${res.statusText}`);
    }
    return res.json();
  },

  async getDemoScenarios(): Promise<DemoScenario[]> {
    const res = await fetch(`${API_BASE_URL}/api/demo-scenarios`);
    if (!res.ok) {
      throw new Error('Failed to fetch demo scenarios');
    }
    return res.json();
  },

  async getHealthStatus() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.json();
  }
};
