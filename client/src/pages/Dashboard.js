import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Filter from '../components/Filter.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext.js';
import Loader from '../components/Loader';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import BookAppointmentModal from '../components/BookAppointmentModal';

function Dashboard() {
  const { currentUser } = useAuth(); // Access the current user object from the auth context
  const [loading, setLoading] = useState(true); // State to manage loading indicator
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [ongoingTreatments, setOngoingTreatments] = useState([]);
  const [filters, setFilters] = useState({});
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Function to calculate time remaining for a treatment
  const calculateTimeRemaining = (treatment) => {
    const now = new Date();
    const meetingDate = new Date(treatment.meeting_date);
    const endDate = new Date(meetingDate.getTime() + treatment.treatment_duration * 24 * 60 * 60 * 1000); // Calculate end date based on meeting date and treatment duration
    const timeDiff = endDate - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days and round up
    return `${daysRemaining} days`;
  };

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    // Perform filtering logic here based on the updated filters state
    console.log("Filters:", filters);
  };

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

  useEffect(() => {
    if (currentUser) {
      fetchData(currentUser.uid);
    } else {
      // No user logged in — stop loading immediately
      setLoading(false);
    }
  }, [currentUser]);

  const fetchData = async (firebaseUid) => {
    try {
      const patientResponse = await axios.get(`${API_BASE}/backend/patients?firebaseUid=${firebaseUid}`);
      const currentPatient = patientResponse.data[0];

      // New users may not have a patient record yet
      if (!currentPatient) {
        setPatient(null);
        return;
      }

      setPatient(currentPatient);

      const [interactionsResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
        axios.get(`${API_BASE}/backend/pdinteraction?patientId=${currentPatient.p_id}`),
        axios.get(`${API_BASE}/backend/doctors`),
        axios.get(`${API_BASE}/backend/appointments/patient/${currentPatient.p_id}`)
      ]);

      const interactionsData = interactionsResponse.data;
      setInteractions(interactionsData);
      setDoctors(doctorsResponse.data);
      setAppointments(appointmentsResponse.data || []);

      // Calculate ongoing treatments
      const now = new Date();
      const ongoing = interactionsData.filter(interaction => {
        const meetingDate = new Date(interaction.meeting_date);
        const durationDate = new Date(meetingDate);
        durationDate.setDate(durationDate.getDate() + interaction.treatment_duration);
        return durationDate > now;
      });
      setOngoingTreatments(ongoing);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      // Always stop loading — even on error or empty data
      setLoading(false);
    }
  };

  // Removed the window.location.reload() loop — data is fetched fresh on mount

  const getDoctorInfo = (doctorId) => {
    const doctor = doctors.find(d => d.d_id === doctorId);
    return doctor ? `${doctor.d_name} (${doctor.d_specialization})` : 'Unknown';
  };

  const toggleDetails = (id) => {
    setInteractions(prevInteractions =>
      prevInteractions.map(interaction =>
        interaction._id === id ? { ...interaction, open: !interaction.open } : interaction
      )
    );
  };


  const openLightbox = (index, documentUrls) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };


  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <div className="dashboardMainContainer">
      <div className="dashboardContainer">
        {loading ? (
          <Loader />
        ) : !patient ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <h2>No patient profile found</h2>
            <p>Please <a href="/create-patient" style={{ color: '#4a90e2' }}>create your patient profile</a> first.</p>
          </div>
        ) : (
          <>
            {patient && (
              <div className="userInfoContainer">
                <div className="profileImageName">
                  <div className="profileImageSection">
                    <img src={patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.p_name || 'Patient')}&background=0D8ABC&color=fff&size=256&bold=true`} alt="Patient Avatar" />
                  </div>
                  <div className="userNameId">
                    <span>{patient.p_name}</span> <br />
                    {patient.p_id}
                  </div>
                </div>
                <div className="userDetails">
                  <ul>
                    <li>Gender: {patient.p_gender}</li>
                    <li>Age: {patient.p_age}</li>
                  </ul>
                  <ul>
                    <li>Blood Group: {patient.p_bloodgroup}</li>
                    <li>Address: {patient.p_address}</li>
                  </ul>
                </div>
              </div>
            )}
            <div className="userHistorySection">
              <div className="userSideBar">
                <section className="patientInfo">
                  <h3>Family History</h3>
                  <p>{patient ? patient.Family_History : 'Loading...'}</p>
                  <h3>Allergies</h3>
                  <p>{patient ? patient.Allergies : 'Loading...'}</p>
                  <div className="ongoingTreatments">
                    <h3>Ongoing Treatments</h3>
                    <ul className="treatmentList">
                      {ongoingTreatments.map(treatment => (
                        <li key={treatment._id} className="treatmentItem">
                          <div className="treatmentInfo">
                            <p className="treatmentName">{treatment.treatment_name}</p>
                            <p className="medicineTaken">Medicine Taken: {treatment.medicines_provided.join(', ')}</p>
                            <p className="timeRemaining">Time Remaining: {calculateTimeRemaining(treatment)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
              <div className="userPastRecords">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '94%', marginTop: '20px', marginBottom: '10px' }}>
                  <button 
                    onClick={() => setIsBookingModalOpen(true)}
                    style={{ padding: '10px 20px', background: '#2AA7FF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Book Appointment
                  </button>
                </div>

                {appointments.length > 0 && (
                  <div className="appointmentsContainer" style={{ width: '94%', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>Upcoming Appointments</h2>
                    {appointments.map(apt => (
                      <div key={apt._id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px', background: '#f9f9f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <strong>Dr. {apt.doctorName}</strong>
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
                        <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>Reason: {apt.reason}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="headingandfilter">
                  <h2>Past Doctor Visits</h2>
                  <Filter onFilterChange={handleFilterChange} />
                </div>
                <div className="accordionContainer">
                  {interactions.map(interaction => (
                    <div key={interaction._id}>
                      <div className="fiterTime">
                        {new Date(interaction.meeting_date).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </div>
                      <div className="accordionSummary" onClick={() => toggleDetails(interaction._id)}>
                        <p>{getDoctorInfo(interaction.d_id)}</p>
                        <p>
                          {interaction.hospital}
                          <FontAwesomeIcon className="accordionArrow" icon={interaction.open ? faCaretUp : faCaretDown} />
                        </p>
                      </div>
                      {interaction.open && (
                        <div className="accordianDetails">
                          <p>Symptoms: {interaction.symptoms.join(', ')}</p>
                          <p>Medicines Provided: {interaction.medicines_provided.join(', ')}</p>
                          {/* Render document previews */}
                          <div className="document-previews">
                            {interaction.documents.map((document, index) => (
                              <img
                                key={index}
                                src={document.document_url}
                                alt={`Document ${index + 1}`}
                                onClick={() => openLightbox(index, interaction.documents)}
                                className="document-preview"
                              />
                            ))}
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {lightboxOpen && (
        <Lightbox
          mainSrc={interactions[lightboxIndex]?.documents[0]?.document_url}
          onCloseRequest={closeLightbox}
          nextSrc={interactions[(lightboxIndex + 1) % interactions.length]?.documents[0]?.document_url}
          prevSrc={interactions[(lightboxIndex + interactions.length - 1) % interactions.length]?.documents[0]?.document_url}
          onMovePrevRequest={() => setLightboxIndex((lightboxIndex + interactions.length - 1) % interactions.length)}
          onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % interactions.length)}
          enableZoom={true}
        />
      )}

      <BookAppointmentModal 
        isOpen={isBookingModalOpen} 
        onClose={() => {
          setIsBookingModalOpen(false);
          if (currentUser) fetchData(currentUser.uid); // refresh data after booking
        }} 
        doctors={doctors} 
        patient={patient} 
      />

    </div>
  );
}

export default Dashboard;
