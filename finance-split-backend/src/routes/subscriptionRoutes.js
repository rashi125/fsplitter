const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createSubscription,
  getGroupSubscriptions
} = require("../controllers/subscriptionController");

router.post("/", auth, createSubscription);
router.get("/:groupId", auth, getGroupSubscriptions);
router.get("/split/:subscriptionId", auth, getSplitDetails);


module.exports = router;