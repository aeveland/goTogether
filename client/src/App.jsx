import React, { useState, useEffect } from 'react';
import { Card, CardBody, Spinner } from '@heroui/react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import TripCreator from './components/TripCreator';
import TripDetails from './components/TripDetails';
import { UserStorage } from './utils/userStorage';
import { TripStorage } from './utils/tripStorage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, create-trip, trip-details
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('gotogether_user');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      // Load user's trips
      setTrips(TripStorage.getUserTrips(userData.id));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gotogether_user', JSON.stringify(userData));
    localStorage.setItem('gotogether_token', 'client-token-' + Date.now());
    // Load user's trips after login
    setTrips(TripStorage.getUserTrips(userData.id));
  };

  const handleLogout = () => {
    setUser(null);
    setTrips([]);
    setCurrentView('dashboard');
    setSelectedTrip(null);
    localStorage.removeItem('gotogether_user');
    localStorage.removeItem('gotogether_token');
  };

  const handleCreateTrip = (tripData) => {
    const newTrip = TripStorage.createTrip({
      ...tripData,
      createdBy: user.id,
      members: [user.id]
    });
    setTrips(prev => [...prev, newTrip]);
    setCurrentView('trip-details');
    setSelectedTrip(newTrip);
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setCurrentView('trip-details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTrip(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardBody className="text-center py-8">
            <Spinner size="lg" color="primary" />
            <h1 className="text-2xl font-bold text-blue-600 mb-2 mt-4">Go Together</h1>
            <p className="text-gray-600">Loading...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentView === 'dashboard' && (
        <Dashboard 
          user={user} 
          trips={trips}
          onLogout={handleLogout}
          onCreateTrip={() => setCurrentView('create-trip')}
          onViewTrip={handleViewTrip}
        />
      )}
      
      {currentView === 'create-trip' && (
        <TripCreator 
          user={user}
          onCreateTrip={handleCreateTrip}
          onCancel={handleBackToDashboard}
        />
      )}
      
      {currentView === 'trip-details' && selectedTrip && (
        <TripDetails 
          trip={selectedTrip}
          user={user}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;
