import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Brush 
} from 'recharts';

// Utility to sample data points
export const sampleData = (data, maxPoints = 300) => {
  if (!data || data.length <= maxPoints) return data;
  
  const interval = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % interval === 0);
};

// Enhanced tooltip component
export const EnhancedTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white p-3 border rounded shadow-lg">
      <p className="font-bold mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex justify-between">
          <span 
            className="mr-2" 
            style={{ color: entry.color }}
          >
            {entry.name}:
          </span>
          <span>{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// Flexible line chart component
export const FlexibleLineChart = ({
  data, 
  lines, 
  height = 300, 
  showBrush = true,
  xAxisKey = 'formattedTime',
  title,
  observations,
  customTooltip = EnhancedTooltip
}) => {
  // Sample the data to improve performance
  const sampledData = useMemo(() => sampleData(data), [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      
      {observations && (
        <div className="p-3 bg-gray-100 rounded mt-1 mb-3">
          <h4 className="font-medium text-sm mb-1">Key Observations:</h4>
          <ul className="text-xs text-gray-700 list-disc pl-4">
            {observations.map((obs, index) => (
              <li key={index}>{obs}</li>
            ))}
          </ul>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={sampledData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 10, angle: -45 }}
            height={60}
          />
          <YAxis />
          <Tooltip content={customTooltip} />
          {lines.map((line, index) => (
            <Line 
              key={line.dataKey} 
              type="monotone" 
              dataKey={line.dataKey}
              stroke={line.stroke || `hsl(${index * 60}, 70%, 50%)`}
              name={line.name || line.dataKey}
              dot={false} 
            />
          ))}
          {showBrush && <Brush dataKey={xAxisKey} height={30} stroke="#8884d8" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar chart component
export const FlexibleBarChart = ({
  data, 
  bars, 
  height = 300, 
  showBrush = true,
  xAxisKey = 'formattedTime',
  title,
  customTooltip = EnhancedTooltip
}) => {
  // Sample the data to improve performance
  const sampledData = useMemo(() => sampleData(data), [data]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={sampledData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 10, angle: -45 }}
            height={60}
          />
          <YAxis />
          <Tooltip content={customTooltip} />
          {bars.map((bar, index) => (
            <Line 
              key={bar.dataKey} 
              type="monotone" 
              dataKey={bar.dataKey}
              stroke={bar.fill || `hsl(${index * 60}, 70%, 50%)`}
              name={bar.name || bar.dataKey}
              dot={false} 
            />
          ))}
          {showBrush && <Brush dataKey={xAxisKey} height={30} stroke="#8884d8" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Utility for calculating statistics
export const calculateMetricStats = (data, metricPath) => {
  if (!data || !data.length) return { min: 0, max: 0, avg: 0, median: 0 };

  // Extract values
  const values = data.map(entry => {
    if (typeof metricPath === 'string') {
      return entry[metricPath] || 0;
    } else if (metricPath.path) {
      let value = entry;
      const parts = metricPath.path.split('.');
      for (const part of parts) {
        value = value && value[part];
      }
      return value || 0;
    }
    return 0;
  });

  // Calculate statistics
  values.sort((a, b) => a - b);
  const min = values[0];
  const max = values[values.length - 1];
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const median = values.length % 2 === 0
    ? (values[values.length / 2] + values[(values.length / 2) - 1]) / 2
    : values[Math.floor(values.length / 2)];

  return { min, max, avg, median };
};
