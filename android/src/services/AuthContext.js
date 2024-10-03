// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");
        const status = await AsyncStorage.getItem("status");
        console.log("Retrieved token:", token);
        console.log("Retrieved role:", role);
        console.log("Retrieved status:", status);
        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(parseInt(role));
          setUserStatus(status);
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
      userStatus, 
      setUserStatus, 
      loading, 
      setLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};