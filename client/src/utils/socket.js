// socket.js (Singleton Pattern for Socket Connection)
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false, // Prevent auto connection; we control it manually
});

export default socket;