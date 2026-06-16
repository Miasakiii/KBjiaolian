import { getAllRecords } from './storage';
import { getAllWorkouts } from './workoutStorage';
import { getAllNutritionRecords } from './nutritionStorage';
import { getAllPlans } from './planStorage';
import { getUserProfile, getUserGoals } from './userStorage';

export interface ExportData {
  exportDate: string;
  profile: any;
  goals: any;
  analysisRecords: any[];
  workoutRecords: any[];
  nutritionRecords: any[];
  trainingPlans: any[];
}

export async function collectAllData(): Promise<ExportData> {
  return {
    exportDate: new Date().toISOString(),
    profile: getUserProfile(),
    goals: getUserGoals(),
    analysisRecords: await getAllRecords(),
    workoutRecords: await getAllWorkouts(),
    nutritionRecords: await getAllNutritionRecords(),
    trainingPlans: await getAllPlans(),
  };
}

export async function exportAsJSON(): Promise<void> {
  const data = await collectAllData();
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'kb-coach-data.json', 'application/json');
}

export async function exportAsCSV(): Promise<void> {
  const data = await collectAllData();

  // 体态分析记录 CSV
  const analysisCSV = generateAnalysisCSV(data.analysisRecords);
  const workoutCSV = generateWorkoutCSV(data.workoutRecords);
  const nutritionCSV = generateNutritionCSV(data.nutritionRecords);

  // 合并所有 CSV
  const fullCSV = `=== 体态分析记录 ===\n${analysisCSV}\n\n=== 训练记录 ===\n${workoutCSV}\n\n=== 饮食记录 ===\n${nutritionCSV}`;

  downloadFile(fullCSV, 'kb-coach-data.csv', 'text/csv');
}

function generateAnalysisCSV(records: any[]): string {
  if (records.length === 0) return '暂无数据';

  const headers = ['日期', '评分', '头前伸', '圆肩', '骨盆前倾', '膝超伸', '问题'];
  const rows = records.map((r) => {
    const date = new Date(r.timestamp).toLocaleDateString('zh-CN');
    const issues = r.result.issues.map((i: any) => i.name).join('; ');
    return `${date},${r.result.score},${r.result.radar.headForward},${r.result.radar.roundShoulder},${r.result.radar.pelvicTilt},${r.result.radar.kneeExtension},"${issues}"`;
  });

  return [headers.join(','), ...rows].join('\n');
}

function generateWorkoutCSV(records: any[]): string {
  if (records.length === 0) return '暂无数据';

  const headers = ['日期', '方案', '训练日', '时长(分钟)', '动作数', '评分'];
  const rows = records.map((r) => {
    const date = new Date(r.createdAt).toLocaleDateString('zh-CN');
    return `${date},"${r.planName}","${r.dayName}",${r.duration},${r.exercises.length},${r.rating}`;
  });

  return [headers.join(','), ...rows].join('\n');
}

function generateNutritionCSV(records: any[]): string {
  if (records.length === 0) return '暂无数据';

  const headers = ['日期', '餐次', '热量', '蛋白质', '碳水', '脂肪', '食物'];
  const rows = records.map((r) => {
    const date = new Date(r.createdAt).toLocaleDateString('zh-CN');
    const foods = r.analysis.foods.map((f: any) => f.name).join('; ');
    return `${date},${r.mealType},${r.analysis.totalCalories},${r.analysis.totalProtein},${r.analysis.totalCarbs},${r.analysis.totalFat},"${foods}"`;
  });

  return [headers.join(','), ...rows].join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function getDataStats(): Promise<{
  analysisCount: number;
  workoutCount: number;
  nutritionCount: number;
  planCount: number;
}> {
  const [analysisRecords, workoutRecords, nutritionRecords, plans] = await Promise.all([
    getAllRecords(),
    getAllWorkouts(),
    getAllNutritionRecords(),
    getAllPlans(),
  ]);

  return {
    analysisCount: analysisRecords.length,
    workoutCount: workoutRecords.length,
    nutritionCount: nutritionRecords.length,
    planCount: plans.length,
  };
}
