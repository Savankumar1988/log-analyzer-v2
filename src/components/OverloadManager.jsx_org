import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { prepareTimeSeriesData, getMetricStats } from '../utils/chartUtils';
import StatCard from './StatCard';

const OverloadManager = ({ logData }) => {
  if (!logData || !logData.addCandidateTargets.length) return <div>No data available</div>;
  
  // Define NA value without quotes
  const NA = "N/A";

  // Prepare data for charts
  const targetData = prepareTimeSeriesData(logData.addCandidateTargets, ['triggerPct', 'denyPct', 'rule']);
  const metricsData = prepareTimeSeriesData(
    logData.addCandidateTargets, 
    [
      { name: 'cpuMs', path: 'metrics.cpu' },
      { name: 'memKB', path: 'metrics.mem' },
      { name: 'reqs', path: 'metrics.reqs' }
    ]
  );
  const processLoopData = prepareTimeSeriesData(logData.processMainLoops, ['runQ', 'triggerReason', 'triggerValue']);

  // Calculate statistics
  const triggerStats = getMetricStats(logData.addCandidateTargets, 'triggerPct');
  const denyStats = getMetricStats(logData.addCandidateTargets, 'denyPct');
  const cpuStats = getMetricStats(logData.addCandidateTargets, { path: 'metrics.cpu' });
  const memStats = getMetricStats(logData.addCandidateTargets, { path: 'metrics.mem' });
  const reqsStats = getMetricStats(logData.addCandidateTargets, { path: 'metrics.reqs' });
  const runQStats = getMetricStats(logData.processMainLoops, 'runQ');

  // Get unique rules for rule distribution analysis
  const rules = {};
  const triggerReasons = {};
  const arlidEntries = {};
  const ehnidEntries = {};
  
  logData.addCandidateTargets.forEach(entry => {
    if (entry.rule) {
      rules[entry.rule] = (rules[entry.rule] || 0) + 1;
    }
    // Track arlid and ehnid entries if they exist
    if (entry.arlid) {
      arlidEntries[entry.arlid] = (arlidEntries[entry.arlid] || 0) + 1;
    }
    if (entry.ehnid !== null && entry.ehnid !== undefined) {
      ehnidEntries[entry.ehnid] = (ehnidEntries[entry.ehnid] || 0) + 1;
    }
  });
  
  logData.processMainLoops.forEach(entry => {
    if (entry.triggerReason) {
      triggerReasons[entry.triggerReason] = (triggerReasons[entry.triggerReason] || 0) + 1;
    }
  });
  
  // Convert to arrays for easier rendering
  const ruleDistribution = Object.entries(rules)
    .map(([rule, count]) => ({ 
      rule, 
      count, 
      percentage: ((count / logData.addCandidateTargets.length) * 100).toFixed(1) 
    }))
    .sort((a, b) => b.count - a.count);
    
  const triggerDistribution = Object.entries(triggerReasons)
    .map(([reason, count]) => ({ 
      reason, 
      count, 
      percentage: ((count / logData.processMainLoops.length) * 100).toFixed(1) 
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">OverloadManager Analysis</h2>

      {/* Summary stats cards - now in horizontal layout */}
      <div className="flex flex-wrap justify-between mb-6">
        <StatCard
          title="Trigger Percentage"
          value={`${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].triggerPct.toFixed(1)}%`}
          color="orange"
          details={`Avg: ${triggerStats.avg.toFixed(1)}% | Max: ${triggerStats.max.toFixed(1)}%`}
        />

        <StatCard
          title="Deny Percentage"
          value={`${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].denyPct.toFixed(1)}%`}
          color="red"
          details={`Avg: ${denyStats.avg.toFixed(1)}% | Max: ${denyStats.max.toFixed(1)}%`}
        />

        <StatCard
          title="Run Queue"
          value={`${logData.processMainLoops[logData.processMainLoops.length - 1].runQ.toFixed(3)}`}
          color="blue"
          details={`Avg: ${runQStats.avg.toFixed(3)} | Max: ${runQStats.max.toFixed(3)}`}
        />
      </div>

      {/* Distribution Tables Section - Now placed above charts with proper borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">Rule Distribution Table</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Rule</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-l">Count</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-l">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ruleDistribution.map((rule, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{rule.rule}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm border-l">{rule.count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm border-l">{rule.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3">Trigger Reason Distribution Table</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Trigger Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-l">Count</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-l">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {triggerDistribution.map((trigger, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{trigger.reason}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm border-l">{trigger.count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm border-l">{trigger.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Trigger & Deny Percentages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={targetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} dy={20} />
              <YAxis domain={[0, Math.max(100, denyStats.max * 1.1)]} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`]} />
              <Legend />
              <Line type="monotone" dataKey="triggerPct" stroke="#ed8936" name="Trigger %" dot={false} />
              <Line type="monotone" dataKey="denyPct" stroke="#e53e3e" name="Deny %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Resource Metrics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} dy={20} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cpuMs" stroke="#3182ce" name="CPU (ms)" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="memKB" stroke="#38a169" name="Memory (KB)" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="reqs" stroke="#805ad5" name="Requests" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Raw data table */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-3">OverloadManager Raw Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger %</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deny %</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU (ms)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory (KB)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triggered By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">arlid</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ehnid</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logData.addCandidateTargets.slice(0, 5).map((entry, index) => {
                const mainLoop = logData.processMainLoops.find(m => Math.abs(m.timestamp - entry.timestamp) < 0.01);
                return (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.timestampFormatted}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.triggerPct.toFixed(1)}%</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.denyPct.toFixed(1)}%</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.metrics.cpu}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.metrics.mem}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.metrics.reqs}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{mainLoop ? mainLoop.triggerReason || NA : NA}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.rule || NA}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.arlid !== null && entry.arlid !== undefined ? entry.arlid : NA}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.ehnid !== null && entry.ehnid !== undefined ? entry.ehnid : NA}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Showing 5 of {logData.addCandidateTargets.length} entries
        </div>
      </div>
    </div>
  );
};

export default OverloadManager;
