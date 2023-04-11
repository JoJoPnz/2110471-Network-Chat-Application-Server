const mongoose = require("mongoose");
const { MessageSchema } = require("./Message");

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please add a group name"],
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  messages: {
    type: [MessageSchema],
    default: [],
  },
});

module.exports = mongoose.model("Group", GroupSchema);
