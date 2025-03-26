
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const OverloadManager = ({ logData }) => {
  if (!logData || !logData.overloadManager || logData.overloadManager.length === 0) {
    return <div>No OverloadManager data available</div>;
  }

  const formatData = logData.overloadManager.map(entry => ({
    timestamp: entry.timestamp.toFixed(3),
    ruleName: entry.ruleName || '',
    triggerType: entry.triggerType || '',
    triggerValue: entry.triggerValue || 0,
    triggerPct: entry.triggerPct || 0,
    denyPct: entry.denyPct || 0,
    arlid: entry.metrics?.arlid || 0,
    ehnid: entry.metrics?.ehnid || 0,
    cpu: entry.metrics?.cpu || 0,
    mem: entry.metrics?.mem || 0,
    reqs: entry.metrics?.reqs || 0
  }));

  // Prepare time series data for plots
  const plotData = formatData.map(d => ({
    timestamp: d.timestamp,
    triggerPct: d.triggerPct,
    denyPct: d.denyPct,
    cpu: d.cpu,
    mem: d.mem,
    reqs: d.reqs
  }));

  return (
    <div>
      <h2>OverloadManager Analysis</h2>
      
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Timestamp</th>
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
            {formatData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.timestamp}</td>
                <td>{entry.ruleName}</td>
                <td>{entry.triggerType}</td>
                <td>{entry.triggerPct.toFixed(2)}</td>
                <td>{entry.denyPct.toFixed(2)}</td>
                <td>{entry.arlid}</td>
                <td>{entry.ehnid}</td>
                <td>{entry.cpu}</td>
                <td>{entry.mem}</td>
                <td>{entry.reqs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Metrics Over Time</h3>
      <LineChart width={800} height={400} data={plotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="triggerPct" stroke="#8884d8" name="Trigger %" />
        <Line type="monotone" dataKey="denyPct" stroke="#82ca9d" name="Deny %" />
        <Line type="monotone" dataKey="cpu" stroke="#ff7300" name="CPU (ms)" />
      </LineChart>

      <h3>Memory and Requests Over Time</h3>
      <LineChart width={800} height={400} data={plotData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="mem" stroke="#8884d8" name="Memory (KB)" />
        <Line type="monotone" dataKey="reqs" stroke="#82ca9d" name="Requests" />
      </LineChart>
    </div>
  );
};

export default OverloadManager;
