/**
 * Authentication service for managing user login/logout and token handling
 */
import config from '../config.js';

export class AuthService {
    constructor() {
        this.tokenKey = 'gotogether_token';
        this.userKey = 'gotogether_user';
        this.baseUrl = config.API_BASE_URL;
    }

    /**
     * Login user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<object>} - Login response with user data and token
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token and user data
            this.setToken(data.token);
            this.setUser(data.user);

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} - Registration response
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store token and user data
            this.setToken(data.token);
            this.setUser(data.user);

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Logout user by clearing stored data
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        
        // Redirect to login page
        window.location.href = '/login';
    }

    /**
     * Check if user is currently authenticated
     * @returns {Promise<boolean>} - True if authenticated, false otherwise
     */
    async isAuthenticated() {
        const token = this.getToken();
        
        console.log('Checking authentication, token:', token ? 'present' : 'missing');
        
        if (!token) {
            console.log('No token found, user not authenticated');
            return false;
        }

        try {
            // Verify token with server
            const response = await fetch(`${this.baseUrl}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Auth verification response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Auth verification successful:', data);
                // Update user data if provided
                if (data.user) {
                    this.setUser(data.user);
                }
                return true;
            } else {
                console.log('Auth verification failed, clearing token');
                // Token is invalid, clear it
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Auth verification error:', error);
            return false;
        }
    }

    /**
     * Get the current user data
     * @returns {object|null} - User data or null if not logged in
     */
    getUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Set user data in localStorage
     * @param {object} user - User data to store
     */
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * Get the authentication token
     * @returns {string|null} - JWT token or null if not available
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Set the authentication token
     * @param {string} token - JWT token to store
     */
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * Get authorization headers for API requests
     * @returns {object} - Headers object with Authorization header
     */
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Request password reset
     * @param {string} email - User's email
     * @returns {Promise<object>} - Response from server
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset request failed');
            }

            return data;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token from email
     * @param {string} newPassword - New password
     * @returns {Promise<object>} - Response from server
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            return data;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }
}
