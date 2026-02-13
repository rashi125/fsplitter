const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createSubscription,
  getGroupSubscriptions,
  getSplitDetails
} = require("../controllers/subscriptionController");

// Specific FIRST
router.get("/split/:subscriptionId", auth, getSplitDetails);

// Then generic
router.post("/", auth, createSubscription);
router.get("/:groupId", auth, getGroupSubscriptions);

module.exports = router;
