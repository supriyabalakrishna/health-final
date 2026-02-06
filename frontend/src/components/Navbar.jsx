import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('healthsync_token');

  function handleLogout() {
    localStorage.removeItem('healthsync_token');
    localStorage.removeItem('healthsync_user');
    navigate('/login');
  }

  return (
    <nav className="flex items-center justify-between px-4 py-4 bg-hs-card shadow-card rounded-b-lg">
      <div className="flex items-center space-x-3">
        <span className="font-extrabold text-lg text-hs-soft-pink tracking-tight">HealthSync</span>
      </div>
      <div className="flex space-x-4 items-center">
        {isLoggedIn ? (
          <>
            <Link className={`font-medium hover:text-hs-soft-pink transition ${location.pathname === '/' ? 'text-hs-soft-pink' : 'text-gray-700'}`} to="/">Dashboard</Link>
            <Link className={`font-medium hover:text-hs-soft-pink transition ${location.pathname === '/mealplanner' ? 'text-hs-soft-pink' : 'text-gray-700'}`} to="/mealplanner">Meal Planner</Link>
            <button onClick={handleLogout} className="ml-4 py-1 px-4 rounded bg-gradient-to-r from-hs-green to-hs-soft-pink text-gray-700 font-semibold text-sm hover:opacity-80 shadow">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className={`font-medium hover:text-hs-soft-pink transition ${location.pathname === '/login' ? 'text-hs-soft-pink' : 'text-gray-700'}`} to="/login">Login</Link>
            <Link className={`font-medium hover:text-hs-soft-pink transition ${location.pathname === '/signup' ? 'text-hs-soft-pink' : 'text-gray-700'}`} to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}