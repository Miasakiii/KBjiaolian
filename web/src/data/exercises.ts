/**
 * 训练动作库数据
 *
 * 按肌群分类，每个动作包含：
 * - 基础信息（名称、肌群、难度、器械）
 * - 动作描述 + 步骤 + 要点
 * - 动画标识（预留 Lottie/GIF 接口）
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'glutes'
  | 'full_body';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Equipment = 'bodyweight' | 'dumbbell' | 'barbell' | 'machine' | 'band' | 'cable';

export interface ExerciseDef {
  id: string;
  name: string;
  nameEn: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  difficulty: Difficulty;
  equipment: Equipment;
  /** 动画类型：icon 占位，后续替换为 lottie/gif */
  animation: {
    type: 'icon' | 'lottie' | 'gif';
    value: string;
  };
  description: string;
  steps: string[];
  tips: string[];
  /** 常见错误 */
  commonMistakes: string[];
  /** 推荐组数×次数 */
  defaultSets: string;
}

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: '胸部',
  back: '背部',
  shoulders: '肩部',
  arms: '手臂',
  legs: '腿部',
  core: '核心',
  glutes: '臀部',
  full_body: '全身',
};

export const muscleGroupEmojis: Record<MuscleGroup, string> = {
  chest: 'Dumbbell',
  back: 'ArrowLeftCircle',
  shoulders: 'Dumbbell',
  arms: 'Dumbbell',
  legs: 'Footprints',
  core: 'Target',
  glutes: 'Dumbbell',
  full_body: 'Flame',
};

export const difficultyLabels: Record<Difficulty, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
};

export const equipmentLabels: Record<Equipment, string> = {
  bodyweight: '徒手',
  dumbbell: '哑铃',
  barbell: '杠铃',
  machine: '器械',
  band: '弹力带',
  cable: '龙门架',
};

// ==================== 动作数据 ====================

