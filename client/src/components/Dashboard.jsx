import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Divider, Avatar, Chip } from '@heroui/react';

function Dashboard({ user, onLogout }) {
  const [trips, setTrips] = useState([]);

  const handleCreateTrip = () => {
    const tripName = prompt('Enter a name for your new trip:');
    if (tripName && tripName.trim()) {
      const newTrip = {
        id: Date.now(),
        name: tripName.trim(),
        description: 'New trip created',
        created_at: new Date().toISOString(),
        member_count: 1
      };
      setTrips(prev => [...prev, newTrip]);
    }
  };

  const handleJoinTrip = () => {
    const tripCode = prompt('Enter the trip invitation code:');
    if (tripCode && tripCode.trim()) {
      alert(`Joining trip with code: ${tripCode.trim()}\nFull trip joining features coming soon.`);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <Card className="mb-6">
        <CardBody className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar
                name={user.name}
                size="lg"
                color="primary"
                className="text-white"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Go Together</h1>
                <p className="text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            <Button
              color="danger"
              variant="light"
              onPress={onLogout}
            >
              Logout
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              <Button
                color="success"
                size="lg"
                className="w-full justify-start"
                startContent={<span className="text-lg">🏕️</span>}
                onPress={handleCreateTrip}
              >
                Create New Trip
              </Button>
              <Button
                color="primary"
                size="lg"
                className="w-full justify-start"
                startContent={<span className="text-lg">🤝</span>}
                onPress={handleJoinTrip}
              >
                Join Existing Trip
              </Button>
              <Button
                color="secondary"
                size="lg"
                className="w-full justify-start"
                startContent={<span className="text-lg">🔍</span>}
                variant="bordered"
              >
                Browse Public Trips
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity yet.</p>
              <p className="text-sm">Create your first trip to get started!</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Your Trips */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-semibold text-gray-800">Your Trips</h2>
            <Chip color="primary" variant="flat" size="sm">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {trips.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🎒</div>
              <h3 className="text-lg font-medium mb-2">No trips yet</h3>
              <p className="text-sm mb-4">Create your first trip to start planning your adventure!</p>
              <Button
                color="primary"
                onPress={handleCreateTrip}
              >
                Create Your First Trip
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{trip.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{trip.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{trip.member_count} member{trip.member_count !== 1 ? 's' : ''}</span>
                      <span>{new Date(trip.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Dashboard;
