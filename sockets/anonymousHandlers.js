// filepath: sockets/anonymousHandlers.js
module.exports = function anonymousHandlers(io, socket, anonymousRooms) {
  // Broadcast the updated members list to all users in the room
  function broadcastMembers(roomName) {
    const room = anonymousRooms[roomName];
    if (!room) return;
    const members = room.users.map(u => u.username);
    io.to(roomName).emit("anonymous-members", { members });
  }

  // Join request: add user to room, ensure unique username
  socket.on("anonymous-join-request", ({ roomName, username }) => {
    if (!roomName || !username) return;
    if (!anonymousRooms[roomName]) {
      anonymousRooms[roomName] = {
        users: [{ username, socketId: socket.id }]
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
  });

  // Group message: broadcast to all in room
  socket.on("anonymous-group-message", ({ room, from, message }) => {
    if (!room || !from || !message) return;
    const roomObj = anonymousRooms[room];
    if (!roomObj) return;
    // Only allow if user is in room
    if (!roomObj.users.find(u => u.username === from && u.socketId === socket.id)) {
      return;
    }
    io.to(room).emit("anonymous-group-message", { from, message, timestamp: Date.now() });
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
