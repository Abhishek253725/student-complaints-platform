const Vote = require('../models/Vote');
const Complaint = require('../models/Complaint');

exports.castVote = async (req, res) => {
  try {
    const { complaintId, voteType } = req.body;
    if (!['up', 'down'].includes(voteType))
      return res.status(400).json({ message: 'voteType must be "up" or "down"' });

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const existing = await Vote.findOne({ userId: req.user._id, complaintId });

    if (existing) {
      if (existing.voteType === voteType) {
        // Remove vote (toggle off)
        await Vote.deleteOne({ _id: existing._id });
        const field = voteType === 'up' ? 'votes' : 'downvotes';
        await Complaint.findByIdAndUpdate(complaintId, { $inc: { [field]: -1 } });
        return res.json({ message: 'Vote removed' });
      } else {
        // Switch vote
        const oldField = existing.voteType === 'up' ? 'votes' : 'downvotes';
        const newField = voteType === 'up' ? 'votes' : 'downvotes';
        existing.voteType = voteType;
        await existing.save();
        await Complaint.findByIdAndUpdate(complaintId, { $inc: { [oldField]: -1, [newField]: 1 } });
        return res.json({ message: 'Vote updated' });
      }
    }

    // New vote
    await Vote.create({ userId: req.user._id, complaintId, voteType });
    const field = voteType === 'up' ? 'votes' : 'downvotes';
    await Complaint.findByIdAndUpdate(complaintId, { $inc: { [field]: 1 } });

    // Emit real-time update
    req.app.get('io').emit('voteUpdated', { complaintId });

    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
