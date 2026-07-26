import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchVacations } from '../api/vacations';

export default function DashboardPage() {
  const { user } = useAuth();
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchVacations();
        if (!cancelled) setVacations(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load your trips.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalBudget = vacations.reduce((sum, v) => sum + Number(v.budget), 0);
  const nextTrip = vacations[0];

  return (
    <div className="dashboard">
      <header className="hero hero--dashboard">
        <p className="hero__eyebrow">Departures board</p>
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'traveler'}</h1>
        <p className="hero__sub">Here's where your dream trips stand right now.</p>
      </header>

      {loading ? (
        <p className="list-status">Loading your dashboard…</p>
      ) : error ? (
        <p className="list-status list-status--error">{error}</p>
      ) : (
        <div className="stat-row">
          <div className="stat-card">
            <span className="stat-card__value">{vacations.length}</span>
            <span className="stat-card__label">{vacations.length === 1 ? 'trip planned' : 'trips planned'}</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">₹{totalBudget.toLocaleString('en-IN')}</span>
            <span className="stat-card__label">total dream budget</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">{nextTrip ? nextTrip.destination : '—'}</span>
            <span className="stat-card__label">most recent plan</span>
          </div>
        </div>
      )}

      <div className="dashboard__actions">
        <Link to="/planner" className="action-card action-card--primary">
          <span className="action-card__icon" aria-hidden="true">✈️</span>
          <span className="action-card__title">Plan a new trip</span>
          <span className="action-card__sub">Fill out the booking form and add it to your list</span>
        </Link>
        <Link to="/trips" className="action-card">
          <span className="action-card__icon" aria-hidden="true">🎫</span>
          <span className="action-card__title">View my trips</span>
          <span className="action-card__sub">See every dream vacation you've already planned</span>
        </Link>
      </div>
    </div>
  );
}
