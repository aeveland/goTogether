// Simple user storage for client-side auth
export const UserStorage = {
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
