const CoachSchedule = require('../models/coachSchedule');

exports.saveSchedule = async (req, res) => {
  const { email, timeSchedule } = req.body;

  try {
    if (!email || !timeSchedule) {
      return res.status(400).json({ message: 'Email and schedule are required' });
    }

    const updatedSchedule = await CoachSchedule.findOneAndUpdate(
      { email },
      { email, schedule: timeSchedule }, 
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Schedule saved successfully', data: updatedSchedule });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};