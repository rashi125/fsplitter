const Usage = require("../models/usage");
const Subscription = require("../models/Subscription");

// ADD OR UPDATE USAGE (UPSERT)
exports.addUsage = async (req, res) => {
    try {
        console.log("BODY:", req.body);

        // 1️⃣ Get data from body
        const { subscriptionId, usageHours } = req.body;
         console.log("subscriptionId value:", subscriptionId);
console.log("subscriptionId type:", typeof subscriptionId);
console.log("full body:", req.body);

        // 2️⃣ Basic Validation (FIRST always)
        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                message: "subscriptionId is required"
            });
        }

        if (usageHours === undefined || usageHours === null) {
            return res.status(400).json({
                success: false,
                message: "usageHours is required"
            });
        }

        if (typeof usageHours !== "number" || usageHours < 0) {
            return res.status(400).json({
                success: false,
                message: "usageHours must be a positive number"
            });
        }

        // 3️⃣ Get user from auth middleware
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found in token"
            });
        }

        // 4️⃣ Check if subscription exists
        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        // 5️⃣ Find existing usage
        let usage = await Usage.findOne({
            user: userId,
            subscription: subscriptionId
        });

        // 6️⃣ UPSERT Logic (Update or Create)
        if (usage) {
            usage.usageHours += usageHours;
            await usage.save();

            return res.status(200).json({
                success: true,
                message: "Usage updated successfully",
                data: usage
            });
        } else {
            const newUsage = await Usage.create({
                user: userId,
                subscription: subscriptionId, // matches schema field
                usageHours: usageHours
            });

            return res.status(201).json({
                success: true,
                message: "Usage added successfully",
                data: newUsage
            });
        }

    } catch (error) {
        console.error("ADD USAGE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Usage update failed",
            error: error.message
        });
    }
};
