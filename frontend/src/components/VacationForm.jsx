import React, { useState } from 'react';
import { createVacation } from '../api/vacations';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const COMPANIONS = ['Solo', 'Family', 'Friends'];

const EMPTY_FORM = {
  name: '', destination: '', budget: '', days: '',
  travel_month: '', companions: '', description: ''
};

export default function VacationForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.destination.trim()) next.destination = 'Please enter your dream destination.';
    if (!form.budget || Number(form.budget) <= 0) next.budget = 'Enter a budget greater than 0.';
    if (!form.days || Number(form.days) <= 0) next.days = 'Enter at least 1 day.';
    if (!form.travel_month) next.travel_month = 'Pick a preferred month.';
    if (!form.companions) next.companions = 'Pick who you are travelling with.';
    if (!form.description.trim()) next.description = 'Tell us why you want to go.';
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMessage('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createVacation({
        ...form,
        budget: Number(form.budget),
        days: Number(form.days)
      });
      setSuccessMessage(`Your trip to ${created.destination} is booked into the list below.`);
      setForm(EMPTY_FORM);
      onCreated?.(created);
    } catch (err) {
      if (err.fieldErrors?.length) {
        const fieldErrs = {};
        err.fieldErrors.forEach(fe => { fieldErrs[fe.field] = fe.message; });
        setErrors(fieldErrs);
      } else {
        setErrors({ form: err.message || 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit} noValidate>
      <div className="ticket-form__header">
        <span className="ticket-form__eyebrow">Departure gate</span>
        <h2>Book your dream trip</h2>
      </div>

      {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}
      {successMessage && <p className="form-success" role="status">{successMessage}</p>}

      <div className="field-grid">
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Your full name"
            maxLength={100}
          />
          {errors.name && <em>{errors.name}</em>}
        </label>

        <label className="field">
          <span>Dream destination</span>
          <input
            type="text"
            value={form.destination}
            onChange={e => update('destination', e.target.value)}
            placeholder="e.g. Kyoto, Japan"
            maxLength={150}
          />
          {errors.destination && <em>{errors.destination}</em>}
        </label>

        <label className="field">
          <span>Budget (₹)</span>
          <input
            type="number"
            min="0"
            step="1000"
            value={form.budget}
            onChange={e => update('budget', e.target.value)}
            placeholder="150000"
          />
          {errors.budget && <em>{errors.budget}</em>}
        </label>

        <label className="field">
          <span>Number of days</span>
          <input
            type="number"
            min="1"
            max="365"
            value={form.days}
            onChange={e => update('days', e.target.value)}
            placeholder="7"
          />
          {errors.days && <em>{errors.days}</em>}
        </label>

        <label className="field">
          <span>Preferred travel month</span>
          <select value={form.travel_month} onChange={e => update('travel_month', e.target.value)}>
            <option value="">Select a month</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.travel_month && <em>{errors.travel_month}</em>}
        </label>

        <label className="field">
          <span>Travel companions</span>
          <select value={form.companions} onChange={e => update('companions', e.target.value)}>
            <option value="">Select an option</option>
            {COMPANIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.companions && <em>{errors.companions}</em>}
        </label>
      </div>

      <label className="field field--full">
        <span>Why this trip?</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={e => update('description', e.target.value)}
          placeholder="Tell us what draws you to this destination..."
          maxLength={1000}
        />
        {errors.description && <em>{errors.description}</em>}
      </label>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Issuing boarding pass…' : 'Submit dream vacation'}
      </button>
    </form>
  );
}
