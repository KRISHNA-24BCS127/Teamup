const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, default: "", maxlength: 300 },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "cancelled"],
    default: "pending"
  },
  teamName: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null }
});

// Prevent duplicate pending pairs at the DB level (either direction)
teamRequestSchema.index(
  { fromUserId: 1, toUserId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

module.exports = mongoose.model('TeamRequest', teamRequestSchema);