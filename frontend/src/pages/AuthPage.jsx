import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (mode === 'signup' && !form.name.trim()) {
      setErrors({ name: 'Please enter your name.' });
      return;
    }
    if (!form.email.trim()) {
      setErrors({ email: 'Please enter your email.' });
      return;
    }
    if (!form.password || form.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters.' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(redirectTo, { replace: true });
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
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__ticketline" aria-hidden="true" />
        <p className="hero__eyebrow" style={{ textAlign: 'center' }}>Check-in counter</p>
        <h1 className="auth-card__title">
          {mode === 'login' ? 'Welcome back, traveler' : 'Start planning your escape'}
        </h1>
        <p className="auth-card__sub">
          {mode === 'login'
            ? 'Sign in with your email to see your saved trips.'
            : 'Create an account to start booking your dream vacations.'}
        </p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'auth-toggle__btn auth-toggle__btn--active' : 'auth-toggle__btn'}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'auth-toggle__btn auth-toggle__btn--active' : 'auth-toggle__btn'}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {errors.form && <p className="form-alert" role="alert">{errors.form}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
              {errors.name && <em>{errors.name}</em>}
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <em>{errors.email}</em>}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {errors.password && <em>{errors.password}</em>}
          </label>

          <button type="submit" className="btn-primary auth-card__submit" disabled={submitting}>
            {submitting
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
}
