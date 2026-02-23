import type { AvatarPresetId, Gender } from '../../types';
import avatar1Src from '../../assets/avatars/1.png';
import avatar2Src from '../../assets/avatars/2.jpg';
import avatar3Src from '../../assets/avatars/3.png';
import avatar4Src from '../../assets/avatars/4.png';
import avatar5Src from '../../assets/avatars/5.png';
import avatar6Src from '../../assets/avatars/6.png';
import avatar7Src from '../../assets/avatars/7.png';
import avatar8Src from '../../assets/avatars/8.png';
import avatar9Src from '../../assets/avatars/9.png';
import avatar10Src from '../../assets/avatars/10.png';
import avatar11Src from '../../assets/avatars/11.png';
import '../../styles/Avatar.css';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarPresetOption = {
  id: AvatarPresetId;
  label: string;
  previewSrc: string;
};

export const AVATAR_PRESET_OPTIONS: AvatarPresetOption[] = [
  { id: 'avatar-1', label: 'Avatar 1', previewSrc: avatar1Src },
  { id: 'avatar-2', label: 'Avatar 2', previewSrc: avatar2Src },
  { id: 'avatar-3', label: 'Avatar 3', previewSrc: avatar3Src },
  { id: 'avatar-4', label: 'Avatar 4', previewSrc: avatar4Src },
  { id: 'avatar-5', label: 'Avatar 5', previewSrc: avatar5Src },
  { id: 'avatar-6', label: 'Avatar 6', previewSrc: avatar6Src },
  { id: 'avatar-7', label: 'Avatar 7', previewSrc: avatar7Src },
  { id: 'avatar-8', label: 'Avatar 8', previewSrc: avatar8Src },
  { id: 'avatar-9', label: 'Avatar 9', previewSrc: avatar9Src },
  { id: 'avatar-10', label: 'Avatar 10', previewSrc: avatar10Src },
  { id: 'avatar-11', label: 'Avatar 11', previewSrc: avatar11Src },
];

const IMAGE_PRESET_SRC_BY_ID = new Map(
  AVATAR_PRESET_OPTIONS.map((preset) => [preset.id, preset.previewSrc]),
);

type AvatarProps = {
  username: string;
  avatar: string | null;
  avatarPresetId?: AvatarPresetId;
  gender?: Gender;
  size?: AvatarSize;
};

function MaleAvatarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="14" r="5" fill="none" />
      <path d="M13.5 10.5 20 4" fill="none" />
      <path d="M15 4h5v5" fill="none" />
    </svg>
  );
}

function FemaleAvatarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="5" fill="none" />
      <path d="M12 14v7" fill="none" />
      <path d="M8.5 18h7" fill="none" />
    </svg>
  );
}

export function Avatar({ username, avatar, avatarPresetId, gender, size = 'md' }: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  const className = `avatar avatar--${size}`;

  if (avatar) {
    return <img src={avatar} className={className} alt={`${username}'s avatar`} />;
  }

  if (avatarPresetId) {
    const preset = AVATAR_PRESET_OPTIONS.find((option) => option.id === avatarPresetId);
    const presetSrc = IMAGE_PRESET_SRC_BY_ID.get(avatarPresetId);

    if (presetSrc) {
      return (
        <img
          src={presetSrc}
          className={`${className} avatar--preset-image`}
          alt={`${preset?.label ?? 'Avatar'} for ${username}`}
        />
      );
    }
  }

  if (gender) {
    return (
      <span
        className={`${className} avatar--icon avatar--${gender}`}
        role="img"
        aria-label={`${gender === 'male' ? 'Male' : 'Female'} avatar placeholder`}
      >
        {gender === 'male' ? <MaleAvatarIcon /> : <FemaleAvatarIcon />}
      </span>
    );
  }

  return <span className={`${className} avatar--initials`}>{initials}</span>;
}
