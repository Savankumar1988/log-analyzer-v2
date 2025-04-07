/**
 * Utility for generating interactive HTML reports from log data
 */
import { formatTimestamp } from './chartUtils';
import { generateBundledHTML, downloadHTML } from './htmlBundler';
import { exportData } from './exportUtils';

// Import these using fetch when needed - prevents bundling in main app
const getTemplate = async () => {
  try {
    console.log('Fetching template...');
    const response = await fetch('/report-template.html');
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    console.log('Template fetched successfully');
    return text;
  } catch (error) {
    console.error('Error fetching report template:', error);
    throw error;
  }
};

const getCSS = async () => {
  try {
    console.log('Fetching CSS...');
    const response = await fetch('/report-styles.css');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSS: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    console.log('CSS fetched successfully');
    return text;
  } catch (error) {
    console.error('Error fetching report styles:', error);
    throw error;
  }
};

/**
 * Create report metadata from log data
 * @param {Object} data - Log data
 * @param {Object} timeRange - Time range object
 * @returns {Object} Report metadata
 */
const createReportMetadata = (data, timeRange) => {
  const entriesCount = calculateEntriesCount(data);
  const timeRangeStr = timeRange ? 
    `${formatTimestamp(timeRange.start, true)} to ${formatTimestamp(timeRange.end, true)}` : 
    'Not available';

  return {
    title: 'Log Analysis Report',
    generationDate: new Date().toLocaleString(),
    timeRange: timeRangeStr,
    entriesCount: entriesCount
  };
};

/**
 * Calculate total entries count from log data
 * @param {Object} data - Log data
 * @returns {string} Total entries count
 */
const calculateEntriesCount = (data) => {
  if (!data) return '0';

  let count = 0;

  // For standard log data
  if (data.robustStats) {
    count += data.robustStats.length || 0;
  }

  if (data.overloadManager) {
    count += data.overloadManager.length || 0;
  }

  // For GhostMon data (array)
  if (Array.isArray(data)) {
    count = data.length;
  }

  return count.toString();
};

/**
 * Generate chart rendering JavaScript code
 * @param {Object} data - Log data
 * @param {string} dataType - Type of data ('standard' or 'ghostmon')
 * @returns {string} JavaScript code for rendering charts
 */
