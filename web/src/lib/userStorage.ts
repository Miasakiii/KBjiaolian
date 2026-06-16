import { UserProfile, UserGoals } from '@/types/user';

const PROFILE_KEY = 'kb-coach-profile';
const GOALS_KEY = 'kb-coach-user-goals';

const defaultProfile: UserProfile = {
  nickname: '',
  gender: 'male',
  age: 25,
  height: 170,
  weight: 65,
  goal: 'health',
  experience: 'beginner',
};

const defaultGoals: UserGoals = {
  targetWeight: 65,
  targetBodyFat: 20,
  weeklyWorkouts: 4,
  dailyCalories: 2000,
  dailyProtein: 150,
  dailyCarbs: 250,
  dailyFat: 65,
};

export function getUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? { ...defaultProfile, ...JSON.parse(data) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getUserGoals(): UserGoals {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? { ...defaultGoals, ...JSON.parse(data) } : defaultGoals;
  } catch {
    return defaultGoals;
  }
}

export function saveUserGoals(goals: UserGoals): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

export function calculateBMR(profile: UserProfile): number {
  // Harris-Benedict 公式
  if (profile.gender === 'male') {
    return Math.round(88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age));
  } else {
    return Math.round(447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age));
  }
}
