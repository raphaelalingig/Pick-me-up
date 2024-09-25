import { useContext, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { isAuthenticated, setIsAuthenticated, userRole, setUserRole, loading } = context;

  const login = useCallback(async (token, role, user_id) => {  // Add userId as a parameter
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role.toString());
      if (user_id !== undefined && user_id !== null) {
        await AsyncStorage.setItem("user_id", user_id.toString());  // Store the user_id if it exists
      }
      setIsAuthenticated(true);
      setUserRole(parseInt(role));
      console.log('Login successful:', { isAuthenticated: true, userRole: parseInt(role), user_id });
    } catch (error) {
      console.error("Error during login:", error);
    }
  }, [setIsAuthenticated, setUserRole]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("user_id");  // Ensure user_id is removed
      setIsAuthenticated(false);
      setUserRole(null);
      console.log('Logout successful');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [setIsAuthenticated, setUserRole]);

  return {
    isAuthenticated,
    userRole,
    login,
    logout,
    loading
  };
};
