const app = require("./app");
const debug = require("debug")("debugger");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const messageController = require("./controllers/messageController");
const notificationController = require("./controllers/notificationController");

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

const server = http.createServer(app);
const io = socketio(server);

server.on("error", onError);
server.on("listening", onListening);

let connectedUsers = [];

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("Socket connection rejected: No token provided");
    return socket.disconnect();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket instance

    connectedUsers.push({
      socketId: socket.id,
      username: decoded.username
    });

    // console.log("User connected:", decoded.username);
  } catch (err) {
    console.log("Invalid token:", err.message);
    return socket.disconnect();
  }

  // Handle sending messages
  socket.on("sendMessage", (messageReq) => {
    // save the new message
    messageController.saveMessage(messageReq, socket);
    const sendTo = connectedUsers.filter(user => user.username === messageReq.to);

    
    // emit the new message to all recipients socket id
    sendTo.forEach(user => {
      io.to(user.socketId).emit("newMessageReceived", messageReq);
    });
  });

  // Handle typing event
  socket.on('typing', (typingData) => {
    socket.broadcast.emit('typingStatus', typingData);
  });

  // Fetch messages
  socket.on("fetchMessages", (messageReq) => {
    messageController.fetchMessages(messageReq, socket);
  });

  // Handle notifications (Ensuring sender is authenticated)
  socket.on("sendNotification", (notification) => {
    try {
      if (!socket.user) {
        console.error("Unauthorized notification attempt");
        return;
      }

      // Ensure the sender matches the authenticated user
      if (notification.sender !== socket.user.username) {
        console.error("Sender does not match authenticated user");
        return;
      }

      // Save notification to the database
      notificationController.saveSentNotification(notification, socket);

      // Find the receiver in the connected users
      const receiver = connectedUsers.find(user => user.username === notification.receiver);
      if (receiver) {
        // Emit notification to the receiver
        io.to(receiver.socketId).emit("receiveNotification", notification);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // update connectedUsers as soon as a user is disconnected
    connectedUsers = connectedUsers.filter(user => user.socketId !== socket.id);
  });
});

server.listen(port, (error) => {
  error ? console.log("Something went wrong!") : console.log("Server is listening on port " + port);
});
