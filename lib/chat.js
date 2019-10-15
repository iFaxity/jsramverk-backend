
const { promisify } = require('util');
const randomBytes = promisify(require('crypto').randomBytes);

const socketio = require('socket.io');
const MongoClient = require('mongodb').MongoClient;
const mongo = MongoClient.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(console.error);


/**
 * Connects to a MongoDB database
 * @param {string} db
 */
function connect(db) {
  return mongo.then(client => client.db(db));
}


/**
 * Gets the messages a user has saved
 * @param {string} user
 * @param {number} [messageId]
 */
async function loadMessages(alias) {
  try {
    const db = await connect('jsramverk');
    const chat = await db.collection('chat');
    const cursor = chat.find({ users: alias });
    const messages = await cursor.sort('timestamp', -1).toArray();

    return messages.map(({ id, sender, text, timestamp }) => ({ id, sender, text, timestamp }));
  } catch {
    throw new Error('Ett fel inträffade vid hämtande av meddelanden');
  }
}


/**
 * Saves message for user
 * @param {string} alias
 * @param {string} messageId
 */
async function saveMessage(alias, messageId) {
  try {
    const db = await connect('jsramverk');
    const chat = await db.collection('chat');

    await chat.updateOne({ id: messageId }, { $push: { users: alias } });
  } catch (ex) {
    throw new Error('Ett fel inträffade vid hämtande av meddelanden');
  }
}


/**
 * Adds message to database
 * @param {object} message
 */
async function addMessage(message) {
  try {
    const db = await connect('jsramverk');
    const chat = await db.collection('chat');
    const buf = await randomBytes(9);
    const id = buf.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    await chat.insertOne({ id, users: [], ...message });
    return id;
  } catch (ex) {
    if (ex.code == 11000) {
      return saveMessage(message);
    } else {
      throw new Error('Ett fel inträffade vid sparande av meddelande');
    }
  }
}


// user object = { typing: boolean, save: boolean };
module.exports = function ws(server) {
  const io = socketio(server);
  const users = new Map();

  async function onTypingStop(socket) {
    const { user, typingTimeout } = socket;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      socket.typingTimeout = null;
    }

    if (users.get(user.alias)) {
      socket.broadcast.emit('typing_stop', user.alias);
      user.typing = false;
    }
  }

  async function onTyping(socket) {
    const { user, typingTimeout } = socket;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      socket.typingTimeout = null;
    }

    user.typing = true;
    socket.broadcast.emit('typing', user.alias);

    // If user is idle for longer than 10 seconds, send stop typing
    socket.typingTimeout = setTimeout(onTypingStop.bind(null, socket), 10000);
  }

  async function onMessage(socket, text) {
    const sender = socket.user.alias;
    const timestamp = Date.now();
    const id = await addMessage({ sender, text, timestamp });

    io.emit('message', { sender, id, text, timestamp });
    onTypingStop(socket);
  }

  async function onSave(socket, messageId) {
    await saveMessage(socket.user.alias, messageId);
    socket.emit('saved_message', messageId);
  }

  async function onLoad(socket) {
    const messages = await loadMessages(socket.user.alias);
    socket.emit('loaded_messages', messages);
  }

  // Only allow unique users
  io.use((socket, next) => {
    const { alias } = socket.handshake.query;

    if (users.has(alias)) {
      return next(new Error('Användaren finns redan'));
    }

    socket.user = { alias, typing: false };
    socket.users = users;
    next();
  });

  io.on('connection', socket => {
    const { user, users } = socket;

    socket.on('message', onMessage.bind(null, socket));
    socket.on('typing', onTyping.bind(null, socket));
    socket.on('save_message', onSave.bind(null, socket));
    socket.on('load_messages', onLoad.bind(null, socket));
    socket.on('disconnect', () => {
      users.delete(user.alias);
      socket.broadcast.emit('leave', user.alias);
    });

    // Send user info on connection
    socket.emit('users', Array.from(users).map(({ alias, typing }) => ({ alias, typing })));

    // Broadcast when user joins the chat
    socket.broadcast.emit('join', user.alias);
    users.set(user.alias, user);
  });

  console.log('Chat started');
};
