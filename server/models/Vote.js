const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  voteType: { type: String, enum: ['up', 'down'], required: true },
}, { timestamps: true });

voteSchema.index({ userId: 1, complaintId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
