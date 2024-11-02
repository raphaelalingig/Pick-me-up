import Pusher from 'pusher-js/dist/web/pusher';

const pusher = new Pusher('1b95c94058a5463b0b08', {
  cluster: 'ap1',
  encrypted: true
});
    // apiKey: "1b95c94058a5463b0b08",
    //   cluster: "ap1"
export default pusher;