const CoachSchedule = require('../models/coachSchedule');
const Group = require('../models/trainingGroup')
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const Coach = require('../models/coachSchema');


exports.saveSchedule = async (req, res) => {
  const { email, timeSchedule } = req.body;

  try {
    if (!email || !timeSchedule) {
      return res.status(400).json({ message: 'Email and schedule are required' });
    }

    if (
      !timeSchedule.saturday ||
      !timeSchedule.sunday ||
      !timeSchedule.monday ||
      !timeSchedule.tuesday ||
      !timeSchedule.wednesday ||
      !timeSchedule.thursday ||
      !timeSchedule.friday
    ) {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    const updatedSchedule = await CoachSchedule.findOneAndUpdate(
      { email },
      { email, schedule: timeSchedule },
      { upsert: true, new: true, runValidators: true }
    );

    // Save to Coach
    const updatedCoach = await Coach.findOneAndUpdate(
      { email },
      { schedule: timeSchedule },
      { upsert: false, new: true, runValidators: true } 
    );

    if (!updatedCoach) {
      return res.status(404).json({ message: 'Coach not found for the provided email' });
    }

    res.status(200).json({
      message: 'Schedule updated successfully in both Coach and CoachSchedule models',
      data: { updatedSchedule, updatedCoach },
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getCoachScheduleByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required to retrieve the schedule",
      });
    }

    const coachSchedule = await CoachSchedule.findOne({ email });
    if (!coachSchedule) {
      return res.status(404).json({
        message: "Schedule not found for the provided email",
      });
    }

    const calculateIntervals = (times) =>
      times.map(({ startTime, endTime }) => {
        const formatTime = (time) => {
          const [hour, minute] = time.split(":").map(Number);
          const period = hour >= 12 ? "PM" : "AM";
          const formattedHour = hour % 12 || 12;
          return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
        };
        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
      });

    const mapScheduleDay = (daySchedule) => ({
      selected: daySchedule.selected,
      intervals: calculateIntervals(daySchedule.times),
    });

    const response = {
      email: coachSchedule.email,
      schedule: Object.fromEntries(
        Object.entries(coachSchedule.schedule).map(([day, daySchedule]) => [
          day,
          mapScheduleDay(daySchedule),
        ])
      ),
    };

    res.status(200).json({
      message: "Schedule retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the schedule",
    });
  }
};



