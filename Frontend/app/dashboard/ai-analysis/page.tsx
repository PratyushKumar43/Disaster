"use client";

import { AIAnalysisView } from "@/components/dashboard/AIAnalysisView";
import { useTheme } from "@/hooks/useTheme";

export default function AIAnalysisPage() {
  const { isDark } = useTheme();

  return <AIAnalysisView isDark={isDark} />;
}
