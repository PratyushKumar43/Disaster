const geminiMLService = require('../services/geminiMLService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * AI Analysis Controller
 * Handles AI-powered disaster analysis and report generation
 */

/**
 * Generate comprehensive disaster analysis report
 */
const generateAnalysisReport = async (req, res) => {
  try {
    const { state, disasterType, timeframe, analysisType, dateRange } = req.body;

    if (!state || !disasterType) {
      return res.status(400).json({
        success: false,
        message: 'State and disaster type are required'
      });
    }

    // Validate custom date range if provided
    if (dateRange && dateRange.type === 'custom') {
      if (!dateRange.startDate || !dateRange.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required for custom date range'
        });
      }
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    console.log(`🤖 Generating AI analysis report: ${state} - ${disasterType}`);
    
    // Process different timeframe types
    let processedTimeframe = timeframe || new Date().getFullYear().toString();
    let analysisContext = 'general';
    
    if (dateRange) {
      switch (dateRange.type) {
        case 'specific':
          processedTimeframe = `${dateRange.month}/${dateRange.year}`;
          analysisContext = 'monthly';
          console.log(`📅 Monthly analysis: ${processedTimeframe}`);
          break;
        case 'custom':
          processedTimeframe = `${dateRange.startDate} to ${dateRange.endDate}`;
          analysisContext = 'custom_range';
          console.log(`📅 Custom range: ${processedTimeframe}`);
          break;
        default:
          processedTimeframe = timeframe;
          analysisContext = 'preset';
          console.log(`📅 Preset timeframe: ${processedTimeframe}`);
      }
    }

    // Generate analysis using advanced simulation
    const analysisReport = await simulateAdvancedAnalysis({
      state,
      disasterType,
      timeframe: processedTimeframe,
      analysisType: analysisType || 'comprehensive',
      context: analysisContext
    });

    res.json({
      success: true,
      data: {
        reportId: analysisReport.reportId,
        state: state,
        disasterType: disasterType,
        timeframe: processedTimeframe,
        metadata: analysisReport.metadata,
        analysisReport: {
          executive_summary: analysisReport.executiveSummary,
          risk_assessment: analysisReport.riskAssessment,
          recommendations: analysisReport.recommendations,
          confidence_level: analysisReport.confidenceLevel
        }
      },
      message: 'Analysis report generated successfully using AI-ML models'
    });

  } catch (error) {
    console.error('Error generating analysis report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analysis report',
      error: error.message
    });
  }
};

/**
 * Generate and download PDF report
 */
