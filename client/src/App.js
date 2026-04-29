import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import About from './pages/About';
import Createpatient from './components/Createpatient';
import Login from './pages/Login';
import Createdoctor from './components/Createdoctor';
import DoctorDashboard from './pages/Doctordashboard';
import Documents from './pages/Documents';
import Createhospital from './components/Createhospital';
import Hospitaldashboard from './pages/Hospitaldashboard';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/'                element={<PageTransition><Home /></PageTransition>} />
        <Route path='/dashboard'       element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path='/doctor-dashboard'   element={<PageTransition><DoctorDashboard /></PageTransition>} />
        <Route path='/hospital-dashboard' element={<PageTransition><Hospitaldashboard /></PageTransition>} />
        <Route path='/about'           element={<PageTransition><About /></PageTransition>} />
        <Route path='/create-patient'  element={<PageTransition><Createpatient /></PageTransition>} />
        <Route path='/create-doctor'   element={<PageTransition><Createdoctor /></PageTransition>} />
        <Route path='/create-hospital' element={<PageTransition><Createhospital /></PageTransition>} />
        <Route path='/documents'       element={<PageTransition><Documents /></PageTransition>} />
        <Route path='/sign-up'         element={<PageTransition><Signup /></PageTransition>} />
        <Route path='/login'           element={<PageTransition><Login /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </Router>
  );
}

export default App;
