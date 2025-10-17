import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Divider, Spacer } from '@heroui/react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { UserStorage } from './utils/userStorage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('gotogether_user');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('gotogether_user', JSON.stringify(userData));
    localStorage.setItem('gotogether_token', 'client-token-' + Date.now());
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gotogether_user');
    localStorage.removeItem('gotogether_token');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardBody className="text-center py-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Go Together</h1>
            <p className="text-gray-600">Loading...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
