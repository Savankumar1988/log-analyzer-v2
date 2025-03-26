import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatMemory, formatNumber, prepareTimeSeriesData, getMetricStats } from '../utils/chartUtils';
import StatCard from './StatCard';

const Overview = ({ logData }) => {
  if (!logData || !logData.robustStats.length) return <div>No data available</div>;

  const lastStats = logData.robustStats[logData.robustStats.length - 1];
  const cpuStats = getMetricStats(logData.robustStats, 'cpuAll');
  const memStats = getMetricStats(logData.robustStats, 'memRSS');
  const httpStats = getMetricStats(logData.robustStats, 'https');

  // Prepare time series data for CPU, Memory, and HTTP requests
  const cpuData = prepareTimeSeriesData(logData.robustStats, ['cpuAll']);
  const memData = prepareTimeSeriesData(logData.robustStats, ['memRSS']);
  const httpData = prepareTimeSeriesData(logData.robustStats, ['http', 'https']);
  const clientData = prepareTimeSeriesData(logData.robustStats, ['clientInProgress', 'done']);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">System Overview</h2>

      <div className="mb-6" style={{textAlign: 'center'}}>
        <StatCard 
          title="CPU Usage"
          value={`${lastStats.cpuAll}%`}
          color="blue"
          details={`Avg: ${cpuStats.avg.toFixed(1)}% | Min: ${cpuStats.min}% | Max: ${cpuStats.max}%`}
        />

        <StatCard
          title="Memory (RSS)"
          value={formatMemory(lastStats.memRSS)}
          color="green"
          details={`Avg: ${formatMemory(memStats.avg)} | Max: ${formatMemory(memStats.max)}`}
        />

        <StatCard
          title="HTTPS Requests"
          value={formatNumber(lastStats.https)}
          color="purple"
          details={`Avg: ${httpStats.avg.toFixed(0)} | Max: ${formatNumber(httpStats.max)}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">CPU Utilization Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} dy={20} />
              <YAxis domain={[0, Math.max(100, cpuStats.max)]} />
              <Tooltip formatter={(value) => [`${value}%`, 'CPU']} labelFormatter={(time) => `Time: ${time}`} />
              <Line type="monotone" dataKey="cpuAll" stroke="#3182ce" name="CPU %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Memory Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={memData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} dy={20} />
              <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(value) => `${(value / 1024 / 1024).toFixed(1)} GB`} />
              <Tooltip formatter={(value) => [formatMemory(value), 'Memory RSS']} labelFormatter={(time) => `Time: ${time}`} />
              <Line type="monotone" dataKey="memRSS" stroke="#38a169" name="Memory RSS" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">HTTP/HTTPS Requests</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={httpData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} dy={20} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="http" stroke="#3182ce" name="HTTP" dot={false} />
              <Line type="monotone" dataKey="https" stroke="#805ad5" name="HTTPS" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Client Requests</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={clientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} dy={20} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clientInProgress" stroke="#e53e3e" name="In Progress" dot={false} />
              <Line type="monotone" dataKey="done" stroke="#38a169" name="Done" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;