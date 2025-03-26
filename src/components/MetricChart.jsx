import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom X-axis tick component for rotated labels
const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        fill="#666"
        fontSize={10}
        transform="rotate(-65)"
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
        <LineChart data={data} margin={{ bottom: 40, left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedTime"
            height={85}
            tickMargin={25}
            tick={<CustomXAxisTick />}
            interval={0} // Show all ticks without skipping
          />
          
          {!useMultipleYAxis ? (
            <YAxis 
              domain={yAxisDomain} 
              tickFormatter={yAxisFormatter} 
            />
          ) : (
            <>
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
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