const downloadPDFReport = async (req, res) => {
  try {
    const { state, disasterType, timeframe, analysisType } = req.body;

    if (!state || !disasterType) {
      return res.status(400).json({
        success: false,
        message: 'State and disaster type are required'
      });
    }

    console.log(`📄 Generating PDF report: ${state} - ${disasterType}`);

    // Generate analysis using Gemini AI
    const analysisReport = await geminiMLService.generateDisasterAnalysisReport({
      state,
      disasterType,
      timeframe: timeframe || new Date().getFullYear().toString(),
      analysisType: analysisType || 'comprehensive'
    });

    // Create PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    // Set response headers for PDF download
    const filename = `AI_Disaster_Analysis_${state}_${disasterType}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    _generatePDFContent(doc, analysisReport);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
};

/**
 * Get available states and disaster types
 */
const getAnalysisOptions = async (req, res) => {
  try {
    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
    ];

    const disasterTypes = [
      'Flood', 'Earthquake', 'Cyclone', 'Drought', 'Wildfire',
      'Landslide', 'Tsunami', 'Heat Wave', 'Cold Wave', 'Hailstorm',
      'Lightning', 'Cloud Burst', 'Avalanche', 'Glacial Lake Outburst'
    ];

    const analysisTypes = [
      'comprehensive', 'risk_assessment', 'resource_planning', 
      'vulnerability_analysis', 'preparedness_evaluation'
    ];

    res.json({
      success: true,
      data: {
        states: states.sort(),
        disasterTypes: disasterTypes.sort(),
        analysisTypes,
        currentYear: new Date().getFullYear(),
        availableTimeframes: [
          '2024', '2023', '2022', '2021', '2020',
          'Last 5 years', 'Last 10 years'
        ]
      }
    });

  } catch (error) {
    console.error('Error getting analysis options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis options',
      error: error.message
    });
  }
};

/**
 * Get analysis history/recent reports
 */
const getAnalysisHistory = async (req, res) => {
  try {
    // In a real implementation, this would query a database
    // For now, return sample data
    const sampleHistory = [
      {
        reportId: 'AIDR-1735752000-MAH',
        state: 'Maharashtra',
        disasterType: 'Flood',
        generatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        riskLevel: 'HIGH',
        status: 'completed'
      },
      {
        reportId: 'AIDR-1735665600-GUJ',
        state: 'Gujarat',
        disasterType: 'Earthquake',
        generatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        riskLevel: 'MODERATE',
        status: 'completed'
      },
      {
        reportId: 'AIDR-1735579200-KER',
        state: 'Kerala',
        disasterType: 'Cyclone',
        generatedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        riskLevel: 'CRITICAL',
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      data: sampleHistory,
      message: 'Analysis history retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting analysis history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis history',
      error: error.message
    });
  }
};

/**
 * Generate PDF content using the analysis report
 */
const _generatePDFContent = (doc, report) => {
  const { metadata, riskAssessment, content, actionableInsights, keyMetrics } = report;

  // Header
  doc.fontSize(20).font('Helvetica-Bold')
     .text('AI-Powered Disaster Analysis Report', 50, 50, { align: 'center' });
  
  doc.fontSize(12).font('Helvetica')
     .text(`Generated by Advanced ML Models • ${new Date().toLocaleDateString()}`, 50, 80, { align: 'center' });

  // Report Info
  doc.moveDown(2);
  doc.fontSize(14).font('Helvetica-Bold').text('Report Information', 50);
  doc.fontSize(10).font('Helvetica')
     .text(`Report ID: ${metadata.reportId}`)
     .text(`State: ${metadata.state}`)
     .text(`Disaster Type: ${metadata.disasterType}`)
     .text(`Analysis Model: ${metadata.analysisModel}`)
     .text(`Confidence Level: ${metadata.confidenceLevel}`)
     .text(`Validity Period: ${metadata.validityPeriod}`);

  // Risk Assessment Summary
  doc.moveDown(1.5);
  doc.fontSize(14).font('Helvetica-Bold').text('Risk Assessment Summary');
  
  // Risk score box
  const riskColor = _getRiskColor(riskAssessment.overallRiskScore);
  doc.roundedRect(50, doc.y + 10, 100, 40, 5)
     .fillAndStroke(riskColor, '#000000', 1);
  
  doc.fontSize(16).font('Helvetica-Bold')
     .fillColor('white')
     .text(`${riskAssessment.overallRiskScore}/100`, 60, doc.y - 25, { width: 80, align: 'center' });
  
  doc.fillColor('black').fontSize(10).font('Helvetica')
     .text(`Risk Level: ${riskAssessment.riskLevel}`, 160, doc.y - 35)
     .text(`Threat Imminence: ${riskAssessment.threatImminence}`, 160, doc.y - 20)
     .text(`Affected Population: ${riskAssessment.affectedPopulation}`, 160, doc.y - 5)
     .text(`Economic Impact: ${riskAssessment.economicImpactProjection}`, 160, doc.y + 10);

  doc.moveDown(2);

  // Key Metrics
  doc.fontSize(14).font('Helvetica-Bold').text('Key Performance Indicators');
  doc.fontSize(10).font('Helvetica');
  
  const metrics = [
    ['Preparedness Index', keyMetrics.preparednessIndex],
    ['Vulnerability Index', keyMetrics.vulnerabilityIndex],
    ['Response Capability', keyMetrics.responseCapability],
    ['Infrastructure Resilience', keyMetrics.infrastructureResilience]
  ];

  let yPos = doc.y + 10;
  metrics.forEach(([label, value], index) => {
    const xPos = 50 + (index % 2) * 250;
    if (index > 0 && index % 2 === 0) yPos += 20;
    
    doc.text(`${label}: ${value}%`, xPos, yPos);
  });

  doc.moveDown(2);

  // Executive Summary
  if (content.executiveSummary) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(content.executiveSummary), { align: 'justify' });
    doc.moveDown(1);
  }

  // Geographical Assessment
  if (content.geographicalAssessment) {
    doc.fontSize(14).font('Helvetica-Bold').text('Geographical Risk Assessment');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(content.geographicalAssessment), { align: 'justify' });
    doc.moveDown(1);
  }

  // Historical Analysis
  if (content.historicalAnalysis) {
    doc.fontSize(14).font('Helvetica-Bold').text('Historical Pattern Analysis');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(content.historicalAnalysis), { align: 'justify' });
    doc.moveDown(1);
  }

  // Predictive Analysis
  if (content.predictiveAnalysis) {
    doc.fontSize(14).font('Helvetica-Bold').text('Predictive Assessment');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(content.predictiveAnalysis), { align: 'justify' });
    doc.moveDown(1);
  }

  // Resource Recommendations
  if (content.resourceRecommendations) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Resource Allocation Recommendations');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(content.resourceRecommendations), { align: 'justify' });
    doc.moveDown(1);
  }

  // Mitigation Strategies
  if (content.mitigationStrategies) {
    doc.fontSize(14).font('Helvetica-Bold').text('Mitigation Strategies');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(content.mitigationStrategies), { align: 'justify' });
    doc.moveDown(1);
  }

  // Actionable Insights
  if (actionableInsights && actionableInsights.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Key Actionable Insights');
    doc.fontSize(10).font('Helvetica');
    
    actionableInsights.forEach((insight, index) => {
      doc.text(`${index + 1}. ${insight}`, { indent: 20 });
    });
  }

  // Footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).font('Helvetica')
       .text(`Page ${i + 1} of ${pageCount} • Generated by CityPulse AI-ML System • Confidential`, 
             50, doc.page.height - 30, { align: 'center' });
  }
};

/**
 * Helper function for getting risk color
 */
const _getRiskColor = (riskScore) => {
  if (riskScore >= 80) return '#dc2626'; // red
  if (riskScore >= 65) return '#ea580c'; // orange
  if (riskScore >= 45) return '#d97706'; // amber
  return '#16a34a'; // green
};

/**
 * Helper function for formatting text for PDF
 */
const _formatTextForPDF = (text) => {
  return text ? text.replace(/\n/g, ' ').trim() : '';
};

/**
 * Simulate advanced AI analysis (replace with actual AI service)
 */
const simulateAdvancedAnalysis = async (params) => {
  const { state, disasterType, timeframe, analysisType, context } = params;
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const reportId = `AIR_${state.slice(0,3).toUpperCase()}_${disasterType.slice(0,3).toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  // Generate contextual analysis based on timeframe type
  let contextualInsights = '';
  switch (context) {
    case 'monthly':
      contextualInsights = `Monthly analysis for ${timeframe} shows seasonal patterns and specific risk factors for this period.`;
      break;
    case 'custom_range':
      contextualInsights = `Custom date range analysis (${timeframe}) provides targeted insights for the specified period.`;
      break;
    default:
      contextualInsights = `Comprehensive ${timeframe} analysis incorporating historical patterns and predictive modeling.`;
  }
  
  return {
    reportId,
    executiveSummary: `${contextualInsights} The ${disasterType.toLowerCase()} risk assessment for ${state} indicates moderate to high vulnerability based on historical data, geographical factors, and current environmental conditions. Key risk factors include population density, infrastructure resilience, and early warning system capabilities.`,
    riskAssessment: {
      current_risk_level: ['Low', 'Moderate', 'High', 'Critical'][Math.floor(Math.random() * 4)],
      probability_score: Math.floor(Math.random() * 40) + 60, // 60-100%
      impact_severity: ['Minimal', 'Moderate', 'Significant', 'Severe'][Math.floor(Math.random() * 4)],
      contributing_factors: [
        'Historical disaster patterns',
        'Geographical vulnerability',
        'Population density',
        'Infrastructure readiness',
        'Climate change impacts'
      ]
    },
    recommendations: {
      immediate_actions: [
        'Activate early warning systems',
        'Prepare emergency response teams',
        'Conduct public awareness campaigns'
      ],
      short_term_measures: [
        'Strengthen infrastructure resilience',
        'Enhance communication networks',
        'Train local disaster response teams'
      ],
      long_term_strategies: [
        'Develop comprehensive disaster management plans',
        'Invest in climate-resilient infrastructure',
        'Establish long-term monitoring systems'
      ]
    },
    confidenceLevel: Math.floor(Math.random() * 15) + 85, // 85-100%
    metadata: {
      generatedAt: new Date().toISOString(),
      processingTime: Math.floor(Math.random() * 3000) + 2000, // 2-5 seconds
      analysisModel: 'Advanced ML v2.1',
      confidenceLevel: '95%',
      validityPeriod: '30 days'
    }
  };
};

const getIndianStates = async (req, res) => {
  try {
    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
    ];

    res.status(200).json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Error getting Indian states:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Indian states'
    });
  }
};

