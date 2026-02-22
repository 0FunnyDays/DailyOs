import { useRef, useState, type FormEvent } from 'react';
import { Footer } from '../components/Footer/Footer';

type LoginPageProps = {
  onRegister: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
};

export function LoginPage({ onRegister, onLogin }: LoginPageProps) {
  const [showAuthView, setShowAuthView] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = mode === 'login'
      ? await onLogin(username, password)
      : await onRegister(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'Something went wrong');
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  function openAuthView(nextMode: 'login' | 'register') {
    setMode(nextMode);
    setShowAuthView(true);
    setTimeout(() => usernameInputRef.current?.focus(), 0);
  }

  function handleGetStarted() {
    openAuthView('register');
  }

  const authPanel = (
    <section className="login-panel" aria-label="Authentication">
      <div className="login-card">
        <button
          type="button"
          className="login-back"
          onClick={() => setShowAuthView(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <h2 className="login-title">Daily Os</h2>
        <p className="login-subtitle">
          {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              ref={usernameInputRef}
              className="field__input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {mode === 'register' && (
            <label className="field">
              <span className="field__label">Confirm password</span>
              <input
                className="field__input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button className="login-toggle" onClick={toggleMode}>
          {mode === 'login'
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </section>
  );

  const landingPanel = (
    <>
      <div className="login-page__content">
        <section className="login-hero" aria-labelledby="auth-hero-title">
          <div className="login-hero__brand">
            <div>
              <p className="login-hero__eyebrow">Daily Os</p>
              <h1 id="auth-hero-title" className="login-hero__title">
                Track work, money, and training in one place.
              </h1>
            </div>
          </div>

          <p className="login-hero__subtitle">
            Shift tracking, expenses, dashboard insights, and gym sessions in a
            single workflow. Start with an account and continue from the same page.
          </p>

          <div className="login-hero__actions">
            <button
              type="button"
              className="btn btn--primary login-hero__cta"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
            <button
              type="button"
              className="btn btn--ghost login-hero__cta-alt"
              onClick={() => openAuthView('login')}
            >
              I already have an account
            </button>
          </div>

          <div className="login-hero__features" aria-label="App features">
            <article className="login-hero__feature">
              <div className="login-hero__feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="login-hero__feature-title">Shift Tracking</h3>
              <p className="login-hero__feature-desc">Hours, flat shifts, tips, and automatic pay totals.</p>
            </article>

            <article className="login-hero__feature">
              <div className="login-hero__feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="login-hero__feature-title">Expenses</h3>
              <p className="login-hero__feature-desc">Track daily expenses and see net earnings clearly.</p>
            </article>

            <article className="login-hero__feature">
              <div className="login-hero__feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
              </div>
              <h3 className="login-hero__feature-title">Dashboard</h3>
              <p className="login-hero__feature-desc">Period summaries with charts for work and gym data.</p>
            </article>

            <article className="login-hero__feature">
              <div className="login-hero__feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 6.5h11" />
                  <path d="M6.5 17.5h11" />
                  <path d="M3 9.5v5" />
                  <path d="M21 9.5v5" />
                  <path d="M1 11v2" />
                  <path d="M23 11v2" />
                </svg>
              </div>
              <h3 className="login-hero__feature-title">Gym Tracker</h3>
              <p className="login-hero__feature-desc">Sessions, sets, reps, and program planning in one flow.</p>
            </article>
          </div>
        </section>
      </div>

      <div className="login-page__footer">
        <Footer />
      </div>
    </>
  );

  return (
    <div className={`login-page${showAuthView ? ' login-page--auth-only' : ''}`}>
      <div className="login-page__stage">
        <div className="login-page__view login-page__view--landing">
          {landingPanel}
        </div>
        <div className="login-page__view login-page__view--auth">
          <div className="login-page__content login-page__content--auth">
            {authPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
