import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VacationForm from '../components/VacationForm';

export default function PlannerPage() {
  const navigate = useNavigate();

  function handleCreated() {
    // Give the person a moment to see the success message in the form,
    // then send them to the full list where the new trip now lives.
    setTimeout(() => navigate('/trips'), 900);
  }

  return (
    <div className="planner-page">
      <header className="hero hero--page">
        <p className="hero__eyebrow">Departure gate</p>
        <h1>Plan your next dream vacation</h1>
        <p className="hero__sub">
          Fill in the details below — it saves straight to your account and
          shows up on <Link to="/trips">My Trips</Link> right after.
        </p>
      </header>

      <VacationForm onCreated={handleCreated} />
    </div>
  );
}
