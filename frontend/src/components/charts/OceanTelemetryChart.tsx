import React from 'react';
import ReactECharts from 'echarts-for-react';

interface OceanTelemetryChartProps {
  sstC?: number;
  chlorophyll?: number;
  waveM?: number;
  windSpeedKnots?: number;
}

export const OceanTelemetryChart: React.FC<OceanTelemetryChartProps> = ({
  sstC = 28.4,
  chlorophyll = 1.2,
  waveM = 1.1,
  windSpeedKnots = 14
}) => {
  // Apache ECharts Option for 6-Factor Suitability Radar & Driver Bar Chart
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#070e1a',
      borderColor: '#1c2838',
      textStyle: { color: '#dce3f0', fontSize: 11 }
    },
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['PFZ', 'Chlorophyll', 'SST', 'Wind', 'Wave', 'Access'],
      axisLine: { lineStyle: { color: '#3d494c' } },
      axisLabel: { color: '#bcc9cd', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: '#1c2838', type: 'dashed' } },
      axisLabel: { color: '#bcc9cd', fontSize: 10 }
    },
    series: [
      {
        name: 'Factor Score',
        type: 'bar',
        barWidth: '50%',
        data: [
          { value: 92, itemStyle: { color: '#4edea3' } },
          { value: 88, itemStyle: { color: '#34d399' } },
          { value: 95, itemStyle: { color: '#4cd7f6' } },
          { value: 78, itemStyle: { color: '#38bdf8' } },
          { value: 75, itemStyle: { color: '#06b6d4' } },
          { value: 85, itemStyle: { color: '#0284c7' } }
        ],
        label: {
          show: true,
          position: 'top',
          color: '#dce3f0',
          fontSize: 10,
          formatter: '{c}%'
        }
      }
    ]
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant p-3.5 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-extrabold text-on-surface uppercase tracking-wider font-mono">
          SUITABILITY FACTOR SPECTRUM (APACHE ECHARTS)
        </h4>
        <span className="text-[10px] font-mono text-primary font-bold">6-Factor Weighting</span>
      </div>

      <div className="h-44 w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
