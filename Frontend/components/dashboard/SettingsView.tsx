"use client";

import { Settings, User, Bell, Shield, Database, Globe } from "lucide-react";

interface SettingsViewProps {
  isDark: boolean;
}

export function SettingsView({ isDark }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div className={`
        p-6 rounded-xl border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h3 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Settings */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-blue-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                User Profile
              </h4>
            </div>
            <div className="space-y-3">
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Edit Profile
              </button>
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Change Password
              </button>
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Account Settings
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-yellow-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h4>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Alerts
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Weather Warnings
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Inventory Alerts
                </span>
              </label>
            </div>
          </div>

          {/* Security Settings */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-green-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Security
              </h4>
            </div>
            <div className="space-y-3">
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Two-Factor Authentication
              </button>
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Login History
              </button>
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Privacy Settings
              </button>
            </div>
          </div>

          {/* System Settings */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-purple-500" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                System
              </h4>
            </div>
            <div className="space-y-3">
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                Database Backup
              </button>
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                API Configuration
              </button>
              <button className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}>
                System Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
