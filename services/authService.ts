import { User, UserRole } from "../types";

const STORAGE_KEY = "zotpot_users";

// Initialize default users if not present
export const initializeAuth = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaultUsers: User[] = [
      {
        username: "superadmin",
        password: "admin123",
        role: "admin",
      },
      {
        username: "user",
        password: "user123",
        role: "user",
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  }
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const authenticate = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Return user without password
    return { username: user.username, role: user.role };
  }
  return null;
};

export const createUser = (user: User): boolean => {
  const users = getUsers();
  if (users.find(u => u.username === user.username)) {
    return false; // User already exists
  }
  users.push(user);
  saveUsers(users);
  return true;
};

export const deleteUser = (username: string): boolean => {
  let users = getUsers();
  // Prevent deleting the last superadmin
  if (username === 'superadmin') return false;
  
  const initialLength = users.length;
  users = users.filter(u => u.username !== username);
  
  if (users.length !== initialLength) {
    saveUsers(users);
    return true;
  }
  return false;
};

// For Admin to force reset a password without knowing the old one
export const updateUserPassword = (username: string, newPassword: string): boolean => {
  let users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsers(users);
    return true;
  }
  return false;
};

// For Users to change their own password (requires old password)
export const verifyAndChangePassword = (username: string, oldPassword: string, newPassword: string): boolean => {
  let users = getUsers();
  const userIndex = users.findIndex(u => u.username === username && u.password === oldPassword);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsers(users);
    return true;
  }
  return false;
};