const app = require("./app");
const debug = require("debug")("debugger");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const messageController = require("./controllers/messageController");
const notificationController = require("./controllers/notificationController");
const authenticatedHandlers = require("./sockets/authenticatedHandlers");
const anonymousHandlers = require("./sockets/anonymousHandlers");
const chatroomRouter = require("./routes/chatroom");

const normalizePort = (val) => {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") throw error;
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
};

const onListening = () => {
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT);
app.set("port", port);

// Register the new /chatroom route
app.use("/chatroom", chatroomRouter);

const server = http.createServer(app);
const io = socketio(server);

server.on("error", onError);
server.on("listening", onListening);

let connectedUsers = [];

// Anonymous chatroom logic
const anonymousRooms = {}; // { [roomName]: { admin: { username, socketId }, users: [{ username, socketId }], pending: [{ username, socketId }] } }

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  let isAuthenticated = false;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user info to socket instance
      isAuthenticated = true;
      // Deduplicate by username to avoid stale socketIds for the same user
      const existingIndex = connectedUsers.findIndex(u => u.username === decoded.username);
      if (existingIndex !== -1) {
        connectedUsers.splice(existingIndex, 1);
      }
      connectedUsers.push({ socketId: socket.id, username: decoded.username });
    } catch (err) {
      console.log("Invalid token:", err.message);
      return socket.disconnect();
    }
  }

  // Authenticated events (only if token is present and valid)
  if (isAuthenticated) {
    authenticatedHandlers(io, socket, connectedUsers, messageController, notificationController);
  }

  // Anonymous chatroom events (always registered)
  anonymousHandlers(io, socket, anonymousRooms);

  // Cleanup on disconnect: remove this socket from connected users
  socket.on("disconnect", () => {
    if (socket.user?.username) {
      const idx = connectedUsers.findIndex(u => u.socketId === socket.id);
      if (idx !== -1) connectedUsers.splice(idx, 1);
    }
  });
});

server.listen(port, (error) => {
  error ? console.log("Something went wrong!") : console.log("Server is listening on port " + port);
});
