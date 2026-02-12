const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createGroup,
  getMyGroups
} = require("../controllers/groupController");

router.post("/", auth, createGroup);
router.get("/", auth, getMyGroups);

module.exports = router;