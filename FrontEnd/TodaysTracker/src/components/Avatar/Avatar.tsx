import '../../styles/Avatar.css';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  username: string;
  avatar: string | null;
  size?: AvatarSize;
};

export function Avatar({ username, avatar, size = 'md' }: AvatarProps) {
  const initials = username.slice(0, 2).toUpperCase();
  const className = `avatar avatar--${size}`;

  if (avatar) {
    return <img src={avatar} className={className} alt={`${username}'s avatar`} />;
  }

  return <span className={`${className} avatar--initials`}>{initials}</span>;
}
