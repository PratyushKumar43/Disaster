"use client";

import { StatsCard } from "./StatsCard";
import { Package, AlertTriangle, Shield, Cloud, Plus, BarChart3 } from "lucide-react";

interface DashboardOverviewProps {
  isDark: boolean;
}

export function DashboardOverview({ isDark }: DashboardOverviewProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Resources"
          value="1,234"
          trend="+12% from last month"
          icon={Package}
          color="text-blue-500"
          isDark={isDark}
        />
        <StatsCard
          title="Active Alerts"
          value="8"
          trend="+3 from yesterday"
          icon={AlertTriangle}
          color="text-yellow-500"
          isDark={isDark}
        />
        <StatsCard
          title="Response Teams"
          value="24"
          trend="All teams deployed"
          icon={Shield}
          color="text-green-500"
          isDark={isDark}
        />
        <StatsCard
          title="Weather Status"
          value="Normal"
          trend="No severe warnings"
          icon={Cloud}
          color="text-indigo-500"
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm h-fit`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-3 text-sm">
              <Plus className="h-4 w-4 shrink-0" />
              <span>Add Inventory Item</span>
            </button>
            <button className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Create Alert</span>
            </button>
            <button className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-3 text-sm">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm h-fit`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} text-sm truncate`}>
                  Medical supplies restocked
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} text-sm truncate`}>
                  Weather alert issued
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  15 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} text-sm truncate`}>
                  Response team deployed
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  1 hour ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
