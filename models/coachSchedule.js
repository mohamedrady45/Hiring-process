const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true }   
});

const DayScheduleSchema = new mongoose.Schema({
  selected: { type: Boolean, required: true },
  times: [TimeSlotSchema] 
});

const CoachScheduleSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, 
  schedule: {
    saturday: { type: DayScheduleSchema, required: true },
    sunday: { type: DayScheduleSchema, required: true },
    monday: { type: DayScheduleSchema, required: true },
    tuesday: { type: DayScheduleSchema, required: true },
    wednesday: { type: DayScheduleSchema, required: true },
    thursday: { type: DayScheduleSchema, required: true },
    friday: { type: DayScheduleSchema, required: true }
  }
});

const coachSchedule = mongoose.model('CoachSchedule', CoachScheduleSchema);

module.exports = coachSchedule;
