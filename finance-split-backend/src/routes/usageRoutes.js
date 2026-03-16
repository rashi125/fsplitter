const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addUsage,settleUpUser } = require("../controllers/usageController");

router.post("/", auth, addUsage);
router.delete("/settle-up/:groupId", auth, settleUpUser);
module.exports = router;
