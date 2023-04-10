const mongoose = require("mongoose");

const UserType = Object.freeze({
  User: 'User',
  System: 'System'
});

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(UserType),
    required: true,
  },
  sender: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: null,
  },
  text: {
    type: String,
    required: [true, "Please add an text"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);
