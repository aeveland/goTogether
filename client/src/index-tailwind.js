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
    
    app.innerHTML = '<div style="max-width: 400px; margin: 50px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: Arial;"><h1 style="color: #1976d2; text-align: center;">' + (isLoginMode ? 'Login' : 'Create Account') + '</h1><form id="auth-form">' + (isLoginMode ? '' : '<div style="margin-bottom: 15px;"><label>Full Name:</label><input type="text" name="name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div>') + '<div style="margin-bottom: 15px;"><label>Email:</label><input type="email" name="email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div><div style="margin-bottom: 15px;"><label>Password:</label><input type="password" name="password" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div>' + (isLoginMode ? '' : '<div style="margin-bottom: 15px;"><label>Confirm Password:</label><input type="password" name="confirmPassword" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"></div>') + '<button type="submit" style="width: 100%; padding: 15px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">' + (isLoginMode ? 'Login' : 'Create Account') + '</button></form><div style="text-align: center; margin-top: 15px;"><button onclick="toggleAuthMode()" style="background: none; border: none; color: #1976d2; cursor: pointer; text-decoration: underline;">' + (isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Login') + '</button></div><div id="result"></div></div>';
    
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
    
    app.innerHTML = '<div style="padding: 40px; font-family: Arial;"><div style="background: #1976d2; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;"><div><h1 style="margin: 0; font-size: 28px;">Go Together</h1><p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome back, ' + user.name + '!</p></div><div><button onclick="logout()" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Logout</button></div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;"><div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h2 style="margin: 0 0 20px 0; color: #333;">Quick Actions</h2><div style="display: flex; flex-direction: column; gap: 15px;"><button onclick="createTrip()" style="background: #4caf50; color: white; border: none; padding: 15px; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold;">🏕️ Create New Trip</button><button onclick="joinTrip()" style="background: #2196f3; color: white; border: none; padding: 15px; border-radius: 4px; font-size: 16px; cursor: pointer; font-weight: bold;">🤝 Join Existing Trip</button></div></div><div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h2 style="margin: 0 0 20px 0; color: #333;">Your Trips</h2><div id="trips-container"><div style="text-align: center; padding: 40px; color: #666;"><h3 style="margin: 0 0 10px 0;">No trips yet</h3><p style="margin: 0;">Create your first trip to start planning!</p></div></div></div></div></div>';
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
        
