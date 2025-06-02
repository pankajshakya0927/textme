const ChatRoom = require('../models/chatRoom');

module.exports = function anonymousHandlers(io, socket, anonymousRooms) {
  // Broadcast the updated members list to all users in the room
  function broadcastMembers(roomName) {
    const room = anonymousRooms[roomName];
    if (!room) return;
    const members = room.users.map(u => u.username);
    io.to(roomName).emit("anonymous-members", { members });
  }

  // Join request: add user to room, ensure unique username (DB check)
  socket.on("anonymous-join-request", async ({ roomName, username, token }) => {
    if (!roomName || !username || !token) return;
    // Find or create the chat room
    let chatRoom = await ChatRoom.findOne({ roomName });
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ roomName, usedUsernames: [], messages: [] });
    }
    // Check if username is already used
    const userIdx = chatRoom.usedUsernames.findIndex(u => u.username === username);
    if (userIdx !== -1) {
      // Username is used, check token
      if (chatRoom.usedUsernames[userIdx].token === token) {
        // Allow rejoin
      } else {
        socket.emit("anonymous-join-denied", { reason: "This username has already been used in this room. Please choose a different one." });
        return;
      }
    } else {
      // New username, store with token
      chatRoom.usedUsernames.push({ username, token });
      await chatRoom.save();
    }
    if (!anonymousRooms[roomName]) {
      anonymousRooms[roomName] = {
        users: [{ username, socketId: socket.id }],
      };
    } else {
      const room = anonymousRooms[roomName];
      if (room.users.some(u => u.username === username)) {
        socket.emit("anonymous-join-denied", { reason: "Username already taken in this room." });
        return;
      }
      room.users.push({ username, socketId: socket.id });
    }
    socket.join(roomName);
    broadcastMembers(roomName);
    // Send group message history
    const groupHistory = chatRoom.messages.filter(m => m.type === 'group');
    socket.emit("anonymous-group-history", groupHistory);
    // Send private message history for this user
    const privateHistory = chatRoom.messages.filter(m => m.type === 'private' && (m.from === username || m.to === username));
    socket.emit("anonymous-private-history", privateHistory);
  });

  // Group message: save and broadcast to all in room
  socket.on("anonymous-group-message", async ({ room, from, message }) => {
    if (!room || !from || !message) return;
    const roomObj = anonymousRooms[room];
    if (!roomObj) return;
    // Save group message in chat room
    let chatRoom = await ChatRoom.findOne({ roomName: room });
    if (!chatRoom) return;
    const msg = { type: 'group', from, content: message, timestamp: new Date() };
    chatRoom.messages.push(msg);
    await chatRoom.save();
    io.to(room).emit("anonymous-group-message", { from, message, timestamp: msg.timestamp });
  });

  // Private message: save and send to recipient
  socket.on("anonymous-private-message", async ({ room, from, to, message, type = "text", callStatus, duration }) => {
    if (!room || !from || !to || (!message && type === "text")) return;
    const roomObj = anonymousRooms[room];
    if (!roomObj) return;
    // Save private message in chat room
    let chatRoom = await ChatRoom.findOne({ roomName: room });
    if (!chatRoom) return;
    const msg = { type: 'private', from, to, content: message, timestamp: new Date(), callStatus, duration, msgType: type };
    chatRoom.messages.push(msg);
    await chatRoom.save();
    const recipient = roomObj.users.find(u => u.username === to);
    if (recipient) {
      io.to(recipient.socketId).emit("anonymous-private-message", { from, to, message, type, callStatus, duration, timestamp: msg.timestamp });
    }
  });

  // Handle explicit leave: remove user from a specific room
  socket.on("anonymous-leave-room", ({ roomName, username }) => {
    if (!roomName || !username) return;
    const room = anonymousRooms[roomName];
    if (!room) return;
    const idx = room.users.findIndex(u => u.username === username && u.socketId === socket.id);
    if (idx !== -1) {
      room.users.splice(idx, 1);
      if (room.users.length === 0) {
        delete anonymousRooms[roomName];
      } else {
        broadcastMembers(roomName);
      }
    }
  });

  // Handle disconnect: remove user from all rooms
  socket.on("disconnect", () => {
    for (const [roomName, room] of Object.entries(anonymousRooms)) {
      const idx = room.users.findIndex(u => u.socketId === socket.id);
      if (idx !== -1) {
        const username = room.users[idx].username;
        room.users.splice(idx, 1);
        if (room.users.length === 0) {
          delete anonymousRooms[roomName];
        } else {
          broadcastMembers(roomName);
        }
        break;
      }
    }
  });
};
