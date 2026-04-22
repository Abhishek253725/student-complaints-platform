const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title:
   { 
      type: String,
      required: true,
      trim: true 
   },
  description: { type: String, required: true },
  category: { type: String, enum: ['Academic', 'Infrastructure', 'Safety', 'Other'], default: 'Other' },
  priorityScore: { type: Number, default: 0, min: 0, max: 100 },
  priorityLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  summary: { type: String, default: '' },
  votes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  isAnonymous: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
