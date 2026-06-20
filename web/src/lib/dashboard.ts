import { getAllRecords } from './storage';
import { getAllWorkouts, getWorkoutStats } from './workoutStorage';
import { getTodayNutrition, getNutritionGoals } from './nutritionStorage';
import { getAllPlans } from './planStorage';

export interface DashboardData {
  // 体态评分
  latestScore: number | null;
  scoreTrend: number; // 正数表示提升，负数表示下降

  // 训练统计
  workoutStats: {
    thisWeek: number;
    streak: number;
    total: number;
  };

  // 营养摄入
  nutrition: {
    calories: number;
    caloriesGoal: number;
    protein: number;
    proteinGoal: number;
  };

  // 训练方案
  hasPlan: boolean;
  planName: string | null;

  // 最近活动
  recentActivities: Activity[];

  // 今日任务
  todayTasks: Task[];
}

export interface Activity {
  id: string;
  type: 'analysis' | 'workout' | 'nutrition' | 'plan';
  title: string;
  time: number;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
  link: string;
}

export async function getDashboardData(): Promise<DashboardData> {
  // 获取体态分析记录
  const analysisRecords = await getAllRecords();
  const latestScore = analysisRecords.length > 0 ? analysisRecords[0].result.score : null;
  const scoreTrend = analysisRecords.length >= 2
    ? analysisRecords[0].result.score - analysisRecords[1].result.score
    : 0;

  // 获取训练统计
  const workoutStatsData = await getWorkoutStats();
  const workoutStats = {
    thisWeek: workoutStatsData.thisWeekWorkouts,
    streak: workoutStatsData.currentStreak,
    total: workoutStatsData.totalWorkouts,
  };

  // 获取营养摄入
  const todayNutrition = await getTodayNutrition();
  const nutritionGoals = getNutritionGoals();
  const nutrition = {
    calories: todayNutrition.totalCalories,
    caloriesGoal: nutritionGoals.calories,
    protein: todayNutrition.totalProtein,
    proteinGoal: nutritionGoals.protein,
  };

  // 获取训练方案
  const plans = await getAllPlans();
  const hasPlan = plans.length > 0;
  const planName = hasPlan ? plans[0].name : null;

  // 生成最近活动
  const workoutRecords = await getAllWorkouts();
  const recentActivities = generateRecentActivities(analysisRecords, workoutRecords);

  // 生成今日任务
  const todayTasks = generateTodayTasks(latestScore !== null, workoutStats.thisWeek, todayNutrition.records.length > 0);

  return {
    latestScore,
    scoreTrend,
    workoutStats,
    nutrition,
    hasPlan,
    planName,
    recentActivities,
    todayTasks,
  };
}

function generateRecentActivities(analysisRecords: any[], workoutRecords: any[]): Activity[] {
  const activities: Activity[] = [];

  // 添加分析记录
  analysisRecords.slice(0, 3).forEach((record) => {
    activities.push({
      id: record.id,
      type: 'analysis',
      title: `体态分析 - ${record.result.score}分`,
      time: record.timestamp,
      icon: '',
    });
  });

  // 添加训练记录
  workoutRecords.slice(0, 3).forEach((record) => {
    activities.push({
      id: record.id,
      type: 'workout',
      title: `${record.dayName} - ${record.duration}分钟`,
      time: record.createdAt,
      icon: '',
    });
  });

  // 按时间排序，取最近5条
  return activities
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);
}

function generateTodayTasks(hasScore: boolean, weekWorkouts: number, hasNutrition: boolean): Task[] {
  const tasks: Task[] = [];

  // 体态分析任务
  if (!hasScore) {
    tasks.push({
      id: 'analysis',
      title: '完成首次体态分析',
      icon: '',
      completed: false,
      link: '/analyze',
    });
  }

  // 训练任务
  if (weekWorkouts < 3) {
    tasks.push({
      id: 'workout',
      title: '今日训练',
      icon: '',
      completed: false,
      link: '/workout',
    });
  }

  // 饮食记录任务
  if (!hasNutrition) {
    tasks.push({
      id: 'nutrition',
      title: '记录今日饮食',
      icon: '',
      completed: false,
      link: '/nutrition',
    });
  }

  // 如果没有任务，显示鼓励信息
  if (tasks.length === 0) {
    tasks.push({
      id: 'complete',
      title: '今日任务已完成！',
      icon: 'Check',
      completed: true,
      link: '/',
    });
  }

  return tasks;
}
