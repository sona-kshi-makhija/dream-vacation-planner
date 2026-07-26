import React from 'react';
import TicketCard from './TicketCard';

export default function VacationList({ vacations, loading, error, onDelete, onRetry }) {
  if (loading) {
    return <p className="list-status">Loading submitted dream trips…</p>;
  }

  if (error) {
    return (
      <div className="list-status list-status--error">
        <p>{error}</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  if (vacations.length === 0) {
    return (
      <p className="list-status">
        No trips booked yet — be the first to submit a dream vacation above.
      </p>
    );
  }

  return (
    <div className="ticket-grid">
      {vacations.map(v => (
        <TicketCard key={v.id} vacation={v} onDelete={onDelete} />
      ))}
    </div>
  );
}
