const uuidv4 = require("uuid").v4;
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const messages = new Set();
// const messages = new Map(); // roomId => {  }
const socketToUser = new Map(); // userSocket => User schema
const users = new Set(); // User schema

const messageExpirationTimeMS = 5 * 60 * 1000;

const initUsername = () => {
  return "Anonymous" + uuidv4().slice(0, 5);
};

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    // add new user with random username
    // users.set(socket, initUsername());
    // console.log(
    //   `User connected socket id: ${
    //     socket.id
    //   } with initial username: ${users.get(socket)}`
    // );
    // console.log(socket.data);
    // console.log(`There are ${users.size} users now\n.`);

    socket.on("setUserOnline", (token) => this.setUserOnline(token));

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

  async setUserOnline(token) {
    // console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const user = await User.findById(decoded.id);
    console.log(user.username);
    socketToUser.set(this.socket, user);
    users.add(user);
  }

  sendMessage(message) {
    this.io.sockets.emit("message", message);
  }

  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  getUsername() {
    this.socket.emit("getUsername", socketToUser.get(this.socket)?.username);
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: socketToUser.get(this.socket).username,
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

  async checkDuplicateName(username) {
    const allUsername = await User.find().select(username);
    if (allUsername.includes(username)) {
      return true;
    }
    return false;
  }

  async setUsername(username) {
    console.log(socketToUser);
    const oldUser = await User.find({ _id: socketToUser[this.socket]._id });
    if (this.checkDuplicateName(username)) {
      this.socket.emit("errorDuplicateUsername", username);
    } else {
      const updatedUser = await User.findOneAndUpdate(
        { _id: socketToUser[this.socket]._id },
        { username: username },
        { new: true }
      );
      socketToUser.set(this.socket, updatedUser);
      users.delete(oldUser);
      users.add(updatedUser);
      this.socket.emit("getUsername", username);
    }
  }

  getAllClient() {
    const allClient = [];
    for (const entry of socketToUser.entries()) {
      const clientSocket = entry[0];
      const clientSocketId = clientSocket.id;
      const clientUser = entry[1];
      allClient.push({ id: clientSocketId, username: clientUser.username });
    }
    this.socket.emit("getAllClient", allClient);
  }

  disconnect() {
    users.delete(socketToUser[this.socket]);
    socketToUser.delete(this.socket);
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = chat;
