import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Link, Spacer } from '@heroui/react';
import { UserStorage } from '../utils/userStorage';

function AuthForm({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        await handleLogin();
      } else {
        await handleRegister();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const { email, password } = formData;
    
    if (!email || !password) {
      throw new Error('Please fill in all fields');
    }

    const user = UserStorage.findUser(email, password);
    
    if (user) {
      onLogin(user);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      throw new Error('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (UserStorage.userExists(email)) {
      throw new Error('User with this email already exists');
    }

    const user = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      created_at: new Date().toISOString()
    };

    UserStorage.saveUser(user);
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center pb-0 pt-6">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Go Together</h1>
          <p className="text-gray-600 text-center">
            {isLoginMode 
              ? 'Sign in to plan your next adventure' 
              : 'Create an account to start planning trips'
            }
          </p>
        </CardHeader>
        
        <CardBody className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
                isRequired
                variant="bordered"
              />
            )}
            
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={formData.email}
              onValueChange={(value) => handleInputChange('email', value)}
              isRequired
              variant="bordered"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={formData.password}
              onValueChange={(value) => handleInputChange('password', value)}
              isRequired
              variant="bordered"
              description={!isLoginMode ? "Must be at least 6 characters" : ""}
            />
            
            {!isLoginMode && (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                type="password"
                value={formData.confirmPassword}
                onValueChange={(value) => handleInputChange('confirmPassword', value)}
                isRequired
                variant="bordered"
              />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <Spacer y={4} />
          
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <Link
                color="primary"
                className="cursor-pointer"
                onPress={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                }}
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default AuthForm;
