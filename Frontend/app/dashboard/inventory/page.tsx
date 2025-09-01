"use client";

import { InventoryView } from "@/components/dashboard/InventoryView";
import { useTheme } from "@/hooks/useTheme";

export default function InventoryPage() {
  const { isDark } = useTheme();

  return <InventoryView isDark={isDark} />;
}
