console.log('Go Together app starting');

// Simple user storage for client-side auth
const UserStorage = {
    getUsers() {
        return JSON.parse(localStorage.getItem('gotogether_users') || '[]');
    },
    
    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('gotogether_users', JSON.stringify(users));
    },
    
    findUser(email, password) {
        const users = this.getUsers();
        return users.find(u => u.email === email && u.password === password);
    },
    
    userExists(email) {
        const users = this.getUsers();
        return users.some(u => u.email === email);
    }
};

// Trip storage for managing trips
const TripStorage = {
    getAllTrips() {
        return JSON.parse(localStorage.getItem('gotogether_trips') || '[]');
    },

    saveTrip(trip) {
        const trips = this.getAllTrips();
        const existingIndex = trips.findIndex(t => t.id === trip.id);
        
        if (existingIndex >= 0) {
            trips[existingIndex] = trip;
        } else {
            trips.push(trip);
        }
        
        localStorage.setItem('gotogether_trips', JSON.stringify(trips));
        return trip;
    },

    createTrip(tripData) {
        const trip = {
            id: Date.now(),
            name: tripData.name,
            description: tripData.description || '',
            location: tripData.location || '',
            startDate: tripData.startDate,
            endDate: tripData.endDate,
            createdBy: tripData.createdBy,
            members: [tripData.createdBy],
            inviteCode: this.generateInviteCode(),
            status: 'planning',
            activities: [],
            packingList: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return this.saveTrip(trip);
    },

    getUserTrips(userId) {
        const allTrips = this.getAllTrips();
        return allTrips.filter(trip => 
            trip.members.includes(userId) || trip.createdBy === userId
        );
    },

    getTripByInviteCode(inviteCode) {
        const trips = this.getAllTrips();
        return trips.find(trip => trip.inviteCode === inviteCode.toUpperCase());
    },

    joinTrip(tripId, userId) {
        const trip = this.getAllTrips().find(t => t.id === tripId);
        if (trip && !trip.members.includes(userId)) {
            trip.members.push(userId);
            trip.updatedAt = new Date().toISOString();
            return this.saveTrip(trip);
        }
        return trip;
    },

    generateInviteCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    
    app.innerHTML = '<div style="padding: 40px; text-align: center; font-family: Arial;"><h1>Go Together</h1><p>Loading...</p></div>';
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('gotogether_user');
    if (currentUser) {
        showDashboard(JSON.parse(currentUser));
        return;
    }
    
    // Show auth form
    setTimeout(function() {
        showAuthForm();
    }, 100);
});

function showAuthForm() {
    const app = document.getElementById('app');
    
    // Set body background
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.minHeight = '100vh';
    
    app.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div style="width: 100%; max-width: 400px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1976d2; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Go Together</h1>
                    <p style="color: #666; margin: 0; font-size: 16px;">
                        ${isLoginMode 
                            ? 'Sign in to plan your next adventure' 
                            : 'Create an account to start planning trips'
                        }
                    </p>
                </div>
                
                <div id="error-message" style="display: none; background: #ffebee; color: #c62828; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f44336; font-size: 14px;"></div>
                
                <form id="auth-form">
                    ${!isLoginMode ? `
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Full Name</label>
                            <input type="text" name="name" required 
                                   style="width: 100%; padding: 14px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s;"
                                   onfocus="this.style.borderColor='#1976d2'" onblur="this.style.borderColor='#e1e5e9'">
                        </div>
                    ` : ''}
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Email</label>
                        <input type="email" name="email" required 
                               style="width: 100%; padding: 14px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s;"
                               onfocus="this.style.borderColor='#1976d2'" onblur="this.style.borderColor='#e1e5e9'">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Password</label>
                        <input type="password" name="password" required 
                               style="width: 100%; padding: 14px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s;"
                               onfocus="this.style.borderColor='#1976d2'" onblur="this.style.borderColor='#e1e5e9'">
                        ${!isLoginMode ? '<small style="color: #666; font-size: 12px; margin-top: 4px; display: block;">Must be at least 6 characters</small>' : ''}
                    </div>
                    
                    ${!isLoginMode ? `
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Confirm Password</label>
                            <input type="password" name="confirmPassword" required 
                                   style="width: 100%; padding: 14px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box; font-size: 16px; transition: border-color 0.2s;"
                                   onfocus="this.style.borderColor='#1976d2'" onblur="this.style.borderColor='#e1e5e9'">
                        </div>
                    ` : ''}
                    
                    <button type="submit" 
                            style="width: 100%; padding: 16px; background: linear-gradient(135deg, #1976d2, #1565c0); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(25,118,210,0.3)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        ${isLoginMode ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 25px;">
                    <p style="color: #666; margin: 0; font-size: 14px;">
                        ${isLoginMode ? "Don't have an account?" : "Already have an account?"}
                        <button onclick="toggleAuthMode()" 
                                style="background: none; border: none; color: #1976d2; cursor: pointer; font-weight: 600; margin-left: 5px; text-decoration: none;"
                                onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                            ${isLoginMode ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('auth-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (isLoginMode) {
            handleLogin(formData);
        } else {
            handleRegister(formData);
        }
    });
}

