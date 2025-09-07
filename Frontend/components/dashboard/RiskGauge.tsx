'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getRiskLevelColor, formatRiskScore } from '@/lib/fire-risk-api';

interface RiskGaugeProps {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  confidence: number;
  location?: {
    region?: string;
    latitude: number;
    longitude: number;
  };
  previousScore?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({
  riskScore,
  riskLevel,
  confidence,
  location,
  previousScore,
  className = '',
  size = 'md',
  showDetails = true
}) => {
  // Calculate trend
  const trend = previousScore !== undefined ? riskScore - previousScore : null;
  const trendDirection = trend ? (trend > 0.05 ? 'up' : trend < -0.05 ? 'down' : 'stable') : null;

  // Size configurations
  const sizeConfig = {
    sm: {
      gauge: 'w-16 h-16',
      text: 'text-lg',
      subtext: 'text-xs',
      padding: 'p-3'
    },
    md: {
      gauge: 'w-24 h-24',
      text: 'text-2xl',
      subtext: 'text-sm',
      padding: 'p-4'
    },
    lg: {
      gauge: 'w-32 h-32',
      text: 'text-4xl',
      subtext: 'text-base',
      padding: 'p-6'
    }
  };

  const config = sizeConfig[size];
  const riskColor = getRiskLevelColor(riskLevel);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - riskScore);

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendText = () => {
    if (!trend) return '';
    const change = Math.abs(trend * 100);
    const direction = trend > 0 ? 'increase' : 'decrease';
    return `${change.toFixed(1)}% ${direction}`;
  };

  return (
    <Card className={`${className}`}>
      {showDetails && (
        <CardHeader className={config.padding}>
          <CardTitle className="flex items-center justify-between">
            <span>Fire Risk</span>
            {location?.region && (
              <Badge variant="outline" className="text-xs">
                {location.region}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={`${config.padding} pt-0 flex flex-col items-center space-y-4`}>
        {/* Circular Gauge */}
        <div className={`relative ${config.gauge}`}>
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgb(229 231 235)"
              strokeWidth="8"
              className="opacity-20"
            />
            
            {/* Risk level arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={riskColor}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-bold ${config.text}`} style={{ color: riskColor }}>
              {formatRiskScore(riskScore)}
            </div>
            <div className={`${config.subtext} text-muted-foreground font-medium`}>
              {riskLevel}
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Confidence */}
            <div className="text-center space-y-1">
              <div className="text-sm font-medium">
                Confidence: {formatRiskScore(confidence)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Trend indicator */}
            {trendDirection && (
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon()}
                <span className={`
                  ${trendDirection === 'up' ? 'text-red-500' : 
                    trendDirection === 'down' ? 'text-green-500' : 
                    'text-gray-500'}
                `}>
                  {getTrendText()}
                </span>
              </div>
            )}

            {/* Location details */}
            {location && (
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Risk level indicators for comparison
export const RiskLevelIndicators: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const levels = [
    { level: 'LOW', color: '#22c55e', range: '0-25%' },
    { level: 'MODERATE', color: '#f59e0b', range: '26-50%' },
    { level: 'HIGH', color: '#ef4444', range: '51-75%' },
    { level: 'EXTREME', color: '#dc2626', range: '76-100%' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Risk Level Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {levels.map((level) => (
          <div key={level.level} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: level.color }}
              />
              <span className="text-sm font-medium">{level.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">{level.range}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Mini gauge for dashboard widgets
export const MiniRiskGauge: React.FC<{
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  label?: string;
  className?: string;
}> = ({ riskScore, riskLevel, label, className = '' }) => {
  const riskColor = getRiskLevelColor(riskLevel);
  const circumference = 2 * Math.PI * 20; // smaller radius
  const strokeDashoffset = circumference * (1 - riskScore);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="rgb(229 231 235)"
            strokeWidth="4"
            className="opacity-20"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={riskColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color: riskColor }}>
            {Math.round(riskScore * 100)}
          </span>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-medium">{label || 'Fire Risk'}</div>
        <div className="text-xs text-muted-foreground">{riskLevel}</div>
      </div>
    </div>
  );
};

export default RiskGauge;
