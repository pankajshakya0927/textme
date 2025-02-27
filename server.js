const app = require("./app");
const debug = require("debug")("debugger");
const http = require("http");
const socketio = require("socket.io");
const messageController = require("./controllers/messageController");
const notificationController = require("./controllers/notificationController");

const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
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
  for (let [id, socket] of io.of("/").sockets) {
    const userExists = connectedUsers.some(user => user.socketId === id);
    if (!userExists && socket.handshake.auth.username) {
      connectedUsers.push({
        socketId: id,
        username: socket.handshake.auth.username
      });
    }
  }

  socket.on("sendMessage", (messageReq) => {
    // save the new message
    messageController.saveMessage(messageReq, socket);
    const sendTo = connectedUsers.filter(user => user.username === messageReq.to); // if user has opened multiple tabs

    // emit the new message to all recipients socket id
    sendTo.forEach(user => {
      io.to(user.socketId).emit("newMessageReceived", messageReq);
    });
  });

  socket.on('typing', (typingData) => {
    socket.broadcast.emit('typingStatus', typingData)
  });

  socket.on("fetchMessages", (messageReq) => {
    messageController.fetchMessages(messageReq, socket);
  });

  // Handle notifications
  socket.on("sendNotification", (notification) => {
    try {
      // Save notification to the database
      notificationController.saveNotification(notification, socket);

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
})

server.listen(port, (error) => {
  error ? console.log("Something went wrong!") : console.log("Server is listening on port " + port);
});
