
// Report generation utilities
const generateReport = async ({ data, timeRange, dataType, filename, options }) => {
  try {
    // External libraries
    const libraries = `
<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/recharts@2.1.12/umd/Recharts.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>`;

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Log Analysis Report</title>
  ${libraries}
  <style>
    :root {
      --primary: #0ea5e9;
      --primary-dark: #0284c7;
      --secondary: #6366f1;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    
    .chart-container {
      @apply w-full overflow-x-auto p-4 bg-white rounded-lg shadow-sm;
    }

    .stat-card {
      @apply bg-white p-4 rounded-lg shadow-sm border border-gray-100;
    }
    
    .stat-value {
      @apply text-2xl font-semibold text-gray-900;
    }
    
    .stat-label {
      @apply text-sm text-gray-500;
    }

    .tab-button {
      @apply px-4 py-2 text-sm font-medium rounded-md transition-colors;
    }

    .tab-button.active {
      @apply bg-primary text-white;
    }

    .tab-button:not(.active) {
      @apply text-gray-600 hover:bg-gray-100;
    }

    [data-theme="dark"] {
      --primary: #38bdf8;
      --primary-dark: #0ea5e9;
      background-color: #1e293b;
      color: #f8fafc;
    }

    [data-theme="dark"] .stat-card {
      @apply bg-slate-800 border-slate-700;
    }

    [data-theme="dark"] .stat-value {
      @apply text-white;
    }

    [data-theme="dark"] .chart-container {
      @apply bg-slate-800;
    }
  </style>
</head>
<body class="min-h-screen bg-gray-50 transition-colors">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Log Analysis Report</h1>
        <div class="mt-2 text-sm text-gray-500">
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Time Range: ${timeRange.start} to ${timeRange.end}</p>
          <p>Total Entries: ${data?.robustStats?.length || 0}</p>
        </div>
      </div>
      <button
        onclick="document.body.setAttribute('data-theme', document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')"
        class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        Toggle Theme
      </button>
    </div>

    <div id="root"></div>
  </div>

  <script>
    window.reportData = ${JSON.stringify({ data, timeRange, dataType, options })};

    function Report() {
      const [activeTab, setActiveTab] = React.useState('overview');
      const { robustStats = [] } = reportData.data;
      
      const averages = {
        cpu: (robustStats.reduce((sum, stat) => sum + stat.cpuAll, 0) / robustStats.length || 0).toFixed(1),
        memory: (robustStats.reduce((sum, stat) => sum + stat.memRSS, 0) / robustStats.length || 0).toFixed(0),
        connections: (robustStats.reduce((sum, stat) => sum + stat.http + stat.https, 0) / robustStats.length || 0).toFixed(0)
      };

      return React.createElement('div', null,
        // Tab Navigation
        React.createElement('div', { className: 'flex space-x-2 mb-6' },
          React.createElement('button', {
            className: 'tab-button ' + (activeTab === 'overview' ? 'active' : ''),
            onClick: () => setActiveTab('overview')
          }, 'Overview'),
          React.createElement('button', {
            className: 'tab-button ' + (activeTab === 'detailed' ? 'active' : ''),
            onClick: () => setActiveTab('detailed')
          }, 'Detailed Analysis'),
          React.createElement('button', {
            className: 'tab-button ' + (activeTab === 'connections' ? 'active' : ''),
            onClick: () => setActiveTab('connections')
          }, 'Connections')
        ),

        // Overview Tab
        activeTab === 'overview' && React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
            React.createElement('div', { className: 'stat-card' },
              React.createElement('div', { className: 'stat-value' }, averages.cpu + '%'),
              React.createElement('div', { className: 'stat-label' }, 'Average CPU Usage')
            ),
            React.createElement('div', { className: 'stat-card' },
              React.createElement('div', { className: 'stat-value' }, (averages.memory / 1024).toFixed(1) + ' MB'),
              React.createElement('div', { className: 'stat-label' }, 'Average Memory Usage')
            ),
            React.createElement('div', { className: 'stat-card' },
              React.createElement('div', { className: 'stat-value' }, averages.connections),
              React.createElement('div', { className: 'stat-label' }, 'Average Connections')
            )
          ),
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
                stroke: "var(--primary)",
                name: "CPU Usage (%)"
              })
            )
          )
        ),

        // Detailed Analysis Tab
        activeTab === 'detailed' && React.createElement('div', { className: 'space-y-6' },
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
                dataKey: "memRSS",
                stroke: "var(--secondary)",
                name: "Memory Usage (KB)"
              })
            )
          )
        ),

        // Connections Tab
        activeTab === 'connections' && React.createElement('div', { className: 'space-y-6' },
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
                dataKey: "http",
                stroke: "var(--success)",
                name: "HTTP Connections"
              }),
              React.createElement(Recharts.Line, {
                type: "monotone",
                dataKey: "https",
                stroke: "var(--primary)",
                name: "HTTPS Connections"
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
