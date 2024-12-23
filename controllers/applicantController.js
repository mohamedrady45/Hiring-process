const { Applicant, Application } = require('../models/Applicants'); 
const mongoose = require('mongoose');

exports.createApplicant = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!req.file) {
      return res.status(400).send('CV file is required');
    }

    const cvUrl = req.file.path;

    const newApplicant = new Applicant({
      name,
      email,
      cv: cvUrl,
    });

    await newApplicant.save();

    const newApplication = new Application({
      applicant: newApplicant._id,
      status: 'Pending',
      interviewDate:'2024-10-25T09:00:00Z', 
      feedback: 'No feedback provided', 
      meetingLink: null, 
      interviewer: 'Rady', 
    });

    await newApplication.save();

    res.status(201).json(newApplication);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAllApplicants = async (req, res) => {
  try {
    const applications = await Application.find({ status: 'Pending' })
      .populate('applicant', 'name email cv') 
      .select('status interviewDate feedback meetingLink interviewer'); 

    const response = applications.map(application => ({
      id: application._id,
      name: application.applicant.name,
      email: application.applicant.email,
      cv: application.applicant.cv,
      status: application.status,
      interviewDate: application.interviewDate,
      feedback: application.feedback,
      meetingLink: application.meetingLink,
      interviewer: application.interviewer,
    }));
    

    res.status(200).json(response);
  } catch (err) {   
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, applicantIds } = req.body;

    if (!status || !applicantIds || !Array.isArray(applicantIds) || applicantIds.length === 0) {
      return res.status(400).json({ message: 'Status and applicationIds are required.' });
    }

    const objectIds = applicantIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (objectIds.length === 0) {
      return res.status(400).json({ message: 'No valid application IDs provided.' });
    }

    const validObjectIds = objectIds.map(id => new mongoose.Types.ObjectId(id));

    const result = await Application.updateMany(
      { _id: { $in: validObjectIds } },
      { status },
      { new: true }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No applications were modified. Check the provided IDs.' });
    }

    res.json({
      message: `${result.modifiedCount} application(s) updated successfully.`,
      updatedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
