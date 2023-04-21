const mongoose = require("mongoose");
const { MessageSchema } = require("./Message");

// user1_id < user2_id
const DirectMessageSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
	required: [true, "user 1 must not be null"]
  },
  user2: {
	type: mongoose.Schema.Types.ObjectId,
	ref: "User",
	required: [true, "user 2 must not be null"]
  },
  messages: {
    type: [MessageSchema],
    default: [],
  },
});

module.exports = mongoose.model("DirectMessage", DirectMessageSchema);
