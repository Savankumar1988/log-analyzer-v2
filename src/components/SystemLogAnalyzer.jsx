import React, { useState, useRef } from 'react';
import Overview from './Overview';
import RobustStats from './RobustStats';
import OverloadManager from './OverloadManager';
import GhostMonAnalyzer from './GhostMonAnalyzer';
import FileUpload from './FileUpload';
import LargeFileProcessor from './LargeFileProcessor';
import TabNavigation from './TabNavigation';
import ReportGenerator from './ReportGenerator';
import { parseLogData } from '../utils/logParser';
import { formatTimestamp } from '../utils/chartUtils';
import pako from 'pako';
import './LoadingOverride.css';

const SystemLogAnalyzer = () => {
  const [loading, setLoading] = useState(true);
  const [logData, setLogData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [rawLogContent, setRawLogContent] = useState('');
  const [isLargeFile, setIsLargeFile] = useState(false);
  
  // Reference to large file processor
  const largeFileProcessorRef = useRef(null);
  
  // File size threshold for server processing (200MB)
  const LARGE_FILE_THRESHOLD = 200 * 1024 * 1024;
  
  const handleFileUpload = (event) => {
    // If a file is provided via input, use that
    const file = event?.target?.files?.[0];
    
    // Reset state
    setLoading(true);
    setError('');
    setIsLargeFile(false);
    
    if (!file) {
      // Auto-load the sample file for development/testing
      fetch('/sample-ghostmon-both-keys.log')
        .then(response => response.text())
        .then(processFileContent)
        .catch(err => {
          setError('Failed to load sample file: ' + err.message);
          setLoading(false);
        });
      return;
    }
    
    // Check file size to determine processing method
    if (file.size >= LARGE_FILE_THRESHOLD) {
      // Large file - use server-side processing
      setIsLargeFile(true);
      // Process with the large file processor
      if (largeFileProcessorRef.current && largeFileProcessorRef.current.processFile) {
        largeFileProcessorRef.current.processFile(file);
      }
    } else {
      // Small file - use client-side processing
      processFileBrowser(file);
    }
  };
  
  // Client-side processing for smaller files
  const processFileBrowser = (file) => {
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
  };
  
  // Process content regardless of source
  const processFileContent = (content) => {
    try {
      // Save the raw log content for GhostMon analyzer
      setRawLogContent(content);
      
      const { data, timeRange, error } = parseLogData(content);
      
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
  
  // Handler for server-processed data
  const handleServerProcessedData = (data) => {
    setLoading(false);
    
    if (!data) {
      setError('No data returned from server');
      return;
    }
    
    if (data.type === 'standard') {
      setLogData(data.data);
      setTimeRange(data.timeRange);
      setRawLogContent(''); // No raw content for server processing
    } else if (data.type === 'ghostmon') {
      // For GhostMon data, we need to auto-switch to that tab
      setActiveTab('ghostMon');
      setRawLogContent(JSON.stringify(data.data)); // Pass data as JSON string
    } else {
      setError('Unknown data type returned from server');
    }
  };
  
  // Handle server processing errors
  const handleServerError = (errorMsg) => {
    setLoading(false);
    setError('Server processing error: ' + errorMsg);
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
    <div className={`p-4 max-w-5xl mx-auto ${isLargeFile ? 'large-file-active' : ''}`}>
      <h1 className="text-3xl font-bold mb-4 text-center">System Log Analyzer</h1>
      
      <div className="flex items-center mb-4">
        <FileUpload onFileUpload={handleFileUpload} />
        <button 
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setIsLargeFile(true);
            // Create a mock file object that will trigger large file processing
            const mockFile = new File(
              ["test content".repeat(1000)], 
              "large-test-file.log", 
              { type: "text/plain" }
            );
            // Set size property to exceed the threshold
            Object.defineProperty(mockFile, 'size', {
              value: LARGE_FILE_THRESHOLD + 1000,
              writable: false
            });
            // Process with the large file processor
            if (largeFileProcessorRef.current && largeFileProcessorRef.current.processFile) {
              largeFileProcessorRef.current.processFile(mockFile);
            }
          }}
        >
          Simulate Large File
        </button>
      </div>
      
      {isLargeFile && (
        <div className="mt-2 mb-4 bg-blue-50 p-3 rounded-md border border-blue-200 large-file-progress-container">
          <div className="font-medium mb-1 text-blue-800 text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Large File Processing
          </div>
          <div className="text-gray-700 mb-2">
            This file is larger than 200MB. Processing on the server for better performance.
          </div>
          <LargeFileProcessor 
            onFileProcessed={(data) => {
              handleServerProcessedData(data);
              setIsLargeFile(false);
            }}
            onError={handleServerError}
            ref={largeFileProcessorRef}
          />
        </div>
      )}
      
      {/* Only show the loading indicator when loading regular files, not when processing large files */}
      {loading && !isLargeFile && (
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
          {activeTab === 'ghostMon' && <GhostMonAnalyzer logFileContent={rawLogContent} isLoading={loading && !isLargeFile} />}
          
          {/* Report Generator */}
          {!loading && (
            <ReportGenerator 
              logData={activeTab === 'ghostMon' 
                ? (rawLogContent && rawLogContent.startsWith('[{') 
                  ? JSON.parse(rawLogContent) 
                  : (activeTab === 'ghostMon' && document.getElementById('ghostmon-analyzer-data') 
                    ? JSON.parse(document.getElementById('ghostmon-analyzer-data').textContent || '[]') 
                    : null))
                : logData}
              timeRange={timeRange}
              activeTab={activeTab}
              disabled={loading || (activeTab !== 'ghostMon' && !logData) || (activeTab === 'ghostMon' && !rawLogContent)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SystemLogAnalyzer;
