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


exports.getCoachScheduleByEmail = async (req, res) => {
  try {
    const { email } = req.query;   
    const coachSchedule = await CoachSchedule.findOne({ email });

    if (!coachSchedule) {
      return res.status(404).json({
        message: "Schedule not found for the provided email",
      });
    }

    const calculateIntervals = (times) => {
      return times.map((time) => {
        const [startHour, startMinute] = time.startTime.split(':').map(Number);
        const [endHour, endMinute] = time.endTime.split(':').map(Number);

        const start = `${startHour % 12 || 12}:${startMinute.toString().padStart(2, '0')} ${startHour >= 12 ? 'PM' : 'AM'}`;
        const end = `${endHour % 12 || 12}:${endMinute.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`;
        return `${start} - ${end}`;
      });
    };

    const response = {
      email: coachSchedule.email,
      schedule: {
        saturday: {
          selected: coachSchedule.schedule.saturday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.saturday.times),
        },
        sunday: {
          selected: coachSchedule.schedule.sunday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.sunday.times),
        },
        monday: {
          selected: coachSchedule.schedule.monday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.monday.times),
        },
        tuesday: {
          selected: coachSchedule.schedule.tuesday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.tuesday.times),
        },
        wednesday: {
          selected: coachSchedule.schedule.wednesday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.wednesday.times),
        },
        thursday: {
          selected: coachSchedule.schedule.thursday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.thursday.times),
        },
        friday: {
          selected: coachSchedule.schedule.friday.selected,
          intervals: calculateIntervals(coachSchedule.schedule.friday.times),
        },
      },
    };

    res.status(200).json({
      message: "Schedule retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while retrieving the schedule",
    });
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
        const currentDate = moment();  

        const groupsWithSessionsToday = await Group.find({
            "sessions.day": today,             
            "startDate": { $gte: currentDate }, 
            "isFinished": false,               
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

        if (sessionsForToday.length === 0) {
            return res.status(200).json({
                message: "No sessions for today",
                data: [],
            });
        }

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
   console.log("Received ID:", id);
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

  exports.getGroupsWithDetails = async (req, res) => {
    try {
      const groups = await Group.find();
  
      const groupDetails = groups.map(group => ({
        id : group._id,
        name: group.name,
        category: group.category,
        daysAndTimes: group.sessions.map(session => ({
          day: session.day,
          time: `${session.time.split(':')[0] % 12 || 12}:${session.time.split(':')[1]} ${
            session.time.split(':')[0] >= 12 ? 'PM' : 'AM'
          }`,
        })), 
        level: group.level,
      }));
  
      res.status(200).json({
        message: "Groups retrieved successfully",
        data: groupDetails,
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  exports.getGroupById = async (req, res) => {
    try {
      const { id } = req.params;
      const group = await Group.findById(id);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
      const formattedSessions = group.sessions.map((session, index) => {
        const startDate = new Date(group.startDate);
        const sessionDayIndex = weekdays.indexOf(session.day.toLowerCase());
  
        if (sessionDayIndex === -1) {
          console.warn(`Invalid session day '${session.day}' for session ${index + 1}`);
          return null;
        }
  
        const startDayIndex = startDate.getDay();
        const dayOffset = (sessionDayIndex - startDayIndex + 7) % 7; 
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + dayOffset + index * 7); 
  
        return {
          id: session._id || null,
          sessionNumber: index + 1,
          sessionDate: sessionDate.toISOString(), 
          sessionDay: weekdays[sessionDate.getDay()], 
          time: session.time,
          feedback: session.feedback,
          customFeedback: session.customFeedback,
        };
      }).filter(Boolean); 
  
      const formattedGroup = {
        name: group.name,
        category: group.category,
        level: group.level,
        startDate: group.startDate,
        sessions: formattedSessions,
      };
  
      res.status(200).json(formattedGroup);
    } catch (error) {
      console.error(`Error retrieving group with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  