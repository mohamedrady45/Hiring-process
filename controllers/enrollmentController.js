const CoachSchedule = require('../models/coachSchedule');
const Group = require('../models/trainingGroup')
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const Coach = require('../models/coachSchema');
const StudentHistory = require('../models/studentHistory');  


exports.getEnrollmentRequests = async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
    // اللي مش مدفوع بس
      const pendingRequests = group.requests.filter(request => !request.paid);
  
      res.status(200).json({ message: 'Enrollment requests fetched successfully', data: pendingRequests });
    } catch (error) {
      console.error('Error fetching enrollment requests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
exports.requestToEnroll = async (req, res) => {
    const { groupId, studentName, studentEmail , studentPhone } = req.body;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      if (group.seats <= 0) {
        return res.status(400).json({ message: 'No available seats' });
      }
  
      group.requests.push({ studentName, studentEmail,studentPhone ,  paid: false });
      await group.save();
  
      res.status(201).json({ message: 'Request to enroll submitted successfully' });
    } catch (error) {
      console.error('Error submitting enrollment request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.confirmPaymentAndEnroll = async (req, res) => {
    const { groupId, requestId } = req.params;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      const request = group.requests.id(requestId);
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      request.paid = true;
  
      group.enrolledStudents.push({
        studentName: request.studentName,
        studentEmail: request.studentEmail,
        studentPhone: request.studentPhone,
      });
  
      group.seats -= 1;
  
      group.requests.id(requestId).remove();
  
      await group.save();
  
      const studentHistory = await StudentHistory.findOne({ studentEmail: request.studentEmail });
  
      if (!studentHistory) {
        const newStudentHistory = new StudentHistory({
          studentEmail: request.studentEmail,
          actions: [
            {
              action: 'enrolled',
              fromGroup: null,  
              toGroup: groupId,
              date: new Date(),
              description: `Enrolled in group ${group.name}`,
              reason: null,
            },
          ],
        });
  
        await newStudentHistory.save();
      } else {
        studentHistory.actions.push({
          action: 'enrolled',
          fromGroup: null,  
          toGroup: groupId,
          date: new Date(),
          description: `Enrolled in group ${group.name}`,
          reason: null,
        });
  
        await studentHistory.save();
      }
  
      res.status(200).json({ message: 'Student successfully enrolled and history updated' });
    } catch (error) {
      console.error('Error confirming payment and enrolling:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

exports.getEnrolledStudents = async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      res.status(200).json({
        message: 'Enrolled students fetched successfully',
        data: group.enrolledStudents.map(student => ({
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          studentPhone: student.studentPhone,  
        })),
      });
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


exports.enrollStudent = async (req, res) => {
    const { groupId } = req.params;
    const { studentName, studentEmail, studentPhone } = req.body;
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      if (group.seats <= 0) {
        return res.status(400).json({ message: 'No available seats in the group' });
      }
  
      group.enrolledStudents.push({
        studentName,
        studentEmail,
        studentPhone,
      });
  
      group.seats -= 1;
  
      await group.save();
      const studentHistory = await StudentHistory.findOne({ studentEmail: request.studentEmail });
  
      if (!studentHistory) {
        const newStudentHistory = new StudentHistory({
          studentEmail: request.studentEmail,
          actions: [
            {
              action: 'enrolled',
              fromGroup: null,  
              toGroup: groupId,
              date: new Date(),
              description: `Enrolled in group ${group.name}`,
              reason: null,
            },
          ],
        });
  
        await newStudentHistory.save();
      } else {
        studentHistory.actions.push({
          action: 'enrolled',
          fromGroup: null,  
          toGroup: groupId,
          date: new Date(),
          description: `Enrolled in group ${group.name}`,
          reason: null,
        });
  
        await studentHistory.save();
      }
  
      res.status(200).json({ message: 'Student enrolled successfully', data: group });
    } catch (error) {
      console.error('Error enrolling student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  exports.transferStudent = async (req, res) => {
    const { fromGroupId, toGroupId, studentEmail } = req.params;
  
    try {
      const fromGroup = await Group.findById(fromGroupId);
      if (!fromGroup) {
        return res.status(404).json({ message: 'Source group not found' });
      }
  
      const toGroup = await Group.findById(toGroupId);
      if (!toGroup) {
        return res.status(404).json({ message: 'Target group not found' });
      }
  
      const student = fromGroup.enrolledStudents.find(student => student.studentEmail === studentEmail);
      if (!student) {
        return res.status(404).json({ message: 'Student not found in source group' });
      }
  
      fromGroup.enrolledStudents = fromGroup.enrolledStudents.filter(student => student.studentEmail !== studentEmail);
  
      toGroup.enrolledStudents.push({
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        studentPhone: student.studentPhone,
        enrolledDate: student.enrolledDate,
      });
  
      fromGroup.seats += 1;
      toGroup.seats -= 1;
  
      await fromGroup.save();
      await toGroup.save();
  
      await StudentHistory.updateOne(
        { studentEmail },  
        {
          $push: {
            actions: {
              action: 'transferred',
              fromGroup: fromGroup._id,
              toGroup: toGroup._id,
              description: `Transferred from group ${fromGroup.name} to group ${toGroup.name}`,
            }
          }
        },
        { upsert: true }  
      );
  
      res.status(200).json({ message: 'Student successfully transferred' });
    } catch (error) {
      console.error('Error transferring student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
exports.removeStudent = async (req, res) => {
    const { groupId, studentEmail, reason } = req.body;  
  
    try {
      const group = await Group.findById(groupId);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      const student = group.enrolledStudents.find(student => student.studentEmail === studentEmail);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found in the group' });
      }
  
      group.enrolledStudents = group.enrolledStudents.filter(student => student.studentEmail !== studentEmail);
  
      group.seats += 1;
      await group.save();
  
      await StudentHistory.updateOne(
        { studentEmail },  
        {
          $push: {
            actions: {
              action: 'removed',
              fromGroup: group._id,
              description: `Removed from group ${group.name} for reason: ${reason}`,
            }
          }
        },
        { upsert: true }  
      );
  
      res.status(200).json({ message: 'Student successfully removed', data: { studentName: student.studentName, reason } });
    } catch (error) {
      console.error('Error removing student:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  exports.getStudentDetailsWithHistory = async (req, res) => {
    const { studentEmail } = req.params;
  
    try {
      const studentHistory = await StudentHistory.findOne({ studentEmail });
  
      if (!studentHistory) {
        return res.status(404).json({ message: 'No history found for this student' });
      }
  
      const enrolledGroup = await Group.findOne({
        enrolledStudents: { $elemMatch: { studentEmail } },
      });
  
      if (!enrolledGroup) {
        return res.status(404).json({ message: 'Student not enrolled in any group' });
      }
  
      const student = enrolledGroup.enrolledStudents.find(
        student => student.studentEmail === studentEmail
      );
  
      const actionsWithGroupNames = await Promise.all(
        studentHistory.actions.map(async (action) => {
          if (action.fromGroup && action.toGroup) {
            const fromGroup = await Group.findById(action.fromGroup);
            const toGroup = await Group.findById(action.toGroup);
  
            return {
              ...action,
              fromGroupName: fromGroup ? fromGroup.name : 'Unknown Group',
              toGroupName: toGroup ? toGroup.name : 'Unknown Group',
            };
          }
          return action;
        })
      );
  
      const response = {
        studentDetails: {
          name: student.studentName,
          email: student.studentEmail,
          phone: student.studentPhone,
        },
        history: actionsWithGroupNames,
      };
  
      res.status(200).json({ message: 'Student details and history fetched successfully', data: response });
  
    } catch (error) {
      console.error('Error fetching student details and history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  
  