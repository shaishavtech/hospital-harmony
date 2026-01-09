import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbUser } from '@/hooks/useDatabase';

interface AuthContextType {
  user: DbUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
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
    try {
      // Query the users table directly
      const { data: foundUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('is_active', 1)
        .maybeSingle();

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An error occurred during login' };
      }

      if (foundUser) {
        // Update last login time
        await supabase
          .from('users')
          .update({ last_login_at_ist: new Date().toISOString() })
          .eq('user_id', foundUser.user_id);

        // Store user without password hash
        const userWithoutPassword = { ...foundUser, password_hash: '' };
        setUser(userWithoutPassword);
        localStorage.setItem('hospital_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      }

      return { success: false, error: 'Invalid username or password' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An error occurred during login' };
    }
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
