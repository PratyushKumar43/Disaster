"use client";

import { SettingsView } from "@/components/dashboard/SettingsView";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const { isDark } = useTheme();

  return <SettingsView isDark={isDark} />;
}
