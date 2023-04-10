const express = require("express");
const {
  getMessages,
  getMessage,
  addMessage,
} = require("../controllers/messages");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(protect, getMessages).post(protect, addMessage);

router.route("/:id").get(protect, getMessage);

module.exports = router;
