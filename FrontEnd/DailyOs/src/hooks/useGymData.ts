import { useLocalStorage } from './useLocalStorage';
import type { GymProgram, GymSession } from '../types';

export function useGymData(userId: string) {
  const [gymProgram, setGymProgram] = useLocalStorage<GymProgram | null>(
    `dailyos_gym_program_${userId}`,
    null,
  );
  const [gymSessions, setGymSessions] = useLocalStorage<Record<string, GymSession>>(
    `dailyos_gym_sessions_${userId}`,
    {},
  );

  function updateGymProgram(program: GymProgram | null): void {
    setGymProgram(program);
  }

  function upsertGymSession(date: string, session: GymSession): void {
    setGymSessions({ ...gymSessions, [date]: session });
  }

  return { gymProgram, gymSessions, updateGymProgram, upsertGymSession };
}
