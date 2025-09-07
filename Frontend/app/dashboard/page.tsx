"use client";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { useTheme } from "@/hooks/useTheme";

export default function DashboardPage() {
  const { isDark } = useTheme();

  return <DashboardOverview isDark={isDark} />;
}

