export default function TipsCard() {
  const tips = [
    { icon: '📷', title: '拍照姿势', desc: '自然站立，双脚与肩同宽，正面拍摄' },
    { icon: '💡', title: '光线要求', desc: '选择光线均匀的环境，避免逆光' },
    { icon: '👕', title: '穿着建议', desc: '穿紧身或贴身衣物，便于观察体态' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-5 shadow-lg shadow-primary-500/5">
      <h3 className="text-primary-800 font-semibold mb-4 flex items-center gap-2">
        <span>💡</span> 拍照小贴士
      </h3>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-xl mt-0.5">{tip.icon}</span>
            <div>
              <p className="font-medium text-primary-800 text-sm">{tip.title}</p>
              <p className="text-primary-500 text-xs">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
