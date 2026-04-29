import React from 'react';
import './HomeTestimonials.css';

const testimonials = [
  {
    name: 'Dr. Samantha Johnson',
    role: 'Cardiologist, Apollo Hospital',
    avatar: 'https://ui-avatars.com/api/?name=Samantha+Johnson&background=2AA7FF&color=fff&bold=true&size=128',
    quote: 'HealthVault has completely transformed how I manage patient records. I can see complete history in seconds — it saves me hours every day.',
    stars: 5,
  },
  {
    name: 'Emma Johnson',
    role: 'Patient',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Johnson&background=7C3AED&color=fff&bold=true&size=128',
    quote: 'I used to carry stacks of paper records to every appointment. Now everything is digital, organised, and my doctor can see it instantly.',
    stars: 5,
  },
  {
    name: 'Fortis Memorial Hospital',
    role: 'Partner Hospital',
    avatar: 'https://ui-avatars.com/api/?name=Fortis+Hospital&background=10B981&color=fff&bold=true&size=128',
    quote: 'The hospital dashboard gives us a real-time view of patient admissions and doctor availability. Operational efficiency has improved by 40%.',
    stars: 5,
  },
];

const Stars = ({ count }) => (
  <div className="home-stars">
    {Array.from({ length: count }).map((_, i) => (
      <span key={i}>⭐</span>
    ))}
  </div>
);

export default function HomeTestimonials() {
  return (
    <section className="home-testimonials-section">
      <div className="home-section-header">
        <span className="home-section-badge">💬 Trusted by Thousands</span>
        <h2>What Our <span>Users Say</span></h2>
        <p>Real stories from patients, doctors, and hospitals using HealthVault every day.</p>
      </div>
      <div className="home-testimonials-grid">
        {testimonials.map((t, i) => (
          <div className="home-testimonial-card" key={i}>
            <Stars count={t.stars} />
            <p className="home-testimonial-quote">"{t.quote}"</p>
            <div className="home-testimonial-author">
              <img src={t.avatar} alt={t.name} className="home-testimonial-avatar" />
              <div>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
