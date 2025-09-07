// Mock chartjs-node-canvas for production deployment
try {
  require('chartjs-node-canvas');
} catch (error) {
  // If canvas is not available, create a mock
  const mockChartJS = {
    ChartJSNodeCanvas: class {
      constructor() {}
      async renderToBuffer() {
        // Return a simple text buffer indicating charts are not available
        return Buffer.from('Chart rendering not available in this deployment');
      }
    }
  };
  
  // Register the mock module
  require.cache[require.resolve('chartjs-node-canvas')] = {
    exports: mockChartJS,
    loaded: true
  };
}
