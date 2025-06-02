// filepath: sockets/authenticatedHandlers.js
module.exports = function authenticatedHandlers(io, socket, connectedUsers, messageController, notificationController) {
  // Handle sending messages
  socket.on("sendMessage", (messageReq) => {
    messageController.saveMessage(messageReq, socket);
    const sendTo = connectedUsers.filter(user => user.username === messageReq.to);
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
      if (notification.sender !== socket.user.username) {
        console.error("Sender does not match authenticated user");
        return;
      }
      notificationController.saveSentNotification(notification, socket);
      const receiver = connectedUsers.find(user => user.username === notification.receiver);
      if (receiver) {
        io.to(receiver.socketId).emit("receiveNotification", notification);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  // WebRTC events
  socket.on("call-user", ({ to, offer, callType }) => {
    const target = connectedUsers.find(user => user.username === to);
    if (target) {
      io.to(target.socketId).emit("call-made", {
        from: socket.user.username,
        offer,
        callType
      });
    }
  });
  socket.on("make-answer", ({ to, answer }) => {
    const target = connectedUsers.find(user => user.username === to);
    if (target) {
      io.to(target.socketId).emit("answer-made", {
        from: socket.user.username,
        answer,
      });
    }
  });
  socket.on("ice-candidate", ({ to, candidate }) => {
    const target = connectedUsers.find(user => user.username === to);
    if (target) {
      io.to(target.socketId).emit("ice-candidate", {
        from: socket.user.username,
        candidate,
      });
    }
  });
  socket.on("call-rejected", ({ to }) => {
    const target = connectedUsers.find(user => user.username === to);
    if (target) {
      io.to(target.socketId).emit("call-rejected", { from: socket.user.username });
    }
  });
  socket.on("hang-up", ({ to }) => {
    const target = connectedUsers.find(user => user.username === to);
    if (target) {
      io.to(target.socketId).emit("call-ended");
    }
  });
  socket.on("call-ended", ({ to }) => {
    const target = connectedUsers.find(u => u.username === to);
    if (target) {
      io.to(target.socketId).emit("call-ended");
    }
    io.to(socket.id).emit("call-ended");
  });
  socket.on("sendCallLog", (callLogReq) => {
    messageController.saveMessage(callLogReq, socket);
    const sendTo = connectedUsers.filter(user => user.username === callLogReq.to);
    sendTo.forEach(user => {
      io.to(user.socketId).emit("newMessageReceived", callLogReq);
    });
    const sender = connectedUsers.find(user => user.username === callLogReq.from);
    if (sender) {
      io.to(sender.socketId).emit("newMessageReceived", callLogReq);
    }
  });
};
