import React, { useState } from 'react';
import axios from 'axios';
import './BookAppointmentModal.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export default function BookAppointmentModal({ isOpen, onClose, doctors, patient }) {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedDoctor = doctors.find(d => d.d_id === doctorId);
      if (!selectedDoctor) {
        throw new Error('Please select a doctor');
      }

      await axios.post(`${API_BASE}/backend/appointments`, {
        patientId: patient.p_id,
        patientName: patient.p_name,
        doctorId: selectedDoctor.d_id,
        doctorName: selectedDoctor.d_name,
        date,
        time,
        reason
      });

      setSuccess('Appointment booked successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
        setDoctorId('');
        setDate('');
        setTime('');
        setReason('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Book Appointment</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
              <option value="">-- Choose a doctor --</option>
              {doctors && doctors.length > 0 ? (
                doctors.map(doc => (
                  <option key={doc.d_id || doc._id} value={doc.d_id || doc._id}>
                    {doc.d_name} ({doc.d_specialization})
                  </option>
                ))
              ) : (
                <option value="" disabled>No doctors available (Please refresh the page)</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows="3"></textarea>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
