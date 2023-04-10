const Group = require("../models/Group");

//@desc     Get all groups
//@route    GET /api/v1/groups
//@access   Private
exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({})
      .populate({
        path: "users",
        select: "username email",
      })
      .populate({
        path: "messages",
        select: "type sender text createdAt",
      });

    res.status(200).json({ success: true, data: groups });
  } catch {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find any group" });
  }
};

//@desc     Get single group
//@route    GET /api/v1/groups/:groupName
//@access   Private
exports.getSingleGroup = async (req, res, next) => {
  try {
    const groupName = req.params.groupName;
    const group = await Group.findOne({ name: groupName })
      .populate({
        path: "users",
        select: "username email",
      })
      .populate({
        path: "messages",
        select: "type sender text createdAt",
      });

    if (group) {
      return res.status(200).json({ success: true, data: group });
    }
    return res.status(404).json({
      success: false,
      message: `Cannot find group named '${req.params.groupName}'`,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(404).json({
      success: false,
      message: `Cannot find group named '${req.params.groupName}'`,
    });
  }
};

//@desc     Create single group
//@route    POST /api/v1/groups
//@access   Private
exports.createGroup = async (req, res, next) => {
  try {
    const groupName = req.body.groupName;
    const group = await Group.create({
      name: groupName,
      users: [req.user.id],
      messages: [],
    });

    res.status(200).json({ success: true, data: group });
  } catch (err) {
    console.log(err.stack);
    return res.status(403).json({
      success: false,
      message: `Cannot create group named '${req.body.groupName}'`,
    });
  }
};

//@desc     Edit single group
//@route    PATCH /api/v1/groups/:groupName
//@access   Private
exports.editGroup = async (req, res, next) => {
  try {
    const groupName = req.params.groupName;
    const newUsers = req.body.users;
    const newMessages = req.body.messages;
    const group = await Group.findOneAndUpdate(
      { name: groupName },
      { users: newUsers, messages: newMessages },
      { new: true }
    )
      .populate({
        path: "users",
        select: "username email",
      })
      .populate({
        path: "messages",
        select: "type sender text createdAt",
      });

    if (group) {
      return res.status(200).json({ success: true, data: group });
    }
    return res.status(404).json({
      success: false,
      message: `Cannot find group named '${req.params.groupName}'`,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(403).json({
      success: false,
      message: `Cannot edit group named '${req.params.groupName}'`,
    });
  }
};
