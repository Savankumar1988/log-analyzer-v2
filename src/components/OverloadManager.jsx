
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMetricStats } from '../utils/logParser';

const OverloadManager = ({ logData }) => {
  if (!logData || !logData.processMainLoops || !logData.addCandidateTargets) {
    return <div>No data available for OverloadManager analysis</div>;
  }

  const runQData = logData.processMainLoops.map((entry, index) => ({
    time: index,
    runQ: entry.runQ || 0,
    ruleName: entry.ruleName || 'N/A',
    triggerType: entry.triggerType,
    triggerValue: entry.triggerValue
  }));

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">OverloadManager Analysis</h2>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-medium mb-3">Run Queue</h3>
        <div style={{ width: '100%', height: 300 }}>
          <LineChart
            data={runQData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'runQ') {
                  return value?.toFixed(3) || '0';
                }
                return value;
              }}
              labelFormatter={(time) => {
                const dataPoint = runQData[time];
                if (!dataPoint) return `Time: ${time}`;
                
                return `Time: ${time}\nRule: ${dataPoint.ruleName || 'N/A'}`;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="runQ" 
              stroke="#3182ce" 
              name="Run Queue" 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

export default OverloadManager;
