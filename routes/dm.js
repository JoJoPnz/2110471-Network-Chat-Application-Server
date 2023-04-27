const express = require("express");
const { getOrCreateDm, addMessageGroup } = require("../controllers/dm");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/:receiver").get(protect, getOrCreateDm);

router.route("/messages").post(protect, addMessageGroup);

module.exports = router;
