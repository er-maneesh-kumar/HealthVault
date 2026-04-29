import Appointment from '../models/appointment.model.js';

export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, patientName, doctorName, date, time, reason } = req.body;

    if (!patientId || !doctorId || !date || !time || !reason) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      patientName,
      doctorName,
      date,
      time,
      reason
    });

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('[createAppointment] error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId }).sort({ date: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('[getAppointmentsByPatient] error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId }).sort({ date: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('[getAppointmentsByDoctor] error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment status updated', appointment });
  } catch (error) {
    console.error('[updateAppointmentStatus] error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('[deleteAppointment] error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
