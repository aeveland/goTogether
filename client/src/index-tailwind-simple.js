console.log('Go Together app starting with Tailwind CSS');

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

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('gotogether_user');
    if (currentUser) {
        showDashboard(JSON.parse(currentUser));
        return;
    }
    
    // Show auth form
    showAuthForm();
});

function showAuthForm() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <h1 class="text-3xl font-bold text-blue-600 mb-2">Go Together</h1>
                        <p class="text-gray-600">
                            ${isLoginMode 
                                ? 'Sign in to plan your next adventure' 
                                : 'Create an account to start planning trips'
                            }
                        </p>
                    </div>
                    
                    <div id="error-message" class="hidden mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>
                    
                    <form id="auth-form" class="space-y-4">
                        ${!isLoginMode ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input type="text" name="name" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                            </div>
                        ` : ''}
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" name="password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                            ${!isLoginMode ? '<p class="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>' : ''}
                        </div>
                        
                        ${!isLoginMode ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input type="password" name="confirmPassword" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                            </div>
                        ` : ''}
                        
                        <button type="submit" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            ${isLoginMode ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                    
                    <div class="text-center mt-6">
                        <p class="text-gray-600 text-sm">
                            ${isLoginMode ? "Don't have an account?" : "Already have an account?"}
                            <button onclick="toggleAuthMode()" class="text-blue-600 hover:text-blue-700 font-medium ml-1">
                                ${isLoginMode ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
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
        showError('Invalid email or password');
    }
}

function handleRegister(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (UserStorage.userExists(email)) {
        showError('User with this email already exists');
        return;
    }
    
    const user = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        created_at: new Date().toISOString()
    };
    
    UserStorage.saveUser(user);
    localStorage.setItem('gotogether_user', JSON.stringify(user));
    localStorage.setItem('gotogether_token', 'client-token-' + Date.now());
    showDashboard(user);
}

function showDashboard(user) {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-4">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span class="text-white font-semibold text-lg">${user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">Go Together</h1>
                                <p class="text-gray-600">Welcome back, ${user.name}!</p>
                            </div>
                        </div>
                        <button onclick="logout()" 
                                class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                        <div class="space-y-4">
                            <button onclick="createTrip()" 
                                    class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                                <span class="text-xl">🏕️</span>
                                <span>Create New Trip</span>
                            </button>
                            <button onclick="joinTrip()" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                                <span class="text-xl">🤝</span>
                                <span>Join Existing Trip</span>
                            </button>
                            <button onclick="browseTrips()" 
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                                <span class="text-xl">🔍</span>
                                <span>Browse Public Trips</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                        <div class="text-center py-12 text-gray-500">
                            <div class="text-4xl mb-4">📋</div>
                            <p class="text-lg font-medium mb-2">No recent activity</p>
                            <p class="text-sm">Create your first trip to get started!</p>
                        </div>
                    </div>
                </div>
                
                <!-- Your Trips -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-900">Your Trips</h2>
                        <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            0 trips
                        </span>
                    </div>
                    <div id="trips-container" class="text-center py-16 text-gray-500">
                        <div class="text-6xl mb-6">🎒</div>
                        <h3 class="text-xl font-semibold mb-2">No trips yet</h3>
                        <p class="text-gray-600 mb-6">Create your first trip to start planning your adventure!</p>
                        <button onclick="createTrip()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            Create Your First Trip
                        </button>
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

window.createTrip = function() {
    const tripName = prompt('Enter a name for your new trip:');
    if (tripName && tripName.trim()) {
        alert('Trip "' + tripName.trim() + '" created! Full trip management features coming soon.');
    }
};

window.joinTrip = function() {
    const tripCode = prompt('Enter the trip invitation code:');
    if (tripCode && tripCode.trim()) {
        alert('Joining trip with code: ' + tripCode.trim() + '\\nFull trip joining features coming soon.');
    }
};

window.browseTrips = function() {
    alert('Browse public trips feature coming soon!');
};

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function clearError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}
