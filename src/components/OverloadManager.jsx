import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { prepareTimeSeriesData, getMetricStats } from '../utils/chartUtils';
import StatCard from './StatCard';
import DataTable from './DataTable';

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

  // Define columns for summary table
  const summaryColumns = [
    { header: 'Metric', accessor: 'metric' },
    { header: 'Current', accessor: 'current' },
    { header: 'Average', accessor: 'average' },
    { header: 'Maximum', accessor: 'maximum' }
  ];

  // Create summary data for DataTable
  const summaryData = [
    {
      metric: 'Trigger Percentage',
      current: `${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].triggerPct.toFixed(1)}%`,
      average: `${triggerStats.avg.toFixed(1)}%`,
      maximum: `${triggerStats.max.toFixed(1)}%`
    },
    {
      metric: 'Deny Percentage',
      current: `${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].denyPct.toFixed(1)}%`,
      average: `${denyStats.avg.toFixed(1)}%`,
      maximum: `${denyStats.max.toFixed(1)}%`
    },
    {
      metric: 'Run Queue',
      current: `${logData.processMainLoops[logData.processMainLoops.length - 1].runQ.toFixed(3)}`,
      average: `${runQStats.avg.toFixed(3)}`,
      maximum: `${runQStats.max.toFixed(3)}`
    },
    {
      metric: 'CPU (ms)',
      current: `${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].metrics.cpu}`,
      average: `${cpuStats.avg.toFixed(1)}`,
      maximum: `${cpuStats.max.toFixed(1)}`
    },
    {
      metric: 'Memory (KB)',
      current: `${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].metrics.mem}`,
      average: `${memStats.avg.toFixed(1)}`,
      maximum: `${memStats.max.toFixed(1)}`
    },
    {
      metric: 'Requests',
      current: `${logData.addCandidateTargets[logData.addCandidateTargets.length - 1].metrics.reqs}`,
      average: `${reqsStats.avg.toFixed(1)}`,
      maximum: `${reqsStats.max.toFixed(1)}`
    }
  ];

  // Define columns for rule distribution table
  const ruleColumns = [
    { header: 'Rule', accessor: 'rule' },
    { header: 'Count', accessor: 'count' },
    { header: 'Percentage', accessor: 'percentage', render: (row) => `${row.percentage}%` }
  ];

  // Define columns for trigger reason distribution table
  const triggerReasonColumns = [
    { header: 'Trigger Reason', accessor: 'reason' },
    { header: 'Count', accessor: 'count' },
    { header: 'Percentage', accessor: 'percentage', render: (row) => `${row.percentage}%` }
  ];

  // Define columns for raw data table
  const rawDataColumns = [
    { header: 'Timestamp', accessor: 'timestampFormatted' },
    { header: 'Trigger %', accessor: 'triggerPct', render: (row) => `${row.triggerPct.toFixed(1)}%` },
    { header: 'Deny %', accessor: 'denyPct', render: (row) => `${row.denyPct.toFixed(1)}%` },
    { header: 'CPU (ms)', accessor: 'metrics.cpu' },
    { header: 'Memory (KB)', accessor: 'metrics.mem' },
    { header: 'Requests', accessor: 'metrics.reqs' },
    { 
      header: 'Triggered By', 
      render: (row) => {
        const mainLoop = logData.processMainLoops.find(m => Math.abs(m.timestamp - row.timestamp) < 0.01);
        return mainLoop ? mainLoop.triggerReason || NA : NA;
      } 
    },
    { header: 'Rule', accessor: 'rule', render: (row) => row.rule || NA },
    { 
      header: 'arlid', 
      render: (row) => row.arlid !== null && row.arlid !== undefined ? row.arlid : NA 
    },
    { 
      header: 'ehnid', 
      render: (row) => row.ehnid !== null && row.ehnid !== undefined ? row.ehnid : NA 
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">OverloadManager Analysis</h2>

      {/* Summary table */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3">Summary Statistics</h3>
        <DataTable 
          data={summaryData} 
          columns={summaryColumns} 
          limit={summaryData.length} 
        />
      </div>

      {/* Distribution Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Rule Distribution</h3>
          <DataTable 
            data={ruleDistribution} 
            columns={ruleColumns} 
            limit={10} 
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Trigger Reason Distribution</h3>
          <DataTable 
            data={triggerDistribution} 
            columns={triggerReasonColumns} 
            limit={10} 
          />
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
        <DataTable 
          data={logData.addCandidateTargets} 
          columns={rawDataColumns} 
          limit={5} 
          totalCount={logData.addCandidateTargets.length} 
        />
      </div>
    </div>
  );
};

export default OverloadManager;
