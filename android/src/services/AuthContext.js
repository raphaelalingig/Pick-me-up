// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");
        const status = await AsyncStorage.getItem("status");
        const user_id = await AsyncStorage.getItem("user_id");
        console.log("Retrieved token:", token);
        console.log("Retrieved role:", role);
        console.log("Retrieved status:", status);
        console.log("Retrieved id:", userId);
        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(parseInt(role));
          setUserStatus(status);
          setToken(token);
          setUserId(user_id);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
  
    checkAuthState();
  }, []);
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      userRole, 
      setUserRole, 
      userId,
      setUserId,
      userStatus, 
      setUserStatus, 
      loading, 
      setLoading,
      token, 
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};