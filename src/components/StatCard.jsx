import React from 'react';

const StatCard = ({ title, value, color = 'blue', details }) => {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };
  
  const textColorClass = colorMap[color] || 'text-blue-600';
  
  return (
    <div className="bg-white p-4 rounded-lg shadow" style={{display: 'inline-block', width: '30%', margin: '0 1%'}}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${textColorClass}`}>{value}</div>
      {details && <div className="text-sm text-gray-500">{details}</div>}
    </div>
  );
};

export default StatCard;
