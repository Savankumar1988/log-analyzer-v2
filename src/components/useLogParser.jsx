import { useState, useCallback } from 'react';
import Papa from 'papaparse';

// Logging utility
const logError = (context, error) => {
  console.error(`[LogParser Error - ${context}]`, error);
  // In a real-world scenario, you might want to send this to a logging service
};

// Configuration for log parsing
const DEFAULT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB default
  allowedFileTypes: ['.log', '.txt'],
  strictParsing: true
};

export const useLogParser = (config = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logData, setLogData] = useState(null);

  // Merge default config with provided config
  const parserConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };

  // Validate file before parsing
  const validateFile = useCallback((file) => {
    // Check file size
    if (file.size > parserConfig.maxFileSize) {
      setError(`File too large. Maximum size is ${parserConfig.maxFileSize / 1024 / 1024}MB`);
      logError('File Validation', `File size exceeded: ${file.size} bytes`);
      return false;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!parserConfig.allowedFileTypes.includes(fileExtension)) {
      setError(`Invalid file type. Allowed types: ${parserConfig.allowedFileTypes.join(', ')}`);
      logError('File Validation', `Invalid file type: ${fileExtension}`);
      return false;
    }

    return true;
  }, [parserConfig]);

  // Flexible timestamp formatting
  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().replace('T', ' ').substr(0, 19);
  }, []);

  // More robust log parsing with flexible extraction
  const parseLogLine = useCallback((line) => {
    try {
      const data = {
        timestamp: parseFloat(line.split('|')[0]),
        timestampFormatted: ''
      };

      // Robust stats parsing with more flexible matching
      if (line.includes("Robust - stats")) {
        data.timestampFormatted = formatTimestamp(data.timestamp);
        
        // Use regex with optional capturing groups
        const extractValue = (regex, defaultValue = 0) => {
          const match = line.match(regex);
          return match ? parseInt(match[1]) : defaultValue;
        };

        data.http = extractValue(/Accepts: http\/https (\d+)\//);
        data.https = extractValue(/Accepts: http\/https \d+\/(\d+)/);
        data.clientInProgress = extractValue(/client: in-progress (\d+)/);
        // ... other fields with similar flexible extraction
        
        return data;
      }

      // OverloadManager parsing
      if (line.includes("crp::OverloadManager")) {
        data.timestampFormatted = formatTimestamp(data.timestamp);
        
        // More flexible parsing for OverloadManager
        const triggerMatch = line.match(/trigger_pct:(\d+\.\d+)%/);
        const denyMatch = line.match(/deny_pct:(\d+\.\d+)%/);
        
        if (triggerMatch) {
          data.triggerPct = parseFloat(triggerMatch[1]);
        }
        
        if (denyMatch) {
          data.denyPct = parseFloat(denyMatch[1]);
        }
        
        // ... other fields
        
        return data;
      }

      // If strict parsing is off, return null for unrecognized lines
      return parserConfig.strictParsing ? null : data;
    } catch (err) {
      logError('Log Line Parsing', err);
      return null;
    }
  }, [formatTimestamp, parserConfig.strictParsing]);

  // Main parsing function
  const parseLogFile = useCallback(async (file) => {
    // Reset previous state
    setLoading(true);
    setError(null);
    setLogData(null);

    // Validate file first
    if (!validateFile(file)) {
      setLoading(false);
      return;
    }

    try {
      const fileContent = await file.text();
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      
      const robustStats = [];
      const overloadManager = [];

      lines.forEach(line => {
        const parsedEntry = parseLogLine(line);
        if (parsedEntry) {
          if ('http' in parsedEntry) {
            robustStats.push(parsedEntry);
          }
          if ('triggerPct' in parsedEntry) {
            overloadManager.push(parsedEntry);
          }
        }
      });

      // Organize parsed data
      const processedData = {
        robustStats,
        overloadManager,
        addCandidateTargets: overloadManager.filter(entry => 'triggerPct' in entry),
        processMainLoops: overloadManager.filter(entry => 'runQ' in entry),
        timeRange: {
          start: Math.min(
            robustStats[0]?.timestamp || Infinity,
            overloadManager[0]?.timestamp || Infinity
          ),
          end: Math.max(
            robustStats[robustStats.length - 1]?.timestamp || -Infinity,
            overloadManager[overloadManager.length - 1]?.timestamp || -Infinity
          )
        }
      };

      setLogData(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to parse log file: ${errorMessage}`);
      logError('Log File Parsing', err);
    } finally {
      setLoading(false);
    }
  }, [validateFile, parseLogLine]);

  return {
    loading,
    error,
    logData,
    parseLogFile
  };
};
