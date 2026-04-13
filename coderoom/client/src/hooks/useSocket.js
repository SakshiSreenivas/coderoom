import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
};

export default useSocket;