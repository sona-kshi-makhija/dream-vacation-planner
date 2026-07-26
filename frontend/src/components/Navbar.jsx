import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">🌴 Dream Vacation Planner</div>
      <div className="navbar__links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
          Dashboard
        </NavLink>
        <NavLink to="/planner" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
          Plan a Trip
        </NavLink>
        <NavLink to="/trips" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
          My Trips
        </NavLink>
      </div>
      <div className="navbar__user">
        <span className="navbar__email">{user?.email}</span>
        <button type="button" className="btn-secondary" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}
