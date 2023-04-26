const { connect } = require("mongoose");
const DirectMessage = require("../models/DirectMessage");

class DmToYourselfError extends Error {
  constructor(msg) {
    super(msg);

    Object.setPrototypeOf(this, DmToYourselfError.prototype);
  }
}

exports.findChatForAddMessage = async (srcUserId, destUserId) => {
  const dm = await DirectMessage.findOne({
    user1: srcUserId,
    user2: destUserId,
  });

  if (dm) {
    return dm;
  }

  const dm2 = await DirectMessage.findOne({
    user1: destUserId,
    user2: srcUserId,
  });

  if (dm2) {
    return dm2;
  }

  return null;
}

exports.findChatForGetDm = async (srcUserId, destUserId) => {
  const dm = await DirectMessage.findOne({
    user1: srcUserId,
    user2: destUserId,
  }).populate({
    path: "user1",
    model: "User",
    select: "username email",
  }).populate({
    path: "user2",
    model: "User",
    select: "username email"
  }).populate({
    path: "messages",
    populate: {
      path: "sender",
      model: "User",
      select: "username email",
    },
  });

  if (dm) {
    return dm;
  }

  const dm2 = await DirectMessage.findOne({
    user1: destUserId,
    user2: srcUserId,
  }).populate({
    path: "user1",
    model: "User",
    select: "username email",
  }).populate({
    path: "user2",
    model: "User",
    select: "username email"
  }).populate({
    path: "messages",
    populate: {
      path: "sender",
      model: "User",
      select: "username email",
    },
  });

  if (dm2) {
    return dm2;
  }

  return null;
}

exports.getOrCreateDm = async (req, res, next) => {
  try {
    const srcUserId = req.user.id;
    const destUserId = req.body.receiver;
    if (srcUserId === destUserId) {
      return res.status(400).json({
        success: false,
        message: "cannot dm to yourself",
      });
    }

    const dm = await this.findChatForGetDm(srcUserId, destUserId);

    if (dm) {
      return res.status(200).json({
        success: true,
        data: dm,
      });
    }

    const newDm = await DirectMessage.create({
      user1: srcUserId,
      user2: destUserId,
      message: [],
    });

    return res.status(201).json({
      success: true,
      data: newDm,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e,
    });
  }
};

exports.addMessageGroup = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.body.receiverId;
    const message = req.body.message;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "cannot dm with yourself",
      });
    }

    // sender must LT receiver
    const dm = await this.findChatForAddMessage(senderId, receiverId);

    if (!dm) {
      return res.status(400).json({
        success: false,
        message: "receiver with given ID not exist",
      });
    }
    const tmpMessage = Object.assign({}, {type: "User"}, {text: message}, { sender: senderId });

    dm.messages.push(tmpMessage);
    await dm.save();

    return res.status(201).json({
      success: true,
      message: "message send",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};
