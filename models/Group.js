const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  messages: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Message",
    default: [],
  },
});

module.exports = mongoose.model("Group", GroupSchema);
