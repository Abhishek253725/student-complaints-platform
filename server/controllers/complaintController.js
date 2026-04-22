const Complaint = require('../models/Complaint');
const { analyzeComplaint } = require('../utils/aiAnalyzer');
const { sendEmail } = require('../utils/mailer');

// ✅ CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, anonymous } = req.body;

    // 🔒 Validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // 🔒 Ensure user exists (JWT)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // 🤖 Safe AI Handling (fallback if AI fails)
    let aiResult = {
      category: 'Other',
      priorityScore: 0,
      priorityLevel: 'Low',
      summary: ''
    };

    try {
      const result = await analyzeComplaint(description);
      if (result) aiResult = result;
    } catch (err) {
      console.log("AI ERROR:", err.message);
    }

    // 💾 Save to DB
    const complaint = await Complaint.create({
      title,
      description,
      category: aiResult.category,
      priorityScore: aiResult.priorityScore,
      priorityLevel: aiResult.priorityLevel,
      summary: aiResult.summary,
      isAnonymous: anonymous || false,
      createdBy: req.user._id,
    });

    console.log("✅ Complaint Saved:", complaint._id);

    // 📡 Emit Socket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('newComplaint', complaint);
    }

    // 📧 Email Notification (only High/Critical)
    if (['High', 'Critical'].includes(aiResult.priorityLevel)) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `[VoiceRank AI] ${aiResult.priorityLevel} Priority Complaint: ${title}`,
          html: `
            <h2>New ${aiResult.priorityLevel} priority complaint submitted</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Category:</strong> ${aiResult.category}</p>
            <p><strong>Priority Score:</strong> ${aiResult.priorityScore}</p>
            <p><strong>Description:</strong> ${description}</p>
          `,
        });
      } catch (emailErr) {
        console.log("Email Error:", emailErr.message);
      }
    }

    res.status(201).json(complaint);

  } catch (err) {
    console.error("❌ CREATE COMPLAINT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL COMPLAINTS
exports.getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, sort = 'votes', search } = req.query;

    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = sort === 'votes' ? { votes: -1 } : { priorityScore: -1 };

    const complaints = await Complaint.find(filter)
      .populate('createdBy', 'name role')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      complaints,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page)
    });

  } catch (err) {
    console.error("❌ GET COMPLAINTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET SINGLE COMPLAINT
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);

  } catch (err) {
    console.error("❌ GET BY ID ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // 📡 Socket emit
    const io = req.app.get('io');
    if (io) {
      io.emit('complaintUpdated', complaint);
    }

    // 📧 Email on resolve
    if (
      status === 'Resolved' &&
      !complaint.isAnonymous &&
      complaint.createdBy?.email
    ) {
      try {
        await sendEmail({
          to: complaint.createdBy.email,
          subject: `[VoiceRank AI] Your complaint has been resolved`,
          html: `
            <h2>Your complaint has been resolved</h2>
            <p><strong>Title:</strong> ${complaint.title}</p>
            <p>Thank you for raising this issue.</p>
          `,
        });
      } catch (emailErr) {
        console.log("Email Error:", emailErr.message);
      }
    }

    res.json(complaint);

  } catch (err) {
    console.error("❌ UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET STATS
exports.getStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });

    const highPriority = await Complaint.countDocuments({
      priorityLevel: { $in: ['High', 'Critical'] }
    });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      resolved,
      pending,
      inProgress,
      highPriority,
      byCategory,
      byStatus
    });

  } catch (err) {
    console.error("❌ STATS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};