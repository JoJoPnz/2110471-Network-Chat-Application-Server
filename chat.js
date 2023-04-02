const uuidv4 = require("uuid").v4;

const messages = new Set();
// const messages = new Map(); // roomId => {  }
const users = new Map(); // userSocket => username

const messageExpirationTimeMS = 5 * 60 * 1000;

const initUsername = () => {
  return "Anonymous" + uuidv4().slice(0, 5);
};

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    // add new user with random username
    users.set(socket, initUsername());
    console.log(
      `User connected socket id: ${
        socket.id
      } with initial username: ${users.get(socket)}`
    );
    console.log(`There are ${users.size} users now\n.`);

    socket.on("getMessages", () => this.getMessages());
    socket.on("message", (value) => this.handleMessage(value));
    socket.on("getUsername", () => this.getUsername());
    socket.on("setUsername", (username) => this.setUsername(username));
    socket.on("getAllClient", () => this.getAllClient());
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  sendMessage(message) {
    this.io.sockets.emit("message", message);
  }

  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  getUsername() {
    this.socket.emit("getUsername", users.get(this.socket));
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: users.get(this.socket),
      value,
      time: Date.now(),
    };

    messages.add(message);
    this.sendMessage(message);

    setTimeout(() => {
      messages.delete(message);
      this.io.sockets.emit("deleteMessage", message.id);
    }, messageExpirationTimeMS);
  }

  checkDuplicateName(username) {
    const allUsername = Array.from(users.values());
    if (allUsername.includes(username)) {
      return true;
    }
    return false;
  }

  setUsername(username) {
    if (this.checkDuplicateName(username)) {
      this.socket.emit("errorDuplicateUsername", username);
    } else {
      users.set(this.socket, username);
      this.socket.emit("getUsername", username);
    }
  }

  getAllClient() {
    const allClient = [];
    for (const entry of users.entries()) {
      const clientSocket = entry[0];
      const clientSocketId = clientSocket.id;
      const clientUsername = entry[1];
      allClient.push({ id: clientSocketId, username: clientUsername });
    }
    this.socket.emit("getAllClient", allClient);
  }

  disconnect() {
    users.delete(this.socket);
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = chat;
