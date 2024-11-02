import {
    Pusher,
  } from '@pusher/pusher-websocket-react-native';
  
  const pusher = Pusher.getInstance();
  
  (async () => {
    await pusher.init({
      apiKey: "1b95c94058a5463b0b08",
      cluster: "ap1"
    });
      
    await pusher.connect();
    await pusher.subscribe({
      channelName: "my-channel", 
      onEvent: (event) => {
        console.log(`Event received: ${event}`);
      }
    });
  })();
  