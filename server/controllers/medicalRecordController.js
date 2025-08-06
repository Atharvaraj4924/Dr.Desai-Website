const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { validationResult } = require('express-validator');

// @desc    Create medical record (Doctor only)
// @route   POST /api/medical-records
// @access  Private (Doctor only)
const createMedicalRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patientId,
      appointmentId,
      vitals,
      diagnosis,
      symptoms,
      prescription,
      treatment,
      followUp,
      allergies,
      medicalHistory,
      notes
    } = req.body;

    // Check if patient exists
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if appointment exists (optional)
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
    }

    const medicalRecord = new MedicalRecord({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId,
      vitals,
      diagnosis,
      symptoms,
      prescription,
      treatment,
      followUp,
      allergies,
      medicalHistory,
      notes
    });

    await medicalRecord.save();

    await medicalRecord.populate([
      { path: 'patient', select: 'name age gender' },
      { path: 'doctor', select: 'name specialization' },
      { path: 'appointment', select: 'date time reason' }
    ]);

    res.status(201).json({
      message: 'Medical record created successfully',
      medicalRecord
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get medical records for a patient
// @route   GET /api/medical-records/patient/:patientId
// @access  Private (Doctor or Patient)
const getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user has access to this patient's records
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const medicalRecords = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MedicalRecord.countDocuments({ patient: patientId });

    res.json({
      medicalRecords,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
// @access  Private
const getMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name age gender phone address')
      .populate('doctor', 'name specialization phone')
      .populate('appointment', 'date time reason symptoms');

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if user has access to this record
    if (medicalRecord.doctor._id.toString() !== req.user.id && 
        medicalRecord.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update medical record (Doctor only)
// @route   PUT /api/medical-records/:id
// @access  Private (Doctor only)
const updateMedicalRecord = async (req, res) => {
  try {
    const {
      vitals,
      diagnosis,
      symptoms,
      prescription,
      treatment,
      followUp,
      allergies,
      medicalHistory,
      notes
    } = req.body;

    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if doctor owns this record
    if (medicalRecord.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (vitals) medicalRecord.vitals = vitals;
    if (diagnosis) medicalRecord.diagnosis = diagnosis;
    if (symptoms) medicalRecord.symptoms = symptoms;
    if (prescription) medicalRecord.prescription = prescription;
    if (treatment) medicalRecord.treatment = treatment;
    if (followUp) medicalRecord.followUp = followUp;
    if (allergies) medicalRecord.allergies = allergies;
    if (medicalHistory) medicalRecord.medicalHistory = medicalHistory;
    if (notes) medicalRecord.notes = notes;

    await medicalRecord.save();

    await medicalRecord.populate([
      { path: 'patient', select: 'name age gender' },
      { path: 'doctor', select: 'name specialization' },
      { path: 'appointment', select: 'date time reason' }
    ]);

    res.json({
      message: 'Medical record updated successfully',
      medicalRecord
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update patient vitals (Patient or Doctor)
// @route   PUT /api/medical-records/vitals/:patientId
// @access  Private
const updatePatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { weight, height, heartRate, bloodPressure, temperature } = req.body;

    // Check if user has access to update this patient's vitals
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the latest medical record for this patient
    let medicalRecord = await MedicalRecord.findOne({ patient: patientId })
      .sort({ createdAt: -1 });

    if (!medicalRecord) {
      // Create new medical record if none exists
      medicalRecord = new MedicalRecord({
        patient: patientId,
        doctor: req.user.role === 'doctor' ? req.user.id : null,
        vitals: {}
      });
    }

    // Update vitals with current date
    const currentDate = new Date();
    if (weight) {
      medicalRecord.vitals.weight = { value: weight, unit: 'kg', date: currentDate };
    }
    if (height) {
      medicalRecord.vitals.height = { value: height, unit: 'cm', date: currentDate };
    }
    if (heartRate) {
      medicalRecord.vitals.heartRate = { value: heartRate, unit: 'bpm', date: currentDate };
    }
    if (bloodPressure) {
      medicalRecord.vitals.bloodPressure = { 
        systolic: bloodPressure.systolic, 
        diastolic: bloodPressure.diastolic, 
        date: currentDate 
      };
    }
    if (temperature) {
      medicalRecord.vitals.temperature = { value: temperature, unit: '°C', date: currentDate };
    }

    await medicalRecord.save();

    await medicalRecord.populate([
      { path: 'patient', select: 'name age gender' },
      { path: 'doctor', select: 'name specialization' }
    ]);

    res.json({
      message: 'Patient vitals updated successfully',
      medicalRecord
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient vitals history
// @route   GET /api/medical-records/vitals/:patientId
// @access  Private
const getPatientVitalsHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if user has access to this patient's vitals
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const medicalRecords = await MedicalRecord.find({ 
      patient: patientId,
      'vitals.weight.value': { $exists: true }
    })
    .select('vitals createdAt')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(medicalRecords);
  } catch (error) {
    console.error('Get vitals history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete medical record (Doctor only)
// @route   DELETE /api/medical-records/:id
// @access  Private (Doctor only)
const deleteMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    // Check if doctor owns this record
    if (medicalRecord.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await medicalRecord.remove();

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
  updatePatientVitals,
  getPatientVitalsHistory,
  deleteMedicalRecord
}; 