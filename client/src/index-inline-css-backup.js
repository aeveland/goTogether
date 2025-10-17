console.log('Go Together app starting');

// Simple user storage for client-side auth
const UserStorage = {
    getUsers: function() {
        return JSON.parse(localStorage.getItem('gotogether_users') || '[]');
    },
    
    saveUser: function(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('gotogether_users', JSON.stringify(users));
    },
    
    findUser: function(email, password) {
        const users = this.getUsers();
        return users.find(u => u.email === email && u.password === password);
    },
    
    userExists: function(email) {
        const users = this.getUsers();
        return users.some(u => u.email === email);
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
                            <button onclick="createTrip()" 
                                    style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; border: none; padding: 18px; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(72,187,120,0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <span style="font-size: 20px;">🏕️</span>
                                Create New Trip
                            </button>
                            <button onclick="joinTrip()" 
                                    style="background: linear-gradient(135deg, #4299e1, #3182ce); color: white; border: none; padding: 18px; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(66,153,225,0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <span style="font-size: 20px;">🤝</span>
                                Join Existing Trip
                            </button>
                            <button onclick="browseTrips()" 
                                    style="background: linear-gradient(135deg, #9f7aea, #805ad5); color: white; border: none; padding: 18px; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(159,122,234,0.3)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                                <span style="font-size: 20px;">🔍</span>
                                Browse Public Trips
                            </button>
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <h2 style="margin: 0 0 25px 0; color: #1a202c; font-size: 20px; font-weight: 600;">Recent Activity</h2>
                        <div style="text-align: center; padding: 40px 20px; color: #718096;">
                            <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #4a5568;">No recent activity</p>
                            <p style="margin: 0; font-size: 14px;">Create your first trip to get started!</p>
                        </div>
                    </div>
                </div>
                
                <!-- Your Trips -->
                <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h2 style="margin: 0; color: #1a202c; font-size: 20px; font-weight: 600;">Your Trips</h2>
                        <span style="background: #bee3f8; color: #2b6cb0; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            0 trips
                        </span>
                    </div>
                    <div id="trips-container" style="text-align: center; padding: 60px 20px; color: #718096;">
                        <div style="font-size: 64px; margin-bottom: 20px;">🎒</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #4a5568;">No trips yet</h3>
                        <p style="margin: 0 0 25px 0; font-size: 14px;">Create your first trip to start planning your adventure!</p>
                        <button onclick="createTrip()" 
                                style="background: linear-gradient(135deg, #1976d2, #1565c0); color: white; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(25,118,210,0.3)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
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
        alert('Joining trip with code: ' + tripCode.trim() + '\nFull trip joining features coming soon.');
    }
};

window.browseTrips = function() {
    alert('Browse public trips feature coming soon!');
};
