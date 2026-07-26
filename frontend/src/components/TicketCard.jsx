import React from 'react';

const MONTH_CODE = {
  January: 'JAN', February: 'FEB', March: 'MAR', April: 'APR',
  May: 'MAY', June: 'JUN', July: 'JUL', August: 'AUG',
  September: 'SEP', October: 'OCT', November: 'NOV', December: 'DEC'
};

function destinationCode(destination) {
  const clean = destination.replace(/[^a-zA-Z]/g, '');
  return (clean.slice(0, 3) || 'TBD').toUpperCase();
}

export default function TicketCard({ vacation, onDelete }) {
  const { id, name, destination, budget, days, travel_month, companions, description } = vacation;

  return (
    <article className="ticket">
      <div className="ticket__main">
        <div className="ticket__row ticket__row--top">
          <span className="ticket__eyebrow">Boarding pass</span>
          <span className="ticket__stamp">{companions}</span>
        </div>

        <div className="ticket__route">
          <span className="ticket__code">YOU</span>
          <span className="ticket__plane" aria-hidden="true">✈</span>
          <span className="ticket__code">{destinationCode(destination)}</span>
        </div>

        <h3 className="ticket__destination">{destination}</h3>

        <p className="ticket__desc">{description}</p>

        <dl className="ticket__details">
          <div>
            <dt>Traveler</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>Month</dt>
            <dd>{MONTH_CODE[travel_month] || travel_month}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{days} {Number(days) === 1 ? 'day' : 'days'}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>₹{Number(budget).toLocaleString('en-IN')}</dd>
          </div>
        </dl>
      </div>

      <div className="ticket__stub">
        <span className="ticket__stub-label">Seat</span>
        <span className="ticket__stub-value">{String(id).padStart(3, '0')}</span>
        {onDelete && (
          <button
            type="button"
            className="ticket__delete"
            onClick={() => onDelete(id)}
            aria-label={`Remove ${destination} plan`}
          >
            ✕
          </button>
        )}
      </div>
    </article>
  );
}
