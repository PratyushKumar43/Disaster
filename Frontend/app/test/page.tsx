import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Settings } from 'lucide-react';

export default function ComponentTest() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Design System Test</h1>
          <p className="text-gray-400">Testing the unified DisasterIQ components</p>
        </div>

        {/* Button Examples */}
        <Card variant="elevated" size="lg">
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Different button styles and sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="xl">Extra Large</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Item
                </Button>
                <Button variant="secondary" rightIcon={<Settings className="w-4 h-4" />}>
                  Settings
                </Button>
                <Button variant="primary" isLoading>
                  Loading...
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" interactive>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Basic card with default styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a default card with interactive hover effects.</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated" interactive glow glowColor="blue">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with shadow and blue glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has elevation and a blue glow effect on hover.</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">Get Started</Button>
            </CardFooter>
          </Card>

          <Card variant="glass" interactive>
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Glassmorphism effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card uses glassmorphism with backdrop blur.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Explore</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Stats Cards Example */}
        <Card variant="elevated" size="lg">
          <CardHeader>
            <CardTitle>Dashboard Stats</CardTitle>
            <CardDescription>Example statistics display</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="glass" size="sm">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Resources</p>
                      <p className="text-2xl font-bold text-white">1,234</p>
                      <p className="text-xs text-green-400">+12% from last month</p>
                    </div>
                    <div className="text-blue-400">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" size="sm">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Alerts</p>
                      <p className="text-2xl font-bold text-white">8</p>
                      <p className="text-xs text-yellow-400">+3 from yesterday</p>
                    </div>
                    <div className="text-yellow-400">
                      <Settings className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
