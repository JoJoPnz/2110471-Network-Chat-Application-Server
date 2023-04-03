const uuidv4 = require("uuid").v4;

const User = [
  {
    email: "user1@gmail.com",
    password: "user1",
    username: "Anonymous" + uuidv4().slice(0, 5),
  },
];

const addUser = (email, password, username) => {
  var isDup = false;
  for (const u of User) {
    if (u.email === email || u.username === username) {
      isDup = true;
      break;
    }
  }
  if (!isDup) {
    User.push({ email, password, username });
  }
};

const editUsername = (oldUsername, newUsername) => {
  for (const u of User) {
    if (u.username === oldUsername) {
      u.username = newUsername;
      break;
    }
  }
};

const getAllUsername = () => {
  const output = [];
  for (const u of User) {
    output.push(u.username);
  }
  return output;
};

module.exports = {
  User,
  addUser,
  editUsername,
  getAllUsername,
};
