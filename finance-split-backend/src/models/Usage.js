const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true
  },
  usageHours: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Usage", usageSchema);
