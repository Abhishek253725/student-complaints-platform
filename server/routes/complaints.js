const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  getStats,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getStats);
router.route('/')
  .get(protect, getComplaints)
  .post(protect, createComplaint);
router.get('/:id', protect, getComplaintById);
router.put('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
