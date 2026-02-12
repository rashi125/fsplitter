const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    totalCost: {
      type: Number,
      required: true
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);