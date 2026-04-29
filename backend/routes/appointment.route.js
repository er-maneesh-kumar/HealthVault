import express from 'express';
import {
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  updateAppointmentStatus
} from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/patient/:patientId', getAppointmentsByPatient);
router.get('/doctor/:doctorId', getAppointmentsByDoctor);
router.put('/:id/status', updateAppointmentStatus);

export default router;
