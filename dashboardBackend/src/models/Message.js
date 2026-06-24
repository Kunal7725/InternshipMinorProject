const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // For direct messages
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // For group messages
    group:    { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text:     { type: String, required: true, trim: true },
    read:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ group: 1 });

module.exports = mongoose.model("Message", messageSchema);
