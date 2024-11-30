import { useContext, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from "./AuthContext";
import userService from "./auth&services";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const {
    isAuthenticated,
    setIsAuthenticated,
    userRole,
    setUserRole,
    userStatus,
    setUserStatus,
    token,
    setToken,
    userId,
    setUserId,
    loading,
    setLoading,
  } = context;

  // Login function
  const login = useCallback(
    async (token, role, user_id, status) => {
      try {
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", role.toString());
        await AsyncStorage.setItem("status", status ? status.toString() : "");
        if (user_id !== undefined && user_id !== null) {
          await AsyncStorage.setItem("user_id", user_id.toString());
        }
        setIsAuthenticated(true);
        setUserRole(parseInt(role, 10));
        setUserStatus(status);
        setToken(token);
        setUserId(user_id);
        console.log("Login successful:", {
          isAuthenticated: true,
          userRole: parseInt(role, 10),
          user_id,
          status,
        });
      } catch (error) {
        console.error("Error during login:", error);
      }
    },
    [setIsAuthenticated, setUserRole, setUserStatus, setToken, setUserId]
  );

  // Logout function 
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.clear(); // Clear all authentication-related items
      setIsAuthenticated(false);
      setUserRole(null);
      setUserStatus(null);
      setToken(null);
      setUserId(null);
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [setIsAuthenticated, setUserRole, setUserStatus, setToken, setUserId]);

  // Token validation function
  const checkToken = useCallback(async () => {
    setLoading(true); // Show loading state while checking token
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        console.log("No token found, user not authenticated");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
  
      // Call the backend API to validate the token
      const response = await userService.checkToken(storedToken);
  
      if (response && response.status === 200) {
        console.log("Token is valid, user authenticated");
  
        // Extract user data directly from the response
        const { role, status, user_id } = response.data;
  
        setIsAuthenticated(true);
        setUserRole(role);
        setUserId(user_id);
        setUserStatus(status);
        setToken(storedToken); // Use the token directly from the backend
      } else {
        console.log("Invalid or expired token");
        await logout();
      }
    } catch (error) {
      console.error("Error during token validation:", error);
      await logout();
    } finally {
      setLoading(false); // Remove loading state
    }
  }, [logout, setIsAuthenticated, setLoading, setUserRole, setUserId, setUserStatus, setToken]);

  // // Automatically check token when the app loads
  // useEffect(() => {
  //   checkToken();
  // }, [checkToken]);

  return {
    isAuthenticated,
    userRole,
    userStatus,
    userId,
    token,
    login,
    logout,
    checkToken,
    loading,
  };
};
