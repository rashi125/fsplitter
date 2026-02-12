const Group = require("../models/Groups");

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