exports.createGroup = async (req, res) => {
  const { category, level, classNumber, startDate, numberOfWeeks, seats, initialSessions } = req.body;

  try {
    if (!category || !level || !classNumber || !startDate || !numberOfWeeks || !seats || !initialSessions) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const startMonth = new Date(startDate).toLocaleString('default', { month: 'long' }); 
    const year = new Date(startDate).getFullYear();
    const groupName = `${startMonth}${year}-${category}-Level ${level}-C${classNumber}`;

    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const sessions = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let week = 0; week < numberOfWeeks; week++) {
      for (const session of initialSessions) {
        const sessionDayIndex = weekdays.indexOf(session.day.toLowerCase());
        
        if (sessionDayIndex === -1) {
          return res.status(400).json({ message: `Invalid day '${session.day}' provided` });
        }

        const sessionTime24 = convertTo24Hour(session.time);

        const startDayIndex = start.getDay();
        const dayOffset = (sessionDayIndex - startDayIndex + 7) % 7;
        const sessionDate = new Date(start);
        sessionDate.setDate(start.getDate() + dayOffset);

        const nextSessionDay = new Date(sessionDate);
        const prevSessionDay = new Date(sessionDate);
        nextSessionDay.setDate(sessionDate.getDate() + 7);
        prevSessionDay.setDate(sessionDate.getDate() - 7);

        const diffNext = Math.abs(nextSessionDay - currentDate);
        const diffPrev = Math.abs(prevSessionDay - currentDate);
        
        let finalSessionDate = diffNext < diffPrev ? nextSessionDay : prevSessionDay;

        if (week > 0) {
          finalSessionDate.setDate(finalSessionDate.getDate() + week * 7);
        }

        const isPast = finalSessionDate < currentDate;

        let feedback = 'upcoming';
        if (isPast) {
          feedback = 'done';
        }

        sessions.push({
          day: session.day,
          time: sessionTime24,
          sessionDate: finalSessionDate,
          feedback: feedback,
          customFeedback: 'no feedback yet',
        });
      }
    }

    sessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

    const newGroup = new Group({
      name: groupName,
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

exports.assignGroupToCoach = async (req, res) => {
  const { coachEmail, groupId, duration } = req.body;  

  try {
    if (!coachEmail || !groupId || !duration) {
      return res.status(400).json({ message: 'Coach email, group ID and duration are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const coach = await Coach.findOne({ email: coachEmail });
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const coachSchedule = await CoachSchedule.findOne({ email: coachEmail });
    if (!coachSchedule) {
      return res.status(404).json({ message: 'Coach schedule not found' });
    }

    const updatedSchedule = { ...coachSchedule.schedule };

    for (const session of group.sessions) {
      const sessionDay = session.day.toLowerCase();
      const sessionTime = session.time;

      const daySchedule = updatedSchedule[sessionDay];
      const sessionStartTime = sessionTime;
      const sessionEndTime = getSessionEndTime(sessionStartTime, duration); 
      const lockedSlots = [];
      let availableSlotIndex = -1;
      
      daySchedule.times.forEach((timeSlot, index) => {
        if (isTimeSlotInRange(timeSlot.startTime, sessionStartTime, sessionEndTime)) {
          lockedSlots.push(timeSlot);
          availableSlotIndex = index;
        }
      });

      if (lockedSlots.length > 0) {
        lockedSlots.forEach(slot => {
          const index = daySchedule.times.indexOf(slot);
          if (index !== -1) {
            daySchedule.times.splice(index, 1);  
          }
        });

        session.sessionDate = { startTime: sessionStartTime, endTime: sessionEndTime };
      } else {
        return res.status(400).json({
          message: `No available slot for ${session.day} at ${session.time} for ${duration} hours`,
        });
      }
    }

    await CoachSchedule.findOneAndUpdate(
      { email: coachEmail },
      { schedule: updatedSchedule },
      { new: true }
    );

    coach.groups.push(groupId);
    await coach.save();

    res.status(200).json({
      message: 'Group successfully assigned to coach and schedule updated',
      data: { group, coachSchedule: updatedSchedule },
    });
  } catch (error) {
    console.error('Error assigning group to coach:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSessionEndTime = (startTime, durationInHours) => {
  const [hour, minute] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hour, minute, 0, 0);
  startDate.setHours(startDate.getHours() + durationInHours); 
  return `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
};

const isTimeSlotInRange = (time, startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const [timeHour, timeMinute] = time.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const timeTotalMinutes = timeHour * 60 + timeMinute;

  return timeTotalMinutes >= startTotalMinutes && timeTotalMinutes < endTotalMinutes;
};



  
  const moment = require('moment'); 

  exports.getSessionsForToday = async (req, res) => {
    try {
        const today = moment().format('YYYY-MM-DD');  
        const currentDate = moment();  

        const groupsWithSessionsToday = await Group.find({
            "sessions.sessionDate": today,  
            "startDate": { $lte: currentDate },
            "isFinished": false,
            "paused": { $ne: true },  
        });

        const sessionsForToday = groupsWithSessionsToday.map(group => {
            return group.sessions
                .filter(session => moment(session.sessionDate).format('YYYY-MM-DD') === today)  
                .map(session => ({
                    id: group._id,         
                    sessionId: session._id,     
                    name: group.name,
                    category: group.category,
                    level: group.level,
                    numberOfSeats: group.seats,
                    day: session.day,
                    time: session.time,
                    feedback: session.feedback || 'no feedback yet',
                    startDate: group.startDate.toISOString().split('T')[0],
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


exports.getSessionsForTomorrow = async (req, res) => {
  try {
      const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
      const currentDate = moment();  

      const groupsWithSessionsTomorrow = await Group.find({
          "sessions.sessionDate": tomorrow,  
          "startDate": { $lte: currentDate },
          "isFinished": false,
          "paused": { $ne: true },  
      });

      const sessionsForTomorrow = groupsWithSessionsTomorrow.map(group => {
          return group.sessions
              .filter(session => moment(session.sessionDate).format('YYYY-MM-DD') === tomorrow)  
              .map(session => ({
                  id: group._id,         
                  sessionId: session._id,     
                  name: group.name,
                  category: group.category,
                  level: group.level,
                  numberOfSeats: group.seats,
                  day: session.day,
                  time: session.time,
                  feedback: session.feedback || 'no feedback yet',
                  startDate: group.startDate.toISOString().split('T')[0],
              }));
      }).flat();

      if (sessionsForTomorrow.length === 0) {
          return res.status(200).json({
              message: "No sessions for tomorrow",
              data: [],
          });
      }

      res.status(200).json({
          message: "Sessions for tomorrow retrieved successfully",
          data: sessionsForTomorrow,
      });
  } catch (error) {
      console.error('Error retrieving sessions:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getSessionsForYesterday = async (req, res) => {
  try {
      const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
      const currentDate = moment();  

      const groupsWithSessionsYesterday = await Group.find({
          "sessions.sessionDate": yesterday,  
          "startDate": { $lte: currentDate },
          "isFinished": false,
          "paused": { $ne: true },  
      });

      const sessionsForYesterday = groupsWithSessionsYesterday.map(group => {
          return group.sessions
              .filter(session => moment(session.sessionDate).format('YYYY-MM-DD') === yesterday)  
              .map(session => ({
                  id: group._id,         
                  sessionId: session._id,     
                  name: group.name,
                  category: group.category,
                  level: group.level,
                  numberOfSeats: group.seats,
                  day: session.day,
                  time: session.time,
                  feedback: session.feedback || 'no feedback yet',
                  startDate: group.startDate.toISOString().split('T')[0],
              }));
      }).flat();

      if (sessionsForYesterday.length === 0) {
          return res.status(200).json({
              message: "No sessions for yesterday",
              data: [],
          });
      }

      res.status(200).json({
          message: "Sessions for yesterday retrieved successfully",
          data: sessionsForYesterday,
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
  

exports.toggleGroupStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.isFinished = !group.isFinished; 
    await group.save();

    res.status(200).json({
      message: `Group status updated to ${group.isFinished ? 'finished' : 'not finished'}`,
      data: group,
    });
  } catch (error) {
    console.error('Error toggling group status:', error);
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
        startDate: group.startDate.toISOString().split('T')[0],
        numberOfSeats : group.seats,
        isFinished : group.isFinished
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
        sessionDate: sessionDate.toISOString().split('T')[0], 
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
      startDate: new Date(group.startDate).toISOString().split('T')[0], 
      sessions: formattedSessions,
      isFinished : group.isFinished
    };

    res.status(200).json(formattedGroup);
  } catch (error) {
    console.error(`Error retrieving group with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  

const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier === 'PM' && hours !== '12') {
        hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === 'AM' && hours === '12') {
        hours = '00';
    }

    return `${hours}:${minutes}`;
};

exports.editGroup = async (req, res) => {
    const { id: groupId } = req.params;
    const updatedDetails = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: 'Invalid group ID' });
        }

        if (updatedDetails.sessions) {
            updatedDetails.sessions = updatedDetails.sessions.map(session => ({
                day: session.day,
                time: convertTo24Hour(session.time), 
                feedback: session.feedback || 'upcoming',
                customFeedback: session.customFeedback || 'no feedback yet',
            }));
        }

        const updatedGroup = await Group.findByIdAndUpdate(groupId, updatedDetails, {
            new: true, 
            runValidators: true, 
        });

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Group updated successfully', data: updatedGroup });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.pauseGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const { startDate, endDate } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const pauseStartDate = new Date(startDate);
    const pauseEndDate = new Date(endDate);

    if (pauseStartDate >= pauseEndDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const updatedSessions = group.sessions.map((session) => {
      const sessionDayIndex = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(session.day);
      const sessionDate = new Date(session.sessionDate);

      if (isNaN(sessionDate.getTime())) {
        return session;
      }

      if (sessionDate >= pauseStartDate && sessionDate <= pauseEndDate) {
        const daysToAdd = Math.ceil((pauseEndDate - pauseStartDate) / (1000 * 60 * 60 * 24));

        sessionDate.setDate(sessionDate.getDate() + daysToAdd); 

        const updatedSessionDay = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'][sessionDate.getDay()];

        session.sessionDate = sessionDate;
        session.day = updatedSessionDay;
      }

      return session;
    });

    group.sessions = updatedSessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));
    group.paused = true;

    await group.save();

    res.status(200).json({
      message: 'Group paused and sessions rescheduled successfully',
      data: group,
    });
  } catch (error) {
    console.error('Error pausing group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.resumeGroup = async (req, res) => {
  const { id: groupId } = req.params;
  const { resumeDate } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    if (!resumeDate) {
      return res.status(400).json({ message: 'Resume date is required' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const resumeStartDate = new Date(resumeDate);

    const updatedSessions = group.sessions.map((session) => {
      const sessionDayIndex = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(session.day);
      const sessionDate = new Date(session.sessionDate);

      if (isNaN(sessionDate.getTime())) {
        return session;
      }

      if (sessionDate >= resumeStartDate) {
        const sessionDayOfWeek = sessionDate.getDay();
        const daysToAdd = (sessionDayOfWeek - resumeStartDate.getDay() + 7) % 7;

        sessionDate.setDate(sessionDate.getDate() + daysToAdd); 

        session.sessionDate = sessionDate;

        session.day = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'][sessionDate.getDay()];
      }

      return session;
    });

    group.sessions = updatedSessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

    group.paused = false;

    await group.save();

    res.status(200).json({
      message: 'Group resumed and sessions rescheduled successfully',
      data: group,
    });
  } catch (error) {
    console.error('Error resuming group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



