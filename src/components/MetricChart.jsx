import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom X-axis tick component for rotated labels
// Custom X-axis tick to match styling across all charts
const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        fill="#666"
        fontSize={12}
        transform="rotate(-45)"
      >
        {payload.value}
      </text>
    </g>
  );
};

const MetricChart = ({
  data,
  title,
  height = 250,
  metrics = [],
  yAxisFormatter = null,
  tooltipFormatter = null,
  yAxisDomain = ['dataMin', 'dataMax'],
  useMultipleYAxis = false
}) => {
  // Default color scheme
  const colors = ["#3182ce", "#805ad5", "#e53e3e", "#38a169", "#ed8936", "#667eea"];
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ bottom: 40, left: 45, right: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedTime"
            height={80}
            tickMargin={25}
            tick={<CustomXAxisTick />}
            angle={-45}
            textAnchor="end"
            dy={20}
            interval="preserveStartEnd" // Only show start, end and some ticks in between
          />
          
          {!useMultipleYAxis ? (
            <YAxis 
              domain={yAxisDomain} 
              tickFormatter={
                metrics.length > 0 && metrics[0].name === 'flyteload'
                ? (value) => value >= 1000000 
                  ? `${(value/1000000).toFixed(1)}M` 
                  : value >= 1000 
                  ? `${(value/1000).toFixed(0)}k` 
                  : value
                : yAxisFormatter
              } 
            />
          ) : (
            <>
              <YAxis 
                yAxisId="left" 
                tickFormatter={metrics[0].name === 'flyteload' 
                  ? (value) => value >= 1000000 
                    ? `${(value/1000000).toFixed(1)}M` 
                    : value >= 1000 
                    ? `${(value/1000).toFixed(0)}k` 
                    : value
                  : yAxisFormatter
                } 
              />
              <YAxis yAxisId="right" orientation="right" tickFormatter={metrics[1].name === 'hits' ? (value) => value.toFixed(2) : yAxisFormatter} />
            </>
          )}
          
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          
          {metrics.map((metric, index) => {
            const name = typeof metric === 'string' ? metric : metric.name;
            const dataKey = typeof metric === 'string' ? metric : metric.name;
            const color = metric.color || colors[index % colors.length];
            const yAxisId = useMultipleYAxis ? 
              (index < metrics.length / 2 ? "left" : "right") : 
              undefined;
              
            return (
              <Line 
                key={name}
                type="monotone" 
                dataKey={dataKey} 
                name={name}
                stroke={color}
                dot={false}
                yAxisId={yAxisId}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricChart;
