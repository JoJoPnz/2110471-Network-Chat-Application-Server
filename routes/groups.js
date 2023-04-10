const express = require("express");
const {
  getAllGroups,
  getSingleGroup,
  createGroup,
  editGroup,
} = require("../controllers/groups");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect, getAllGroups).post(protect, createGroup);

router
  .route("/:groupName")
  .get(protect, getSingleGroup)
  .patch(protect, editGroup);
module.exports = router;
