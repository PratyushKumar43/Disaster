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

    // Generate analysis using Gemini AI
    const analysisReport = await geminiMLService.generateDisasterAnalysis(
      state,
      disasterType,
      processedTimeframe,
      analysisType || 'comprehensive'
    );

    // Generate a unique report ID for this analysis
    const reportId = `AIR_${state.slice(0,3).toUpperCase()}_${disasterType.slice(0,3).toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    res.json({
      success: true,
      data: {
        reportId: reportId,
        state: state,
        disasterType: disasterType,
        timeframe: processedTimeframe,
        metadata: {
          generatedAt: analysisReport.generatedAt,
          confidence: analysisReport.confidence,
          dataSource: analysisReport.dataSource
        },
        analysisReport: {
          executive_summary: analysisReport.summary,
          risk_assessment: {
            current_risk_level: analysisReport.riskScore >= 8 ? 'Critical' : 
                               analysisReport.riskScore >= 6 ? 'High' : 
                               analysisReport.riskScore >= 4 ? 'Moderate' : 'Low',
            probability_score: analysisReport.riskScore * 10,
            impact_severity: analysisReport.riskScore >= 7 ? 'Severe' : 
                           analysisReport.riskScore >= 5 ? 'Significant' : 'Moderate',
            contributing_factors: analysisReport.keyRiskFactors
          },
          recommendations: {
            immediate_actions: analysisReport.immediateActions,
            short_term_measures: analysisReport.mitigationStrategies.slice(0, 3),
            long_term_strategies: analysisReport.mitigationStrategies.slice(3)
          },
          confidence_level: analysisReport.confidence || 85
        }
      },
      message: 'Analysis report generated successfully using Gemini AI'
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
    const analysisReport = await geminiMLService.generateDisasterAnalysis(
      state,
      disasterType,
      timeframe || new Date().getFullYear().toString(),
      analysisType || 'comprehensive'
    );

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
 * Generate PDF content using the analysis report from Gemini
 */
const _generatePDFContent = (doc, report) => {
  // Header
  doc.fontSize(20).font('Helvetica-Bold')
     .text('AI-Powered Disaster Analysis Report', 50, 50, { align: 'center' });
  
  doc.fontSize(12).font('Helvetica')
     .text(`Generated by Gemini AI • ${new Date().toLocaleDateString()}`, 50, 80, { align: 'center' });

  // Report Info
  doc.moveDown(2);
  doc.fontSize(14).font('Helvetica-Bold').text('Report Information', 50);
  doc.fontSize(10).font('Helvetica')
     .text(`State: ${report.state}`)
     .text(`Disaster Type: ${report.disasterType}`)
     .text(`Generated At: ${new Date(report.generatedAt).toLocaleString()}`)
     .text(`Confidence Level: ${report.confidence || 85}%`)
     .text(`Data Source: ${report.dataSource || 'Gemini AI Analysis'}`);

  // Risk Assessment Summary
  doc.moveDown(1.5);
  doc.fontSize(14).font('Helvetica-Bold').text('Risk Assessment Summary');
  
  // Risk score box
  const riskColor = _getRiskColor(report.riskScore);
  doc.roundedRect(50, doc.y + 10, 100, 40, 5)
     .fillAndStroke(riskColor, '#000000', 1);
  
  doc.fontSize(16).font('Helvetica-Bold')
     .fillColor('white')
     .text(`${report.riskScore}/10`, 60, doc.y - 25, { width: 80, align: 'center' });
  
  doc.fillColor('black').fontSize(10).font('Helvetica')
     .text(`Preparedness Level: ${report.preparednessLevel}/10`, 160, doc.y - 35);

  doc.moveDown(2);

  // Executive Summary
  if (report.summary) {
    doc.fontSize(14).font('Helvetica-Bold').text('Executive Summary');
    doc.fontSize(10).font('Helvetica').text(_formatTextForPDF(report.summary), { align: 'justify' });
    doc.moveDown(1);
  }

  // Key Risk Factors
  if (report.keyRiskFactors && report.keyRiskFactors.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Key Risk Factors');
    doc.fontSize(10).font('Helvetica');
    report.keyRiskFactors.forEach((factor, index) => {
      doc.text(`${index + 1}. ${factor}`);
    });
    doc.moveDown(1);
  }

  // Resource Requirements
  if (report.resourceRequirements && report.resourceRequirements.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Resource Requirements');
    doc.fontSize(10).font('Helvetica');
    report.resourceRequirements.forEach((resource, index) => {
      doc.text(`${index + 1}. ${resource.item}: ${resource.quantity} (Priority: ${resource.priority})`);
    });
    doc.moveDown(1);
  }

  // Immediate Actions
  if (report.immediateActions && report.immediateActions.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Immediate Actions');
    doc.fontSize(10).font('Helvetica');
    report.immediateActions.forEach((action, index) => {
      doc.text(`${index + 1}. ${action}`);
    });
    doc.moveDown(1);
  }

  // Mitigation Strategies
  if (report.mitigationStrategies && report.mitigationStrategies.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Mitigation Strategies');
    doc.fontSize(10).font('Helvetica');
    report.mitigationStrategies.forEach((strategy, index) => {
      doc.text(`${index + 1}. ${strategy}`);
    });
    doc.moveDown(1);
  }

  // Impact Assessment
  if (report.impactAssessment) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').text('Impact Assessment');
    doc.fontSize(10).font('Helvetica')
      .text(`Potential Casualties: ${report.impactAssessment.potentialCasualties}`)
      .text(`Economic Impact: ${report.impactAssessment.economicImpact}`)
      .text(`Environmental Impact: ${report.impactAssessment.environmentalImpact}`)
      .text(`Social Impact: ${report.impactAssessment.socialImpact}`);
    doc.moveDown(1);
  }

  // Recovery Timeline
  if (report.recoveryTimeline) {
    doc.fontSize(14).font('Helvetica-Bold').text('Recovery Timeline');
    doc.fontSize(10).font('Helvetica')
      .text(`Immediate Response: ${report.recoveryTimeline.immediateResponse}`)
      .text(`Short Term Recovery: ${report.recoveryTimeline.shortTermRecovery}`)
      .text(`Long Term Recovery: ${report.recoveryTimeline.longTermRecovery}`)
      .text(`Full Recovery: ${report.recoveryTimeline.fullRecovery}`);
  }

  // Footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).font('Helvetica')
       .text(`Page ${i + 1} of ${pageCount} | Generated by Gemini AI | Confidential`, 50, doc.page.height - 30, {
         width: doc.page.width - 100,
         align: 'center'
       });
  }
};

/**
 * Helper function for getting risk color (1-10 scale)
 */
const _getRiskColor = (riskScore) => {
  if (riskScore >= 8) return '#dc2626'; // red - critical
  if (riskScore >= 6) return '#ea580c'; // orange - high
  if (riskScore >= 4) return '#d97706'; // amber - moderate
  return '#16a34a'; // green - low
};

/**
 * Helper function for formatting text for PDF
 */
const _formatTextForPDF = (text) => {
  return text ? text.replace(/\n/g, ' ').trim() : '';
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
