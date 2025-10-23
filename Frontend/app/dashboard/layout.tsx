"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SimpleSidebar } from "@/components/dashboard/SimpleSidebar";
import { Sun, Moon, PanelLeft } from "lucide-react";
import { useSocket } from "../../lib/socket";
import { useTheme } from "../../components/providers/ThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const { connect, disconnect, isConnected } = useSocket();

  // Initialize socket connection at dashboard level
  useEffect(() => {
    const socket = connect();
    return () => {
      disconnect();
    };
  }, []);

  const isDark = theme === "dark";
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className={`flex w-full h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Sidebar */}
      <SimpleSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shrink-0`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // This will be handled by the sidebar component itself
                const sidebar = document.querySelector('[data-sidebar-toggle]') as HTMLButtonElement;
                if (sidebar) {
                  sidebar.click();
                }
              }}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-all`}
              title="Toggle Sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-medium ${
              isConnected() 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              <span className="hidden md:inline">{isConnected() ? 'Connected' : 'Disconnected'}</span>
              <div className={`w-2 h-2 rounded-full md:hidden ${isConnected() ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            
            {/* Mobile user indicator */}
            <div className="md:hidden">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                P
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}