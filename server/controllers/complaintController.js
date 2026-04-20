const Complaint = require('../models/Complaint');
const { analyzeComplaint } = require('../utils/aiAnalyzer');
const { sendEmail } = require('../utils/mailer');

exports.createComplaint = async (req, res) => {
  try {
    const { title, description, anonymous } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: 'Title and description are required' });

    // AI Analysis
    const aiResult = await analyzeComplaint(description);

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

    // Emit real-time event
    req.app.get('io').emit('newComplaint', complaint);

    // Email admin if High/Critical
    if (['High', 'Critical'].includes(aiResult.priorityLevel)) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `[VoiceRank AI] ${aiResult.priorityLevel} Priority Complaint: ${title}`,
        html: `<h2>New ${aiResult.priorityLevel} priority complaint submitted</h2>
               <p><strong>Title:</strong> ${title}</p>
               <p><strong>Category:</strong> ${aiResult.category}</p>
               <p><strong>Priority Score:</strong> ${aiResult.priorityScore}</p>
               <p><strong>Description:</strong> ${description}</p>`,
      });
    }

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, sort = 'votes', search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const sortObj = sort === 'votes' ? { votes: -1 } : { priorityScore: -1 };

    const complaints = await Complaint.find(filter)
      .populate('createdBy', 'name role')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({ complaints, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('createdBy', 'name role');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'In Progress', 'Resolved'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Notify via socket
    req.app.get('io').emit('complaintUpdated', complaint);

    // Email submitter on resolve
    if (status === 'Resolved' && !complaint.isAnonymous && complaint.createdBy?.email) {
      await sendEmail({
        to: complaint.createdBy.email,
        subject: `[VoiceRank AI] Your complaint has been resolved`,
        html: `<h2>Good news! Your complaint has been resolved.</h2>
               <p><strong>Title:</strong> ${complaint.title}</p>
               <p>Thank you for raising this issue. The college administration has taken action.</p>`,
      });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const highPriority = await Complaint.countDocuments({ priorityLevel: { $in: ['High', 'Critical'] } });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ total, resolved, pending, inProgress, highPriority, byCategory, byStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