const generateChartRenderingCode = (data, dataType) => {
  // Actual chart rendering with detailed implementation
  const renderingCode = `
// Initialize interactive report on load
document.addEventListener('DOMContentLoaded', function() {
  // Generate table of contents
  generateTableOfContents();

  // Render all charts based on data
  renderCharts();

  // Initialize interactivity
  initializeInteractivity();
});

// Generate table of contents from sections
function generateTableOfContents() {
  const tocList = document.getElementById('toc-list');
  const sections = document.querySelectorAll('.report-section');

  sections.forEach(section => {
    if (section.id && section.querySelector('h2')) {
      const title = section.querySelector('h2').textContent;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + section.id;
      a.textContent = title;
      li.appendChild(a);
      tocList.appendChild(li);
    }
  });
}

// Format numbers for better readability
function formatNumber(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value;
}

// Create a basic chart
function createBasicChart(container, title, data, xKey, yKeys, colors) {
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';

  // Chart title
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  chartContainer.appendChild(titleElement);

  // Canvas for drawing
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.maxHeight = '400px';
  chartContainer.appendChild(canvas);

  // Create legend
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.style.display = 'flex';
  legend.style.justifyContent = 'center';
  legend.style.marginTop = '10px';
  legend.style.flexWrap = 'wrap';

  yKeys.forEach((key, i) => {
    const legendItem = document.createElement('div');
    legendItem.style.display = 'flex';
    legendItem.style.alignItems = 'center';
    legendItem.style.margin = '0 10px';

    const colorBox = document.createElement('div');
    colorBox.style.width = '15px';
    colorBox.style.height = '15px';
    colorBox.style.backgroundColor = colors[i % colors.length];
    colorBox.style.marginRight = '5px';

    const keyName = document.createElement('span');
    keyName.textContent = key;

    legendItem.appendChild(colorBox);
    legendItem.appendChild(keyName);
    legend.appendChild(legendItem);
  });

  chartContainer.appendChild(legend);

  // Draw on canvas
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set up chart dimensions
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = canvas.width - padding.left - padding.right;
  const chartHeight = canvas.height - padding.top - padding.bottom;

  // Draw axes
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, canvas.height - padding.bottom);
  ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
  ctx.stroke();

  // Draw data
  if (data && data.length > 0) {
    // Find min/max values for y-axis
    let yMin = Number.MAX_VALUE;
    let yMax = Number.MIN_VALUE;

    data.forEach(item => {
      yKeys.forEach(key => {
        const value = item[key];
        if (value < yMin) yMin = value;
        if (value > yMax) yMax = value;
      });
    });

    // Add 10% padding to yMax
    yMax = yMax * 1.1;
    yMin = Math.max(0, yMin * 0.9);

    // Draw y-axis labels
    const yRange = yMax - yMin;
    const yStepCount = 5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yStepCount; i++) {
      const yValue = yMin + (yRange * i / yStepCount);
      const yPos = canvas.height - padding.bottom - (chartHeight * i / yStepCount);

      ctx.fillText(formatNumber(yValue), padding.left - 10, yPos);

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = '#e0e0e0';
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(canvas.width - padding.right, yPos);
      ctx.stroke();
      ctx.strokeStyle = '#000000';
    }

    // Draw x-axis labels
    const xStep = Math.max(1, Math.ceil(data.length / 10)); // Show at most 10 labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    data.forEach((item, i) => {
      if (i % xStep === 0) {
        const xPos = padding.left + (chartWidth * i / (data.length - 1));
        ctx.fillText(item[xKey], xPos, canvas.height - padding.bottom + 10);
      }
    });

    // Draw lines for each y key
    yKeys.forEach((key, keyIndex) => {
      ctx.beginPath();
      ctx.strokeStyle = colors[keyIndex % colors.length];
      ctx.lineWidth = 2;

      data.forEach((item, i) => {
        const xPos = padding.left + (chartWidth * i / (data.length - 1));
        const yPos = canvas.height - padding.bottom - (chartHeight * (item[key] - yMin) / yRange);

        if (i === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      });

      ctx.stroke();
    });
  } else {
    // No data message
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '16px Arial';
    ctx.fillText('No data available for this chart', canvas.width / 2, canvas.height / 2);
  }

  container.appendChild(chartContainer);
}

// Create a stat card
function createStatCard(container, title, value, trend = null) {
  const card = document.createElement('div');
  card.className = 'stat-card';

  const titleEl = document.createElement('div');
  titleEl.className = 'title';
  titleEl.textContent = title;

  const valueEl = document.createElement('div');
  valueEl.className = 'value';
  valueEl.textContent = value;

  card.appendChild(titleEl);
  card.appendChild(valueEl);

  if (trend) {
    const trendEl = document.createElement('div');
    trendEl.className = 'trend ' + (trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral');
    trendEl.textContent = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
    card.appendChild(trendEl);
  }

  container.appendChild(card);
}

// Create a data table
function createDataTable(container, headers, rows) {
  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container';

  const table = document.createElement('table');
  table.className = 'data-table';

  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header.label;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement('tbody');

  rows.forEach(row => {
    const tr = document.createElement('tr');

    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header.key] !== undefined ? row[header.key] : '';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.appendChild(table);
  container.appendChild(tableContainer);
}

// Render appropriate charts based on data type
function renderCharts() {
  // Create recharts components using the reportData
  const dataType = ${JSON.stringify(dataType)};

  if (dataType === 'standard') {
    renderStandardCharts();
  } else if (dataType === 'ghostmon') {
    renderGhostMonCharts();
  }
}

// Render standard log charts (Robust Stats, OverloadManager)
function renderStandardCharts() {
  if (!reportData || !reportData.robustStats || reportData.robustStats.length === 0) {
    document.getElementById('robust-stats-content').innerHTML = '<div class="no-data">No Robust Stats data available</div>';
  } else {
    renderRobustStatsCharts(reportData.robustStats);
  }

  if (!reportData || !reportData.overloadManager || reportData.overloadManager.length === 0) {
    document.getElementById('overload-manager-content').innerHTML = '<div class="no-data">No OverloadManager data available</div>';
  } else {
    renderOverloadManagerCharts(reportData.overloadManager);
  }

  renderOverviewStats();
}

// Render GhostMon charts
function renderGhostMonCharts() {
  if (!reportData || reportData.length === 0) {
    document.getElementById('ghostmon-content').innerHTML = '<div class="no-data">No GhostMon data available</div>';
    return;
  }

  const ghostmonContent = document.getElementById('ghostmon-content');

  // Split data by key type
  const typeWData = reportData.filter(entry => entry.keyType === 'W');
  const typeSData = reportData.filter(entry => entry.keyType === 'S');

  // Stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'stats-section mb-6';

  const statsTitle = document.createElement('h3');
  statsTitle.textContent = 'GhostMon Statistics';
  statsTitle.className = 'text-xl font-medium mb-4';
  statsSection.appendChild(statsTitle);

  // Stats grid
  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';

  // Render type W stats
  if (typeWData.length > 0) {
    const typeWSection = document.createElement('div');

    const typeWTitle = document.createElement('h4');
    typeWTitle.textContent = 'Key Type: W (' + typeWData.length + ' entries)';
    typeWTitle.className = 'text-lg font-medium mb-2';
    typeWSection.appendChild(typeWTitle);

    // Flyteload stats
    const flyteloadValues = typeWData.map(entry => entry.flyteload);
    const minFlyteload = Math.min(...flyteloadValues);
    const maxFlyteload = Math.max(...flyteloadValues);
    const avgFlyteload = flyteloadValues.reduce((a, b) => a + b, 0) / flyteloadValues.length;

    const flyteloadSection = document.createElement('div');
    flyteloadSection.className = 'stat-group mb-4';

    const flyteloadTitle = document.createElement('h5');
    flyteloadTitle.textContent = 'Flyteload';
    flyteloadTitle.className = 'text-md font-medium mb-1';
    flyteloadSection.appendChild(flyteloadTitle);

    createStatCard(flyteloadSection, 'Min', formatNumber(minFlyteload));
    createStatCard(flyteloadSection, 'Max', formatNumber(maxFlyteload));
    createStatCard(flyteloadSection, 'Avg', formatNumber(Math.round(avgFlyteload)));

    typeWSection.appendChild(flyteloadSection);

    // Create flyteload chart
    createBasicChart(
      typeWSection, 
      'Flyteload Over Time (W)', 
      typeWData, 
      'timestampFormatted', 
      ['flyteload'], 
      ['#3182ce']
    );

    statsSection.appendChild(typeWSection);
  }

  // Render type S stats if available
  if (typeSData.length > 0) {
    const typeSSection = document.createElement('div');
    typeSSection.className = 'mt-6';

    const typeSTitle = document.createElement('h4');
    typeSTitle.textContent = 'Key Type: S (' + typeSData.length + ' entries)';
    typeSTitle.className = 'text-lg font-medium mb-2';
    typeSSection.appendChild(typeSTitle);

    // Flyteload stats
    const flyteloadValues = typeSData.map(entry => entry.flyteload);
    const minFlyteload = Math.min(...flyteloadValues);
    const maxFlyteload = Math.max(...flyteloadValues);
    const avgFlyteload = flyteloadValues.reduce((a, b) => a + b, 0) / flyteloadValues.length;

    const flyteloadSection = document.createElement('div');
    flyteloadSection.className = 'stat-group mb-4';

    const flyteloadTitle = document.createElement('h5');
    flyteloadTitle.textContent = 'Flyteload';
    flyteloadTitle.className = 'text-md font-medium mb-1';
    flyteloadSection.appendChild(flyteloadTitle);

    createStatCard(flyteloadSection, 'Min', formatNumber(minFlyteload));
    createStatCard(flyteloadSection, 'Max', formatNumber(maxFlyteload));
    createStatCard(flyteloadSection, 'Avg', formatNumber(Math.round(avgFlyteload)));

    typeSSection.appendChild(flyteloadSection);

    // Create flyteload chart
    createBasicChart(
      typeSSection, 
      'Flyteload Over Time (S)', 
      typeSData, 
      'timestampFormatted', 
      ['flyteload'], 
      ['#38a169']
    );

    statsSection.appendChild(typeSSection);
  }

  ghostmonContent.appendChild(statsSection);

  // Add data table with raw data
  const dataSection = document.createElement('div');
  dataSection.className = 'mt-6 pt-4 border-t border-gray-200';

  const dataTitle = document.createElement('h3');
  dataTitle.textContent = 'Raw Data';
  dataTitle.className = 'text-lg font-medium mb-2';
  dataSection.appendChild(dataTitle);

  createDataTable(
    dataSection,
    [
      { key: 'timestampFormatted', label: 'Timestamp' },
      { key: 'keyType', label: 'Key Type' },
      { key: 'flyteload', label: 'Flyteload' },
      { key: 'hits', label: 'Hits' },
      { key: 'suspendflag', label: 'Suspend Flag' },
      { key: 'suspendlevel', label: 'Suspend Level' }
    ],
    reportData.slice(0, 20)
  );

  ghostmonContent.appendChild(dataSection);
}

// Add interactivity for the report
function initializeInteractivity() {
  // Add event listeners for interactive elements
  document.querySelectorAll('.chart-container').forEach(chart => {
    // Example: Add hover effects, zooming, etc.
  });
}

// Render Robust Stats charts
function renderRobustStatsCharts(data) {
  const container = document.getElementById('robust-stats-content');

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="no-data">No Robust Stats data available</div>';
    return;
  }

  // Create CPU chart
  createBasicChart(
    container,
    'CPU Usage Over Time',
    data,
    'timestampFormatted',
    ['cpuAll'],
    ['#e53e3e']
  );

  // Create memory chart
  createBasicChart(
    container,
    'Memory Usage Over Time',
    data,
    'timestampFormatted',
    ['memRSS', 'appUsed', 'tcpMem'],
    ['#3182ce', '#38a169', '#805ad5']
  );

  // Create connections chart
  createBasicChart(
    container,
    'Connections Over Time',
    data,
    'timestampFormatted',
    ['clientInProgress', 'websocketsInProgress', 'fwdInProgress'],
    ['#3182ce', '#38a169', '#805ad5']
  );
}

// Render OverloadManager charts
function renderOverloadManagerCharts(data) {
  const container = document.getElementById('overload-manager-content');

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="no-data">No OverloadManager data available</div>';
    return;
  }

  // Filter by entry type
  const addCandidateTargets = data.filter(entry => entry.type === "addCandidateTarget");
  const processMainLoops = data.filter(entry => entry.type === "processMainLoop");

  // Create trigger percentages chart
  if (addCandidateTargets.length > 0) {
    createBasicChart(
      container,
      'Trigger Percentages Over Time',
      addCandidateTargets,
      'timestampFormatted',
      ['triggerPct', 'denyPct'],
      ['#e53e3e', '#805ad5']
    );
  }

  // Create RunQ chart
  if (processMainLoops.length > 0) {
    createBasicChart(
      container,
      'RunQ Over Time',
      processMainLoops,
      'timestampFormatted',
      ['runQ'],
      ['#3182ce']
    );
  }
}

// Render Overview stats
function renderOverviewStats() {
  const container = document.getElementById('overview-content');

  if (!reportData || !reportData.robustStats || reportData.robustStats.length === 0) {
    container.innerHTML = '<div class="no-data">No overview data available</div>';
    return;
  }

  // Create stats grid
  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';

  // Calculate stats from robust stats
  const cpuValues = reportData.robustStats.map(entry => entry.cpuAll);
  const maxCpu = Math.max(...cpuValues);
  const avgCpu = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;

  const memValues = reportData.robustStats.map(entry => entry.memRSS);
  const maxMem = Math.max(...memValues);
  const avgMem = memValues.reduce((a, b) => a + b, 0) / memValues.length;

  createStatCard(statsGrid, 'Max CPU', maxCpu + '%');
  createStatCard(statsGrid, 'Avg CPU', Math.round(avgCpu) + '%');
  createStatCard(statsGrid, 'Max Memory', formatNumber(maxMem) + ' KB');
  createStatCard(statsGrid, 'Avg Memory', formatNumber(Math.round(avgMem)) + ' KB');

  // Add connection stats
  const clientValues = reportData.robustStats.map(entry => entry.clientInProgress);
  const maxClient = Math.max(...clientValues);
  const avgClient = clientValues.reduce((a, b) => a + b, 0) / clientValues.length;

  createStatCard(statsGrid, 'Max Connections', maxClient);
  createStatCard(statsGrid, 'Avg Connections', Math.round(avgClient));

  // If overload data exists, add overload stats
  if (reportData.overloadManager && reportData.overloadManager.length > 0) {
    // Count overload events
    const overloadEvents = reportData.overloadManager.filter(entry => 
      entry.type === "addCandidateTarget" && entry.triggerPct > 50
    ).length;

    createStatCard(statsGrid, 'Overload Events', overloadEvents);
  }

  container.appendChild(statsGrid);

  // Create summary charts
  createBasicChart(
    container,
    'System Overview',
    reportData.robustStats,
    'timestampFormatted',
    ['cpuAll', 'clientInProgress', 'flit'],
    ['#e53e3e', '#3182ce', '#805ad5']
  );
}
  `;

  return renderingCode;
};

