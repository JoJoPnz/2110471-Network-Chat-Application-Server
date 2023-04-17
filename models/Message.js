const mongoose = require("mongoose");

const MessageType = Object.freeze({
  User: "User",
  System: "System",
});

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(MessageType),
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.type === MessageType.User;
    },
    // ensure that the field value is null when the type field is System,
    // even if the sender field value is set.
    validate: {
      validator: function (v) {
        return this.type === MessageType.System ? v === null : true;
      },
      message: "Sender must be null when type is System",
    },
    default: function () {
      return this.type === MessageType.System ? null : undefined;
    },
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

module.exports = { MessageSchema };
