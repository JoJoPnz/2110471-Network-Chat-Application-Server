const jwt = require("jsonwebtoken");
const User = require("./models/User");

// const messages = new Map(); // roomId => { )
const socketToUser = new Map(); // userSocketId => userId
const users = new Set(); // all online userId

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("setUserOnline", (token) => this.setUserOnline(token));

    socket.on("getUsername", () => this.getUsername());
    socket.on("setUsername", (username) => this.setUsername(username));
    socket.on("getAllClient", () => this.getAllClient());
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  async setUserOnline(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (users.has(userId)) {
      this.socket.emit("error", "This user is already login");
    } else {
      socketToUser.set(this.socket.id, userId);
      users.add(userId);

      this.getUsername();
      this.getAllClient();
    }
  }

  async getUsername() {
    const userId = socketToUser.get(this.socket.id);
    const username = (await User.findById(userId))?.username;
    this.socket.emit("getUsername", username);
  }

  async checkDuplicateName(username) {
    const user = await User.find({ username: username });
    if (user.length > 0) {
      return true;
    }
    return false;
  }

  async setUsername(username) {
    const isDuplicate = await this.checkDuplicateName(username);
    if (isDuplicate) {
      console.log("aaa");
      this.socket.emit("errorDuplicateUsername", username);
    } else {
      const userId = socketToUser.get(this.socket.id);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username: username },
        { new: true }
      );
      this.socket.emit("getUsername", username);
      this.getAllClient();
    }
  }

  async getAllClient() {
    const allClient = [];
    for (const entry of socketToUser.entries()) {
      const clientSocketId = entry[0];
      const clientUserId = entry[1];
      const clientUsername = (await User.findById(clientUserId))?.username;
      allClient.push({
        id: clientSocketId,
        username: clientUsername,
      });
    }
    this.io.emit("getAllClient", allClient);
  }

  disconnect() {
    users.delete(socketToUser.get(this.socket.id));
    socketToUser.delete(this.socket.id);
    this.getAllClient();
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = chat;
