// pages/exercises/index.js - 动作库页逻辑
const app = getApp();

// 本地动作数据（训练方案所需，无需网络请求）
const EXERCISE_DB = [
  { name: '深蹲', group: '腿部', equipment: '自重', difficulty: '初级', desc: '下肢推力基础动作', tips: ['脚尖略向外展', '膝盖跟随脚尖方向', '臀部向后坐'] },
  { name: '俯卧撑', group: '胸部', equipment: '自重', difficulty: '初级', desc: '上肢推力基础动作', tips: ['手掌与肩同宽', '核心收紧不塌腰', '下放至上胸近地面'] },
  { name: '平板支撑', group: '核心', equipment: '自重', difficulty: '初级', desc: '核心稳定性训练', tips: ['身体成一条直线', '臀部不要抬起', '保持正常呼吸'] },
  { name: '弓步蹲', group: '腿部', equipment: '自重', difficulty: '中级', desc: '单腿力量与平衡', tips: ['前膝不超过脚尖', '后膝接近地面', '躯干保持直立'] },
  { name: '引体向上', group: '背部', equipment: '单杠', difficulty: '高级', desc: '上肢拉力经典动作', tips: ['启动前先沉肩', '用背阔肌发力', '全程控制速度'] },
  { name: '哑铃划船', group: '背部', equipment: '哑铃', difficulty: '中级', desc: '背部厚度训练', tips: ['单膝跪凳保持平衡', '拉起时夹背', '下放充分拉伸'] },
  { name: '哑铃卧推', group: '胸部', equipment: '哑铃', difficulty: '中级', desc: '胸部力量训练', tips: ['下放至胸侧', '推起时呼气', '肩胛骨保持后缩'] },
  { name: '肩推', group: '肩部', equipment: '哑铃', difficulty: '中级', desc: '肩部推力训练', tips: ['核心收紧不反弓', '推至头顶稍前', '下放至耳侧'] },
  { name: '二头弯举', group: '手臂', equipment: '哑铃', difficulty: '初级', desc: '二头肌孤立训练', tips: ['大臂贴住躯干', '发力时旋转手腕', '下放控制离心'] },
  { name: '臀桥', group: '臀部', equipment: '自重', difficulty: '初级', desc: '臀大肌激活', tips: ['脚跟靠近臀部', '挺髋至膝髋肩一线', '顶峰收缩 1 秒'] },
  { name: '超人式', group: '核心', equipment: '自重', difficulty: '初级', desc: '后链肌群训练', tips: ['同时抬起胸腿', '眼睛看地面', '腰部不超伸'] },
  { name: '侧平板', group: '核心', equipment: '自重', difficulty: '中级', desc: '腹斜肌训练', tips: ['身体成一条直线', '髋部不坠落', '保持正常呼吸'] },
  { name: '高抬腿', group: '腿部', equipment: '自重', difficulty: '中级', desc: '心肺与下肢爆发', tips: ['保持核心收紧', '大腿抬至水平', '落地轻快'] },
  { name: '登山者', group: '核心', equipment: '自重', difficulty: '中级', desc: '动态核心训练', tips: ['躯干保持水平', '收膝至胸下', '速度由慢到快'] },
  { name: '三头下压', group: '手臂', equipment: '龙门架', difficulty: '中级', desc: '三头肌孤立训练', tips: ['大臂贴住躯干', '仅肘关节屈伸', '手腕保持中立'] },
];

Page({
  data: {
    keyword: '',
    activeGroup: '全部',
    muscleGroups: ['全部', '胸部', '背部', '腿部', '核心', '肩部', '手臂', '臀部'],
    filteredList: EXERCISE_DB,
    showDetail: false,
    detailData: null,
  },

  onLoad() {
    this.setData({ filteredList: EXERCISE_DB });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this.filterList();
  },
  onSearch() { this.filterList(); },

  // 筛选肌群
  onSelectGroup(e) {
    this.setData({ activeGroup: e.currentTarget.dataset.group });
    this.filterList();
  },

  filterList() {
    const { keyword, activeGroup } = this.data;
    let list = EXERCISE_DB;
    if (activeGroup !== '全部') {
      list = list.filter(e => e.group === activeGroup);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(kw) || e.group.includes(kw));
    }
    this.setData({ filteredList: list });
  },

  // 查看动作详情
  onTapExercise(e) {
    const name = e.currentTarget.dataset.name;
    const detail = EXERCISE_DB.find(e => e.name === name);
    if (detail) {
      this.setData({ showDetail: true, detailData: detail });
    }
  },

  onCloseDetail() {
    this.setData({ showDetail: false, detailData: null });
  },

  onShareAppMessage() {
    return { title: 'KB教练 - 动作库', path: '/pages/exercises/index' };
  },
});
