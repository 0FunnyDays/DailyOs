import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AvatarPresetId } from "../types";
import { AVATAR_PRESET_OPTIONS, Avatar } from "../components/Avatar/Avatar";

type AuthMode = "login" | "register";

type LoginPageProps = {
  onRegister: (
    username: string,
    password: string,
    avatarPresetId: AvatarPresetId,
  ) => Promise<{ ok: boolean; error?: string }>;
  onLogin: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  initialMode?: AuthMode;
  onBack?: () => void;
  exiting?: boolean;
};

const DEFAULT_AVATAR_PRESET_ID: AvatarPresetId = "avatar-1";

export function LoginPage({
  onRegister,
  onLogin,
  initialMode = "login",
  onBack,
  exiting,
}: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPresetId, setAvatarPresetId] = useState<AvatarPresetId>(DEFAULT_AVATAR_PRESET_ID);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!avatarModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAvatarModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [avatarModalOpen]);

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
        : await onRegister(username, password, avatarPresetId);
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
    setAvatarPresetId(DEFAULT_AVATAR_PRESET_ID);
    setAvatarModalOpen(false);
    setTimeout(() => usernameInputRef.current?.focus(), 0);
  }

  function handleBack() {
    setError("");
    setPassword("");
    setConfirmPassword("");
    setAvatarModalOpen(false);
    onBack?.();
  }

  return (
    <div className={`login-page${exiting ? " login-page--exiting" : ""}`}>
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

                {mode === "register" && (
                  <label className="field">
                    <span className="field__label">Choose avatar</span>
                    <div className="auth-avatar-field">
                      <button
                        type="button"
                        className="auth-avatar-field__button"
                        onClick={() => setAvatarModalOpen(true)}
                        aria-haspopup="dialog"
                        aria-expanded={avatarModalOpen}
                        aria-controls="avatar-picker-dialog"
                      >
                        Choose avatar
                      </button>

                      <span className="auth-avatar-field__preview" aria-hidden="true">
                        <Avatar
                          username={username || "You"}
                          avatar={null}
                          avatarPresetId={avatarPresetId}
                          size="lg"
                        />
                      </span>
                    </div>
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

      {mode === "register" && avatarModalOpen && (
        <div
          className="auth-avatar-modal"
          role="presentation"
          onClick={() => setAvatarModalOpen(false)}
        >
          <div
            id="avatar-picker-dialog"
            className="auth-avatar-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-picker-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-avatar-modal__header">
              <div>
                <h3 id="avatar-picker-title" className="auth-avatar-modal__title">
                  Choose avatar
                </h3>
                <p className="auth-avatar-modal__subtitle">
                  Tap one preview to use it.
                </p>
              </div>

              <button
                type="button"
                className="auth-avatar-modal__close"
                onClick={() => setAvatarModalOpen(false)}
                aria-label="Close avatar picker"
              >
                ×
              </button>
            </div>

            <div className="auth-avatar-modal__grid" role="list">
              {AVATAR_PRESET_OPTIONS.map((preset) => {
                const isSelected = preset.id === avatarPresetId;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`auth-avatar-modal__option${isSelected ? " auth-avatar-modal__option--active" : ""}`}
                    aria-label={`Choose ${preset.label}`}
                    aria-pressed={isSelected}
                    title={preset.label}
                    onClick={() => {
                      setAvatarPresetId(preset.id);
                      setAvatarModalOpen(false);
                    }}
                  >
                    <Avatar
                      username={username || "You"}
                      avatar={null}
                      avatarPresetId={preset.id}
                      size="lg"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
