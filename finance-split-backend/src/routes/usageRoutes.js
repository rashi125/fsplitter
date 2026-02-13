const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addUsage } = require("../controllers/usageController");

router.post("/", auth, addUsage);

module.exports = router;
