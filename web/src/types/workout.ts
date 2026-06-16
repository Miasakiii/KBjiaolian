export interface CompletedSet {
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface CompletedExercise {
  name: string;
  targetMuscle: string;
  sets: CompletedSet[];
}

export interface WorkoutRecord {
  id: string;
  planId: string;
  planName: string;
  dayNumber: number;
  dayName: string;
  startTime: number;
  endTime: number;
  duration: number;  // 分钟
  exercises: CompletedExercise[];
  rating: number;    // 1-5星
  notes: string;
  createdAt: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;  // 分钟
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
  currentStreak: number;  // 连续天数
  averageRating: number;
}
