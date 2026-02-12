const Subscription = require("../models/Subscription");
const Group = require("../models/Groups");

// CREATE SUBSCRIPTION
exports.createSubscription = async (req, res) => {
  try {
    const { name, totalCost, billingCycle, groupId } = req.body;

    // check user belongs to group
    const group = await Group.findOne({
      _id: groupId,
      members: req.user.userId
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
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};
exports.getSplitDetails = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId)
      .populate("group");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const memberCount = subscription.group.members.length;

    const splitAmount = subscription.totalCost / memberCount;

    res.json({
      subscription: subscription.name,
      totalCost: subscription.totalCost,
      members: memberCount,
      perPersonCost: splitAmount
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to calculate split" });
  }
};
exports.getSplitDetails = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId)
      .populate("group");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const memberCount = subscription.group.members.length;

    const splitAmount = subscription.totalCost / memberCount;

    res.json({
      subscription: subscription.name,
      totalCost: subscription.totalCost,
      members: memberCount,
      perPersonCost: splitAmount
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to calculate split" });
  }
};
exports.getSplitDetails = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId)
      .populate("group");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const memberCount = subscription.group.members.length;

    const splitAmount = subscription.totalCost / memberCount;

    res.json({
      subscription: subscription.name,
      totalCost: subscription.totalCost,
      members: memberCount,
      perPersonCost: splitAmount
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to calculate split" });
  }
};
