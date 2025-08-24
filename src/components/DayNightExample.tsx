import React from 'react';
import { DayNightHouse, AllHousesDisplay, TimeConfigAdmin } from '../components/DayNightHouse';
import { useHouseImage } from '../utils/dayNightHouses';

/**
 * Example implementation of day/night house system
 */
export default function DayNightExample() {
  // Individual house hook example
  const { imageUrl, isLoading, isDay } = useHouseImage('jocks-house');

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        🏠 Day/Night House System Example
      </h1>

      {/* Individual House Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Single House Example</h2>
        <div className="flex items-center space-x-4">
          <DayNightHouse 
            houseId="jocks-house" 
            className="w-48 h-48 rounded-lg shadow-lg"
            onClick={() => alert('Jocks house clicked!')}
          />
          <div className="text-sm text-gray-600">
            <p><strong>Status:</strong> {isLoading ? 'Loading...' : 'Loaded'}</p>
            <p><strong>Time:</strong> {isDay ? '☀️ Day Time' : '🌙 Night Time'}</p>
            <p><strong>Image URL:</strong> {imageUrl || 'None'}</p>
          </div>
        </div>
      </section>

      {/* All Houses Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">All Houses Grid</h2>
        <AllHousesDisplay />
      </section>

      {/* Time Configuration Admin Panel */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Admin: Time Configuration</h2>
        <TimeConfigAdmin />
      </section>

      {/* Usage Instructions */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">🛠️ How to Use</h2>
        <div className="space-y-2 text-sm">
          <p><strong>1. Database Setup:</strong> Run the SQL file: <code>supabase/day_night_house_system.sql</code></p>
          <p><strong>2. Add House Images:</strong> Upload day/night versions to <code>/images/houses/</code></p>
          <p><strong>3. Individual House:</strong> <code>&lt;DayNightHouse houseId="jocks-house" /&gt;</code></p>
          <p><strong>4. All Houses:</strong> <code>&lt;AllHousesDisplay /&gt;</code></p>
          <p><strong>5. Admin Panel:</strong> <code>&lt;TimeConfigAdmin /&gt;</code></p>
        </div>
      </section>
    </div>
  );
}
