const socketio = require('socket.io');

module.exports = function ws(server) {
  const io = socketio(server);
  const users = new Map(); // store a map of usernames and if the user is typing

  // Only allow unique users
  io.use((socket, next) => {
    const { user } = socket.handshake.query;
    let ex;

    if (users.has(user)) {
      ex = new Error('Användaren finns redan');
    } else {
      users.set(user, false);
      socket.user = user;
    }

    next(ex);
  });

  io.on('connection', socket => {
    let timeoutId = null;

    function typingStop() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (users.get(socket.user)) {
        socket.broadcast.emit('typing_stop', socket.user);
        users.set(socket.user, false);
      }
    }

    // Send which users are typing on connection
    for (let [ user, typing ] of users.entries()) {
      if (typing) {
        socket.emit('typing', user);
      }
    }

    // Broadcast to sender aswell, maybe not later though
    socket.on('message', message => {
      const timestamp = Date.now();

      io.emit('message', { user: socket.user, message, timestamp });
      typingStop();
    });

    socket.on('typing', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // If user is idle for 10 seconds stop showing that the user is typing
      timeoutId = setTimeout(typingStop, 10000);
      users.set(socket.user, true);
      socket.broadcast.emit('typing', socket.user);
    });

    socket.on('disconnect', () => {
      users.delete(socket.user);
      socket.broadcast.emit('leave', socket.user);
    });

    // Broadcast when user joins the chat
    socket.broadcast.emit('join', socket.user);
  });

  console.log('Chat started');
};
