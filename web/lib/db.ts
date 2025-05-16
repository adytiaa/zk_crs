// lib/db.ts
// A simple in-memory database for demo purposes
// In a real application, use a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

// Global store for users
export const users = new Map<string, User>();

export const db = {
  // User operations
  getUser: (walletAddress: string): User | undefined => {
    return users.get(walletAddress);
  },
  
  createUser: (walletAddress: string): User => {
    const user: User = {
      id: Date.now().toString(), // Use a proper UUID in production
      walletAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(walletAddress, user);
    return user;
  },
  
  getUserOrCreate: (walletAddress: string): User => {
    let user = users.get(walletAddress);
    if (!user) {
      user = db.createUser(walletAddress);
    }
    return user;
  },
  
  updateUser: (id: string, data: Partial<User>): User | undefined => {
    // Find user by ID
    let user: User | undefined;
    let walletAddress: string | undefined;
    
    for (const [addr, u] of users.entries()) {
      if (u.id === id) {
        user = u;
        walletAddress = addr;
        break;
      }
    }
    
    if (!user || !walletAddress) return undefined;
    
    // Update user data
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    
    users.set(walletAddress, updatedUser);
    return updatedUser;
  },
};

export default db; 