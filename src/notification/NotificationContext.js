// NotificationContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import Pusher from 'pusher-js/react-native';
// import { NotificationModal } from './NotificationModal';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, user_id }) => {
    const [notification, setNotification] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [matchData, setMatchData] = useState(null);
    const [showMatchModal, setShowMatchModal] = useState(false);
  
    useEffect(() => {
      const pusher = new Pusher('1b95c94058a5463b0b08', {
        cluster: 'ap1',
      });
  
      const channel = pusher.subscribe('notifications');
  
      channel.bind('NEW_NOTIFICATION', (data) => {
        if (data.user_id === user_id) {
          if (data.type === 'RIDE_MATCHED') {
            // Show match modal for ride matches
            setMatchData(data);
            setShowMatchModal(true);
          } else {
            // Show regular notification for other notifications
            setNotification(data);
            setIsVisible(true);
          }
        }
      });
  
      return () => {
        pusher.unsubscribe('notifications');
      };
    }, [user_id]);
  
    return (
      <NotificationContext.Provider 
        value={{ 
          notification, 
          isVisible, 
          setIsVisible,
          matchData,
          showMatchModal,
          setShowMatchModal
        }}
      >
        {children}
        {/* Regular Notification Modal */}
        {/* <NotificationModal allowedScreens={['Home', 'Profile', 'Settings']} /> */}
        
        {/* Match Modal */}
        {/* <MatchModal 
          isVisible={showMatchModal}
          matchData={matchData}
          onClose={() => setShowMatchModal(false)}
        /> */}
      </NotificationContext.Provider>
    );
  };