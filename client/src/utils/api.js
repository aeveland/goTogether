/**
 * API service for making HTTP requests to the backend
 * Handles authentication headers and error responses
 */
import { AuthService } from './auth.js';
import { MockApiService } from './mock-api.js';
import config from '../config.js';

export class ApiService {
    constructor() {
        console.log('ApiService constructor, config:', config);
        this.baseUrl = config.API_BASE_URL;
        this.authService = new AuthService();
        
        // Use mock API for demo deployments
        if (config.API_BASE_URL === '/api/mock') {
            console.log('Using MockApiService for demo mode');
            return new MockApiService();
        }
        
        console.log('Using real ApiService with baseUrl:', this.baseUrl);
    }

    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint (without /api prefix)
     * @param {object} options - Fetch options
     * @returns {Promise<object>} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Merge default headers with provided headers
        const headers = {
            'Content-Type': 'application/json',
            ...this.authService.getAuthHeaders(),
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Handle 401 Unauthorized by logging out
            if (response.status === 401) {
                this.authService.logout();
                throw new Error('Session expired. Please log in again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<object>} - Response data
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body data
     * @returns {Promise<object>} - Response data
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body data
     * @returns {Promise<object>} - Response data
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<object>} - Response data
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Trip-related API methods
    
    /**
     * Get all trips for the current user
     * @returns {Promise<Array>} - Array of trip objects
     */
    async getTrips() {
        return this.get('/trips');
    }

    /**
     * Get a specific trip by ID
     * @param {string} tripId - Trip ID
     * @returns {Promise<object>} - Trip object
     */
    async getTrip(tripId) {
        return this.get(`/trips/${tripId}`);
    }

    /**
     * Create a new trip
     * @param {object} tripData - Trip data
     * @returns {Promise<object>} - Created trip object
     */
    async createTrip(tripData) {
        return this.post('/trips', tripData);
    }

    /**
     * Update a trip
     * @param {string} tripId - Trip ID
     * @param {object} tripData - Updated trip data
     * @returns {Promise<object>} - Updated trip object
     */
    async updateTrip(tripId, tripData) {
        return this.put(`/trips/${tripId}`, tripData);
    }

    /**
     * Delete a trip
     * @param {string} tripId - Trip ID
     * @returns {Promise<object>} - Deletion confirmation
     */
    async deleteTrip(tripId) {
        return this.delete(`/trips/${tripId}`);
    }

    // Shopping list API methods

    /**
     * Get shopping list for a trip
     * @param {string} tripId - Trip ID
     * @returns {Promise<Array>} - Array of shopping list items
     */
    async getShoppingList(tripId) {
        return this.get(`/shopping/trips/${tripId}`);
    }

    /**
     * Add item to shopping list
     * @param {string} tripId - Trip ID
     * @param {object} itemData - Shopping item data
     * @returns {Promise<object>} - Created shopping item
     */
    async addShoppingItem(tripId, itemData) {
        return this.post(`/shopping/trips/${tripId}`, itemData);
    }

    /**
     * Update shopping item
     * @param {string} itemId - Item ID
     * @param {object} updates - Updates to apply
     * @returns {Promise<object>} - Updated shopping item
     */
    async updateShoppingItem(itemId, updates) {
        return this.put(`/shopping/items/${itemId}`, updates);
    }

    /**
     * Delete shopping item
     * @param {string} itemId - Item ID
     * @returns {Promise<object>} - Success response
     */
    async deleteShoppingItem(itemId) {
        return this.delete(`/shopping/items/${itemId}`);
    }

    // Todo list API methods

    /**
     * Get todo list for a trip
     * @param {string} tripId - Trip ID
     * @returns {Promise<Array>} - Array of todo items
     */
    async getTodos(tripId) {
        return this.get(`/trips/${tripId}/todos`);
    }

    /**
     * Add todo item
     * @param {string} tripId - Trip ID
     * @param {object} todoData - Todo item data
     * @returns {Promise<object>} - Created todo object
     */
    async addTodo(tripId, todoData) {
        return this.post(`/trips/${tripId}/todos`, todoData);
    }

    /**
     * Update todo item
     * @param {string} tripId - Trip ID
     * @param {string} todoId - Todo ID
     * @param {object} todoData - Updated todo data
     * @returns {Promise<object>} - Updated todo object
     */
    async updateTodo(tripId, todoId, todoData) {
        return this.put(`/trips/${tripId}/todos/${todoId}`, todoData);
    }

    /**
     * Delete todo item
     * @param {string} tripId - Trip ID
     * @param {string} todoId - Todo ID
     * @returns {Promise<object>} - Deletion confirmation
     */
    async deleteTodo(tripId, todoId) {
        return this.delete(`/trips/${tripId}/todos/${todoId}`);
    }

    // Notes API methods

    /**
     * Get notes for a trip
     * @param {string} tripId - Trip ID
     * @returns {Promise<Array>} - Array of note objects
     */
    async getNotes(tripId) {
        return this.get(`/trips/${tripId}/notes`);
    }

    /**
     * Create a note
     * @param {string} tripId - Trip ID
     * @param {object} noteData - Note data
     * @returns {Promise<object>} - Created note object
     */
    async createNote(tripId, noteData) {
        return this.post(`/trips/${tripId}/notes`, noteData);
    }

    /**
     * Update a note
     * @param {string} tripId - Trip ID
     * @param {string} noteId - Note ID
     * @param {object} noteData - Updated note data
     * @returns {Promise<object>} - Updated note object
     */
    async updateNote(tripId, noteId, noteData) {
        return this.put(`/trips/${tripId}/notes/${noteId}`, noteData);
    }

    /**
     * Delete a note
     * @param {string} tripId - Trip ID
     * @param {string} noteId - Note ID
     * @returns {Promise<object>} - Deletion confirmation
     */
    async deleteNote(tripId, noteId) {
        return this.delete(`/trips/${tripId}/notes/${noteId}`);
    }

    // User and profile API methods

    /**
     * Get user profile
     * @returns {Promise<object>} - User profile object
     */
    async getProfile() {
        return this.get('/users/profile');
    }

    /**
     * Update user profile
     * @param {object} profileData - Updated profile data
     * @returns {Promise<object>} - Updated profile object
     */
    async updateProfile(profileData) {
        return this.put('/users/profile', profileData);
    }

    /**
     * Search for users (for inviting to trips)
     * @param {string} query - Search query (email or name)
     * @returns {Promise<Array>} - Array of user objects
     */
    async searchUsers(query) {
        return this.get(`/users/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Invite user to trip
     * @param {string} tripId - Trip ID
     * @param {string} email - User email to invite
     * @returns {Promise<object>} - Invitation result
     */
    async inviteToTrip(tripId, email) {
        return this.post(`/trips/${tripId}/invite`, { email });
    }
}
