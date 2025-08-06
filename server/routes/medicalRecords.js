const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  createMedicalRecord,
  getPatientMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
  updatePatientVitals,
  getPatientVitalsHistory,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');

const router = express.Router();

// Validation middleware
const createMedicalRecordValidation = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('appointmentId').optional().isMongoId().withMessage('Valid appointment ID is required'),
  body('diagnosis').optional().trim(),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('treatment').optional().trim(),
  body('notes').optional().trim(),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
  body('followUp.required').optional().isBoolean().withMessage('Follow-up required must be boolean'),
  body('followUp.date').optional().isISO8601().withMessage('Valid follow-up date is required'),
  body('followUp.notes').optional().trim()
];

const updateVitalsValidation = [
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be a positive number'),
  body('heartRate').optional().isInt({ min: 30, max: 200 }).withMessage('Heart rate must be between 30 and 200'),
  body('bloodPressure.systolic').optional().isInt({ min: 70, max: 200 }).withMessage('Systolic pressure must be between 70 and 200'),
  body('bloodPressure.diastolic').optional().isInt({ min: 40, max: 130 }).withMessage('Diastolic pressure must be between 40 and 130'),
  body('temperature').optional().isFloat({ min: 35, max: 42 }).withMessage('Temperature must be between 35 and 42')
];

const updateMedicalRecordValidation = [
  body('diagnosis').optional().trim(),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('treatment').optional().trim(),
  body('notes').optional().trim(),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
  body('followUp.required').optional().isBoolean().withMessage('Follow-up required must be boolean'),
  body('followUp.date').optional().isISO8601().withMessage('Valid follow-up date is required'),
  body('followUp.notes').optional().trim()
];

// All routes require authentication
router.use(auth);

// Doctor only routes
router.post('/', authorize('doctor'), createMedicalRecordValidation, createMedicalRecord);
router.put('/:id', authorize('doctor'), updateMedicalRecordValidation, updateMedicalRecord);
router.delete('/:id', authorize('doctor'), deleteMedicalRecord);

// Routes for both doctors and patients
router.get('/patient/:patientId', getPatientMedicalRecords);
router.get('/:id', getMedicalRecord);
router.put('/vitals/:patientId', updateVitalsValidation, updatePatientVitals);
router.get('/vitals/:patientId', getPatientVitalsHistory);

module.exports = router; 