/**
 * Mock API Service for Demo Deployments
 * Provides fake data and responses when no backend is available
 */

// Mock data
const mockUsers = [
    {
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        bio: 'Love camping and outdoor adventures!',
        camper_type: 'tent',
        group_size: 2,
        created_at: '2025-10-17T19:00:00Z'
    }
];

const mockTrips = [
    {
        id: 1,
        name: 'Yosemite Adventure',
        description: 'Weekend camping in beautiful Yosemite National Park',
        location: 'Yosemite National Park, CA',
        start_date: '2025-11-15',
        end_date: '2025-11-17',
        created_by: 1,
        invite_code: 'DEMO123',
        member_count: 3,
        role: 'admin',
        created_at: '2025-10-17T19:00:00Z'
    },
    {
        id: 2,
        name: 'Big Sur Coastal Trip',
        description: 'Scenic coastal camping along the Big Sur coastline',
        location: 'Big Sur, CA',
        start_date: '2025-12-01',
        end_date: '2025-12-03',
        created_by: 1,
        invite_code: 'DEMO456',
        member_count: 2,
        role: 'admin',
        created_at: '2025-10-17T19:00:00Z'
    }
];

let mockToken = null;
let isLoggedIn = false;

/**
 * Mock API responses with realistic delays
 */
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
    constructor() {
        this.baseUrl = '/api/mock';
    }

    // Authentication methods
    async login(email, password) {
        await delay();
        
        if (email === 'demo@example.com' && password === 'Demo123') {
            mockToken = 'mock-jwt-token-' + Date.now();
            isLoggedIn = true;
            
            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: mockUsers[0],
                    token: mockToken
                }
            };
        }
        
        throw new Error('Invalid credentials. Try demo@example.com / Demo123');
    }

    async register(userData) {
        await delay();
        
        const newUser = {
            id: mockUsers.length + 1,
            ...userData,
            created_at: new Date().toISOString()
        };
        
        mockUsers.push(newUser);
        mockToken = 'mock-jwt-token-' + Date.now();
        isLoggedIn = true;
        
        return {
            success: true,
            message: 'Registration successful',
            data: {
                user: newUser,
                token: mockToken
            }
        };
    }

    async verifyToken() {
        await delay(200);
        
        if (isLoggedIn && mockToken) {
            return {
                success: true,
                message: 'Token is valid',
                data: {
                    user: mockUsers[0]
                }
            };
        }
        
        throw new Error('Invalid token');
    }

    async isAuthenticated() {
        return isLoggedIn && mockToken !== null;
    }

    // Trip methods
    async getTrips() {
        await delay();
        
        if (!isLoggedIn) {
            throw new Error('Authentication required');
        }
        
        return {
            success: true,
            message: 'Trips retrieved successfully',
            data: mockTrips,
            pagination: {
                page: 1,
                limit: 20,
                total: mockTrips.length,
                pages: 1
            }
        };
    }

    async getTrip(tripId) {
        await delay();
        
        if (!isLoggedIn) {
            throw new Error('Authentication required');
        }
        
        const trip = mockTrips.find(t => t.id === parseInt(tripId));
        if (!trip) {
            throw new Error('Trip not found');
        }
        
        return {
            success: true,
            message: 'Trip retrieved successfully',
            data: trip
        };
    }

    async createTrip(tripData) {
        await delay();
        
        if (!isLoggedIn) {
            throw new Error('Authentication required');
        }
        
        const newTrip = {
            id: mockTrips.length + 1,
            ...tripData,
            created_by: 1,
            invite_code: 'DEMO' + Math.random().toString(36).substr(2, 3).toUpperCase(),
            member_count: 1,
            role: 'admin',
            created_at: new Date().toISOString()
        };
        
        mockTrips.push(newTrip);
        
        return {
            success: true,
            message: 'Trip created successfully',
            data: newTrip
        };
    }

    // User methods
    async getProfile() {
        await delay();
        
        if (!isLoggedIn) {
            throw new Error('Authentication required');
        }
        
        return {
            success: true,
            message: 'Profile retrieved successfully',
            data: mockUsers[0]
        };
    }

    async updateProfile(profileData) {
        await delay();
        
        if (!isLoggedIn) {
            throw new Error('Authentication required');
        }
        
        Object.assign(mockUsers[0], profileData);
        
        return {
            success: true,
            message: 'Profile updated successfully',
            data: mockUsers[0]
        };
    }

    // Placeholder methods for other features
    async getShoppingList() { return { success: true, data: [] }; }
    async getTodos() { return { success: true, data: [] }; }
    async getNotes() { return { success: true, data: [] }; }
    async searchUsers() { return { success: true, data: [] }; }
    async getFriends() { return { success: true, data: [] }; }
}
