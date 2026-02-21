import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import type { User } from '../types';
import { Avatar } from '../components/Avatar/Avatar';

type ProfilePageProps = {
  user: User;
  onUpdateAvatar: (userId: string, base64: string) => void;
  onUpdatePassword: (userId: string, oldPw: string, newPw: string) => Promise<{ ok: boolean; error?: string }>;
};

export function ProfilePage({ user, onUpdateAvatar, onUpdatePassword }: ProfilePageProps) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    const result = await onUpdatePassword(user.id, oldPw, newPw);
    if (result.ok) {
      setPwSuccess(true);
      setOldPw(''); setNewPw(''); setConfirmPw('');
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

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Profile</h1>
      </div>

      <div className="page__content">

        {/* Avatar */}
        <section className="section" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Avatar username={user.username} avatar={user.avatar} size="lg" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>{user.username}</p>
              <button className="btn btn--secondary" onClick={() => fileInputRef.current?.click()}>
                Upload photo
              </button>
              {avatarError && <p className="login-error" style={{ marginTop: 0 }}>{avatarError}</p>}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </section>

        {/* Change password */}
        <section className="section">
          <h2 className="section__title" style={{ marginBottom: '14px' }}>Change Password</h2>
          <form className="login-form" onSubmit={handlePasswordSubmit}>
            <label className="field">
              <span className="field__label">Current password</span>
              <input className="field__input" type="password" value={oldPw}
                onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" required />
            </label>
            <label className="field">
              <span className="field__label">New password</span>
              <input className="field__input" type="password" value={newPw}
                onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" required />
            </label>
            <label className="field">
              <span className="field__label">Confirm new password</span>
              <input className="field__input" type="password" value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" required />
            </label>
            {pwError && <p className="login-error">{pwError}</p>}
            {pwSuccess && (
              <p style={{ color: 'var(--clr-green)', fontSize: '13px' }}>Password updated successfully.</p>
            )}
            <button type="submit" className="btn btn--primary">Update password</button>
          </form>
        </section>

      </div>
    </div>
  );
}
