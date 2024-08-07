import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");
        console.log("Retrieved token:", token); // Debug log
        console.log("Retrieved role:", role); // Debug log
        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(parseInt(role));
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
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole, setUserRole, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};