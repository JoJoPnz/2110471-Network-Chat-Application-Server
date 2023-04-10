const Message = require("../models/Message");
const User = require("../models/User");

//@desc     Get all messages
//@route    GET /api/v1/messages
//@access   Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({}).populate({
      path: "sender",
      select: "username email",
    });

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Messages" });
  }
};

//@desc     Get single message
//@route    GET /api/v1/messages/:id
//@access   Private
exports.getMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id).populate({
      path: "sender",
      select: "username email",
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: `No message with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: message });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Message" });
  }
};

//@desc     Add message
//@route    POST /api/v1/message
//@access   Private
exports.addMessage = async (req, res, next) => {
  try {
    // if message type is "USER", sender must exist
    if (req.body.type === "User") {
      const sender = await User.findById(req.body.sender);
      if (!sender) {
        return res.status(404).json({
          success: false,
          message: `No sender user with the id of ${req.body.sender}`,
        });
      }
    }
    const message = await Message.create(req.body);
    return res.status(200).json({ success: true, data: message });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Message" });
  }
};
