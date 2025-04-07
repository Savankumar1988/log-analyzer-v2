
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
    /* Base styles */
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
      return React.createElement('div', null,
        React.createElement('div', { className: 'chart-container' },
          React.createElement(Recharts.LineChart, { width: 800, height: 400, data: reportData.data.robustStats },
            React.createElement(Recharts.CartesianGrid, { strokeDasharray: "3 3" }),
            React.createElement(Recharts.XAxis, { dataKey: "timestampFormatted" }),
            React.createElement(Recharts.YAxis),
            React.createElement(Recharts.Tooltip),
            React.createElement(Recharts.Legend),
            React.createElement(Recharts.Line, { type: "monotone", dataKey: "cpuAll", stroke: "#8884d8" })
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
