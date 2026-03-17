const Usage = require("../models/Usage");
const Subscription = require("../models/Subscription");

exports.getUsageBasedSplit = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    // 1️⃣ Validate param
    if (!subscriptionId || subscriptionId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "subscriptionId is required"
      });
    }

    // 2️⃣ Fetch subscription with group + members
    const subscription = await Subscription.findById(subscriptionId)
      .populate({
        path: "group",
        populate: {
          path: "members",
          select: "name email"
        }
      });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    // 🔐 (IMPORTANT) Check user belongs to group
    const userId = req.user?.userId;
    const isMember = subscription.group.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group"
      });
    }

    // 3️⃣ Get all usage records for this subscription
    const usageRecords = await Usage.find({
      subscription: subscriptionId
    }).populate("user", "name email");

    if (usageRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No usage data found for this subscription"
      });
    }

    // 4️⃣ Calculate total usage hours
    const totalUsageHours = usageRecords.reduce(
      (sum, record) => sum + record.usageHours,
      0
    );

    // 🚨 Prevent division by zero
    if (totalUsageHours === 0) {
      return res.status(400).json({
        success: false,
        message: "Total usage hours cannot be zero"
      });
    }

    // 5️⃣ Calculate usage-based split
    const splitDetails = usageRecords.map((record) => {
      const userShare =
        (record.usageHours / totalUsageHours) * subscription.totalCost;

      return {
        userId: record.user._id,
        name: record.user.name,
        email: record.user.email,
        usageHours: record.usageHours,
        percentage: Number(
          ((record.usageHours / totalUsageHours) * 100).toFixed(2)
        ),
        amountToPay: Number(userShare.toFixed(2))
      };
    });

    // 6️⃣ Final Response
    res.status(200).json({
      success: true,
      subscriptionId: subscription._id,
      subscriptionName: subscription.name,
      totalCost: subscription.totalCost,
      billingCycle: subscription.billingCycle,
      totalUsageHours,
      totalUsers: usageRecords.length,
      split: splitDetails
    });

  } catch (error) {
    console.error("USAGE BASED SPLIT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Split calculation failed",
      error: error.message
    });
  }
};
