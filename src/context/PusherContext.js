import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Pusher from 'pusher-js/react-native';
import { Alert } from 'react-native';
import Toast from "react-native-root-toast";
import { useAuth } from '../services/useAuth';

// Create the context
const PusherContext = createContext({
  availableRides: [],
  applyRide: null,
  showApplyModal: false,
  showMatchModal: false,
  matchDetails: null,
  setAvailableRides: () => {},
  setApplyRide: () => {},
  setShowApplyModal: () => {},
  setShowMatchModal: () => {},
  setMatchDetails: () => {},
  handleBookedMatch: () => {},
});

// Provider component
export const PusherProvider = ({ children, handleBookedMatch  }) => {
  const [pusher, setPusher] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [applyRide, setApplyRide] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  
  const { userId, token, checkToken } = useAuth();

  // Setup Pusher connection
  const setupPusherConnection = useCallback(() => {
    if (!userId) return;

    // Disconnect existing connection if any
    if (pusher) {
      pusher.disconnect();
    }

    // Create new Pusher instance
    console.log("PUSHER TOKEN:", token)
    const newPusher = new Pusher('1b95c94058a5463b0b08', {
      cluster: 'ap1',
      encrypted: true,
      authEndpoint: '/api/broadcasting/auth', // Add your auth endpoint
      auth: {
        headers: {
          // Add your authentication headers here
          Authorization: `Bearer ${token}`,
        },
      },
    });
    setPusher(newPusher);

    // Subscribe to channels
    const userChannel = newPusher.subscribe('logout');
    const ridesChannel = newPusher.subscribe('rides');
    const appliedChannel = newPusher.subscribe('application');
    const bookedChannel = newPusher.subscribe('booked');

    // Event handlers
    userChannel.bind('LOGOUT', (data) => {
      console.log("LOGOUT????:  ",data)
      if (data.userId === userId) {
        Toast.show("Logging out. Account logged in on another device.", {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          backgroundColor: "red",
          textColor: "#fff",
        });
        checkToken();
      }
    });

    ridesChannel.bind('RIDES_UPDATE', (data) => {
      if (data && Array.isArray(data.rides)) {
        const sortedRides = data.rides.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAvailableRides(sortedRides);
      }
    });

    appliedChannel.bind('RIDES_APPLY', (data) => {
      if (data && data.applicationData && data.applicationData.length > 0) {
        const apply = data.applicationData[0];
        if (apply.apply_to === userId) {
          if (!showApplyModal) {
            setApplyRide(apply);
            setShowApplyModal(true);
          }
        }
      }
    });

    // bookedChannel.bind("BOOKED", (data) => {
    //   if (data.ride.applier === userId || data.ride.apply_to === userId) {
    //     Alert.alert(
    //       "Ride Match", 
    //       "You have found a Match!", 
    //       [
    //         {
    //           text: "OK",
    //           onPress: () => navigate("Home")
    //         }
    //       ]
    //     );
    //   }
    // });

    bookedChannel.bind("BOOKED", (data) => {
      if (data.ride.apply_to === userId) {
        // Instead of handling navigation directly, emit the event
      }
    });

    // Cleanup function
    return () => {
      userChannel.unbind_all();
      ridesChannel.unbind_all();
      appliedChannel.unbind_all();
      bookedChannel.unbind_all();
      newPusher.unsubscribe('logout');
      newPusher.unsubscribe('rides');
      newPusher.unsubscribe('application');
      // newPusher.unsubscribe('booked');
      newPusher.disconnect();
    };
  }, [userId, checkToken]);

  // Setup Pusher when userId changes
  useEffect(() => {
    const cleanup = setupPusherConnection();
    
    // Return cleanup function
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [setupPusherConnection]);

  // Context value
  const contextValue = {
    availableRides,
    applyRide,
    showApplyModal,
    showMatchModal,
    matchDetails,
    setAvailableRides,
    setApplyRide,
    setShowApplyModal,
    setShowMatchModal,
    setMatchDetails,
    handleBookedMatch
  };

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
};

// Custom hook to use Pusher context
export const usePusher = () => {
  const context = useContext(PusherContext);
  
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  
  return context;
};