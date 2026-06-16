import { AnalysisResult } from '@/types/analysis';

export const mockResult: AnalysisResult = {
  score: 72,
  summary: '体态整体处于中等水平，主要问题集中在上交叉综合征（圆肩、头前伸）和下交叉综合征（骨盆前倾）。建议通过针对性训练改善肌肉失衡，同时注意日常姿势调整。',
  issues: [
    { name: '圆肩', severity: 'moderate' },
    { name: '头前伸', severity: 'mild' },
  ],
  radar: {
    headForward: 65,
    roundShoulder: 45,
    pelvicTilt: 78,
    kneeExtension: 82,
  },
  suggestions: [
    {
      exercise: '靠墙天使',
      sets: '3组 × 15次',
      description: '背靠墙站立，手臂贴墙上下滑动，改善圆肩',
      targetMuscle: '菱形肌、斜方肌中下束',
      difficulty: '初级',
      steps: [
        '背靠墙站立，双脚距离墙面约15厘米',
        '臀部、上背部、头部贴紧墙面',
        '手臂打开呈W型，手背贴墙',
        '缓慢向上滑动手臂至头顶呈Y型',
        '缓慢下放回起始位置，重复动作',
      ],
      tips: [
        '全程保持手臂贴墙，不要耸肩',
        '动作缓慢控制，感受肩胛骨收紧',
        '如果无法完全贴墙，可适当降低难度',
      ],
    },
    {
      exercise: '颈部后缩',
      sets: '3组 × 12次',
      description: '收下巴向后推，强化深层颈屈肌',
      targetMuscle: '深层颈屈肌',
      difficulty: '初级',
      steps: [
        '坐姿或站姿，目视前方',
        '保持身体不动，下巴向后收',
        '感觉后颈有拉伸感，保持3秒',
        '缓慢回到起始位置',
        '重复动作，注意不要低头',
      ],
      tips: [
        '想象有人轻轻推你的下巴向后',
        '动作幅度不用太大，轻微后缩即可',
        '可以在办公时随时练习，改善头前伸',
      ],
    },
    {
      exercise: '臀桥',
      sets: '3组 × 15次',
      description: '仰卧屈膝抬臀，激活臀肌改善骨盆前倾',
      targetMuscle: '臀大肌、腘绳肌',
      difficulty: '初级',
      steps: [
        '仰卧屈膝，双脚平放地面，与肩同宽',
        '双手放于身体两侧，掌心朝下',
        '收紧核心，臀部发力向上抬起',
        '至身体呈一条直线，保持2秒',
        '缓慢下放，不要完全落地',
      ],
      tips: [
        '抬起时不要过度挺腰，避免腰椎压力',
        '感受臀部发力，而不是大腿后侧',
        '可以在膝盖间夹一个枕头增加激活感',
      ],
    },
  ],
};
