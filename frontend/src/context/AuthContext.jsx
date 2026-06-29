import React, { createContext, useState, useEffect } from 'react';
import { login, register, getMe } from '../services/authAPI';
import { updateStudentProfile } from '../services/studentAPI';
import { updateCompanyProfile } from '../services/companyAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getMe(token);
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user profile, logging out:', error);
          logoutUser();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      // Load full user details including profile
      const fullUser = await getMe(data.token);
      setUser(fullUser);
      return fullUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const data = await register(userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);

      const fullUser = await getMe(data.token);
      setUser(fullUser);
      return fullUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setLoading(false);
  };

  const updateUserProfile = async (profileData) => {
    if (!token || !user) return;
    try {
      let updatedProfile;
      if (user.role === 'student') {
        updatedProfile = await updateStudentProfile(profileData, token);
      } else if (user.role === 'company') {
        updatedProfile = await updateCompanyProfile(profileData, token);
      }
      
      setUser(prev => ({
        ...prev,
        profile: updatedProfile
      }));
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update user profile details:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