/**
 * Generate an interactive HTML report from log data
 * @param {Object} options - Report generation options
 * @param {Object} options.data - Log data
 * @param {Object} options.timeRange - Time range object
 * @param {string} options.dataType - Type of data ('standard' or 'ghostmon')
 * @param {string} options.filename - Filename for the report
 * @returns {Promise<string>} Generated HTML blob URL
 */
export const generateReport = async (options) => {
  const { data, timeRange, dataType = 'standard', filename = 'log-analysis-report.html' } = options;

  try {
    // Fetch template and CSS
    const [template, css] = await Promise.all([
      getTemplate(),
      getCSS()
    ]);

    // Create rendering code and metadata
    const renderingCode = generateChartRenderingCode(data, dataType);
    const metadata = createReportMetadata(data, timeRange);

    // Load required libraries from CDN
    const libraries = [
      {
        name: 'React',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js'
      },
      {
        name: 'ReactDOM',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js'
      },
      {
        name: 'Recharts',
        url: 'https://cdnjs.cloudflare.com/ajax/libs/recharts/2.7.2/Recharts.min.js'
      }
    ];

    // Fetch library content with error handling
    const libraryContents = await Promise.all(
      libraries.map(async (lib) => {
        try {
          const response = await fetch(lib.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${lib.name}: ${response.status}`);
          }
          const content = await response.text();
          console.log(`Successfully loaded ${lib.name}`);
          return { name: lib.name, content };
        } catch (error) {
          console.error(`Error loading ${lib.name}:`, error);
          throw error;
        }
      })
    );

    // Generate bundled HTML
    const html = generateBundledHTML({
      template,
      css,
      libraries: libraryContents,
      data,
      renderingCode,
      metadata
    });

    // Download the HTML report
    downloadHTML(html, filename);

    return html;
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report: ' + error.message);
  }
};

/**
 * Get report libraries from CDNs
 * This function would fetch the actual library code in a production implementation
 * @returns {Promise<Array>} Array of library objects
 */
export const getReportLibraries = async () => {
  // In a real implementation, this would fetch the libraries from CDNs
  // For now, return mock data
  return [
    {
      name: 'React',
      content: '/* Minified React library would be here */'
    },
    {
      name: 'ReactDOM',
      content: '/* Minified ReactDOM library would be here */'
    },
    {
      name: 'Recharts',
      content: '/* Minified Recharts library would be here */'
    }
  ];
};

/**
 * Copy the report template and styles to the public folder
 * This should be called in build scripts or app initialization
 */
export const prepareReportAssets = async () => {
  try {
    // In a real implementation, this would copy the template and CSS to the public folder
    console.log('Report assets prepared');
  } catch (error) {
    console.error('Error preparing report assets:', error);
  }
};