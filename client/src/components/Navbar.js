import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button'
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const [userAvatar, setUserAvatar] = useState(null);
  const [selectedNavItem, setSelectedNavItem] = useState(null); // State to track selected nav item
  const navigate = useNavigate();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUserAvatar("");
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchUserAvatar = async (uid) => {
      try {
        if (!currentUser) return;

        const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
        const role = currentUser.role; // 'patient' | 'doctor' | 'hospital' | 'admin'

        let endpointUrl = '';
        if (role === 'doctor') {
          endpointUrl = `${API_BASE}/backend/doctors?firebaseUid=${uid}`;
        } else if (role === 'patient') {
          endpointUrl = `${API_BASE}/backend/patients?firebaseUid=${uid}`;
        } else if (role === 'hospital') {
          endpointUrl = `${API_BASE}/backend/hospitals?firebaseUid=${uid}`;
        } else {
          // admin or unknown — use a generated avatar from their name
          const name = currentUser.name || currentUser.email || 'Admin';
          setUserAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=256&bold=true`);
          return;
        }

        const response = await axios.get(endpointUrl);
        const record = response.data[0];
        if (record?.avatar) {
          setUserAvatar(record.avatar);
        } else {
          // Fallback: generate avatar from user name
          const name = currentUser.name || currentUser.email || 'User';
          setUserAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=256&bold=true`);
        }
      } catch (error) {
        console.error('Error fetching user avatar:', error);
        // Fallback on error
        const name = currentUser?.name || 'User';
        setUserAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=256&bold=true`);
      }
    };

    if (currentUser) {
      fetchUserAvatar(currentUser.uid);
    }
  }, [currentUser]);

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
          <img src="/images/healthvaultlogo.png" alt="logo" className='logo' />
          HealthVault
        </Link>
        <div className='menu-icon' onClick={handleClick}>
          {click ? (
            <ion-icon className='fa-bars' name="close-outline"></ion-icon>
          ) : (
            <ion-icon className='fa-bars' name="menu-outline"></ion-icon>
          )}
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className={`nav-item ${selectedNavItem === 'home' ? 'selected' : ''}`}>
            <Link
              to='/'
              className='nav-links'
              onClick={() => {
                closeMobileMenu();
                setSelectedNavItem('home');
              }}
            >
              Home
            </Link>
          </li>
          {currentUser && (
            <>
            {currentUser.role === 'doctor' ? (
                <li className={`nav-item ${selectedNavItem === 'doctor-dashboard' ? 'selected' : ''}`}>
                  <Link
                    to='/doctor-dashboard'
                    className='nav-links'
                    onClick={() => {
                      closeMobileMenu();
                      setSelectedNavItem('doctor-dashboard');
                    }}
                  >
                    Doctor Dashboard
                  </Link>
                </li>
              ) : currentUser.role === 'hospital' ? (
                <li className={`nav-item ${selectedNavItem === 'hospital-dashboard' ? 'selected' : ''}`}>
                  <Link
                    to='/hospital-dashboard'
                    className='nav-links'
                    onClick={() => {
                      closeMobileMenu();
                      setSelectedNavItem('hospital-dashboard');
                    }}
                  >
                    Hospital Dashboard
                  </Link>
                </li>
              ) : (
                <li className={`nav-item ${selectedNavItem === 'dashboard' ? 'selected' : ''}`}>
                  <Link
                    to='/dashboard'
                    className='nav-links'
                    onClick={() => {
                      closeMobileMenu();
                      setSelectedNavItem('dashboard');
                    }}
                  >
                    Dashboard
                  </Link>
                </li>
              )}

              {/* <li className={`nav-item ${selectedNavItem === 'documents' ? 'selected' : ''}`}>
                <Link
                  to='/documents'
                  className='nav-links'
                  onClick={() => {
                    closeMobileMenu();
                    setSelectedNavItem('documents');
                  }}
                >
                  Documents
                </Link>
              </li> */}
            </>
          )}


          <li className={`nav-item ${selectedNavItem === 'documents' ? 'selected' : ''}`}>
            <Link
              to='/documents'
              className='nav-links'
              onClick={() => {
                closeMobileMenu();
                setSelectedNavItem('documents');
              }}
            >
              Documents
            </Link>
          </li>
          <li className={`nav-item ${selectedNavItem === 'about' ? 'selected' : ''}`}>
            <Link
              to='/about'
              className='nav-links'
              onClick={() => {
                closeMobileMenu();
                setSelectedNavItem('about');
              }}
            >
              About
            </Link>
          </li>

          {currentUser && (
            <li className='nav-item'>
              <div className="profile-container" onClick={handleClick}>
                <img src={userAvatar} alt="Profile" className="profile-pic" />
                {/* <img src="https://res.cloudinary.com/djoebsejh/image/upload/v1711976358/qnmcxqotjgzbup7ajwci.png" alt="Profile" className="profile-pic" />*/}
                <div className="profile-dropdown" style={{ display: click ? 'block' : 'none' }}>
                  <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </li>
          )}
          <div onClick={closeMobileMenu}>
            {!currentUser && button && <Button buttonStyle='btn--outline'>SIGN UP</Button>}
          </div>

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
