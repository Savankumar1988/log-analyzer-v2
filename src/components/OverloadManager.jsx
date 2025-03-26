
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const mergeLogEntries = (logData) => {
  const merged = new Map();
  
  logData.forEach(entry => {
    const key = entry.timestamp;
    if (!merged.has(key)) {
      merged.set(key, {
        timestamp: entry.timestamp,
        ruleName: entry.ruleName || '',
        triggerType: entry.triggerType || '',
        triggerPct: entry.triggerPct || 0,
        denyPct: entry.denyPct || 0,
        metrics: entry.metrics || { cpu: 0, mem: 0, reqs: 0 },
        runQ: entry.runQ || 0
      });
    } else {
      const existingEntry = merged.get(key);
      merged.set(key, {
        ...existingEntry,
        ruleName: entry.ruleName || existingEntry.ruleName,
        triggerType: entry.triggerType || existingEntry.triggerType,
        triggerPct: entry.triggerPct || existingEntry.triggerPct,
        denyPct: entry.denyPct || existingEntry.denyPct,
        metrics: entry.metrics || existingEntry.metrics,
        runQ: entry.runQ || existingEntry.runQ
      });
    }
  });
  
  return Array.from(merged.values());
};

const OverloadManager = ({ logData }) => {
  if (!logData || !logData.overloadManager || logData.overloadManager.length === 0) {
    return <div>No OverloadManager data available</div>;
  }

  const mergedData = mergeLogEntries(logData.overloadManager);
  const formatData = mergedData.map(entry => ({
    timestamp: entry.timestamp.toFixed(3),
    ruleName: entry.ruleName,
    triggerType: entry.triggerType,
    triggerPct: entry.triggerPct,
    denyPct: entry.denyPct,
    arlid: entry.metrics?.arlid || 0,
    ehnid: entry.metrics?.ehnid || 0,
    cpu: entry.metrics?.cpu || 0,
    mem: entry.metrics?.mem || 0,
    reqs: entry.metrics?.reqs || 0,
    runQ: entry.runQ
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
      <h2 className="text-xl font-semibold mb-4">OverloadManager Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Latest Trigger %</h3>
          <div className="text-3xl font-bold text-orange-600">
            {formatData[formatData.length - 1]?.triggerPct.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Latest Deny %</h3>
          <div className="text-3xl font-bold text-red-600">
            {formatData[formatData.length - 1]?.denyPct.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Latest Run Queue</h3>
          <div className="text-3xl font-bold text-blue-600">
            {formatData[formatData.length - 1]?.runQ.toFixed(3)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Percentages Over Time</h3>
        <LineChart width={800} height={300} data={formatData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="triggerPct" name="Trigger %" stroke="#f97316" />
          <Line type="monotone" dataKey="denyPct" name="Deny %" stroke="#dc2626" />
        </LineChart>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Resource Usage</h3>
        <LineChart width={800} height={300} data={formatData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cpu" name="CPU (ms)" stroke="#2563eb" />
          <Line type="monotone" dataKey="mem" name="Memory (KB)" stroke="#7c3aed" />
          <Line type="monotone" dataKey="reqs" name="Requests" stroke="#059669" />
        </LineChart>
      </div>

      <h3 className="text-lg font-medium mb-3">Raw Data (Sample)</h3>
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
            {formatData.slice(-10).map((entry, index) => (
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
