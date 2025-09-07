const mongoose = require('mongoose');

const aiAnalysisReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  disasterType: {
    type: String,
    required: true,
    index: true
  },
  timeframe: {
    type: String,
    default: '30 days',
    index: true
  },
  analysisReport: {
    executive_summary: String,
    risk_assessment: {
      current_risk_level: String,
      probability_score: Number,
      impact_severity: String,
      contributing_factors: [String]
    },
    historical_analysis: {
      past_incidents: [Object],
      trends: [String],
      seasonal_patterns: String
    },
    vulnerability_assessment: {
      population_at_risk: Number,
      infrastructure_vulnerability: String,
      economic_impact_estimate: String,
      critical_facilities: [String]
    },
    preparedness_evaluation: {
      current_preparedness_level: String,
      resource_availability: Object,
      response_capabilities: [String],
      gaps_identified: [String]
    },
    recommendations: {
      immediate_actions: [String],
      short_term_measures: [String],
      long_term_strategies: [String],
      resource_requirements: Object
    },
    monitoring_indicators: [String],
    confidence_level: Number
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    generatedBy: {
      type: String,
      default: 'Gemini-2.5-Flash'
    },
    processingTime: Number,
    dataSourcesUsed: [String],
    version: {
      type: String,
      default: '1.0'
    }
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'error'],
    default: 'generating',
    index: true
  },
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'ai_analysis_reports'
});

// Indexes for better query performance
aiAnalysisReportSchema.index({ createdAt: -1 });
aiAnalysisReportSchema.index({ state: 1, disasterType: 1 });
aiAnalysisReportSchema.index({ 'metadata.generatedAt': -1 });

// Static method to generate unique report ID
aiAnalysisReportSchema.statics.generateReportId = function(state, disasterType) {
  const timestamp = Date.now();
  const stateCode = state.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const disasterCode = disasterType.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `AIR_${stateCode}_${disasterCode}_${timestamp}_${random}`;
};

// Method to get formatted report data for PDF generation
aiAnalysisReportSchema.methods.getFormattedReportData = function() {
  return {
    title: `Disaster Analysis Report: ${this.disasterType} Risk Assessment for ${this.state}`,
    subtitle: `Comprehensive AI-Powered Analysis`,
    reportId: this.reportId,
    generatedDate: this.metadata.generatedAt.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    timeframe: this.timeframe,
    state: this.state,
    disasterType: this.disasterType,
    analysis: this.analysisReport,
    metadata: this.metadata
  };
};

const AIAnalysisReport = mongoose.model('AIAnalysisReport', aiAnalysisReportSchema);

module.exports = AIAnalysisReport;
