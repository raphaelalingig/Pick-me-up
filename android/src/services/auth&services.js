import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "./api_url";

const userService = {
  login: async (user_name, password) => {
    const response = await axios.post(API_URL + "loginMob", {
      user_name,
      password,
    });
    return response.data;
  },

  logout: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(API_URL + 'logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },

  signup: async (userData) => {
    try {
      await axios.post(API_URL + 'signup', userData);
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
  },
}

export default userService;