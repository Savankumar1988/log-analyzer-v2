import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().replace('T', ' ').substr(0, 19);
};

const mergeLogEntries = (logData) => {
  const merged = new Map();

  logData.forEach(entry => {
    if (entry.type === "addCandidateTarget") {
      const key = entry.timestamp;
      merged.set(key, {
        timestamp: entry.timestamp,
        timestampUTC: formatTimestamp(entry.timestamp),
        ruleName: entry.ruleName || '',
        triggerType: '',
        triggerPct: entry.triggerPct || 0,
        denyPct: entry.denyPct || 0,
        arlid: entry.arlid || 0,
        ehnid: entry.ehnid || 0,
        metrics: {
          cpu: entry.metrics?.cpu || 0,
          mem: entry.metrics?.mem || 0,
          reqs: entry.metrics?.reqs || 0
        }
      });
    } else if (entry.type === "processMainLoop") {
      const key = entry.timestamp;
      if (merged.has(key)) {
        const existing = merged.get(key);
        merged.set(key, {
          ...existing,
          triggerType: entry.triggerMetric,
          triggerValue: entry.triggerValue
        });
      }
    }
  });

  return Array.from(merged.values());
};

const OverloadManager = ({ data }) => {
  if (!data || !Array.isArray(data)) {
    return <div>No data available for analysis</div>;
  }
  
  const mergedData = mergeLogEntries(data) || [];

  return (
    <div>
      <h2>Overload Manager Analysis</h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Rule Name</th>
              <th>Triggered By</th>
              <th>Trigger %</th>
              <th>Deny %</th>
              <th>ARLID</th>
              <th>EHNID</th>
              <th>CPU (ms)</th>
              <th>Memory (KB)</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.timestampUTC}</td>
                <td>{entry.ruleName}</td>
                <td>{entry.triggerType}</td>
                <td>{entry.triggerPct.toFixed(2)}</td>
                <td>{entry.denyPct.toFixed(2)}</td>
                <td>{entry.arlid}</td>
                <td>{entry.ehnid}</td>
                <td>{entry.metrics.cpu}</td>
                <td>{entry.metrics.mem}</td>
                <td>{entry.metrics.reqs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px' }}>
        <LineChart width={800} height={400} data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestampUTC" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="triggerPct" stroke="#8884d8" name="Trigger %" />
          <Line type="monotone" dataKey="denyPct" stroke="#82ca9d" name="Deny %" />
        </LineChart>
      </div>
    </div>
  );
};

export default OverloadManager;