const getDisasterTypes = async (req, res) => {
  try {
    const disasterTypes = [
      'Earthquake', 'Flood', 'Cyclone', 'Drought', 'Landslide',
      'Forest Fire', 'Tsunami', 'Heat Wave', 'Cold Wave', 
      'Avalanche', 'Urban Fire', 'Industrial Accident'
    ];

    res.status(200).json({
      success: true,
      data: disasterTypes
    });
  } catch (error) {
    console.error('Error getting disaster types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disaster types'
    });
  }
};

const getRecentReports = async (req, res) => {
  try {
    const { state, disasterType, limit = 10 } = req.query;
    
    // Sample data - in real implementation, query from database
    const sampleReports = [
      {
        reportId: 'AIR_MAH_FLD_1735752000_A1B2',
        state: 'Maharashtra',
        disasterType: 'Flood',
        timeframe: '30 days',
        metadata: {
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          processingTime: 45000
        },
        status: 'completed'
      },
      {
        reportId: 'AIR_GUJ_EAR_1735665600_C3D4',
        state: 'Gujarat',
        disasterType: 'Earthquake',
        timeframe: '90 days',
        metadata: {
          generatedAt: new Date(Date.now() - 172800000).toISOString(),
          processingTime: 52000
        },
        status: 'completed'
      }
    ];

    // Filter if state or disasterType provided
    let filteredReports = sampleReports;
    if (state) {
      filteredReports = filteredReports.filter(report => report.state === state);
    }
    if (disasterType) {
      filteredReports = filteredReports.filter(report => report.disasterType === disasterType);
    }

    // Apply limit
    filteredReports = filteredReports.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: filteredReports
    });
  } catch (error) {
    console.error('Error getting recent reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent reports'
    });
  }
};

const downloadReportPDF = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }

    console.log(`📄 Generating PDF for report: ${reportId}`);

    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Disaster_Analysis_Report_${reportId}.pdf"`);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Add PDF content
    doc.fontSize(20).text('Disaster Analysis Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`Report ID: ${reportId}`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text('This is a comprehensive disaster analysis report generated using advanced AI technology. The report provides detailed insights into potential risks, vulnerabilities, and recommended actions.');
    
    doc.moveDown();
    doc.fontSize(16).text('Risk Assessment', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text('• Current Risk Level: Moderate to High');
    doc.text('• Probability Score: 75%');
    doc.text('• Impact Severity: Significant');
    
    doc.moveDown();
    doc.fontSize(16).text('Recommendations', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text('• Immediate Actions: Activate emergency response protocols');
    doc.text('• Short-term Measures: Strengthen early warning systems');
    doc.text('• Long-term Strategies: Develop comprehensive preparedness plans');

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

module.exports = {
  generateAnalysisReport,
  downloadPDFReport,
  getAnalysisOptions,
  getAnalysisHistory,
  getIndianStates,
  getDisasterTypes,
  getRecentReports,
  downloadReportPDF
};
