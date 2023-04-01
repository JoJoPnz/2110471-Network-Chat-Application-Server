const uuidv4 = require("uuid").v4;

const messages = new Set();
const users = new Map(); // userSocket => userName

const defaultUser = {
  id: "anon",
  name: "Anonymous",
};

const messageExpirationTimeMS = 5 * 60 * 1000;

const initName = () => {
  return "Anonymous" + uuidv4().slice(0, 5);
};

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    // add new user with random name
    users.set(socket, initName());
    console.log(
      `User connected socket id: ${socket.id} with initial name: ${users.get(
        socket
      )}`
    );
    console.log(`There are ${users.size} users now\n.`);

    socket.on("getMessages", () => this.getMessages());
    socket.on("message", (value) => this.handleMessage(value));
    socket.on("setUsername", (userName) => this.setUsername(userName));
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

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: users.get(this.socket) || defaultUser,
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

  checkDuplicateName(userName) {
    const allUserName = Array.from(users.values());
    if (allUserName.includes(userName)) {
      return true;
    }
    return false;
  }

  setUsername(userName) {
    if (this.checkDuplicateName(userName)) {
      this.io.sockets.emit("errorDuplicateName", userName);
    } else {
      users.set(this.socket, userName);
    }
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
