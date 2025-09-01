"use client";

import { ReportsView } from "@/components/dashboard/ReportsView";
import { useTheme } from "@/hooks/useTheme";

export default function ReportsPage() {
  const { isDark } = useTheme();

  return <ReportsView isDark={isDark} />;
}
