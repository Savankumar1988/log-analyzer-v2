
const generateReport = async ({ data, timeRange, dataType, filename, options }) => {
  try {
    // Fetch template and CSS 
    const templateResponse = await fetch('/report-template.html');
    const cssResponse = await fetch('/report-styles.css');
    
    if (!templateResponse.ok || !cssResponse.ok) {
      throw new Error('Failed to fetch template or CSS');
    }

    const template = await templateResponse.text();
    const css = await cssResponse.text();

    // Generate report content
    const reportContent = template
      .replace('/* REPORT_STYLES */', css)
      .replace('/* REPORT_DATA */', `window.reportData = ${JSON.stringify({
        data,
        timeRange,
        dataType,
        options
      })};`);

    // Create download link
    const blob = new Blob([reportContent], { type: 'text/html' });
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
