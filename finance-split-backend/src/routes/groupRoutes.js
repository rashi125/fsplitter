const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createGroup,
  getMyGroups,
  addMemberToGroup
} = require("../controllers/groupController");

router.post("/", auth, createGroup);
router.get("/", auth, getMyGroups);
router.post("/add-member", auth, addMemberToGroup);
module.exports = router;