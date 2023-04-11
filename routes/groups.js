const express = require("express");
const {
  getAllGroups,
  getSingleGroup,
  createGroup,
  updateGroup,
} = require("../controllers/groups");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getAllGroups).post(protect, createGroup);

router.route("/:id").get(protect, getSingleGroup).patch(protect, updateGroup);

module.exports = router;
