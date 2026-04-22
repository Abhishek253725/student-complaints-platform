const Complaint = require('../models/Complaint');

// ─── Helper: Priority level from score ───────────────────────────────────────
const getPriorityLevel = score => {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
};

// ─── CREATE Complaint ─────────────────────────────────────────────────────────
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, anonymous } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Simple priority score based on keywords (AI ki jagah basic logic)
    let priorityScore = 10;
    const text = (title + ' ' + description).toLowerCase();

    if (text.includes('urgent') || text.includes('emergency') || text.includes('danger')) {
      priorityScore = 90;
    } else if (text.includes('safety') || text.includes('hazard') || text.includes('fire')) {
      priorityScore = 75;
    } else if (text.includes('not working') || text.includes('broken') || text.includes('failed')) {
      priorityScore = 50;
    } else if (text.includes('improve') || text.includes('request') || text.includes('suggest')) {
      priorityScore = 25;
    }

    const complaint = await Complaint.create({
      title:         title.trim(),
      description:   description.trim(),
      category:      category || 'Other',
      isAnonymous:   anonymous || false,
      priorityScore,
      priorityLevel: getPriorityLevel(priorityScore),
      createdBy:     req.user._id,
    });

    // Populate createdBy before sending response
    await complaint.populate('createdBy', 'name email');

    return res.status(201).json({
      message:   'Complaint created successfully',
      complaint,
    });
  } catch (err) {
    console.error('createComplaint error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET All Complaints ───────────────────────────────────────────────────────
const getComplaints = async (req, res) => {
  try {
    const { category, status, priority, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category     = category;
    if (status)   filter.status       = status;
    if (priority) filter.priorityLevel = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    return res.status(200).json({
      complaints,
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('getComplaints error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET Single Complaint ─────────────────────────────────────────────────────
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.status(200).json({ complaint });
  } catch (err) {
    console.error('getComplaintById error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE Status (Admin only) ───────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ['Pending', 'In Progress', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.status(200).json({ message: 'Status updated', complaint });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── VOTE Complaint ───────────────────────────────────────────────────────────
const voteComplaint = async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'

    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({ message: 'Vote type must be "up" or "down"' });
    }

    const update = type === 'up'
      ? { $inc: { votes: 1 } }
      : { $inc: { downvotes: 1 } };

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).populate('createdBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.status(200).json({ message: 'Vote recorded', complaint });
  } catch (err) {
    console.error('voteComplaint error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET Stats (Admin only) ───────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
    ]);

    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priorityLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
      categoryStats,
      priorityStats,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  voteComplaint,
  getStats,
};