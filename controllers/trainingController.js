const CoachSchedule = require('../models/coachSchedule');
const Group = require('../models/trainingGroup')
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


exports.createGroup = async (req, res) => {
    const { name, level, startDate, numberOfWeeks, category, seats, initialSessions } = req.body;
  
    try {
      if (!name || !level || !startDate || !numberOfWeeks || !category || !seats || !initialSessions) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const sessions = initialSessions.map(session => ({
        day: session.day,
        time: session.time,
        feedback: session.feedback || 'upcoming',
        customFeedback: 'no feedback yet',
      }));
  
      const newGroup = new Group({
        name,
        level,
        startDate,
        numberOfWeeks,
        category,
        seats,
        sessions,
        isFinished: false,
      });
  
      await newGroup.save();
  
      res.status(201).json({ message: 'Group created successfully', data: newGroup });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const moment = require('moment'); 

  exports.getSessionsForToday = async (req, res) => {
    try {
      const today = moment().format('dddd').toLowerCase();  
  
      const groupsWithSessionsToday = await Group.find({
        "sessions.day": today,  
      });
  
      const sessionsForToday = groupsWithSessionsToday.map(group => {
        return group.sessions
          .filter(session => session.day === today)
          .map(session => ({
            groupId: group._id,         
            sessionId: session._id,     
            groupName: group.name,
            category: group.category,
            day: session.day,
            time: session.time,
            feedback: session.feedback || 'no feedback yet',
          }));
      }).flat();
  
      res.status(200).json({
        message: "Sessions for today retrieved successfully",
        data: sessionsForToday,
      });
    } catch (error) {
      console.error('Error retrieving sessions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

exports.submitFeedback = async (req, res) => {
    const { groupId, sessionId, feedback, customFeedback } = req.body;
  
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      const session = group.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      session.feedback = feedback;
      session.customFeedback = customFeedback || session.customFeedback;  
  
      await group.save();
  
      res.status(200).json({
        message: 'Feedback submitted successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

exports.finishGroup = async (req, res) => {
    const { id } = req.params;
  
    try {
      const group = await Group.findByIdAndUpdate(
        id,
        { isFinished: true },
        { new: true }
      );
  
      if (!group) {
        return res.status(400).json({ message: 'Group not found' });
      }
  
      res.status(200).json({ message: 'Group marked as finished', data: group });
    } catch (error) {
      console.error('Error finishing group:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };