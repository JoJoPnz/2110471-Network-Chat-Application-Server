const express = require("express");
const {
  getAllGroups,
  getSingleGroup,
  createGroup,
  updateGroupName,
  joinGroup,
  leaveGroup,
  addMessageGroup,
} = require("../controllers/groups");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getAllGroups).post(protect, createGroup);

router.route("/:id").get(protect, getSingleGroup);

router.route("/name").patch(protect, updateGroupName);
router.route("/join").post(protect, joinGroup);
router.route("/leave").post(protect, leaveGroup);
router.route("/message").post(protect, addMessageGroup);

module.exports = router;
