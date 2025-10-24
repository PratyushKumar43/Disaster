"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconPackage,
  IconCloudStorm,
  IconChartBar,
} from "@tabler/icons-react";
import { User, ChevronLeft, ChevronRight, X } from "lucide-react";

// Define the sidebar links for DisasterIQ
const sidebarLinks = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Inventory",
    url: "/dashboard/inventory",
    icon: IconPackage,
  },
  {
    title: "Weather",
    url: "/dashboard/weather",
    icon: IconCloudStorm,
  },
  {
    title: "AI Analysis",
    url: "/dashboard/ai-analysis",
    icon: IconChartBar,
  },
];

// Logo components for the sidebar
const DisasterIQLogo = () => {
  return (
    <Link 
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-red-500 dark:bg-red-400" />
      <span className="font-medium whitespace-pre text-black dark:text-white">
        DisasterIQ
      </span>
    </Link>
  );
};

export function SimpleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On mobile, sidebar should be closed by default
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Close sidebar when clicking on a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300
        ${isMobile 
          ? `fixed left-0 top-0 z-50 h-full ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`
          : `${isCollapsed ? 'w-16' : 'w-64'}`
        }
      `}>
      {/* Header */}
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && <DisasterIQLogo />}
          <button
            onClick={toggleSidebar}
            data-sidebar-toggle
            className="p-1 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {isMobile ? (
              <X className="h-4 w-4" />
            ) : isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-2">
        <div className="flex w-full min-w-0 flex-col gap-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.title}
              href={link.url}
              onClick={handleLinkClick}
              className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all ${
                isCollapsed && !isMobile ? 'justify-center' : ''
              }`}
              title={isCollapsed && !isMobile ? link.title : undefined}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {(!isCollapsed || isMobile) && <span className="truncate">{link.title}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 p-2">
        <div className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 ${
          isCollapsed && !isMobile ? 'justify-center' : ''
        }`}>
          <User className="h-5 w-5 rounded-md shrink-0" />
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate">Pratyush</span>
              <span className="text-xs text-muted-foreground truncate">admin@disasteriq.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
