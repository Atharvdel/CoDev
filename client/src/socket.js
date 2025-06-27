import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    'force new connection': true,
    reconnectionAttempts: 'Infinity',
    timeout: 20000,
    transports: ['websocket'],
  };

  // Use environment variable for backend URL
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  
  return io(serverUrl, options);
};
