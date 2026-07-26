import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import VacationList from '../components/VacationList';
import { fetchVacations, deleteVacation } from '../api/vacations';

export default function TripsPage() {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVacations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchVacations();
      setVacations(data);
    } catch (err) {
      setError(err.message || 'Could not load your trips.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVacations();
  }, [loadVacations]);

  async function handleDelete(id) {
    const previous = vacations;
    setVacations(prev => prev.filter(v => v.id !== id));
    try {
      await deleteVacation(id);
    } catch {
      setVacations(previous); // roll back on failure
    }
  }

  return (
    <div className="trips-page">
      <header className="hero hero--page">
        <p className="hero__eyebrow">Boarding passes issued</p>
        <h1>Already planned trips</h1>
        <p className="hero__sub">
          Every dream vacation saved to your account, pulled live from the database.{' '}
          <Link to="/planner">Plan another one →</Link>
        </p>
      </header>

      <div className="board__header">
        <h2>Your trips</h2>
        <span className="board__count">{vacations.length} {vacations.length === 1 ? 'trip' : 'trips'}</span>
      </div>

      <VacationList
        vacations={vacations}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        onRetry={loadVacations}
      />
    </div>
  );
}
