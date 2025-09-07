"use client";

import { useState, useEffect } from "react";
import { Brain, Download, FileText, MapPin, AlertTriangle, Loader2, Calendar, Clock, TrendingUp } from "lucide-react";
import { aiAnalysisAPI } from "@/lib/api";

interface AIAnalysisViewProps {
  isDark: boolean;
}

interface AnalysisReport {
  reportId: string;
  state: string;
  disasterType: string;
  timeframe: string;
  analysisReport: {
    executive_summary: string;
    risk_assessment: {
      current_risk_level: string;
      probability_score: number;
      impact_severity: string;
      contributing_factors: string[];
    };
    recommendations: {
      immediate_actions: string[];
      short_term_measures: string[];
      long_term_strategies: string[];
    };
    confidence_level: number;
  };
  metadata: {
    generatedAt: string;
    processingTime: number;
  };
}

interface ProcessingStatus {
  stage: string;
  progress: number;
  message: string;
}

export function AIAnalysisView({ isDark }: AIAnalysisViewProps) {
  const [states, setStates] = useState<string[]>([]);
  const [disasterTypes, setDisasterTypes] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDisasterType, setSelectedDisasterType] = useState<string>("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("30 days");
  const [customDateRange, setCustomDateRange] = useState<{
    type: 'preset' | 'custom' | 'specific';
    startDate: string;
    endDate: string;
    year: string;
    month: string;
  }>({
    type: 'preset',
    startDate: '',
    endDate: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0')
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: '',
    progress: 0,
    message: ''
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  const timeframes = ["7 days", "14 days", "30 days", "90 days", "6 months", "1 year"];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [statesRes, disasterTypesRes, reportsRes] = await Promise.all([
        aiAnalysisAPI.getIndianStates(),
        aiAnalysisAPI.getDisasterTypes(),
        aiAnalysisAPI.getRecentReports({ limit: 5 })
      ]);

      if (statesRes.success) setStates(statesRes.data || []);
      if (disasterTypesRes.success) setDisasterTypes(disasterTypesRes.data || []);
      if (reportsRes.success) setRecentReports(reportsRes.data || []);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setError("Failed to load initial data. Please refresh the page.");
    }
  };

  const generateReport = async () => {
    if (!selectedState || !selectedDisasterType) {
      setError("Please select both state and disaster type.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setAnalysisReport(null);

    // Simulate processing stages with progress updates
    const processingStages = [
      { stage: 'initializing', progress: 10, message: 'Initializing AI analysis engine...' },
      { stage: 'data_collection', progress: 25, message: 'Collecting historical disaster data...' },
      { stage: 'risk_analysis', progress: 45, message: 'Analyzing risk patterns and vulnerabilities...' },
      { stage: 'ai_processing', progress: 70, message: 'Processing data through ML models...' },
      { stage: 'report_generation', progress: 90, message: 'Generating comprehensive analysis report...' },
      { stage: 'complete', progress: 100, message: 'Analysis complete!' }
    ];

    try {
      // Simulate processing stages
      for (const stage of processingStages) {
        setProcessingStatus(stage);
        await new Promise(resolve => setTimeout(resolve, 800)); // 0.8s delay per stage
      }

      // Determine the actual timeframe to send
      let actualTimeframe = selectedTimeframe;
      if (customDateRange.type === 'custom') {
        actualTimeframe = `${customDateRange.startDate} to ${customDateRange.endDate}`;
      } else if (customDateRange.type === 'specific') {
        actualTimeframe = `${customDateRange.month}/${customDateRange.year}`;
      }

      const response = await aiAnalysisAPI.generateAnalysisReport({
        state: selectedState,
        disasterType: selectedDisasterType,
        timeframe: actualTimeframe,
        dateRange: customDateRange.type !== 'preset' ? customDateRange : undefined
      });

      if (response.success) {
        setAnalysisReport(response.data);
        // Refresh recent reports
        const reportsRes = await aiAnalysisAPI.getRecentReports({ limit: 5 });
        if (reportsRes.success) setRecentReports(reportsRes.data || []);
        
        setProcessingStatus({ stage: 'complete', progress: 100, message: 'Report generated successfully!' });
      } else {
        setError(response.message || "Failed to generate report.");
        setProcessingStatus({ stage: 'error', progress: 0, message: 'Analysis failed' });
      }
    } catch (error: any) {
      console.error("Failed to generate report:", error);
      setError(error.response?.data?.message || "Failed to generate analysis report. Please try again.");
      setProcessingStatus({ stage: 'error', progress: 0, message: 'Analysis failed' });
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProcessingStatus({ stage: '', progress: 0, message: '' });
      }, 1500);
    }
  };

  const downloadPDF = async (reportId: string) => {
    setIsDownloading(true);
    try {
      const blob = await aiAnalysisAPI.downloadReportPDF(reportId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AI_Disaster_Analysis_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Failed to download PDF:", error);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'medium':
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <Brain className={`h-8 w-8 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Disaster Analysis
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Generate comprehensive disaster analysis reports using advanced AI
            </p>
          </div>
        </div>
      </div>

      {/* Report Generation Form */}
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Generate New Analysis Report
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* State Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <MapPin className="inline h-4 w-4 mr-1" />
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Choose a state...</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Disaster Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Disaster Type
            </label>
            <select
              value={selectedDisasterType}
              onChange={(e) => setSelectedDisasterType(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Choose disaster type...</option>
              {disasterTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="inline h-4 w-4 mr-1" />
              Analysis Timeframe
            </label>
            
            {/* Timeframe Type Selection */}
            <div className="mb-3">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setCustomDateRange(prev => ({ ...prev, type: 'preset' }))}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    customDateRange.type === 'preset'
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                  }`}
                >
                  Preset
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateRange(prev => ({ ...prev, type: 'specific' }))}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    customDateRange.type === 'specific'
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                  }`}
                >
                  Year/Month
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDateRange(prev => ({ ...prev, type: 'custom' }))}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    customDateRange.type === 'custom'
                      ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                      : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                  }`}
                >
                  Custom Range
                </button>
              </div>
            </div>

            {/* Preset Timeframes */}
            {customDateRange.type === 'preset' && (
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {timeframes.map((timeframe) => (
                  <option key={timeframe} value={timeframe}>{timeframe}</option>
                ))}
              </select>
            )}

            {/* Year/Month Selection */}
            {customDateRange.type === 'specific' && (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={customDateRange.year}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, year: e.target.value }))}
                  className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={customDateRange.month}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, month: e.target.value }))}
                  className={`p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Date Range */}
            {customDateRange.type === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>From</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To</label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={generateReport}
            disabled={isGenerating || !selectedState || !selectedDisasterType}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
              ${isGenerating || !selectedState || !selectedDisasterType
                ? 'bg-gray-400 cursor-not-allowed'
                : isDark
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
              }
              text-white
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate AI Report
              </>
            )}
          </button>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Processing Status */}
        {isGenerating && processingStatus.stage && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            isDark 
              ? 'bg-gray-800 border-blue-500' 
              : 'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Processing AI Analysis
                </span>
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {processingStatus.progress}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className={`w-full bg-gray-200 rounded-full h-2.5 mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${processingStatus.progress}%` }}
              ></div>
            </div>
            
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {processingStatus.message}
            </p>
            
            {processingStatus.stage === 'ai_processing' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <TrendingUp className={`h-3 w-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  Advanced ML algorithms analyzing patterns...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generated Report Display */}
      {analysisReport && (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analysisReport.disasterType} Analysis Report
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {analysisReport.state} • {analysisReport.timeframe} • Generated {new Date(analysisReport.metadata.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => downloadPDF(analysisReport.reportId)}
              disabled={isDownloading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                text-white disabled:bg-gray-400
              `}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>

          {/* Risk Assessment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Risk Level</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(analysisReport.analysisReport.risk_assessment.current_risk_level)}`}>
                {analysisReport.analysisReport.risk_assessment.current_risk_level}
              </span>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Probability Score</h4>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(analysisReport.analysisReport.risk_assessment.probability_score)}%
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>probability</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confidence Level</h4>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(analysisReport.analysisReport.confidence_level)}%
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>confidence</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Executive Summary</h4>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {analysisReport.analysisReport.executive_summary}
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Key Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Immediate Actions</h5>
                <ul className="space-y-1">
                  {analysisReport.analysisReport.recommendations.immediate_actions.map((action, index) => (
                    <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Short-term Measures</h5>
                <ul className="space-y-1">
                  {analysisReport.analysisReport.recommendations.short_term_measures.map((measure, index) => (
                    <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      • {measure}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Long-term Strategies</h5>
                <ul className="space-y-1">
                  {analysisReport.analysisReport.recommendations.long_term_strategies.map((strategy, index) => (
                    <li key={index} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      • {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Analysis Reports
          </h3>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.reportId} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {report.disasterType} - {report.state}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Generated {new Date(report.metadata?.generatedAt).toLocaleDateString()} • {report.timeframe}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <button
                      onClick={() => downloadPDF(report.reportId)}
                      className={`text-sm px-3 py-1 rounded ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

