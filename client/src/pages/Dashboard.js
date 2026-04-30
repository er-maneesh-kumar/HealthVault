import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Filter from '../components/Filter.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown, faCaretUp,
  faTrash, faShareAlt, faCopy, faEnvelope, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext.js';
import Loader from '../components/Loader';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import BookAppointmentModal from '../components/BookAppointmentModal';

function Dashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [ongoingTreatments, setOngoingTreatments] = useState([]);
  const [filters, setFilters] = useState({});
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // ── Delete state ──────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── Share state ───────────────────────────────────────────
  const [shareApt, setShareApt] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculateTimeRemaining = (treatment) => {
    const now = new Date();
    const meetingDate = new Date(treatment.meeting_date);
    const endDate = new Date(meetingDate.getTime() + treatment.treatment_duration * 24 * 60 * 60 * 1000);
    const timeDiff = endDate - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return `${daysRemaining} days`;
  };

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    console.log('Filters:', filters);
  };

  const API_BASE = process.env.REACT_APP_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://healthvault-qhqn.onrender.com');

  useEffect(() => {
    if (currentUser) {
      fetchData(currentUser.uid);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchData = async (firebaseUid) => {
    try {
      const patientResponse = await axios.get(`${API_BASE}/backend/patients?firebaseUid=${firebaseUid}`);
      const currentPatient = patientResponse.data[0];

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
      setLoading(false);
    }
  };

  const getDoctorInfo = (doctorId) => {
    const doctor = doctors.find(d => d.d_id === doctorId);
    return doctor ? `${doctor.d_name} (${doctor.d_specialization})` : 'Unknown';
  };

  const toggleDetails = (id) => {
    setInteractions(prev =>
      prev.map(interaction =>
        interaction._id === id ? { ...interaction, open: !interaction.open } : interaction
      )
    );
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  // ── Delete handlers ───────────────────────────────────────
  const handleDeleteClick = (id) => setDeleteConfirmId(id);

  const handleDeleteConfirm = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}/backend/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      alert('Could not delete appointment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => setDeleteConfirmId(null);

  // ── Share helpers ─────────────────────────────────────────
  const buildShareText = (apt) => {
    const dateStr = new Date(apt.date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    return `📅 Appointment Details\nDoctor: Dr. ${apt.doctorName}\nDate: ${dateStr} at ${apt.time}\nReason: ${apt.reason}\nStatus: ${apt.status.toUpperCase()}`;
  };

  const handleCopy = async () => {
    if (!shareApt) return;
    await navigator.clipboard.writeText(buildShareText(shareApt));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    if (!shareApt) return;
    const subject = encodeURIComponent(`Appointment with Dr. ${shareApt.doctorName}`);
    const body = encodeURIComponent(buildShareText(shareApt));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    if (!shareApt) return;
    const text = encodeURIComponent(buildShareText(shareApt));
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
                    <img
                      src={patient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.p_name || 'Patient')}&background=0D8ABC&color=fff&size=256&bold=true`}
                      alt="Patient Avatar"
                    />
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

                {/* ── Appointments list ─────────────────────────── */}
                {appointments.length > 0 && (
                  <div className="appointmentsContainer" style={{ width: '94%', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>Upcoming Appointments</h2>
                    {appointments.map(apt => (
                      <div key={apt._id} className="apt-card">
                        <div className="apt-card-header">
                          <strong>Dr. {apt.doctorName}</strong>
                          <div className="apt-card-actions">
                            <span className={`apt-status apt-status--${apt.status}`}>
                              {apt.status.toUpperCase()}
                            </span>
                            {/* Share */}
                            <button
                              id={`share-apt-${apt._id}`}
                              className="apt-icon-btn apt-icon-btn--share"
                              title="Share appointment"
                              onClick={() => { setShareApt(apt); setCopied(false); }}
                            >
                              <FontAwesomeIcon icon={faShareAlt} />
                            </button>
                            {/* Delete */}
                            <button
                              id={`delete-apt-${apt._id}`}
                              className="apt-icon-btn apt-icon-btn--delete"
                              title="Delete appointment"
                              disabled={deletingId === apt._id}
                              onClick={() => handleDeleteClick(apt._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                        <div className="apt-card-body">
                          <span>
                            📅 {new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                            &nbsp;⏰ {apt.time}
                          </span>
                          <span className="apt-reason">Reason: {apt.reason}</span>
                        </div>
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
                          year: 'numeric', month: '2-digit', day: '2-digit'
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
                          <div className="document-previews">
                            {interaction.documents.map((document, index) => (
                              <img
                                key={index}
                                src={document.document_url}
                                alt={`Document ${index + 1}`}
                                onClick={() => openLightbox(index)}
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

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {deleteConfirmId && (
        <div className="apt-modal-overlay" onClick={handleDeleteCancel}>
          <div className="apt-modal apt-modal--confirm" onClick={e => e.stopPropagation()}>
            <div className="apt-modal-icon apt-modal-icon--danger">
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <h3>Delete Appointment?</h3>
            <p>This action cannot be undone. The appointment record will be permanently removed.</p>
            <div className="apt-modal-footer">
              <button id="delete-cancel-btn" className="apt-btn apt-btn--ghost" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button id="delete-confirm-btn" className="apt-btn apt-btn--danger" onClick={handleDeleteConfirm}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ────────────────────────────────────── */}
      {shareApt && (
        <div className="apt-modal-overlay" onClick={() => setShareApt(null)}>
          <div className="apt-modal apt-modal--share" onClick={e => e.stopPropagation()}>
            <button className="apt-modal-close" onClick={() => setShareApt(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="apt-modal-icon apt-modal-icon--share">
              <FontAwesomeIcon icon={faShareAlt} />
            </div>
            <h3>Share Appointment</h3>
            <div className="apt-share-preview">
              <pre>{buildShareText(shareApt)}</pre>
            </div>
            <div className="apt-share-actions">
              <button id="share-copy-btn" className="apt-share-btn apt-share-btn--copy" onClick={handleCopy}>
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button id="share-email-btn" className="apt-share-btn apt-share-btn--email" onClick={handleEmailShare}>
                <FontAwesomeIcon icon={faEnvelope} />
                Email
              </button>
              <button id="share-whatsapp-btn" className="apt-share-btn apt-share-btn--whatsapp" onClick={handleWhatsAppShare}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: 6 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

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
          if (currentUser) fetchData(currentUser.uid);
        }}
        doctors={doctors}
        patient={patient}
      />
    </div>
  );
}

export default Dashboard;