function handleLogin(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    
    const user = UserStorage.findUser(email, password);
    
    if (user) {
        localStorage.setItem('gotogether_user', JSON.stringify(user));
        localStorage.setItem('gotogether_token', 'client-token-' + Date.now());
        showDashboard(user);
    } else {
        document.getElementById('result').innerHTML = '<div style="color: red; margin-top: 10px;">Invalid email or password</div>';
    }
}

function handleRegister(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        document.getElementById('result').innerHTML = '<div style="color: red; margin-top: 10px;">Passwords do not match</div>';
        return;
    }
    
    if (password.length < 6) {
        document.getElementById('result').innerHTML = '<div style="color: red; margin-top: 10px;">Password must be at least 6 characters</div>';
        return;
    }
    
    if (UserStorage.userExists(email)) {
        document.getElementById('result').innerHTML = '<div style="color: red; margin-top: 10px;">User with this email already exists</div>';
        return;
    }
    
    const user = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        created_at: new Date().toISOString()
    };
    
    UserStorage.saveUser(user);
    localStorage.setItem('gotogether_user', JSON.stringify(user));
    localStorage.setItem('gotogether_token', 'client-token-' + Date.now());
    showDashboard(user);
}

function showDashboard(user) {
    const app = document.getElementById('app');
    
    // Set body background for dashboard
    document.body.style.background = '#f8fafc';
    
    // Get user's trips
    const userTrips = TripStorage.getUserTrips(user.id);
    
    app.innerHTML = `
        <div style="min-height: 100vh; font-family: Arial, sans-serif;">
            <!-- Header -->
            <div style="background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-bottom: 1px solid #e2e8f0;">
                <div style="max-width: 1200px; margin: 0 auto; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1976d2, #1565c0); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold;">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 style="margin: 0; font-size: 24px; color: #1a202c;">Go Together</h1>
                            <p style="margin: 0; color: #718096; font-size: 14px;">Welcome back, ${user.name}!</p>
                        </div>
                    </div>
                    <button onclick="logout()" 
                            style="background: #fed7d7; color: #c53030; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background-color 0.2s;"
                            onmouseover="this.style.backgroundColor='#feb2b2'" onmouseout="this.style.backgroundColor='#fed7d7'">
                        Logout
                    </button>
                </div>
            </div>
            
            <!-- Main Content -->
            <div style="max-width: 1200px; margin: 0 auto; padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <!-- Quick Actions -->
                    <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h2 style="margin: 0 0 25px 0; color: #1a202c; font-size: 20px; font-weight: 600;">Quick Actions</h2>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <button onclick="showCreateTripForm()" 
                                    style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; border: none; padding: 18px; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(72,187,120,0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <i class="material-icons" style="font-size: 20px;">add</i>
                                Create New Trip
                            </button>
                            <button onclick="showJoinTripForm()" 
                                    style="background: linear-gradient(135deg, #4299e1, #3182ce); color: white; border: none; padding: 18px; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(66,153,225,0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <i class="material-icons" style="font-size: 20px;">group_add</i>
                                Join Existing Trip
                            </button>
                            <button onclick="browseTrips()" 
                                    style="background: linear-gradient(135deg, #9f7aea, #805ad5); color: white; border: none; padding: 18px; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; opacity: 0.6;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(159,122,234,0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <i class="material-icons" style="font-size: 20px;">explore</i>
                                Browse Public Trips (Soon)
                            </button>
                        </div>
                    </div>
                    
                    <!-- Trip Stats -->
                    <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h2 style="margin: 0 0 25px 0; color: #1a202c; font-size: 20px; font-weight: 600;">Trip Statistics</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="text-align: center; padding: 20px; background: #f0f9ff; border-radius: 12px;">
                                <div style="font-size: 32px; font-weight: bold; color: #0369a1;">${userTrips.length}</div>
                                <div style="font-size: 14px; color: #0369a1; font-weight: 600;">Total Trips</div>
                            </div>
                            <div style="text-align: center; padding: 20px; background: #f0fdf4; border-radius: 12px;">
                                <div style="font-size: 32px; font-weight: bold; color: #15803d;">${userTrips.filter(t => t.status === 'planning').length}</div>
                                <div style="font-size: 14px; color: #15803d; font-weight: 600;">Planning</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Your Trips -->
                <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h2 style="margin: 0; color: #1a202c; font-size: 20px; font-weight: 600;">Your Trips</h2>
                        <span style="background: #bee3f8; color: #2b6cb0; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${userTrips.length} trip${userTrips.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div id="trips-container">
                        ${userTrips.length === 0 ? `
                            <div style="text-align: center; padding: 60px 20px; color: #718096;">
                                <i class="material-icons" style="font-size: 64px; margin-bottom: 20px; color: #9ca3af;">luggage</i>
                                <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #4a5568;">No trips yet</h3>
                                <p style="margin: 0 0 25px 0; font-size: 14px;">Create your first trip to start planning your adventure!</p>
                                <button onclick="showCreateTripForm()" 
                                        style="background: linear-gradient(135deg, #1976d2, #1565c0); color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;"
                                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(25,118,210,0.3)'"
                                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                    Create Your First Trip
                                </button>
                            </div>
                        ` : `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                                ${userTrips.map(trip => `
                                    <div style="border: 1px solid #e2e8f0; border-radius: 12px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; overflow: hidden;"
                                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.1)'"
                                         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'"
                                         onclick="viewTrip(${trip.id})">
                                        ${trip.locationData && trip.locationData.lat && trip.locationData.lng ? `
                                            <div style="height: 120px; background-image: url('${generateMapThumbnail(trip.locationData.lat, trip.locationData.lng, 400, 120)}'); background-size: cover; background-position: center; position: relative;">
                                                <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                                    <i class="material-icons" style="font-size: 12px; margin-right: 2px;">place</i>
                                                    MAP
                                                </div>
                                            </div>
                                        ` : ''}
                                        <div style="padding: 20px;">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1a202c;">${trip.name}</h3>
                                                <span style="background: ${trip.status === 'planning' ? '#fef3c7' : '#d1fae5'}; color: ${trip.status === 'planning' ? '#92400e' : '#065f46'}; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                                    ${trip.status}
                                                </span>
                                            </div>
                                            <div style="margin-bottom: 15px;">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
                                                    <i class="material-icons" style="font-size: 16px;">place</i>
                                                    <span>${trip.location || 'Location TBD'}</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
                                                    <i class="material-icons" style="font-size: 16px;">event</i>
                                                    <span>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</span>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
                                                    <i class="material-icons" style="font-size: 16px;">group</i>
                                                    <span>${trip.members.length} member${trip.members.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            ${trip.description ? `<p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${trip.description}</p>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.toggleAuthMode = function() {
    isLoginMode = !isLoginMode;
    showAuthForm();
};

window.logout = function() {
    localStorage.removeItem('gotogether_token');
    localStorage.removeItem('gotogether_user');
    location.reload();
};

// Helper function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Show create trip form
window.showCreateTripForm = function() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div style="min-height: 100vh; background: #f8fafc; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <div style="margin-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 24px; color: #1a202c;">Create New Trip</h1>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Plan your next adventure</p>
                </div>

                <!-- Form -->
                <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <form id="create-trip-form">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Trip Name *</label>
                            <input type="text" name="name" required 
                                   placeholder="e.g., Yosemite Weekend Adventure"
                                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                                   onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'">
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Location *</label>
                            <input type="text" name="location" id="location-input" required 
                                   placeholder="Search for a location..."
                                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                                   onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'">
                            <div style="font-size: 12px; color: #6b7280; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                                <i class="material-icons" style="font-size: 14px;">place</i>
                                Start typing to search for places
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Start Date *</label>
                                <input type="date" name="startDate" required 
                                       style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                                       onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">End Date *</label>
                                <input type="date" name="endDate" required 
                                       style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                                       onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'">
                            </div>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Description (Optional)</label>
                            <textarea name="description" rows="3" 
                                      placeholder="Tell your group what to expect on this trip..."
                                      style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; resize: vertical; box-sizing: border-box;"
                                      onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
                        </div>

                        <div id="create-trip-error" style="display: none; background: #fef2f2; color: #dc2626; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;"></div>

                        <div style="display: flex; gap: 15px; justify-content: end;">
                            <button type="button" id="cancel-btn"
                                    style="background: #f3f4f6; color: #374151; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                Cancel
                            </button>
                            <button type="button" id="create-btn"
                                    style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                Create Trip
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Tips -->
                <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid #93c5fd;">
                    <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; display: flex; align-items: center; gap: 8px;"><i class="material-icons" style="font-size: 18px;">lightbulb</i> Pro Tips</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
                        <li>Choose a descriptive name that gets everyone excited</li>
                        <li>Include specific location details for easy navigation</li>
                        <li>Add buffer time for travel and setup</li>
                        <li>You can always edit these details later</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Add button event listeners
    document.getElementById('cancel-btn').addEventListener('click', function() {
        console.log('Cancel button clicked');
        const user = JSON.parse(localStorage.getItem('gotogether_user'));
        showDashboard(user);
    });
    
    document.getElementById('create-btn').addEventListener('click', function() {
        console.log('Create button clicked');
        const form = document.getElementById('create-trip-form');
        const formData = new FormData(form);
        handleCreateTrip(formData);
    });
    
    // Initialize Google Places Autocomplete
    if (window.google && window.google.maps) {
        initializeLocationAutocomplete();
    } else {
        // Wait for Google Maps to load
        window.addEventListener('load', function() {
            setTimeout(initializeLocationAutocomplete, 1000);
        });
    }
};

// Handle trip creation
function handleCreateTrip(formData) {
    console.log('handleCreateTrip called');
    const user = JSON.parse(localStorage.getItem('gotogether_user'));
    const name = formData.get('name').trim();
    const location = formData.get('location').trim();
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const description = formData.get('description').trim();
    
    console.log('Form data:', { name, location, startDate, endDate, description });

    // Validation
    if (!name || !location || !startDate || !endDate) {
        console.log('Validation failed: missing fields');
        showCreateTripError('Please fill in all required fields');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        console.log('Validation failed: end date before start date');
        showCreateTripError('End date must be after start date');
        return;
    }

    // Remove past date validation for now to test
    // if (new Date(startDate) < new Date()) {
    //     console.log('Validation failed: start date in past');
    //     showCreateTripError('Start date cannot be in the past');
    //     return;
    // }

    // Create trip with location data
    const locationData = selectedPlaceData ? {
        address: selectedPlaceData.formattedAddress,
        name: selectedPlaceData.name,
        lat: selectedPlaceData.lat,
        lng: selectedPlaceData.lng,
        placeId: selectedPlaceData.placeId
    } : {
        address: location,
        name: location,
        lat: null,
        lng: null,
        placeId: null
    };
    
    const trip = TripStorage.createTrip({
        name,
        location: locationData.address,
        locationData: locationData,
        startDate,
        endDate,
        description,
        createdBy: user.id
    });

    // Show success and redirect to trip view
    alert(`Trip "${trip.name}" created successfully! Invite code: ${trip.inviteCode}`);
    viewTrip(trip.id);
}

function showCreateTripError(message) {
    const errorDiv = document.getElementById('create-trip-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Show join trip form
window.showJoinTripForm = function() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div style="min-height: 100vh; background: #f8fafc; padding: 20px; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center;">
            <div style="max-width: 400px; width: 100%;">
                <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #1a202c;">Join a Trip</h1>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Enter the invite code shared by your trip organizer</p>
                    </div>

                    <form id="join-trip-form">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Invite Code</label>
                            <input type="text" name="inviteCode" required 
                                   placeholder="e.g., ABC123"
                                   maxlength="6"
                                   style="width: 100%; padding: 15px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 18px; text-align: center; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; box-sizing: border-box;"
                                   onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'"
                                   oninput="this.value = this.value.toUpperCase()">
                            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">Invite codes are 6 characters long</p>
                        </div>

                        <div id="join-trip-error" style="display: none; background: #fef2f2; color: #dc2626; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;"></div>

                        <div style="display: flex; gap: 15px;">
                            <button type="button" id="join-cancel-btn"
                                    style="flex: 1; background: #f3f4f6; color: #374151; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                Cancel
                            </button>
                            <button type="button" id="join-submit-btn"
                                    style="flex: 1; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                Join Trip
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Add button event listeners
    document.getElementById('join-cancel-btn').addEventListener('click', function() {
        console.log('Join trip cancel clicked');
        const user = JSON.parse(localStorage.getItem('gotogether_user'));
        showDashboard(user);
    });
    
    document.getElementById('join-submit-btn').addEventListener('click', function() {
        console.log('Join trip submit clicked');
        const form = document.getElementById('join-trip-form');
        const formData = new FormData(form);
        handleJoinTrip(formData);
    });
};

// Handle joining trip
function handleJoinTrip(formData) {
    console.log('handleJoinTrip called');
    const user = JSON.parse(localStorage.getItem('gotogether_user'));
    const inviteCode = formData.get('inviteCode').trim().toUpperCase();
    
    console.log('Join trip data:', { inviteCode, userId: user.id });

    if (!inviteCode) {
        console.log('No invite code provided');
        showJoinTripError('Please enter an invite code');
        return;
    }

    const trip = TripStorage.getTripByInviteCode(inviteCode);
    console.log('Found trip:', trip);
    
    if (!trip) {
        console.log('Trip not found for code:', inviteCode);
        showJoinTripError('Invalid invite code. Please check and try again.');
        return;
    }

    if (trip.members.includes(user.id)) {
        console.log('User already member of trip');
        showJoinTripError('You are already a member of this trip');
        return;
    }

    // Join the trip
    console.log('Joining trip...');
    const updatedTrip = TripStorage.joinTrip(trip.id, user.id);
    
    if (updatedTrip) {
        alert(`Successfully joined "${trip.name}"!`);
        viewTrip(trip.id);
    } else {
        showJoinTripError('Failed to join trip. Please try again.');
    }
}

function showJoinTripError(message) {
    const errorDiv = document.getElementById('join-trip-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// View trip details
window.viewTrip = function(tripId) {
    const trip = TripStorage.getAllTrips().find(t => t.id === tripId);
    const user = JSON.parse(localStorage.getItem('gotogether_user'));
    
    if (!trip) {
        alert('Trip not found');
        return;
    }

    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div style="min-height: 100vh; background: #f8fafc; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 800px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                    <button id="trip-back-btn"
                            style="background: #e5e7eb; border: none; padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="material-icons" style="font-size: 20px;">arrow_back</i>
                    </button>
                    <div style="flex: 1;">
                        <h1 style="margin: 0; font-size: 24px; color: #1a202c;">${trip.name}</h1>
                        <div style="display: flex; align-items: center; gap: 20px; margin-top: 5px; color: #6b7280; font-size: 14px;">
                            <span style="display: flex; align-items: center; gap: 4px;"><i class="material-icons" style="font-size: 16px;">place</i> ${trip.location}</span>
                            <span style="display: flex; align-items: center; gap: 4px;"><i class="material-icons" style="font-size: 16px;">event</i> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</span>
                            <span style="display: flex; align-items: center; gap: 4px;"><i class="material-icons" style="font-size: 16px;">group</i> ${trip.members.length} member${trip.members.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: ${trip.status === 'planning' ? '#fef3c7' : '#d1fae5'}; color: ${trip.status === 'planning' ? '#92400e' : '#065f46'}; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${trip.status}
                        </span>
                        <button onclick="shareTrip('${trip.inviteCode}')" 
                                style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            Share
                        </button>
                    </div>
                </div>

                <!-- Trip Overview -->
                <div style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
                    ${trip.description ? `
                        <h3 style="margin: 0 0 15px 0; color: #1a202c; font-size: 18px;">About this trip</h3>
                        <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">${trip.description}</p>
                    ` : ''}
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                        <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: bold; color: #0369a1;">${Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1}</div>
                            <div style="font-size: 12px; color: #0369a1; font-weight: 600;">Days</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: bold; color: #15803d;">${trip.activities.length}</div>
                            <div style="font-size: 12px; color: #15803d; font-weight: 600;">Activities</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: bold; color: #92400e;">${trip.packingList.length}</div>
                            <div style="font-size: 12px; color: #92400e; font-weight: 600;">Packing Items</div>
                        </div>
                    </div>
                </div>

                <!-- Members & Invite -->
                <div style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
                    <h3 style="margin: 0 0 20px 0; color: #1a202c; font-size: 18px;">Trip Members</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9fafb; border-radius: 12px;">
                            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1976d2, #1565c0); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #1a202c;">${user.name}</div>
                                <div style="font-size: 12px; color: #6b7280;">${trip.createdBy === user.id ? 'Trip Organizer' : 'Member'}</div>
                            </div>
                            <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;">You</span>
                        </div>
                    </div>

                    <div style="background: #dbeafe; padding: 20px; border-radius: 12px; border: 1px solid #93c5fd;">
                        <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Invite Others</h4>
                        <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 14px;">Share this code with friends:</p>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <code style="background: white; padding: 10px 15px; border-radius: 8px; font-size: 18px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">
                                ${trip.inviteCode}
                            </code>
                            <button onclick="shareTrip('${trip.inviteCode}')" 
                                    style="background: #3b82f6; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
                        <i class="material-icons" style="font-size: 48px; margin-bottom: 10px; color: #10b981;">local_activity</i>
                        <h4 style="margin: 0 0 10px 0; color: #1a202c;">Activities</h4>
                        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Plan what you'll do</p>
                        <button id="manage-activities-btn" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Manage Activities
                        </button>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
                        <i class="material-icons" style="font-size: 48px; margin-bottom: 10px; color: #f59e0b;">inventory</i>
                        <h4 style="margin: 0 0 10px 0; color: #1a202c;">Packing List</h4>
                        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">What to bring</p>
                        <button style="background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Manage Packing
                        </button>
                    </div>
                </div>
                <div style="text-align: center; padding: 40px 20px; color: #718096;">
                    <i class="material-icons" style="font-size: 48px; margin-bottom: 15px; color: #9ca3af;">history</i>
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #4a5568;">No recent activity yet</p>
                    <p style="margin: 0; font-size: 14px;">Create your first trip to get started!</p>
                </div>
            </div>
        </div>
    `;
    
    // Add back button event listener
    document.getElementById('trip-back-btn').addEventListener('click', function() {
        console.log('Trip back button clicked');
        const user = JSON.parse(localStorage.getItem('gotogether_user'));
        showDashboard(user);
    });
    
    // Add manage activities button event listener
    document.getElementById('manage-activities-btn').addEventListener('click', function() {
        console.log('Manage activities clicked');
        showActivityManager(trip.id);
    });
};

// Share trip function
window.shareTrip = function(inviteCode) {
    navigator.clipboard.writeText(inviteCode).then(() => {
        alert('Invite code copied to clipboard!');
    }).catch(() => {
        prompt('Copy this invite code:', inviteCode);
    });
};

window.browseTrips = function() {
    alert('Browse public trips feature coming soon!');
};

// Global variable to store selected place data
let selectedPlaceData = null;

// Initialize Google Places Autocomplete
function initializeLocationAutocomplete() {
    const locationInput = document.getElementById('location-input');
    if (!locationInput || !window.google) return;
    
    const autocomplete = new google.maps.places.Autocomplete(locationInput, {
        types: ['establishment', 'geocode'],
        fields: ['place_id', 'formatted_address', 'name', 'geometry', 'photos']
    });
    
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            console.log('No geometry found for place');
            return;
        }
        
        // Store the selected place data globally
        selectedPlaceData = {
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            photos: place.photos ? place.photos.slice(0, 1) : null
        };
        
        console.log('Selected place:', selectedPlaceData);
    });
}

// Generate Google Static Maps URL
function generateMapThumbnail(lat, lng, width = 300, height = 200) {
    const apiKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=13&size=${width}x${height}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
}

// Show activity manager
window.showActivityManager = function(tripId) {
    const trips = JSON.parse(localStorage.getItem('gotogether_trips') || '[]');
    const trip = trips.find(t => t.id === tripId);
    const user = JSON.parse(localStorage.getItem('gotogether_user'));
    
    if (!trip) {
        alert('Trip not found');
        return;
    }

    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div style="min-height: 100vh; background: #f8fafc; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 800px; margin: 0 auto;">
                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                    <button id="activities-back-btn"
                            style="background: #e5e7eb; border: none; padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <i class="material-icons" style="font-size: 20px;">arrow_back</i>
                    </button>
                    <div>
                        <h1 style="margin: 0; font-size: 24px; color: #1a202c;">Manage Activities</h1>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">${trip.name}</p>
                    </div>
                </div>

                <!-- Add Activity Form -->
                <div style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
                    <h3 style="margin: 0 0 20px 0; color: #1a202c; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        <i class="material-icons" style="color: #10b981;">add_circle</i>
                        Add New Activity
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">Activity Name</label>
                            <input type="text" id="activity-input" placeholder="e.g., Hiking to Yosemite Falls"
                                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                                   onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#e5e7eb'">
                        </div>
                        <button id="add-activity-btn"
                                style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="material-icons" style="font-size: 18px;">add</i>
                            Add Activity
                        </button>
                    </div>
                </div>

                <!-- Activities List -->
                <div style="background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 20px 0; color: #1a202c; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        <i class="material-icons" style="color: #10b981;">local_activity</i>
                        Trip Activities (${trip.activities ? trip.activities.length : 0})
                    </h3>
                    
                    <div id="activities-list">
                        ${trip.activities && trip.activities.length > 0 ? 
                            trip.activities.map((activity, index) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: #f9fafb; border-radius: 12px; margin-bottom: 10px; border-left: 4px solid #10b981;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #1a202c; margin-bottom: 4px;">${activity.name || activity}</div>
                                        <div style="font-size: 12px; color: #6b7280;">
                                            Added ${activity.createdAt ? formatDate(activity.createdAt) : 'recently'}
                                        </div>
                                    </div>
                                    <button onclick="deleteActivity(${tripId}, ${activity.id || index})" 
                                            style="background: #fee2e2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                                            onmouseover="this.style.backgroundColor='#fecaca'" onmouseout="this.style.backgroundColor='#fee2e2'">
                                        <i class="material-icons" style="font-size: 16px;">delete</i>
                                    </button>
                                </div>
                            `).join('') 
                        : `
                            <div style="text-align: center; padding: 40px 20px; color: #6b7280;">
                                <i class="material-icons" style="font-size: 48px; margin-bottom: 15px; color: #9ca3af;">event_available</i>
                                <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #4a5568;">No activities yet</h4>
                                <p style="margin: 0; font-size: 14px;">Add some activities to make your trip more exciting!</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('activities-back-btn').addEventListener('click', function() {
        viewTrip(tripId);
    });
    
    document.getElementById('add-activity-btn').addEventListener('click', function() {
        console.log('Add activity button clicked');
        addActivity(tripId);
    });
    
    // Allow Enter key to add activity
    document.getElementById('activity-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addActivity(tripId);
        }
    });
};

// Add activity function
window.addActivity = function(tripId) {
    const input = document.getElementById('activity-input');
    if (!input) {
        return;
    }
    
    const activityName = input.value.trim();
    
    if (!activityName) {
        alert('Please enter an activity name');
        return;
    }
    
    // Add activity to trip using the inline TripStorage
    const trips = JSON.parse(localStorage.getItem('gotogether_trips') || '[]');
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) {
        alert('Trip not found');
        return;
    }
    
    const trip = trips[tripIndex];
    if (!trip.activities) {
        trip.activities = [];
    }
    
    const newActivity = {
        id: Date.now(),
        name: activityName,
        createdBy: JSON.parse(localStorage.getItem('gotogether_user')).id,
        createdAt: new Date().toISOString()
    };
    
    trip.activities.push(newActivity);
    trip.updatedAt = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('gotogether_trips', JSON.stringify(trips));
    
    // Clear input and refresh the activity manager
    input.value = '';
    showActivityManager(tripId);
};

// Delete activity function
window.deleteActivity = function(tripId, activityId) {
    if (confirm('Are you sure you want to delete this activity?')) {
        console.log('Deleting activity:', activityId, 'from trip:', tripId);
        
        const success = TripStorage.deleteActivity(tripId, activityId);
        
        if (success) {
            showActivityManager(tripId);
        } else {
            alert('Failed to delete activity. Please try again.');
        }
    }
};
