import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

/**
 * GoogleAuthButton
 * @param {string}   role          - 'patient' | 'doctor' | 'hospital'  (for new users)
 * @param {Function} onError       - optional callback on error
 */
export default function GoogleAuthButton({ role = 'patient', onError }) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const getRoleRedirect = (userRole, isNewUser) => {
    if (isNewUser) {
      switch (userRole) {
        case 'doctor':   return '/create-doctor';
        case 'hospital': return '/create-hospital';
        default:         return '/create-patient';
      }
    }
    switch (userRole) {
      case 'doctor':   return '/doctor-dashboard';
      case 'hospital': return '/hospital-dashboard';
      default:         return '/dashboard';
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError?.(data.message || 'Google sign-in failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      refreshUser();

      navigate(getRoleRedirect(data.user.role, data.isNewUser));
    } catch (err) {
      console.error('Google auth error:', err);
      onError?.('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    onError?.('Google sign-in was cancelled or failed.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {loading ? (
        <div className="google-btn-loading">
          <span className="btn-spinner" style={{
            width: '20px', height: '20px',
            border: '2px solid rgba(0,0,0,0.15)',
            borderTopColor: '#4285f4',
            borderRadius: '50%',
            animation: 'btn-spin 0.7s linear infinite',
            display: 'inline-block',
          }} />
          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#555' }}>
            Signing in with Google…
          </span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          shape="pill"
          size="large"
          text="continue_with"
          locale="en"
        />
      )}
    </div>
  );
}
