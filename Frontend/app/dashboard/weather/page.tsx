"use client";

import dynamic from 'next/dynamic';
import { useTheme } from "@/hooks/useTheme";

// Dynamic import for weather dashboard
const ModernWeatherDashboard = dynamic(() => import('../../components/ModernWeatherDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  )
});

export default function WeatherPage() {
  const { isDark } = useTheme();

  return <ModernWeatherDashboard isDark={isDark} />;
}

