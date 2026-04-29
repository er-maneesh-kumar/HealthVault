import React from 'react';
import './HomeStats.css';

const stats = [
  { value: '50K+', label: 'Patients Registered', icon: '👥' },
  { value: '2K+',  label: 'Verified Doctors',    icon: '🩺' },
  { value: '300+', label: 'Partner Hospitals',   icon: '🏥' },
  { value: '99.9%',label: 'Uptime Guarantee',    icon: '⚡' },
];

export default function HomeStats() {
  return (
    <section className="home-stats-section">
      {stats.map((s, i) => (
        <div className="home-stat-card" key={i}>
          <span className="home-stat-icon">{s.icon}</span>
          <span className="home-stat-value">{s.value}</span>
          <span className="home-stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
