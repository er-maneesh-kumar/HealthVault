import React, { useState, useEffect } from 'react';
import './Doctordashboard.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext.js'; // Import the useAuth hook

function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [patientInteractions, setPatientInteractions] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://healthvault-qhqn.onrender.com');

  useEffect(() => {
    if (currentUser) {
      fetchData(currentUser.uid);
    }
  }, [currentUser]);

  const fetchData = async (firebaseUid) => {
    try {
      // Fetch doctor data
      const doctorResponse = await axios.get(`${API_BASE}/backend/doctors?firebaseUid=${firebaseUid}`);
      const currentDoctor = doctorResponse.data[0];
      setDoctor(currentDoctor);

      if (currentDoctor) {
        // Fetch patient interactions data and appointments
        const [interactionsResponse, appointmentsResponse] = await Promise.all([
          axios.get(`${API_BASE}/backend/pdinteraction?doctorId=${currentDoctor.d_id}`),
          axios.get(`${API_BASE}/backend/appointments/doctor/${currentDoctor.d_id}`)
        ]);
        setPatientInteractions(interactionsResponse.data);
        setAppointments(appointmentsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getPatientName = (patientId) => {
    const interaction = patientInteractions.find(i => i.p_id === patientId);
    return interaction ? interaction.p_name : 'Unknown';
  };

  const toggleDetails = (id) => {
    setPatientInteractions(prevInteractions =>
      prevInteractions.map(interaction =>
        interaction._id === id ? { ...interaction, open: !interaction.open } : interaction
      )
    );
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/backend/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(apt => apt._id === id ? { ...apt, status: newStatus } : apt));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="doctorDashboardMainContainer">
      <div className="doctorDashboardContainer">
        {doctor && (
          <div className="doctorInfoContainer">
            <div className="profileImageName">
              <div className="profileImageSection">
                <img src={doctor.avatar} alt="" />
              </div>
              <div className="doctorNameId">
                <span>{doctor.d_name}</span> <br />
                {doctor.d_id}
              </div>
            </div>
            <div className="doctorDetails">
              <ul>
                <li>Gender : {doctor.d_gender}</li>
                <li>Age : {doctor.d_age}</li>
              </ul>
              <ul>
                <li>Qualifications: {doctor.d_qualifications}</li>
                <li>Email: {doctor.email}</li>
              </ul>
            </div>
          </div>
        )}
        <div className="patientInteractionSection">
          {appointments.length > 0 && (
            <div className="appointmentsContainer" style={{ marginBottom: '30px' }}>
              <h2>Appointment Requests</h2>
              {appointments.map(apt => (
                <div key={apt._id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', background: '#f9f9f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>Patient: {apt.patientName}</strong>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8em',
                      background: apt.status === 'confirmed' ? '#d4edda' : apt.status === 'pending' ? '#fff3cd' : '#f8d7da',
                      color: apt.status === 'confirmed' ? '#155724' : apt.status === 'pending' ? '#856404' : '#721c24'
                    }}>
                      {apt.status.toUpperCase()}
                    </span>
                  </div>
                  <div>Date: {new Date(apt.date).toLocaleDateString()} at {apt.time}</div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px', marginBottom: '15px' }}>Reason: {apt.reason}</div>
                  
                  {apt.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleStatusUpdate(apt._id, 'confirmed')} style={{ padding: '5px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm</button>
                      <button onClick={() => handleStatusUpdate(apt._id, 'cancelled')} style={{ padding: '5px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  )}
                  {apt.status === 'confirmed' && (
                    <button onClick={() => handleStatusUpdate(apt._id, 'completed')} style={{ padding: '5px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Mark Completed</button>
                  )}
                </div>
              ))}
            </div>
          )}

          <h2>Patient Interactions</h2>
          <div className="accordionContainer">
            {patientInteractions.map(interaction => (
              <div key={interaction._id}>
                <div className="fiterTime">
                  {new Date(interaction.meeting_date).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </div>
                <div className="accordionSummary" onClick={() => toggleDetails(interaction._id)}>
                  <p>{getPatientName(interaction.p_id)}</p>
                  <FontAwesomeIcon className="accordionArrow" icon={interaction.open ? faCaretUp : faCaretDown} />
                </div>
                {interaction.open && (
                  <div className="accordianDetails">
                    <p>Symptoms: {interaction.symptoms.join(', ')}</p>
                    <p>Medicines Provided: {interaction.medicines_provided.join(', ')}</p>
                    <p>Documents: {interaction.documents.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
