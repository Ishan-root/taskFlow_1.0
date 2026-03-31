import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        ⬡ Task<span>Flow</span>
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Home
        </NavLink>
        <NavLink to="/kanban" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Kanban
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Progress
        </NavLink>
        <NavLink to="/collaboration" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Collaboration
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          About
        </NavLink>
        <button className="nav-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
