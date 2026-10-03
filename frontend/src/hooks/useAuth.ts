import { useState, useEffect } from 'react';

interface User {
  email: string;
  id: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: ''
  });

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('cms_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          loading: false,
          error: ''
        });
      } catch {
        localStorage.removeItem('cms_user');
        setAuthState({
          user: null,
          loading: false,
          error: ''
        });
      }
    } else {
      setAuthState({
        user: null,
        loading: false,
        error: ''
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo credentials - replace with real authentication
      if (email === 'admin@example.com' && password === 'password123') {
        const user: User = {
          id: '1',
          email: email
        };
        
        localStorage.setItem('cms_user', JSON.stringify(user));
        setAuthState({
          user,
          loading: false,
          error: ''
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('cms_user');
    setAuthState({
      user: null,
      loading: false,
      error: ''
    });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout
  };
}