export const exercises: ExerciseDef[] = [
  // ---- 胸部 ----
  {
    id: 'push_up',
    name: '俯卧撑',
    nameEn: 'Push Up',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'arms'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '最经典的上肢推类动作，锻炼胸肌、三角肌前束和肱三头肌。',
    steps: [
      '双手撑地，略宽于肩，身体呈一条直线',
      '屈肘下降身体，胸部接近地面',
      '推起至手臂伸直，注意不要塌腰',
    ],
    tips: ['全程保持核心收紧', '手肘不要过度外展，与躯干约45°'],
    commonMistakes: ['塌腰或撅臀', '手肘完全外展成90°', '动作幅度不够'],
    defaultSets: '3组 × 12-15次',
  },
  {
    id: 'bench_press',
    name: '杠铃卧推',
    nameEn: 'Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'arms'],
    difficulty: 'intermediate',
    equipment: 'barbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '力量训练之王，复合推类动作，对胸肌刺激最为全面。',
    steps: [
      '平躺于卧推凳，双脚踩实地面',
      '握距略宽于肩，杠铃位于胸部正上方',
      '控制下放至胸部轻触，推起至手臂伸直',
    ],
    tips: ['肩胛骨后缩下沉', '杠铃轨迹略呈弧线'],
    commonMistakes: ['臀部离凳', '杠铃砸胸', '腰部过度弓起'],
    defaultSets: '4组 × 8-12次',
  },
  {
    id: 'dumbbell_fly',
    name: '哑铃飞鸟',
    nameEn: 'Dumbbell Fly',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Target' },
    description: '孤立胸肌动作，增加胸肌厚度和中缝线条。',
    steps: [
      '平躺，双手持哑铃伸直于胸部上方',
      '微屈肘，双臂向两侧打开至与肩平',
      '胸肌发力夹回起始位置',
    ],
    tips: ['手肘始终保持微屈', '想象"抱树"的弧线轨迹'],
    commonMistakes: ['手肘锁死', '下放过深导致肩部受伤', '用惯性甩起'],
    defaultSets: '3组 × 12次',
  },
  {
    id: 'incline_dumbbell_press',
    name: '上斜哑铃卧推',
    nameEn: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'arms'],
    difficulty: 'intermediate',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Ruler' },
    description: '针对上胸的推类动作，让胸型更饱满。',
    steps: [
      '调节卧推凳至30-45度角',
      '双手持哑铃，推至胸部上方',
      '控制下放，上推至手臂伸直',
    ],
    tips: ['角度不要超过45°，否则变成肩部发力', '哑铃在顶部靠拢'],
    commonMistakes: ['凳面角度过高', '两侧用力不均'],
    defaultSets: '3组 × 10-12次',
  },

  // ---- 背部 ----
  {
    id: 'pull_up',
    name: '引体向上',
    nameEn: 'Pull Up',
    muscleGroup: 'back',
    secondaryMuscles: ['arms'],
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '最佳背部自重训练，全面锻炼背阔肌、菱形肌和肱二头肌。',
    steps: [
      '双手正握杠，握距略宽于肩',
      '背阔肌发力拉起身体，下巴过杠',
      '控制下放至手臂完全伸直',
    ],
    tips: ['避免借力摆动', '想象"把杠拉向胸部"'],
    commonMistakes: ['甩身体借力', '半程动作', '耸肩'],
    defaultSets: '4组 × 6-10次',
  },
  {
    id: 'lat_pulldown',
    name: '高位下拉',
    nameEn: 'Lat Pulldown',
    muscleGroup: 'back',
    secondaryMuscles: ['arms'],
    difficulty: 'beginner',
    equipment: 'machine',
    animation: { type: 'icon', value: 'ArrowDown' },
    description: '引体向上的器械替代版本，适合初学者建立背部发力感。',
    steps: [
      '坐于器械上，大腿固定于垫下',
      '双手宽握横杆，挺胸沉肩',
      '背阔肌发力拉至锁骨位置',
    ],
    tips: ['身体略后倾15°', '下拉时挤压肩胛骨'],
    commonMistakes: ['身体过度后仰', '用手臂硬拉', '耸肩代偿'],
    defaultSets: '3组 × 12次',
  },
  {
    id: 'dumbbell_row',
    name: '单臂哑铃划船',
    nameEn: 'Dumbbell Row',
    muscleGroup: 'back',
    secondaryMuscles: ['arms'],
    difficulty: 'beginner',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '经典单侧背部训练，能纠正左右不平衡。',
    steps: [
      '一手一膝撑于凳上，另一手持哑铃',
      '背部发力将哑铃拉向腰部',
      '顶峰收缩后控制下放',
    ],
    tips: ['拉至手肘超过躯干', '不要转体借力'],
    commonMistakes: ['转体借力', '拉的位置太高（到胸部）', '弓背'],
    defaultSets: '3组 × 10-12次/侧',
  },
  {
    id: 'barbell_row',
    name: '杠铃划船',
    nameEn: 'Barbell Row',
    muscleGroup: 'back',
    secondaryMuscles: ['arms'],
    difficulty: 'intermediate',
    equipment: 'barbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '高效复合背部动作，同时锻炼背阔肌、菱形肌和竖脊肌。',
    steps: [
      '双脚与肩同宽，屈髋俯身约45°',
      '双手握杠铃，握距与肩同宽',
      '背肌发力拉杠铃至腹部',
    ],
    tips: ['保持腰背挺直', '拉到腹部而非胸部'],
    commonMistakes: ['俯身角度不够', '用腰部甩起杠铃', '圆背'],
    defaultSets: '4组 × 8-10次',
  },

  // ---- 肩部 ----
  {
    id: 'overhead_press',
    name: '站姿推举',
    nameEn: 'Overhead Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['arms', 'core'],
    difficulty: 'intermediate',
    equipment: 'barbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '肩部王牌动作，锻炼三角肌前束和中束，同时强化核心。',
    steps: [
      '双脚与肩同宽，杠铃置于锁骨位置',
      '核心收紧，将杠铃推至头顶',
      '头部在杠铃通过后前移，锁定在头顶正上方',
    ],
    tips: ['推举时头部稍微后仰让路', '锁定时杠铃、肩、髋、脚踝成一条线'],
    commonMistakes: ['腰部过度后仰', '杠铃轨迹不是直线', '没有完全锁定'],
    defaultSets: '4组 × 8-10次',
  },
  {
    id: 'lateral_raise',
    name: '侧平举',
    nameEn: 'Lateral Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    difficulty: 'beginner',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Target' },
    description: '三角肌中束孤立动作，打造肩部宽度。',
    steps: [
      '双脚与肩同宽，双手持哑铃于体侧',
      '微屈肘，向两侧举起至与肩平',
      '控制下放，不要完全放松',
    ],
    tips: ['小指略高于拇指（内旋）', '想象"倒水"的动作'],
    commonMistakes: ['甩起哑铃用惯性', '举得过高超过肩', '耸肩'],
    defaultSets: '3组 × 15次',
  },
  {
    id: 'face_pull',
    name: '面拉',
    nameEn: 'Face Pull',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['back'],
    difficulty: 'beginner',
    equipment: 'cable',
    animation: { type: 'icon', value: 'Target' },
    description: '锻炼三角肌后束和外旋肌群，改善圆肩体态。',
    steps: [
      '龙门架绳索调至面部高度',
      '双手拉绳索向面部两侧',
      '外旋至大拇指朝后，挤压肩胛骨',
    ],
    tips: ['拉到耳朵两侧', '注重外旋和肩胛骨收缩'],
    commonMistakes: ['拉的位置太低', '身体后仰借力', '没有外旋'],
    defaultSets: '3组 × 15次',
  },

  // ---- 手臂 ----
  {
    id: 'bicep_curl',
    name: '哑铃弯举',
    nameEn: 'Bicep Curl',
    muscleGroup: 'arms',
    secondaryMuscles: [],
    difficulty: 'beginner',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '最基础的手臂训练动作，锻炼肱二头肌。',
    steps: [
      '站立，双手持哑铃于体前',
      '大臂固定，弯举哑铃至肩前',
      '控制下放，不要完全放松',
    ],
    tips: ['大臂紧贴身体不要晃动', '顶峰时手腕外旋增加收缩'],
    commonMistakes: ['甩身体借力', '大臂前后晃动', '下放太快'],
    defaultSets: '3组 × 12次',
  },
  {
    id: 'tricep_dip',
    name: '臂屈伸',
    nameEn: 'Tricep Dip',
    muscleGroup: 'arms',
    secondaryMuscles: ['chest', 'shoulders'],
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '高效肱三头肌训练，也能刺激下胸和前肩。',
    steps: [
      '双手撑于双杠或凳子边缘',
      '屈肘下降至上臂与前臂约90°',
      '三头发力推起至手臂伸直',
    ],
    tips: ['身体直立更侧重三头', '前倾则更侧重胸部'],
    commonMistakes: ['下降过深伤肩', '耸肩', '身体过度前倾'],
    defaultSets: '3组 × 10-12次',
  },
  {
    id: 'hammer_curl',
    name: '锤式弯举',
    nameEn: 'Hammer Curl',
    muscleGroup: 'arms',
    secondaryMuscles: [],
    difficulty: 'beginner',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Hammer' },
    description: '锻炼肱肌和肱桡肌，让手臂更厚实。',
    steps: [
      '双手持哑铃，掌心相对（中立握）',
      '大臂固定，弯举至肩前',
      '控制下放',
    ],
    tips: ['保持掌心相对不要旋转', '可以交替或同时进行'],
    commonMistakes: ['握姿不稳导致旋转', '身体晃动借力'],
    defaultSets: '3组 × 12次',
  },

  // ---- 腿部 ----
  {
    id: 'squat',
    name: '深蹲',
    nameEn: 'Squat',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes', 'core'],
    difficulty: 'intermediate',
    equipment: 'barbell',
    animation: { type: 'icon', value: 'Footprints' },
    description: '力量训练之王，全面锻炼股四头肌、臀大肌和核心。',
    steps: [
      '杠铃置于斜方肌上，双脚略宽于肩',
      '挺胸收腹，屈髋屈膝下蹲',
      '蹲至大腿平行或略低于膝盖，站起',
    ],
    tips: ['膝盖方向与脚尖一致', '重心在脚掌中后部'],
    commonMistakes: ['膝盖内扣', '弓背', '脚跟离地'],
    defaultSets: '4组 × 8-10次',
  },
  {
    id: 'lunges',
    name: '弓步蹲',
    nameEn: 'Lunges',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Footprints' },
    description: '单腿训练动作，锻炼股四头肌和臀大肌，改善左右平衡。',
    steps: [
      '站立，一脚向前迈出一大步',
      '下蹲至前腿大腿平行地面，后膝接近地面',
      '前脚发力蹬回起始位置',
    ],
    tips: ['前膝不要超过脚尖太多', '躯干保持直立'],
    commonMistakes: ['前膝过度内扣', '身体前倾', '步幅太小'],
    defaultSets: '3组 × 12次/侧',
  },
  {
    id: 'romanian_deadlift',
    name: '罗马尼亚硬拉',
    nameEn: 'Romanian Deadlift',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes', 'back'],
    difficulty: 'intermediate',
    equipment: 'barbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '最佳后链训练动作，针对腘绳肌和臀大肌。',
    steps: [
      '双脚与肩同宽，微屈膝，双手握杠铃',
      '保持腰背挺直，屈髋将杠铃沿腿前下放',
      '感受腘绳肌拉伸后，伸髋站起',
    ],
    tips: ['杠铃始终贴近身体', '下放到腘绳肌有强烈拉伸感即可'],
    commonMistakes: ['弓背', '膝盖过度弯曲变成深蹲', '杠铃离身体太远'],
    defaultSets: '3组 × 10次',
  },
  {
    id: 'calf_raise',
    name: '提踵',
    nameEn: 'Calf Raise',
    muscleGroup: 'legs',
    secondaryMuscles: [],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Footprints' },
    description: '锻炼小腿腓肠肌和比目鱼肌。',
    steps: [
      '双脚站立于台阶边缘，脚跟悬空',
      '踮起脚尖至最高点，停顿1-2秒',
      '缓慢下放至脚跟低于台阶平面',
    ],
    tips: ['全程控制速度', '顶峰充分收缩'],
    commonMistakes: ['速度太快像弹跳', '幅度不够'],
    defaultSets: '4组 × 20次',
  },

  // ---- 核心 ----
  {
    id: 'plank',
    name: '平板支撑',
    nameEn: 'Plank',
    muscleGroup: 'core',
    secondaryMuscles: ['shoulders'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '最经典的核心训练，锻炼腹横肌和整体核心稳定性。',
    steps: [
      '前臂和脚尖撑地，身体呈一条直线',
      '收紧腹部和臀部，不要塌腰',
      '保持均匀呼吸，坚持目标时间',
    ],
    tips: ['想象肚脐向脊柱方向收', '不要憋气'],
    commonMistakes: ['塌腰', '撅臀', '憋气', '头部过度抬起'],
    defaultSets: '3组 × 30-60秒',
  },
  {
    id: 'dead_bug',
    name: '死虫式',
    nameEn: 'Dead Bug',
    muscleGroup: 'core',
    secondaryMuscles: [],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '安全高效的核心训练，锻炼腹肌的同时保护腰椎。',
    steps: [
      '仰卧，双手伸直朝天花板，双腿屈膝抬起90°',
      '腰部紧贴地面，对侧手脚同时伸展',
      '收回后换另一侧',
    ],
    tips: ['全程腰部贴地', '动作越慢越好'],
    commonMistakes: ['腰部离开地面', '动作太快', '憋气'],
    defaultSets: '3组 × 10次/侧',
  },
  {
    id: 'russian_twist',
    name: '俄罗斯转体',
    nameEn: 'Russian Twist',
    muscleGroup: 'core',
    secondaryMuscles: [],
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'RefreshCw' },
    description: '锻炼腹斜肌，塑造腰部线条。',
    steps: [
      '坐于地面，上身后倾45°，双脚离地',
      '双手合十或持重物，左右转体',
      '每侧触地算一次',
    ],
    tips: ['转体时呼气', '眼睛跟随手的方向'],
    commonMistakes: ['只动手臂不转躯干', '双脚着地', '弓背'],
    defaultSets: '3组 × 20次（左右各10）',
  },

  // ---- 臀部 ----
  {
    id: 'hip_thrust',
    name: '臀推',
    nameEn: 'Hip Thrust',
    muscleGroup: 'glutes',
    secondaryMuscles: ['legs'],
    difficulty: 'intermediate',
    equipment: 'barbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '臀部激活之王，孤立刺激臀大肌。',
    steps: [
      '上背靠于凳面，杠铃置于髋部',
      '双脚踩地，臀部发力推起至身体成直线',
      '顶峰挤压臀部1-2秒，控制下放',
    ],
    tips: ['下巴微收，眼睛看前方', '小腿垂直地面'],
    commonMistakes: ['过度伸展腰椎', '用腰部代偿', '脚的位置不对'],
    defaultSets: '4组 × 10-12次',
  },
  {
    id: 'glute_bridge',
    name: '臀桥',
    nameEn: 'Glute Bridge',
    muscleGroup: 'glutes',
    secondaryMuscles: ['legs'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '臀部激活入门动作，适合热身和初学者。',
    steps: [
      '仰卧，双脚踩地，双膝弯曲',
      '臀部发力抬起至身体成直线',
      '顶峰挤压臀部，控制下放',
    ],
    tips: ['不要用腰部发力', '顶峰时膝盖、髋、肩成一条线'],
    commonMistakes: ['过度弓腰', '没有充分顶髋', '速度太快'],
    defaultSets: '3组 × 15次',
  },

  // ---- 全身 ----
  {
    id: 'burpee',
    name: '波比跳',
    nameEn: 'Burpee',
    muscleGroup: 'full_body',
    secondaryMuscles: ['chest', 'legs', 'core'],
    difficulty: 'intermediate',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Flame' },
    description: '全身爆发力训练，极佳的燃脂和心肺训练动作。',
    steps: [
      '站立位，下蹲双手撑地',
      '双脚向后跳成俯卧撑位，做一个俯卧撑',
      '双脚跳回蹲位，起身跳跃',
    ],
    tips: ['每个环节流畅衔接', '跳跃时充分伸展'],
    commonMistakes: ['俯卧撑时塌腰', '落地时膝盖锁死', '偷懒省略某个环节'],
    defaultSets: '3组 × 10次',
  },
  {
    id: 'mountain_climber',
    name: '登山跑',
    nameEn: 'Mountain Climber',
    muscleGroup: 'full_body',
    secondaryMuscles: ['core', 'legs'],
    difficulty: 'beginner',
    equipment: 'bodyweight',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '全身有氧训练动作，同时锻炼核心和心肺。',
    steps: [
      '俯卧撑起始位，身体呈一条直线',
      '交替将膝盖拉向胸部',
      '保持快速节奏',
    ],
    tips: ['臀部不要抬太高', '保持核心收紧'],
    commonMistakes: ['臀部翘起', '手的位置太前', '速度不稳定'],
    defaultSets: '3组 × 30秒',
  },
  {
    id: 'turkish_getup',
    name: '土耳其起立',
    nameEn: 'Turkish Get Up',
    muscleGroup: 'full_body',
    secondaryMuscles: ['shoulders', 'core', 'legs'],
    difficulty: 'advanced',
    equipment: 'dumbbell',
    animation: { type: 'icon', value: 'Dumbbell' },
    description: '最复杂的全身训练动作，提升稳定性和协调性。',
    steps: [
      '仰卧，单手持哑铃伸直朝天花板',
      '屈同侧膝盖，用对侧手肘撑起',
      '逐步站起，全程保持哑铃在头顶',
    ],
    tips: ['每个位置都要稳定后再进行下一步', '眼睛始终看哑铃'],
    commonMistakes: ['动作太快失去平衡', '手腕弯曲', '没有保持哑铃垂直'],
    defaultSets: '3组 × 3次/侧',
  },
];

/** 按肌群分组 */
export function getExercisesByMuscleGroup(): Map<MuscleGroup, ExerciseDef[]> {
  const grouped = new Map<MuscleGroup, ExerciseDef[]>();
  for (const ex of exercises) {
    const list = grouped.get(ex.muscleGroup) || [];
    list.push(ex);
    grouped.set(ex.muscleGroup, list);
  }
  return grouped;
}

/** 按肌群筛选 */
export function filterExercises(
  muscleGroup?: MuscleGroup,
  difficulty?: Difficulty,
  equipment?: Equipment
): ExerciseDef[] {
  return exercises.filter((ex) => {
    if (muscleGroup && ex.muscleGroup !== muscleGroup) return false;
    if (difficulty && ex.difficulty !== difficulty) return false;
    if (equipment && ex.equipment !== equipment) return false;
    return true;
  });
}

/** 搜索动作 */
export function searchExercises(query: string): ExerciseDef[] {
  const q = query.toLowerCase().trim();
  if (!q) return exercises;
  return exercises.filter(
    (ex) =>
      ex.name.includes(q) ||
      ex.nameEn.toLowerCase().includes(q) ||
      ex.description.includes(q) ||
      muscleGroupLabels[ex.muscleGroup].includes(q)
  );
}
