import { useContext, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { isAuthenticated, setIsAuthenticated, userRole, setUserRole, userStatus, setUserStatus, loading } = context;

  const login = useCallback(async (token, role, user_id, status) => { 
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role.toString());
      await AsyncStorage.setItem("status", status ? status.toString() : "");
      if (user_id !== undefined && user_id !== null) {
        await AsyncStorage.setItem("user_id", user_id.toString());  // Store the user_id if it exists
      }
      setIsAuthenticated(true);
      setUserRole(parseInt(role));
      setUserStatus(status);
      console.log('Login successful:', { isAuthenticated: true, userRole: parseInt(role), user_id, status });
    } catch (error) {
      console.error("Error during login:", error);
    }
  }, [setIsAuthenticated, setUserRole, setUserStatus]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("user_id");
      await AsyncStorage.removeItem("status");
      setIsAuthenticated(false);
      setUserRole(null);
      setUserStatus(null);
      console.log('Logout successful');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [setIsAuthenticated, setUserRole, setUserStatus]);

  return {
    isAuthenticated,
    userRole,
    userStatus,
    login,
    logout,
    loading
  };
};