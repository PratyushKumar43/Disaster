'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, Globe, Search } from 'lucide-react';

interface LocationSelectorProps {
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  locationName: string;
  onLocationChange: (location: { latitude: number; longitude: number }, name: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const QUICK_LOCATIONS = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, region: 'North India' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'West India' },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, region: 'South India' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, region: 'East India' },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322, region: 'Uttarakhand' },
  { name: 'Shimla', lat: 31.1048, lng: 77.1734, region: 'Himachal Pradesh' },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, region: 'Kerala' },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973, region: 'Kashmir' }
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  locationName,
  onLocationChange,
  loading = false,
  disabled = false
}) => {
  const [locationInput, setLocationInput] = useState({
    latitude: currentLocation.latitude.toString(),
    longitude: currentLocation.longitude.toString()
  });

  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    setLocationInput({
      latitude: currentLocation.latitude.toString(),
      longitude: currentLocation.longitude.toString()
    });
  }, [currentLocation]);

  const handleManualLocationChange = () => {
    const lat = parseFloat(locationInput.latitude);
    const lng = parseFloat(locationInput.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinate ranges:\nLatitude: -90 to 90\nLongitude: -180 to 180');
      return;
    }
    
    const customLocationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    onLocationChange({ latitude: lat, longitude: lng }, customLocationName);
  };

  const handleQuickLocationSelect = (location: typeof QUICK_LOCATIONS[0]) => {
    setLocationInput({
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    });
    onLocationChange(
      { latitude: location.lat, longitude: location.lng }, 
      `${location.name}, ${location.region}`
    );
  };

  const filteredQuickLocations = QUICK_LOCATIONS.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Selection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Location Display */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Location</span>
          </div>
          <div className="text-sm text-blue-700">
            {locationName}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </div>
        </div>

        {/* Manual Coordinate Input */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Manual Coordinates</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-xs">
                Latitude (-90 to 90)
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={locationInput.latitude}
                onChange={(e) => setLocationInput(prev => ({
                  ...prev, 
                  latitude: e.target.value
                }))}
                placeholder="28.6139"
                disabled={disabled}
                className="text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-xs">
                Longitude (-180 to 180)
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={locationInput.longitude}
                onChange={(e) => setLocationInput(prev => ({
                  ...prev, 
                  longitude: e.target.value
                }))}
                placeholder="77.2090"
                disabled={disabled}
                className="text-sm"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleManualLocationChange} 
            disabled={loading || disabled}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Analyze Coordinates
              </>
            )}
          </Button>
        </div>

        {/* Quick Location Search */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Quick Locations</div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search cities or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={disabled}
              className="pl-10 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {filteredQuickLocations.map((location) => (
              <Button
                key={`${location.lat}-${location.lng}`}
                variant="ghost"
                size="sm"
                disabled={loading || disabled}
                onClick={() => handleQuickLocationSelect(location)}
                className="h-auto p-2 flex flex-col items-start justify-start hover:bg-gray-50"
              >
                <div className="font-medium text-xs text-left">
                  {location.name}
                </div>
                <div className="text-xs text-gray-500 text-left">
                  {location.region}
                </div>
                <Badge variant="outline" className="text-xs mt-1">
                  {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
                </Badge>
              </Button>
            ))}
          </div>
          
          {filteredQuickLocations.length === 0 && searchQuery && (
            <div className="text-center text-sm text-gray-500 py-4">
              No locations found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Geolocation Button */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={loading || disabled}
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  setLocationInput({
                    latitude: lat.toString(),
                    longitude: lng.toString()
                  });
                  onLocationChange(
                    { latitude: lat, longitude: lng }, 
                    `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                  );
                },
                (error) => {
                  alert('Unable to get your location. Please enter coordinates manually.');
                  console.error('Geolocation error:', error);
                }
              );
            } else {
              alert('Geolocation is not supported by this browser.');
            }
          }}
        >
          <Globe className="w-4 h-4 mr-2" />
          Use Current Location
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationSelector;
