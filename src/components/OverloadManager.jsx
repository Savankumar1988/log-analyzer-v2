import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { prepareTimeSeriesData, getMetricStats } from '../utils/chartUtils';

const OverloadManager = ({ logData }) => {
  if (!logData || !logData.addCandidateTargets.length) return <div>No data available</div>;

  const targetData = prepareTimeSeriesData(logData.addCandidateTargets, ['triggerPct', 'denyPct']);
  const metricsData = prepareTimeSeriesData(
    logData.addCandidateTargets, 
    [
      { name: 'cpuMs', path: 'metrics.cpu' },
      { name: 'memKB', path: 'metrics.mem' },
      { name: 'reqs', path: 'metrics.reqs' }
    ]
  );
  const processLoopData = prepareTimeSeriesData(logData.processMainLoops, ['runQ']);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">OverloadManager Analysis</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Run Queue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={processLoopData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedTime" 
                  tick={{ fontSize: 12 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  dy={20}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => {
                    return value != null ? [value.toFixed(3), 'Run Queue'] : ['N/A', 'Run Queue'];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="runQ" 
                  stroke="#3182ce" 
                  name="Run Queue" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverloadManager;