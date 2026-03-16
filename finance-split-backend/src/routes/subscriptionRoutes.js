const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createSubscription,
  getGroupSubscriptions,
  getSplitDetails,
  updateSubscription, // Import karein
  deleteSubscription,

} = require("../controllers/subscriptionController");

// Specific FIRST
router.get("/split/:subscriptionId", auth, getSplitDetails);
router.put("/:id", auth, updateSubscription);    
router.delete("/:id", auth, deleteSubscription);

// Then generic
router.post("/", auth, createSubscription);
router.get("/:groupId", auth, getGroupSubscriptions);

module.exports = router;
