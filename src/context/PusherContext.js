import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Pusher from 'pusher-js/react-native';
import userService from '../services/auth&services';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const PusherContext = createContext(null);

export const usePusher = () => useContext(PusherContext);


export const PusherProvider = ({ children, userId }) => {
  const [pusher, setPusher] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [applyRide, setApplyRide] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  const [user_id, setUserId] = useState();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await userService.getUserId();
        const id = parseInt(response, 10);
        console.log("PUSHER IDDDD user_id:", id);
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    // Initialize Pusher
    const newPusher = new Pusher('1b95c94058a5463b0b08', {
      cluster: 'ap1',
      encrypted: true,
    });
    setPusher(newPusher);

    const setupPusher = async () => {
      try {
        const ridesChannel = newPusher.subscribe('rides');
        const appliedChannel = newPusher.subscribe('application');
        const bookedChannel = newPusher.subscribe('booked');

        ridesChannel.bind('RIDES_UPDATE', (data) => {
          if (data && Array.isArray(data.rides)) {
            const sortedRides = data.rides.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            console.log("PUSHER CONTEXT RIDES")
            setAvailableRides(sortedRides);
          }
        });

        appliedChannel.bind('RIDES_APPLY', (data) => {
          if (data && data.applicationData && data.applicationData.length > 0) {
            const apply = data.applicationData[0];
            if (apply.apply_to === user_id) {
              if (!showApplyModal) {
                setApplyRide(apply);
                setShowApplyModal(true);
              }
            }
          }
        });

        bookedChannel.bind('BOOKED', (data) => {
          console.log("Received booked event data:", data);
          console.log("Current user_id:", user_id);
          if (data.ride.applier === user_id) {
            console.log("PUSHER CONTEXT MATCHED");
            setMatchDetails(data.ride);
            setShowMatchModal(true);
          }
        });

        return () => {
          ridesChannel.unbind_all();
          appliedChannel.unbind_all();
          bookedChannel.unbind_all();
          newPusher.unsubscribe('rides');
          newPusher.unsubscribe('application');
          newPusher.unsubscribe('booked');
        };
      } catch (error) {
        console.error('Error setting up Pusher:', error);
      }
    };

    setupPusher();

    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [user_id]);

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchDetails(null);
  };

  return (
    <PusherContext.Provider
      value={{
        availableRides,
        applyRide,
        setApplyRide,
        showApplyModal,
        setShowApplyModal,
        showMatchModal,
        setShowMatchModal,
        matchDetails, 
        setMatchDetails,
      }}
    >
      {children}
    </PusherContext.Provider>
  );
};