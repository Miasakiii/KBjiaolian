'use client';

import { useEffect, useState } from 'react';

interface ScoreCardProps {
  score: number;
  issues: { name: string; severity: string }[];
}

const severityColor = {
  mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  moderate: 'bg-orange-100 text-orange-800 border-orange-200',
  severe: 'bg-red-100 text-red-800 border-red-200',
};

export default function ScoreCard({ score, issues }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    let start = 0;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const scoreColor = score >= 80 ? 'from-primary-500 to-primary-600' : score >= 60 ? 'from-orange-400 to-orange-500' : 'from-red-400 to-red-500';
  const scoreBg = score >= 80 ? 'bg-primary-50' : score >= 60 ? 'bg-orange-50' : 'bg-red-50';

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-primary-100 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-primary-800 font-semibold text-lg">体态评分</h3>
        <div className={`px-4 py-2 rounded-xl ${scoreBg} transition-all duration-300` }>
          <span className={`text-3xl font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}>{displayScore}</span>
          <span className="text-primary-500 text-sm ml-1">/100</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {issues.map((issue, i) => (
          <span
            key={issue.name}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-300 ${severityColor[issue.severity as keyof typeof severityColor]}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {issue.name}
          </span>
        ))}
      </div>
    </div>
  );
}
