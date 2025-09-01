"use client";

import { FileText, BarChart3, Download, Calendar } from "lucide-react";

interface ReportsViewProps {
  isDark: boolean;
}

export function ReportsView({ isDark }: ReportsViewProps) {
  return (
    <div className="space-y-6">
      <div className={`
        p-8 rounded-xl border text-center
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <FileText className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Reports Dashboard
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Generate and manage comprehensive reports for disaster management operations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-3">
            <BarChart3 className="h-5 w-5" />
            Inventory Report
          </button>
          <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            Weather Report
          </button>
          <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-3">
            <Download className="h-5 w-5" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
