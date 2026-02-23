import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import type { AvatarPresetId, User } from '../types';
import { AVATAR_PRESET_OPTIONS, Avatar } from '../components/Avatar/Avatar';
import '../styles/ProfilePage.css';

type ProfilePageProps = {
  user: User;
  onUpdateAvatar: (userId: string, base64: string) => void;
  onUpdateAvatarPreset: (userId: string, avatarPresetId: AvatarPresetId) => void;
  onUpdatePassword: (userId: string, oldPw: string, newPw: string) => Promise<{ ok: boolean; error?: string }>;
};

const DEFAULT_AVATAR_PRESET_ID: AvatarPresetId = AVATAR_PRESET_OPTIONS[0]?.id ?? 'avatar-1';

export function ProfilePage({
  user,
  onUpdateAvatar,
  onUpdateAvatarPreset,
  onUpdatePassword,
}: ProfilePageProps) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPresetId = user.avatarPresetId ?? DEFAULT_AVATAR_PRESET_ID;

  useEffect(() => {
    if (!avatarModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAvatarModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [avatarModalOpen]);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (newPw !== confirmPw) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPw.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }

    const result = await onUpdatePassword(user.id, oldPw, newPw);
    if (result.ok) {
      setPwSuccess(true);
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } else {
      setPwError(result.error ?? 'Failed to update password');
    }
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    if (file.size > 200_000) {
      setAvatarError('Image is too large. Please choose a file under 200 KB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateAvatar(user.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleChoosePreset(presetId: AvatarPresetId) {
    setAvatarError('');
    onUpdateAvatarPreset(user.id, presetId);
    setAvatarModalOpen(false);
  }

  function handleUsePresetAvatar() {
    setAvatarError('');
    onUpdateAvatarPreset(user.id, selectedPresetId);
  }

  return (
    <div className="page profile-page">
      <div className="page__header profile-page__header">
        <div>
          <h1 className="page__title">Profile</h1>
          <p className="profile-page__subtitle">
            Manage your avatar and account password.
          </p>
        </div>
      </div>

      <div className="page__content profile-page__content">
        <section className="section profile-page__card profile-page__card--hero">
          <div className="profile-page__hero">
            <div className="profile-page__hero-avatar">
              <Avatar
                username={user.username}
                avatar={user.avatar}
                avatarPresetId={user.avatarPresetId}
                gender={user.gender}
                size="lg"
              />
            </div>

            <div className="profile-page__hero-main">
              <p className="profile-page__username">{user.username}</p>
              <p className="profile-page__meta">
                {user.avatar ? 'Using uploaded photo' : 'Using avatar preset'}
              </p>

              <div className="profile-page__actions">
                <button
                  type="button"
                  className="profile-page__btn profile-page__btn--primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload photo
                </button>

                <button
                  type="button"
                  className="profile-page__btn profile-page__btn--ghost"
                  onClick={() => setAvatarModalOpen(true)}
                >
                  Choose avatar
                </button>

                {user.avatar && (
                  <button
                    type="button"
                    className="profile-page__btn profile-page__btn--ghost"
                    onClick={handleUsePresetAvatar}
                  >
                    Use preset avatar
                  </button>
                )}
              </div>

              {avatarError && <p className="profile-page__error">{avatarError}</p>}
            </div>

            <div className="profile-page__preset-preview" aria-hidden="true">
              <span className="profile-page__preset-label">Selected preset</span>
              <Avatar
                username={user.username}
                avatar={null}
                avatarPresetId={selectedPresetId}
                size="md"
              />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-page__file-input"
            aria-label="Upload profile photo"
            title="Upload profile photo"
            onChange={handleAvatarChange}
          />
        </section>

        <section className="section profile-page__card">
          <div className="profile-page__section-head">
            <h2 className="section__title profile-page__password-title">Change Password</h2>
            <p className="profile-page__section-note">
              Use at least 6 characters.
            </p>
          </div>

          <form className="profile-page__form" onSubmit={handlePasswordSubmit}>
            <label className="field">
              <span className="field__label">Current password</span>
              <input
                className="field__input"
                type="password"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">New password</span>
              <input
                className="field__input"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Confirm new password</span>
              <input
                className="field__input"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            {pwError && <p className="profile-page__error">{pwError}</p>}
            {pwSuccess && (
              <p className="profile-page__success">Password updated successfully.</p>
            )}

            <button type="submit" className="profile-page__btn profile-page__btn--primary">
              Update password
            </button>
          </form>
        </section>
      </div>

      {avatarModalOpen && (
        <div
          className="profile-page__modal"
          role="presentation"
          onClick={() => setAvatarModalOpen(false)}
        >
          <div
            className="profile-page__modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-avatar-picker-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-page__modal-header">
              <div>
                <h3 id="profile-avatar-picker-title" className="profile-page__modal-title">
                  Choose avatar
                </h3>
                <p className="profile-page__modal-subtitle">
                  Selecting an avatar will switch back from photo to preset avatar.
                </p>
              </div>

              <button
                type="button"
                className="profile-page__modal-close"
                onClick={() => setAvatarModalOpen(false)}
                aria-label="Close avatar picker"
              >
                ×
              </button>
            </div>

            <div className="profile-page__modal-grid">
              {AVATAR_PRESET_OPTIONS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`profile-page__modal-option${isSelected ? ' profile-page__modal-option--active' : ''}`}
                    aria-label={`Choose ${preset.label}`}
                    aria-pressed={isSelected}
                    title={preset.label}
                    onClick={() => handleChoosePreset(preset.id)}
                  >
                    <Avatar
                      username={user.username}
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
