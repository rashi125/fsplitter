const Group = require("../models/Groups");
const User = require("../models/User");
exports.createGroup = async (req, res) => {
  try {
    const group = await Group.create({
      name: req.body.name,
      owner: req.user.userId,
      members: [req.user.userId]
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Group creation failed" });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.userId
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

exports.addMemberToGroup = async (req, res) => {
  
  try {
    const { groupId, userId } = req.body;

    // 1️⃣ Validate inputs
    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message: "groupId and userId are required"
      });
    }

    // 2️⃣ Check group exists
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // 3️⃣ Check user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 4️⃣ Prevent duplicate members
    if (group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User already in group"
      });
    }

    // 5️⃣ Add user to members array
    group.members.push(userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: "User added to group successfully",
      group
    });

  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message
    });
  }
};
