const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Group = require("./models/Group");

// const messages = new Map(); // roomId => { )
const socketToUser = new Map(); // socketId => userId
const userToSocket = new Map(); // userId => socketId
const users = new Set(); // all online userId

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on("setUserOnline", (token) => this.setUserOnline(token));
    socket.on("getUsername", () => this.getUsername());
    socket.on("setUsername", (username) => this.setUsername(username));
    socket.on("createGroup", (groupName) => this.createGroup(groupName));
    socket.on("getAllGroup", () => this.getAllGroup());
    socket.on("getAllClient", () => this.getAllClient());
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    this.getAllGroup();
  }

  async setUserOnline(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      this.socket.emit("error", "User not found");
      return;
    }

    // if (users.has(userId) && userToSocket.get(userId) !== this.socket.id) {
    //   this.socket.emit("error", "This user is already login");
    //   return;
    // }

    socketToUser.set(this.socket.id, userId);
    userToSocket.set(userId, this.socket.id);
    users.add(userId);

    this.getUsername();
    this.getAllClient();
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

  async getAllGroup() {
    const groups = await Group.find();
    this.io.emit("getAllGroup", groups);
  }

  async createGroup(groupName) {
    const userId = socketToUser.get(this.socket.id);
    try {
      await Group.create({ name: groupName, users: [userId] });
      this.getAllGroup();
    } catch (err) {
      if (err.code && err.code === 11000) {
        this.socket.emit("errorDuplicateGroupName", groupName);
      }
    }
  }

  async getAllClient() {
    const allClient = [];
    const allUser = await User.find();
    for (const u of allUser) {
      var isOnline = false;
      const userId = String(u._id);
      if (users.has(userId)) {
        isOnline = true;
        allClient.push({
          id: userToSocket.get(userId),
          username: u.username,
          status: "online",
        });
      }
      if (!isOnline) {
        allClient.push({
          id: null,
          username: u.username,
          status: "offline",
        });
      }
    }
    this.io.emit("getAllClient", allClient);
  }

  async disconnect() {
    userToSocket.delete(socketToUser.get(this.socket.id));
    users.delete(socketToUser.get(this.socket.id));
    socketToUser.delete(this.socket.id);
    await this.getAllClient();
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = chat;
