"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Settings,
  Calendar,
  Globe,
  AlertTriangle,
  FileSpreadsheet,
  File,
  Globe2,
  CheckCircle,
  Loader,
  X,
  Save,
  Database,
  Cloud,
  Eye,
  Clock
} from "lucide-react";
import { weatherAPI } from "../../lib/api";

interface WeatherReportGeneratorProps {
  location: { lat: number; lon: number; name: string } | null;
  isDark: boolean;
}

interface ReportOptions {
  format: 'json' | 'pdf' | 'excel' | 'html';
  language: 'en' | 'hi';
  includeAlerts: boolean;
  includeForecast: boolean;
  forecastDays: number;
  type: string;
}

interface GenerationStatus {
  step: 'idle' | 'fetching' | 'generating' | 'saving' | 'downloading' | 'completed' | 'error';
  message: string;
  progress: number;
}

interface SavedReport {
  reportId: string;
  title: string;
  location: any;
  generatedAt: string;
  format: string;
  summary: any;
}

export default function WeatherReportGenerator({ location, isDark }: WeatherReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    format: 'pdf',
    language: 'en',
    includeAlerts: true,
    includeForecast: true,
    forecastDays: 7,
    type: 'comprehensive'
  });
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    step: 'idle',
    message: '',
    progress: 0
  });
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);
  const [showSaveToDatabase, setShowSaveToDatabase] = useState(false);

  const formatIcons = {
    pdf: FileText,
    excel: FileSpreadsheet,
    html: Globe2,
    json: File
  };

  const formatLabels = {
    pdf: 'PDF Report',
    excel: 'Excel Spreadsheet',
    html: 'Web Report',
    json: 'JSON Data'
  };

  const languageLabels = {
    en: 'English',
    hi: 'हिंदी (Hindi)'
  };

  const updateStatus = (step: GenerationStatus['step'], message: string, progress: number) => {
    setGenerationStatus({ step, message, progress });
  };

  const handleGenerateReport = async () => {
    if (!location) return;

    setIsGenerating(true);
    setSavedReport(null);
    let reportData: any = null;

    try {
      // Step 1: Fetching weather data
      updateStatus('fetching', 'Fetching latest weather data...', 20);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay for UX

      // Step 2: Generating report
      updateStatus('generating', 'Generating weather report...', 40);
      const response = await weatherAPI.generateReport({
        latitude: location.lat,
        longitude: location.lon,
        ...reportOptions
      });

      if (reportOptions.format === 'json') {
        reportData = response.data;
      }

      // Step 3: Optional save to database
      if (showSaveToDatabase && reportData) {
        updateStatus('saving', 'Saving report to database...', 70);
        
        const saveResponse = await weatherAPI.saveReport({
          latitude: location.lat,
          longitude: location.lon,
          location_name: location.name,
          reportData: reportData,
          ...reportOptions
        });
        
        if (saveResponse.data) {
          setSavedReport(saveResponse.data);
        }
      }

      // Step 4: Download file
      updateStatus('downloading', 'Preparing download...', 90);
      
      if (reportOptions.format === 'json') {
        // For JSON, download as file
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-report-${location.name}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For other formats, handle blob download
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        const extension = reportOptions.format === 'excel' ? 'xlsx' : reportOptions.format;
        link.download = `weather-report-${location.name}-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Step 5: Completed
      updateStatus('completed', 'Report generated successfully!', 100);
      setLastGenerated(new Date().toLocaleString());
      
      // Auto-close modal after success
      setTimeout(() => {
        setIsOpen(false);
        setGenerationStatus({ step: 'idle', message: '', progress: 0 });
      }, 2000);

    } catch (error) {
      console.error('Error generating report:', error);
      updateStatus('error', 'Failed to generate report. Please try again.', 0);
      
      // Auto-reset error after 3 seconds
      setTimeout(() => {
        setGenerationStatus({ step: 'idle', message: '', progress: 0 });
      }, 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!location) {
    return (
      <motion.div
        className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-lg opacity-50`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.5, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-gray-400" />
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Weather Report Generator
            </h3>
            <p className="text-sm text-gray-500">
              Select a location to generate weather reports
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className={`p-6 rounded-3xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-2xl`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Weather Report Generator
              </h3>
              <p className="text-gray-500">
                Generate comprehensive weather reports in multiple formats
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>

        {lastGenerated && (
          <motion.div
            className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${
              isDark ? 'border-green-700' : 'border-green-200'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Last report: {lastGenerated}
                </span>
              </div>
              {savedReport && (
                <div className="flex items-center space-x-1">
                  <Database className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Saved
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(formatLabels).map(([format, label]) => {
            const Icon = formatIcons[format as keyof typeof formatIcons];
            return (
              <div
                key={format}
                className={`p-3 rounded-lg border text-center ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Report Options Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className={`w-full max-w-md rounded-2xl p-6 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              } shadow-2xl max-h-[90vh] overflow-y-auto`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Report Options
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Format Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Report Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(formatLabels).map(([format, label]) => {
                      const Icon = formatIcons[format as keyof typeof formatIcons];
                      const isSelected = reportOptions.format === format;
                      return (
                        <button
                          key={format}
                          onClick={() => setReportOptions(prev => ({ ...prev, format: format as any }))}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : isDark
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mx-auto mb-1 ${
                            isSelected ? 'text-blue-500' : 'text-gray-500'
                          }`} />
                          <p className={`text-xs font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selection */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Language
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(languageLabels).map(([lang, label]) => {
                      const isSelected = reportOptions.language === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => setReportOptions(prev => ({ ...prev, language: lang as any }))}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : isDark
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <Globe className={`h-5 w-5 mx-auto mb-1 ${
                            isSelected ? 'text-blue-500' : 'text-gray-500'
                          }`} />
                          <p className={`text-xs font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Include Options */}
                <div className="space-y-4">
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Include in Report
                  </label>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={reportOptions.includeAlerts}
                        onChange={(e) => setReportOptions(prev => ({ 
                          ...prev, 
                          includeAlerts: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Weather Alerts
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={reportOptions.includeForecast}
                        onChange={(e) => setReportOptions(prev => ({ 
                          ...prev, 
                          includeForecast: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Weather Forecast
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Forecast Days */}
                {reportOptions.includeForecast && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Forecast Days: {reportOptions.forecastDays}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={reportOptions.forecastDays}
                      onChange={(e) => setReportOptions(prev => ({ 
                        ...prev, 
                        forecastDays: parseInt(e.target.value) 
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 day</span>
                      <span>14 days</span>
                    </div>
                  </div>
                )}

                {/* Save to Database Option */}
                <div className="space-y-3">
                  <label className={`block text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Additional Options
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showSaveToDatabase}
                      onChange={(e) => setShowSaveToDatabase(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Save to Database
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Progress Indicator */}
              {isGenerating && (
                <div className="mt-6 space-y-3">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      {generationStatus.step === 'fetching' && <Cloud className="h-5 w-5 text-blue-500 animate-pulse" />}
                      {generationStatus.step === 'generating' && <FileText className="h-5 w-5 text-orange-500 animate-pulse" />}
                      {generationStatus.step === 'saving' && <Database className="h-5 w-5 text-green-500 animate-pulse" />}
                      {generationStatus.step === 'downloading' && <Download className="h-5 w-5 text-purple-500 animate-pulse" />}
                      {generationStatus.step === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {generationStatus.step === 'error' && <X className="h-5 w-5 text-red-500" />}
                      
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {generationStatus.message}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          generationStatus.step === 'error' ? 'bg-red-500' : 
                          generationStatus.step === 'completed' ? 'bg-green-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ width: `${generationStatus.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{generationStatus.progress}%</span>
                      <span>{generationStatus.step === 'completed' ? 'Complete!' : 'Processing...'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Report Success */}
              {savedReport && (
                <motion.div
                  className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${
                    isDark ? 'border-green-700' : 'border-green-200'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Report saved to database!
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Report ID: {savedReport.reportId}
                  </p>
                </motion.div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setGenerationStatus({ step: 'idle', message: '', progress: 0 });
                    setSavedReport(null);
                  }}
                  disabled={isGenerating}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isGenerating ? 'Processing...' : 'Cancel'}
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
