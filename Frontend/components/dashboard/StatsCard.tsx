"use client";

import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  icon: any;
  color: string;
  isDark: boolean;
}

export function StatsCard({ title, value, trend, icon: Icon, color, isDark }: StatsCardProps) {
  return (
    <motion.div
      className={`
        p-4 md:p-6 rounded-xl md:rounded-2xl border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        shadow-sm hover:shadow-md transition-all duration-200
      `}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
            {title}
          </p>
          <p className={`text-xl md:text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <div className="flex items-center mt-1 md:mt-2">
            <TrendingUp className={`h-3 w-3 md:h-4 md:w-4 ${color} mr-1 flex-shrink-0`} />
            <span className={`text-xs md:text-sm font-medium ${color} truncate`}>{trend}</span>
          </div>
        </div>
        <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${color.replace('text-', 'bg-').replace('-500', '-100')} ${isDark ? 'bg-opacity-20' : ''} ml-3 flex-shrink-0`}>
          <Icon className={`h-5 w-5 md:h-6 md:w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}
