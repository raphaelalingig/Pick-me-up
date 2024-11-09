// src/hooks/usePusher.js
import { useEffect, useMemo } from 'react';
import Pusher from 'pusher-js/react-native';
import API_URL from './api_url';
import { useAuth } from './useAuth';

const usePusher = () => {
  const { token } = useAuth();

  const pusher = useMemo(() => {
    if (!token) return null;

    return new Pusher('1b95c94058a5463b0b08', {
      cluster: 'ap1',
      forceTLS: true,
      encrypted: true,
      authEndpoint: `${API_URL}broadcasting/auth`,
      auth: {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      },
    });
  }, [token]);

  useEffect(() => {
    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [pusher]);

  return pusher;
};

export default usePusher;
