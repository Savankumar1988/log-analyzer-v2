import React, { useState } from 'react';
import Overview from './Overview';
import RobustStats from './RobustStats';
import OverloadManager from './OverloadManager';
import GhostMonAnalyzer from './GhostMonAnalyzer';
import FileUpload from './FileUpload';
import TabNavigation from './TabNavigation';
import { parseLogData } from '../utils/logParser';
import { formatTimestamp } from '../utils/chartUtils';
import pako from 'pako';

const SystemLogAnalyzer = () => {
  const [loading, setLoading] = useState(true);
  const [logData, setLogData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [rawLogContent, setRawLogContent] = useState('');
  
  const handleFileUpload = (event) => {
    // If a file is provided via input, use that
    const file = event?.target?.files?.[0];
    
    // Otherwise, proceed with processing the file content
    const processFileContent = (content) => {
      try {
        // Save the raw log content for GhostMon analyzer
        setRawLogContent(content);
        
        const { data, timeRange, error } = parseLogData(content);
        
        // Always set the raw log content, even if main parsing fails
        setRawLogContent(content);
        
        if (error) {
          // If main parsing fails, don't set an error - this allows GhostMon to still work
          console.warn('Main log parsing error:', error);
          setLogData(null);
        } else {
          setTimeRange(timeRange);
          setLogData(data);
        }
      } catch (err) {
        setError('Error analyzing log file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    setLoading(true);
    setError('');
    
    if (file) {
      // Process the selected file
      const reader = new FileReader();
      const isGzipped = file.name.toLowerCase().endsWith('.gz');
      
      reader.onload = (e) => {
        try {
          let content;
          
          if (isGzipped) {
            // For .gz files, decompress the content
            const compressed = new Uint8Array(e.target.result);
            const decompressed = pako.inflate(compressed);
            content = new TextDecoder('utf-8').decode(decompressed);
          } else {
            // For .log and .txt files, use the text directly
            content = e.target.result;
          }
          
          processFileContent(content);
        } catch (err) {
          setError('Error processing file: ' + (err.message || 'Unknown error'));
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
      };
      
      if (isGzipped) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } else {
      // Auto-load the sample file for development/testing
      fetch('/sample-ghostmon-both-keys.log')
        .then(response => response.text())
        .then(processFileContent)
        .catch(err => {
          setError('Failed to load sample file: ' + err.message);
          setLoading(false);
        });
    }
  };
  
  // Auto-load the sample file on initial mount
  React.useEffect(() => {
    handleFileUpload();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'robustStats', label: 'Robust Stats' },
    { id: 'overloadManager', label: 'OverloadManager' },
    { id: 'ghostMon', label: 'GhostMon Analyzer' }
  ];

  // Main render function
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">System Log Analyzer</h1>
      
      <FileUpload onFileUpload={handleFileUpload} />
      
      {loading && (
        <div className="text-center py-12">
          <div className="text-lg">Loading and analyzing log data...</div>
          <div className="mt-2 text-gray-500">This may take a moment</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          {logData && (
            <div className="text-xs text-gray-500 flex flex-wrap justify-between items-center">
              <div>
                {formatTimestamp(timeRange.start, true)} to {formatTimestamp(timeRange.end, true)}
              </div>
              <div>
                {logData.robustStats.length} Robust stats, {logData.overloadManager.length} OverloadManager entries
              </div>
            </div>
          )}
          
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            tabs={tabs} 
          />
          
          {activeTab === 'overview' && logData ? (
            <Overview logData={logData} />
          ) : (
            activeTab === 'overview' && <div className="text-center py-6">No overview data available</div>
          )}
          
          {activeTab === 'robustStats' && logData ? (
            <RobustStats logData={logData} />
          ) : (
            activeTab === 'robustStats' && <div className="text-center py-6">No Robust stats data available</div>
          )}
          
          {activeTab === 'overloadManager' && logData ? (
            <OverloadManager logData={logData} />
          ) : (
            activeTab === 'overloadManager' && <div className="text-center py-6">No OverloadManager data available</div>
          )}
          {activeTab === 'ghostMon' && <GhostMonAnalyzer logFileContent={rawLogContent} isLoading={loading} />}
        </div>
      )}
    </div>
  );
};

export default SystemLogAnalyzer;
