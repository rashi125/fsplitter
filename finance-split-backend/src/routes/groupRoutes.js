const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createGroup,
  getMyGroups,
  addMemberToGroup,
  getGroupById,
  leaveGroup,
  // deleteGroup
} = require("../controllers/groupController");

router.post("/", auth, createGroup);
router.get("/", auth, getMyGroups);
router.post("/add-member", auth, addMemberToGroup);
router.get("/:groupId", auth, getGroupById);
router.delete("/leave/:groupId", auth, leaveGroup);
// router.delete("/:groupId", auth, deleteGroup);
module.exports = router;