const Applicant = require('../models/Applicants');
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
    res.status(201).json(newApplicant);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().select('name email cv status'); 
    
    const response = applicants.map(applicant => ({
      id: applicant._id, 
      name: applicant.name,
      email: applicant.email,
      cv: applicant.cv, 
      status: applicant.status,
    }));

    res.status(200).json(response); 
  } catch (err) {
    console.error('Error fetching applicants:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status, applicantIds } = req.body;

    if (!status || !applicantIds || !Array.isArray(applicantIds) || applicantIds.length === 0) {
      return res.status(400).json({ message: 'Status and applicantIds are required.' });
    }

    const objectIds = applicantIds.map(id => new mongoose.Types.ObjectId(id));

    const result = await Applicant.updateMany(
      { _id: { $in: objectIds } },
      { status },
      { new: true } 
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No applicants were modified. Check the provided IDs.' });
    }

    res.json({
      message: `${result.modifiedCount} applicant(s) updated successfully.`,
      updatedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};