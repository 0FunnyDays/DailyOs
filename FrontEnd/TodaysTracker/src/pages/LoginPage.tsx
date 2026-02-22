import { useRef, useState, type FormEvent } from "react";

type AuthMode = "login" | "register";

type LoginPageProps = {
  onRegister: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  onLogin: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  initialMode?: AuthMode;
  onBack?: () => void;
};

export function LoginPage({
  onRegister,
  onLogin,
  initialMode = "login",
  onBack,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result =
      mode === "login"
        ? await onLogin(username, password)
        : await onRegister(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong");
    }
  }

  function toggleMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => usernameInputRef.current?.focus(), 0);
  }

  function handleBack() {
    setError("");
    setPassword("");
    setConfirmPassword("");
    onBack?.();
  }

  return (
    <div className="login-page">
      <div className="login-page__stage">
        <div className="login-page__content login-page__content--auth">
          <section className="login-panel" aria-label="Authentication">
            <div className="login-card">
              {onBack && (
                <button type="button" className="login-back" onClick={handleBack}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </button>
              )}

              <h2 className="login-title">Daily Os</h2>
              <p className="login-subtitle">
                {mode === "login" ? "Sign in to continue" : "Create your account"}
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
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                  />
                </label>

                {mode === "register" && (
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
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

              <button className="login-toggle" onClick={toggleMode}>
                {mode === "login"
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
