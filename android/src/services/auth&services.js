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

  getUserId: async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      console.log("Retrieved user_id:", userId); // Debug log
      return userId;
    } catch (error) {
      console.error("Error retrieving user_id:", error);
      return null;
    }
  },

  // getRiderId: async () => {
  //   try {
  //     const riderId = await AsyncStorage.getItem("user_id");
  //     console.log("Retrieved user_id:", userId); // Debug log
  //     return riderId;
  //   } catch (error) {
  //     console.error("Error retrieving user_id:", error);
  //     return null;
  //   }
  // },

  requestOtp: async (userData) => {
    try {
      await axios.post(API_URL + 'send-otp', userData);
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
  },

  verifyOtp: async (data) => {
    try {
      await axios.post(API_URL + 'verify-otp');
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
  },


  upload: async ()=> {
    try {
      const response = await axios.post(API_URL + 'upload', {
      });
      const data = await response.json();
      if (data.success) {
        console.log("Upload successful!");
      } else {
        console.error("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  },
    



  book: async (bookDetails) => {
    try {
      const response = await axios.post(API_URL + 'book', bookDetails);
      return response.data;
    } catch (error) {
        console.error('Booking Failed:', error);
        throw error;
    }
  },

  checkActiveBook: async () => {
    try {
      const userId = await userService.getUserId();
      if (!userId) {
        console.error("User ID not found");
        return false;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return false;
      }

      const response = await axios.get(`${API_URL}check-existing-booking/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error checking existing ride:", error);
      return false;
    }
  },

  checkActiveRide: async () => {
    try {
      const userId = await userService.getUserId();
      if (!userId) {
        console.error("User ID not found");
        return false;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return false;
      }

      const response = await axios.get(`${API_URL}check-active-ride/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error checking existing ride:", error);
      return false;
    }
  },
  
  cancel_ride: async (ride_id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}cancel_ride/${ride_id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;  // Return the response here
    } catch (error) {
      console.error("Error canceling ride:", error);
      throw error;
    }
  },


  getHistory: async () => {
    try {
      const userId = await userService.getUserId();
      if (!userId) {
        console.error("User ID not found");
        return false;
      }
      const response = await axios.get(API_URL + 'history/' + userId);
      return response;
    } catch (error) {
      console.error("Error fetching available rides:", error);
      throw error;
    }
  },


  getAvailableRides: async () => {
    try {
      const response = await axios.get(API_URL + 'available-rides');
      return response;
    } catch (error) {
      console.error("Error fetching available rides:", error);
      throw error;
    }
  },

  accept_ride: async (ride_id) => { 
    const userId = await userService.getUserId();
    if (!userId) {
      console.error("User ID not found");
      return false;
    }
  
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error("Token not found");
      return false;
    }
  
    try {
      // Ensure the key in the request body matches what the backend expects
      const response = await axios.put(`${API_URL}accept_ride/${ride_id}`, { user_id: userId });
      return response;
    } catch (error) {
      console.error("Error accepting ride:", error);
      throw error;
    }
  },


}

export default userService;