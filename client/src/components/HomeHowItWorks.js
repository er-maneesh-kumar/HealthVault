import React from 'react';
import './HomeHowItWorks.css';

const steps = [
  {
    num: '01',
    icon: '📝',
    title: 'Create Your Account',
    desc: 'Sign up in seconds as a Patient, Doctor, or Hospital. No paperwork — just your email and you are in.',
  },
  {
    num: '02',
    icon: '👤',
    title: 'Build Your Profile',
    desc: 'Add your health history, allergies, current medications, and personal details to create a complete digital record.',
  },
  {
    num: '03',
    icon: '🔗',
    title: 'Connect with Doctors',
    desc: 'Find and connect with verified doctors and hospitals. Share your records securely with one click.',
  },
  {
    num: '04',
    icon: '📈',
    title: 'Track Your Health',
    desc: 'Monitor ongoing treatments, upcoming appointments, and get smart reminders — all from your dashboard.',
  },
];

export default function HomeHowItWorks() {
  return (
    <section className="home-how-section">
      <div className="home-section-header">
        <span className="home-section-badge">⚡ Simple & Fast</span>
        <h2>How <span>HealthVault</span> Works</h2>
        <p>Get up and running in under 5 minutes. It really is that simple.</p>
      </div>
      <div className="home-how-grid">
        {steps.map((step, i) => (
          <div className="home-how-card" key={i}>
            <div className="home-how-num">{step.num}</div>
            <div className="home-how-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            {i < steps.length - 1 && <div className="home-how-arrow">→</div>}
          </div>
        ))}
      </div>
      <div className="home-how-img-row">
        <img src="/images/health_stats_infographic.png" alt="Health platform" className="home-how-img" />
      </div>
    </section>
  );
}
