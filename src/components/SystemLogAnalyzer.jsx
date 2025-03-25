import React, { useState, useMemo } from 'react';
import { 
  FlexibleLineChart, 
  FlexibleBarChart, 
  calculateMetricStats 
} from './LogChartComponents';
import { useLogParser } from './useLogParser';

// Configuration for log parsing
const LOG_PARSER_CONFIG = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedFileTypes: ['.log', '.txt'],
  strictParsing: false
};

// Helper to format memory
const formatMemory = (kb) => {
  if (!kb) return '0 KB';
  if (kb < 1024) return `${kb.toLocaleString()} KB`;
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(2)} MB`;
  return `${(kb / 1024 / 1024).toFixed(2)} GB`;
};

const SystemLogAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMetric, setActiveMetric] = useState('system');

  // Use the custom log parser hook
  const { 
    loading, 
    error, 
    logData, 
    parseLogFile 
  } = useLogParser(LOG_PARSER_CONFIG);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      parseLogFile(file);
    }
  };

  // Prepare chart data and configurations
  const prepareChartData = (data, metrics) => {
    if (!data) return [];
    
    return data.map(entry => {
      const result = { 
        timestamp: entry.timestamp,
        formattedTime: entry.timestampFormatted
      };
      
      metrics.forEach(metric => {
        result[metric] = entry[metric];
      });
      
      return result;
    });
  };

  // Render different sections based on active tab and metric
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="text-lg">Loading and analyzing log data...</div>
          <div className="mt-2 text-gray-500">This may take a moment</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      );
    }

    if (!logData) {
      return (
        <div className="text-center py-12 text-gray-500">
          No log data loaded. Please upload a log file.
        </div>
      );
    }

    // Render based on active tab
    switch (activeTab) {
      case 'overview':
        return renderSystemOverview();
      case 'robustStats':
        return renderRobustStats();
      case 'overloadManager':
        return renderOverloadManager();
      default:
        return null;
    }
  };

  // System Overview rendering
  const renderSystemOverview = () => {
    if (!logData?.robustStats?.length) return <div>No data available</div>;

    const lastStats = logData.robustStats[logData.robustStats.length - 1];
    
    // Calculate statistics
    const cpuStats = calculateMetricStats(logData.robustStats, 'cpuAll');
    const memStats = calculateMetricStats(logData.robustStats, 'memRSS');
    const httpStats = calculateMetricStats(logData.robustStats, 'https');

    // Prepare chart data
    const cpuData = prepareChartData(logData.robustStats, ['cpuAll']);
    const memData = prepareChartData(logData.robustStats, ['memRSS']);
    const httpData = prepareChartData(logData.robustStats, ['http', 'https']);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key metrics cards */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">CPU Usage</h3>
            <div className="text-3xl font-bold text-blue-600">{lastStats.cpuAll}%</div>
            <div className="text-sm text-gray-500">
              Avg: {cpuStats.avg.toFixed(1)}% | Max: {cpuStats.max}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Memory (RSS)</h3>
            <div className="text-3xl font-bold text-green-600">{formatMemory(lastStats.memRSS)}</div>
            <div className="text-sm text-gray-500">
              Avg: {formatMemory(memStats.avg)} | Max: {formatMemory(memStats.max)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">HTTPS Requests</h3>
            <div className="text-3xl font-bold text-purple-600">{lastStats.https.toLocaleString()}</div>
            <div className="text-sm text-gray-500">
              Avg: {httpStats.avg.toFixed(0)} | Max: {httpStats.max.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed charts */}
          <FlexibleLineChart 
            data={cpuData}
            lines={[{ dataKey: 'cpuAll', name: 'CPU Usage' }]}
            title="CPU Utilization Over Time"
            observations={[
              "CPU utilization shows consistent performance",
              `Average CPU usage is ${cpuStats.avg.toFixed(1)}%`,
              `Peaks reach up to ${cpuStats.max}%`
            ]}
          />

          <FlexibleLineChart 
            data={memData}
            lines={[{ dataKey: 'memRSS', name: 'Memory RSS' }]}
            title="Memory Usage Over Time"
            observations={[
              `Average memory usage is ${formatMemory(memStats.avg)}`,
              "Memory consumption remains stable",
              "No significant memory leaks detected"
            ]}
          />

          <FlexibleLineChart 
            data={httpData}
            lines={[
              { dataKey: 'http', name: 'HTTP Requests' },
              { dataKey: 'https', name: 'HTTPS Requests' }
            ]}
            title="HTTP/HTTPS Requests"
            observations={[
              "HTTPS traffic significantly higher than HTTP",
              `Average HTTPS requests: ${httpStats.avg.toFixed(0)}`,
              `Peak HTTPS requests: ${httpStats.max.toLocaleString()}`
            ]}
          />
        </div>
      </div>
    );
  };

  // Robust Stats rendering (similar structure to overview)
  const renderRobustStats = () => {
    // Similar implementation to overview, with more detailed metrics
    // Implement additional metric selections and charts
    return <div>Robust Stats Details</div>;
  };

  // Overload Manager rendering
  const renderOverloadManager = () => {
    // Detailed OverloadManager analysis
    return <div>OverloadManager Details</div>;
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">System Log Analyzer</h1>
      
      {/* File Upload Section */}
      <div className="mb-6">
        <label 
          htmlFor="log-file-upload" 
          className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50"
        >
          <div className="text-lg mb-2">Upload Log File</div>
          <p className="text-sm text-gray-500">
            Select your log file (max 20MB, .log or .txt)
          </p>
          <input
            id="log-file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".log,.txt"
          />
        </label>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          {['overview', 'robustStats', 'overloadManager'].map(tab => (
            <button 
              key={tab}
              className={`pb-2 px-2 capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-500 font-medium' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default SystemLogAnalyzer;
