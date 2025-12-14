
import { GameSession, Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'Novice Explorer', description: 'Complete your first maze.', icon: 'scroll' },
  { id: 'master_5', title: 'Dungeon Crawler', description: 'Complete 5 mazes.', icon: 'trophy' },
  { id: 'master_10', title: 'Dungeon Master', description: 'Complete 10 mazes.', icon: 'trophy' },
  { id: 'perfect_score', title: 'Perfectionist', description: 'Get a perfect score (10/10).', icon: 'star' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Complete a maze in under 60 seconds.', icon: 'lightning' },
  { id: 'math_whiz', title: 'Math Whiz', description: 'Complete 5 Math mazes.', icon: 'fire' },
  { id: 'spelling_bee', title: 'Spelling Bee', description: 'Complete 5 Spelling mazes.', icon: 'medal' },
];

export const checkAchievements = (
  session: GameSession,
  history: GameSession[],
  existingIds: string[]
): string[] => {
  const newIds: string[] = [];
  
  const has = (id: string) => existingIds.includes(id);
  const totalGames = history.length; // Includes current because we pass updated history
  
  if (!has('first_win') && totalGames >= 1) newIds.push('first_win');
  if (!has('master_5') && totalGames >= 5) newIds.push('master_5');
  if (!has('master_10') && totalGames >= 10) newIds.push('master_10');
  
  if (!has('perfect_score') && session.score === 10) newIds.push('perfect_score');
  if (!has('speed_demon') && session.time < 60) newIds.push('speed_demon');
  
  const mathGames = history.filter(h => h.mode === 'Math').length;
  if (!has('math_whiz') && mathGames >= 5) newIds.push('math_whiz');

  const spellingGames = history.filter(h => h.mode === 'Spelling').length;
  if (!has('spelling_bee') && spellingGames >= 5) newIds.push('spelling_bee');

  return newIds;
};