// socket.js (Singleton Pattern for Socket Connection)
import { io } from "socket.io-client";
const token = localStorage.getItem("access_token");  // Fetch token from localStorage

const socket = io(process.env.REACT_APP_SOCKET_URL, {
  auth: { token: token },
  transports: ["websocket"],
  autoConnect: false, // Prevent auto connection; we control it manually
});

export default socket;
