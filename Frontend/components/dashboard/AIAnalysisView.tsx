"use client";

import { Brain } from "lucide-react";

interface AIAnalysisViewProps {
  isDark: boolean;
}

export function AIAnalysisView({ isDark }: AIAnalysisViewProps) {
  return (
    <div className="space-y-6">
      <div className={`
        p-8 rounded-xl border text-center
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <Brain className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          AI Analysis Dashboard
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Intelligent insights and predictive analytics for disaster management and inventory optimization.
        </p>
        <button className={`
          px-6 py-3 rounded-lg font-medium transition-colors
          ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
          text-white
        `}>
          Coming Soon
        </button>
      </div>
    </div>
  );
}
