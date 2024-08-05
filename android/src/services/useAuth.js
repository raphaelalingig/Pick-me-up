import { useContext, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { isAuthenticated, setIsAuthenticated, userRole, setUserRole, loading } = context;

  const login = useCallback(async (token, role) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role.toString());
      setIsAuthenticated(true);
      setUserRole(parseInt(role));
    } catch (error) {
      console.error("Error during login:", error);
    }
  }, [setIsAuthenticated, setUserRole]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      setIsAuthenticated(false);
      setUserRole(null);
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