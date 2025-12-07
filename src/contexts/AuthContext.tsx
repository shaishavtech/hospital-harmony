import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - In production, this would be validated against the PHP backend
const MOCK_USERS: User[] = [
  {
    user_id: 1,
    username: 'admin',
    password_hash: 'admin123', // In production, use proper hashing
    role: 'ADMIN',
    is_active: true,
    created_at_ist: '2024-01-01 09:00:00',
    last_login_at_ist: null,
  },
  {
    user_id: 2,
    username: 'receptionist',
    password_hash: 'reception123',
    role: 'RECEPTIONIST',
    is_active: true,
    created_at_ist: '2024-01-01 09:00:00',
    last_login_at_ist: null,
  },
  {
    user_id: 3,
    username: 'doctor',
    password_hash: 'doctor123',
    role: 'DOCTOR',
    is_active: true,
    created_at_ist: '2024-01-01 09:00:00',
    last_login_at_ist: null,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('hospital_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('hospital_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would be a fetch call to your PHP backend
    // POST /api/auth/login with username and password
    const foundUser = MOCK_USERS.find(
      u => u.username === username && u.password_hash === password && u.is_active
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser, password_hash: '' };
      setUser(userWithoutPassword);
      localStorage.setItem('hospital_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }

    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hospital_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
