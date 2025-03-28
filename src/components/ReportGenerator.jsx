import React, { useState } from 'react';
import { generateReport } from '../utils/reportGenerator';

/**
 * Component for generating interactive HTML reports
 * @param {Object} props - Component props
 * @param {Object} props.logData - Log data for report generation
 * @param {Object} props.timeRange - Time range of the data
 * @param {string} props.activeTab - Currently active tab
 * @param {boolean} props.disabled - Whether the button should be disabled
 */
const ReportGenerator = ({ logData, timeRange, activeTab, disabled = false }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  
  // Report options state
  const [reportOptions, setReportOptions] = useState({
    filename: 'log-analysis-report.html',
    includeOverview: true,
    includeRobustStats: true,
    includeOverloadManager: true,
    includeGhostMon: true
  });
  
  // Handle option changes
  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Generate the report
  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      // Determine data type based on activeTab and logData structure
      let dataType = 'standard';
      if (activeTab === 'ghostMon' || (Array.isArray(logData) && logData.length > 0 && 'keyType' in logData[0])) {
        dataType = 'ghostmon';
      }
      
      // Validate data before generating report
      if (!logData) {
        throw new Error('No data available to generate report');
      }
      
      // Generate the report
      await generateReport({
        data: logData,
        timeRange,
        dataType,
        filename: reportOptions.filename,
        options: {
          includeOverview: reportOptions.includeOverview,
          includeRobustStats: reportOptions.includeRobustStats,
          includeOverloadManager: reportOptions.includeOverloadManager,
          includeGhostMon: reportOptions.includeGhostMon
        }
      });
      
      // Reset options panel after successful generation
      setShowOptions(false);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };
  
  // Toggle options panel
  const toggleOptions = () => {
    setShowOptions(prev => !prev);
  };
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex flex-wrap items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Interactive Report</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={toggleOptions}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            disabled={disabled}
          >
            {showOptions ? 'Hide Options' : 'Options'}
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={disabled || generating || !logData}
            className={`px-4 py-1 rounded text-white ${
              disabled || generating || !logData
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {generating ? 'Generating...' : 'Generate HTML Report'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Options Panel */}
      {showOptions && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium mb-3">Report Options</h4>
          
          <div className="grid gap-3 mb-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Filename
              </label>
              <input
                type="text"
                name="filename"
                value={reportOptions.filename}
                onChange={handleOptionChange}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeOverview"
                name="includeOverview"
                checked={reportOptions.includeOverview}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <label htmlFor="includeOverview" className="text-sm text-gray-700">
                Include Overview
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeRobustStats"
                name="includeRobustStats"
                checked={reportOptions.includeRobustStats}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <label htmlFor="includeRobustStats" className="text-sm text-gray-700">
                Include Robust Stats
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeOverloadManager"
                name="includeOverloadManager"
                checked={reportOptions.includeOverloadManager}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <label htmlFor="includeOverloadManager" className="text-sm text-gray-700">
                Include Overload Manager
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeGhostMon"
                name="includeGhostMon"
                checked={reportOptions.includeGhostMon}
                onChange={handleOptionChange}
                className="mr-2"
              />
              <label htmlFor="includeGhostMon" className="text-sm text-gray-700">
                Include GhostMon
              </label>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <strong>Note:</strong> The generated HTML report will be self-contained with interactive charts for easy sharing or embedding in Confluence.
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        Generate an interactive HTML report with the current data that can be embedded in Confluence.
        All charts will maintain interactive tooltips and functionality.
      </div>
    </div>
  );
};

export default ReportGenerator;
