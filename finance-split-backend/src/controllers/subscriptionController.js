const Subscription = require("../models/Subscription");
const Group = require("../models/Groups");

// CREATE SUBSCRIPTION
exports.createSubscription = async (req, res) => {
  try {
    const { name, totalCost, billingCycle, groupId } = req.body;

    // check user belongs to group
    const group = await Group.findOne({
      _id: groupId,
      members: req.user.userId   // IMPORTANT CHECK
    });

    if (!group) {
      return res.status(403).json({ message: "Not a group member" });
    }

    const subscription = await Subscription.create({
      name,
      totalCost,
      billingCycle,
      group: groupId
    });

    res.status(201).json(subscription);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Subscription creation failed",
      error: error.message
    });
  }
};

// GET GROUP SUBSCRIPTIONS
exports.getGroupSubscriptions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const subscriptions = await Subscription.find({ group: groupId });

    res.status(200).json(subscriptions);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};

// GET SPLIT DETAILS (Equal Split Logic)
exports.getSplitDetails = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const usages = await Usage.find({ subscription: subscriptionId })
      .populate("user", "name");

    if (usages.length === 0) {
      return res.status(400).json({ message: "No usage data found" });
    }

    // total hours
    const totalHours = usages.reduce((sum, u) => sum + u.hours, 0);

    const result = usages.map(u => ({
      user: u.user.name,
      hours: u.hours,
      amountToPay: (u.hours / totalHours) * subscription.totalCost
    }));

    res.json({
      subscription: subscription.name,
      totalCost: subscription.totalCost,
      totalHours,
      split: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Split calculation failed" });
  }
};