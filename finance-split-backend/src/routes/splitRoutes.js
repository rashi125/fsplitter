const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const splitController = require("../controllers/splitController");

// Usage-based split
router.get("/:subscriptionId", auth, splitController.getUsageBasedSplit);

module.exports = router;
