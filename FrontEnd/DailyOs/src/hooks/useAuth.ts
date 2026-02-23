import type { User, Session } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { sha256Hex } from '../utils/hashUtils';
import { generateId } from '../utils/idUtils';

const USERS_KEY = 'dailyos_users';
const SESSION_KEY = 'dailyos_session';

export function useAuth() {
  const [users, setUsers] = useLocalStorage<User[]>(USERS_KEY, []);
  const [session, setSession] = useLocalStorage<Session | null>(SESSION_KEY, null);

  async function register(
    username: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> {
    const trimmed = username.trim();
    if (!trimmed) return { ok: false, error: 'Username is required' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
    if (users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
      return { ok: false, error: 'Username already taken' };
    }
    const hash = await sha256Hex(password);
    const newUser: User = {
      id: generateId(),
      username: trimmed,
      passwordHash: hash,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setSession({ userId: newUser.id, username: newUser.username });
    return { ok: true };
  }

  async function login(
    username: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!user) return { ok: false, error: 'Incorrect username or password' };
    const hash = await sha256Hex(password);
    if (hash !== user.passwordHash) return { ok: false, error: 'Incorrect username or password' };
    setSession({ userId: user.id, username: user.username });
    return { ok: true };
  }

  function logout(): void {
    setSession(null);
  }

  function updateAvatar(userId: string, base64: string): void {
    setUsers(users.map((u) => (u.id === userId ? { ...u, avatar: base64 } : u)));
  }

  async function updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> {
    const user = users.find((u) => u.id === userId);
    if (!user) return { ok: false, error: 'User not found' };
    const oldHash = await sha256Hex(oldPassword);
    if (oldHash !== user.passwordHash) return { ok: false, error: 'Current password is incorrect' };
    if (newPassword.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
    const newHash = await sha256Hex(newPassword);
    setUsers(users.map((u) => (u.id === userId ? { ...u, passwordHash: newHash } : u)));
    return { ok: true };
  }

  return { session, users, register, login, logout, updateAvatar, updatePassword };
}
