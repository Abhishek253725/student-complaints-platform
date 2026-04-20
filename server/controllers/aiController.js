const { analyzeComplaint } = require('../utils/aiAnalyzer');

exports.analyze = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length < 10)
      return res.status(400).json({ message: 'Description is required (min 10 chars)' });

    const result = await analyzeComplaint(description);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
