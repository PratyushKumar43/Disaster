"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar as AnimatedSidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconDashboard,
  IconPackage,
  IconCloudStorm,
  IconChartBar,
  IconReportAnalytics,
  IconSettings,
} from "@tabler/icons-react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useSocket } from "../../lib/socket";
import { useTheme } from "../../hooks/useTheme";

// Define the sidebar links for DisasterIQ
const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconDashboard,
    id: "dashboard"
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: IconPackage,
    id: "inventory"
  },
  {
    label: "Weather",
    href: "/dashboard/weather",
    icon: IconCloudStorm,
    id: "weather"
  },
  {
    label: "AI Analysis",
    href: "/dashboard/ai-analysis",
    icon: IconChartBar,
    id: "ai-analysis"
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: IconReportAnalytics,
    id: "reports"
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: IconSettings,
    id: "settings"
  },
];

// Logo components for the sidebar
const DisasterIQLogo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-red-500 dark:bg-red-400" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        DisasterIQ
      </motion.span>
    </div>
  );
};

const DisasterIQLogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-red-500 dark:bg-red-400" />
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, setIsDark, mounted } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { connect, disconnect, isConnected } = useSocket();

  // Initialize socket connection at dashboard level
  useEffect(() => {
    const socket = connect();
    return () => {
      disconnect();
    };
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex w-full h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <AnimatedSidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10 h-full">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {sidebarOpen ? <DisasterIQLogo /> : <DisasterIQLogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {sidebarLinks.map((link, idx) => {
                const IconComponent = link.icon;
                return (
                  <SidebarLink 
                    key={idx} 
                    link={{
                      ...link,
                      icon: (
                        <IconComponent 
                          className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" 
                        />
                      )
                    }}
                    onClick={() => {
                      // Close mobile sidebar when a link is clicked
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="hidden md:block mt-auto">
            <SidebarLink
              link={{
                label: "Pratyush",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    P
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </AnimatedSidebar>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-3 py-3 md:px-6 md:py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shrink-0`}>
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className={`text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all`}
            >
              {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
            <div className={`hidden sm:flex px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
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
        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

