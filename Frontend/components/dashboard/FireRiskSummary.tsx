"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Flame, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { fireRiskAPI, FireRiskPrediction, getRiskLevelColor } from '@/lib/fire-risk-api';

interface FireRiskSummaryProps {
  isDark: boolean;
}

export function FireRiskSummary({ isDark }: FireRiskSummaryProps) {
  const [currentRisk, setCurrentRisk] = useState<FireRiskPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default location (Delhi) for quick preview
  const defaultLocation = {
    latitude: 28.6139,
    longitude: 77.2090,
    region: 'Delhi'
  };

  useEffect(() => {
    const fetchFireRisk = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current location fire risk for preview
        const prediction = await fireRiskAPI.getCurrentRisk(
          defaultLocation.latitude,
          defaultLocation.longitude,
          defaultLocation.region
        );
        
        setCurrentRisk(prediction);
      } catch (err) {
        console.error('Error fetching fire risk:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch fire risk data');
      } finally {
        setLoading(false);
      }
    };

    fetchFireRisk();
  }, []);

  if (loading) {
    return (
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Flame className="h-5 w-5 text-orange-500" />
            Fire Risk Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Flame className="h-5 w-5 text-orange-500" />
            Fire Risk Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-center">
            <div className="space-y-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Unable to load fire risk data
              </p>
              <Link href="/dashboard/fire-risk">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRisk) {
    return (
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
            <Flame className="h-5 w-5 text-orange-500" />
            Fire Risk Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No fire risk data available
            </p>
            <Link href="/dashboard/fire-risk">
              <Button variant="default" size="sm">
                Get Fire Risk Prediction
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskColor = getRiskLevelColor(currentRisk.riskLevel);

  return (
    <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
          <Flame className="h-5 w-5 text-orange-500" />
          Fire Risk Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Risk Level */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold" style={{ color: riskColor }}>
            {(currentRisk.riskScore * 100).toFixed(0)}%
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs font-medium"
            style={{ 
              backgroundColor: riskColor + '20',
              color: riskColor,
              borderColor: riskColor
            }}
          >
            {currentRisk.riskLevel} RISK
          </Badge>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            {currentRisk.location.region}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center">
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(currentRisk.confidence * 100).toFixed(0)}%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Confidence
            </div>
          </div>
          <div className="text-center">
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentRisk.features?.temperature?.toFixed(0) || '--'}°C
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Temperature
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href="/dashboard/fire-risk" className="block">
            <Button variant="outline" size="sm" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full Analysis
            </Button>
          </Link>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Updated {new Date(currentRisk.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
