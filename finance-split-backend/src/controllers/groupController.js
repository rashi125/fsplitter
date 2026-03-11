const Group = require("../models/Groups");
const User = require("../models/User");

// 1. CREATE GROUP
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

// 2. GET ALL MY GROUPS
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.userId
    }).populate("members", "name email");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// 3. ADD MEMBER BY EMAIL
exports.addMemberToGroup = async (req, res) => {
  try {
    const { groupId, email } = req.body;

    if (!groupId || !email) {
      return res.status(400).json({ success: false, message: "Group ID aur Email dono zaroori hain" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "Is email wala koi user nahi mila." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group nahi mila" });
    }

    // 🔥 CORRECTED CHECK: MongoDB Objects ke liye .some() use karna better hai
    const isAlreadyMember = group.members.some(memberId => memberId.toString() === user._id.toString());
    
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: "Ye user pehle se hi group me hai" });
    }

    group.members.push(user._id);
    await group.save();

    res.status(200).json({
      success: true,
      message: `${user.name} ko group me add kar diya gaya hai!`,
      group,
    });
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);
    res.status(500).json({ success: false, message: "Member add karne me error aaya" });
  }
};

// 4. GET SINGLE GROUP DETAILS
exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    // .populate("members") zaroori hai frontend pe naam dikhane ke liye
    const group = await Group.findById(groupId).populate("members", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group nahi mila" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch group details" });
  }
};