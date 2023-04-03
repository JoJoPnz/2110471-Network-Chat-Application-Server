const uuidv4 = require("uuid").v4;
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// const messages = new Set();
// const messages = new Map(); // roomId => { )
const socketToUser = new Map(); // userSocketId => userId
const users = new Set(); // all online user

// const messageExpirationTimeMS = 5 * 60 * 1000;
class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("setUserOnline", (token) => this.setUserOnline(token));

    // socket.on("getMessages", () => this.getMessages());
    // socket.on("message", (value) => this.handleMessage(value));
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
    const userId = String(user._id);
    // console.log(user.username);
    socketToUser.set(this.socket.id, userId);
    users.add(user);
    // console.log(socketToUser.get(this.socket));
    this.socket.emit("getUsername");
  }

  // sendMessage(message) {
  //   this.io.sockets.emit("message", message);
  // }

  // getMessages() {
  //   messages.forEach((message) => this.sendMessage(message));
  // }

  async getUsername() {
    const userId = socketToUser.get(this.socket.id);
    const username = (await User.findById(userId))?.username;
    this.socket.emit("getUsername", username);
  }

  // handleMessage(value) {
  //   const message = {
  //     id: uuidv4(),
  //     user: socketToUser.get(this.socket).username,
  //     value,
  //     time: Date.now(),
  //   };

  //   messages.add(message);
  //   this.sendMessage(message);

  //   setTimeout(() => {
  //     messages.delete(message);
  //     this.io.sockets.emit("deleteMessage", message.id);
  //   }, messageExpirationTimeMS);
  // }

  async checkDuplicateName(username) {
    const allUsername = await User.find().select(username);
    if (allUsername.includes(username)) {
      return true;
    }
    return false;
  }

  async setUsername(username) {
    // 1. Update user in database
    // const userId = socketToUser.get(this.socket.id);
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { username: username },
    //   { new: true }
    // );

    this.socket.emit("getUsername", username);
  }

  async getAllClient() {
    const allClient = [];
    for (const entry of socketToUser.entries()) {
      const clientSocket = entry[0];
      const clientUserId = entry[1];
      const clientUsername = (await User.findById(clientUserId))?.username;
      allClient.push({
        id: clientSocket[0],
        username: clientUsername,
      });
    }
    this.socket.emit("getAllClient", allClient);
  }

  disconnect() {
    users.delete(socketToUser.get(this.socket.id));
    socketToUser.delete(this.socket.id);
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = chat;
