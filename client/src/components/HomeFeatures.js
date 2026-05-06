import React from 'react';
import './HomeFeatures.css';

const features = [
  {
    icon: '🩺',
    title: 'Digital Health Records',
    desc: 'Securely store and access your complete medical history, lab results, prescriptions, and documents — anytime, anywhere.',
    color: '#2AA7FF',
  },
  {
    icon: '📅',
    title: 'Smart Appointments',
    desc: 'Book, manage, and track doctor appointments with ease. Get reminders and never miss a checkup again.',
    color: '#7C3AED',
  },
  {
    icon: '💊',
    title: 'Medicine Reminders',
    desc: 'Set personalised medication reminders and track your treatment schedules with real-time alerts.',
    color: '#10B981',
  },
  {
    icon: '🏥',
    title: 'Hospital Network',
    desc: 'Connect with top hospitals and specialists. View availability, facilities, and ratings all in one platform.',
    color: '#F59E0B',
  },
  {
    icon: '📊',
    title: 'Health Analytics',
    desc: 'Visualise your health trends over time with interactive charts — blood pressure, weight, sugar levels, and more.',
    color: '#EF4444',
  },
  {
    icon: '🔒',
    title: 'Bank-Grade Security',
    desc: 'Your data is encrypted and protected. Only you and your authorised doctors can access your records.',
    color: '#06B6D4',
  },
];

export default function HomeFeatures() {
  return (
    <section className="home-features-section">
      <div className="home-section-header">
        <span className="home-section-badge">✨ Why HealthVault</span>
        <h2>Everything You Need for <span>Better Healthcare</span></h2>
        <p>A complete ecosystem for patients, doctors, and hospitals — built for the modern age.</p>
      </div>

      <div className="home-features-grid">
        {features.map((f, i) => (
          <div className="home-feature-card" key={i} style={{ '--accent': f.color }}>
            <div className="home-feature-icon" style={{ background: f.color + '18', color: f.color }}>
              {f.icon}
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
