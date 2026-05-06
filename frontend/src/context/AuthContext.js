'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          if (data) setUser(data);
        } catch (error) {
          console.error("Failed to load user", error);
          Cookies.remove('token');
        }
      }
      setLoading(false);
    }
    loadUserFromCookies();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const { data } = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (data.access_token) {
      Cookies.set('token', data.access_token, { expires: 7 });
      const { data: user } = await api.get('/auth/me');
      setUser(user);
      router.push('/');
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data) {
      router.push('/login');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const { data } = await api.post(`/users/wishlist/toggle/${productId}`);
      setUser(data);
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, toggleWishlist, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
