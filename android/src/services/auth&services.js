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
  getUserStatus: async () => {
    try {
      const userStatus = await AsyncStorage.getItem("status");
      console.log("Retrieved user_id:", userStatus); // Debug log
      return userStatus;
    } catch (error) {
      console.error("Error retrieving user_id:", error);
      return null;
    }
  },

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

  fetchRider: async () => {
    const user_id = await userService.getUserId();
    console.log(user_id)
    const response = await axios.get(API_URL + `riderId/${user_id}`);
    
    return response.data;
  },

  fetchCustomer: async () => {
    const response = await axios.get(API_URL + 'customer');
    return response.data;
  },


  upload: async (formData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await userService.getUserId();
      formData.append('user_id', userId); // Add rider_id to the form data
  
      const response = await axios.post(`${API_URL}upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Error uploading documents:", error.response.data || error.message);
      throw error;
    }
  },


  updateRiderInfo: async (textData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await userService.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const dataToSend = {
        ...textData,
        user_id: userId
      };
  
      console.log('Sending update request with data:', dataToSend);
  
      const response = await axios.post(`${API_URL}update-rider-info`, dataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Update rider info response:', response.data);
  
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", error.response.status, error.response.data);
        throw new Error(`Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error('No response from server');
      } else {
        console.error("Error updating rider info:", error.message);
        throw error;
      }
    }
  },
  

  getUploadedImages: async () => {
    try {
      const userId = await userService.getUserId();
      const response = await axios.get(API_URL + `requirement_photos/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching fucking uploaded images:", error);
      throw error;
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


  getCusHistory: async () => {
    try {
      const userId = await userService.getUserId();
      if (!userId) {
        console.error("User ID not found");
        return false;
      }
      const response = await axios.get(API_URL + 'cus_history/' + userId);
      return response;
    } catch (error) {
      console.error("Error fetching available rides:", error);
      throw error;
    }
  },

  getRiderHistory: async () => {
    try {
      const userId = await userService.getUserId();
      if (!userId) {
        console.error("User ID not found");
        return false;
      }
      const response = await axios.get(API_URL + 'rider_history/' + userId);
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

  set_riderLocation: async (ride_id) => { 
    try {
      // Ensure the key in the request body matches what the backend expects
      const response = await axios.put(`${API_URL}accept_ride/${ride_id}`, { user_id: userId });
      return response;
    } catch (error) {
      console.error("Error accepting ride:", error);
      throw error;
    }
  },

  start_ride: async (ride_id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}start_ride/${ride_id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;  // Return the response here
    } catch (error) {
      console.error("Error starting ride:", error);
      throw error;
    }
  },

  complete_ride: async (ride_id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}finish_ride/${ride_id}`, {}, {
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

  review_ride: async (ride_id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}complete_ride/${ride_id}`, {}, {
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

  saveBookLocation: async (rideDetails) => {
    return await axios.post(API_URL + 'book-location', rideDetails);
  },
  
  saveRiderLocation: async (rideDetails) => {
    console.log("Saving to URL:", API_URL + 'rider-location');
    return await axios.post(API_URL + 'rider-location', rideDetails);
  },

}

export default userService;