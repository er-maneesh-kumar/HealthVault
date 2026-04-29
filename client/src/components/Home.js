import React from 'react';
import HeroSection from './HeroSection';
import HomeFeatures from './HomeFeatures';
import HomeHowItWorks from './HomeHowItWorks';
import HomeStats from './HomeStats';
import HomeTestimonials from './HomeTestimonials';
import HomeCTA from './HomeCTA';
import ScrollToTop from './ScrollToTop.js';
import './Home.css';

function Home() {
  return (
    <div className="mainHomeBody">
      <div className="mainHomeContainer">
        <HeroSection />
        <HomeStats />
        <HomeFeatures />
        <HomeHowItWorks />
        <HomeTestimonials />
        <HomeCTA />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default Home;