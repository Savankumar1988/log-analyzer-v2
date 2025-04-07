
const generateReport = async ({ data, timeRange, dataType, filename, options }) => {
  try {
    // Load required libraries
    const reactLibrary = `<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/recharts@2.1.12/umd/Recharts.min.js"></script>`;

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Log Analysis Report</title>
  <style>
    :root {
      --primary-color: #3182ce;
      --text-color: #2d3748;
      --background-color: #ffffff;
      --border-color: #e2e8f0;
    }
    
    body {
      font-family: -apple-system, sans-serif;
      color: var(--text-color);
      margin: 0;
      padding: 20px;
    }
    
    #report-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .report-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    
    .chart-container {
      margin: 20px 0;
      width: 100%;
      overflow-x: auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .stat-card {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #4a5568;
    }

    .stat-card p {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
    }
  </style>
</head>
<body>
  <div id="report-container">
    <header>
      <h1>Log Analysis Report</h1>
      <div class="report-metadata">
        <div>Generated: ${new Date().toLocaleString()}</div>
        <div>Time Range: ${timeRange.start} to ${timeRange.end}</div>
        <div>Entries: ${data?.robustStats?.length || 0}</div>
      </div>
    </header>
    <div id="root"></div>
  </div>
  ${reactLibrary}
  <script>
    window.reportData = ${JSON.stringify({ data, timeRange, dataType, options })};
    
    function Report() {
      const { robustStats = [] } = reportData.data;
      
      return React.createElement('div', null,
        // Overview Section
        reportData.options.includeOverview && React.createElement('section', { className: 'report-section' },
          React.createElement('h2', null, 'Overview'),
          React.createElement('div', { className: 'stats-grid' },
            React.createElement('div', { className: 'stat-card' },
              React.createElement('h3', null, 'Average CPU'),
              React.createElement('p', null, (robustStats.reduce((sum, stat) => sum + stat.cpuAll, 0) / robustStats.length || 0).toFixed(1) + '%')
            ),
            React.createElement('div', { className: 'stat-card' },
              React.createElement('h3', null, 'Average Memory'),
              React.createElement('p', null, (robustStats.reduce((sum, stat) => sum + stat.memRSS, 0) / robustStats.length || 0).toFixed(0) + ' KB')
            )
          )
        ),

        // Robust Stats Section
        reportData.options.includeRobustStats && React.createElement('section', { className: 'report-section' },
          React.createElement('h2', null, 'Robust Stats'),
          React.createElement('div', { className: 'chart-container' },
            React.createElement(Recharts.LineChart, { 
              width: 1000, 
              height: 400, 
              data: robustStats,
              margin: { top: 20, right: 30, left: 20, bottom: 20 }
            },
              React.createElement(Recharts.CartesianGrid, { strokeDasharray: "3 3" }),
              React.createElement(Recharts.XAxis, { dataKey: "timestampFormatted" }),
              React.createElement(Recharts.YAxis),
              React.createElement(Recharts.Tooltip),
              React.createElement(Recharts.Legend),
              React.createElement(Recharts.Line, { 
                type: "monotone", 
                dataKey: "cpuAll", 
                stroke: "#8884d8",
                name: "CPU Usage (%)"
              })
            )
          )
        )
      );
    }

    ReactDOM.render(
      React.createElement(Report),
      document.getElementById('root')
    );
  </script>
</body>
</html>`;

    // Create and download the report
    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export { generateReport };
