import React from 'react';
import { Link } from 'react-router-dom';
import './HomeCTA.css';

export default function HomeCTA() {
  return (
    <section className="home-cta-section">
      <div className="home-cta-glow" />
      <div className="home-cta-content">
        <span className="home-cta-badge">🚀 Free to Get Started</span>
        <h2 className="home-cta-title">
          Take Control of Your <span>Health Journey</span> Today
        </h2>
        <p className="home-cta-sub">
          Join thousands of patients, doctors, and hospitals already using HealthVault
          to manage records, book appointments, and stay on top of treatments.
        </p>
        <div className="home-cta-actions">
          <Link to="/sign-up" className="home-cta-btn primary">Get Started for Free</Link>
          <Link to="/about" className="home-cta-btn secondary">Learn More</Link>
        </div>
        <div className="home-cta-img-row">
          <img src="/images/doctor_patient_consultation.png" alt="Doctor patient" className="home-cta-img" />
        </div>
      </div>
    </section>
  );
}
