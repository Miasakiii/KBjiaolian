'use client';

import { useState, useEffect } from 'react';
import { AnalysisResult } from '@/types/analysis';
import ScoreCard from './ScoreCard';
import RadarChart from './RadarChart';
import SuggestionList from './SuggestionList';
import ExportReport from './ExportReport';

interface ResultPanelProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  imagePreview?: string | null;
}

function ScanLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(Math.round(p * 100));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-8 shadow-xl shadow-primary-500/5">
      <div className="relative w-48 h-64 border-2 border-primary-300 rounded-2xl overflow-hidden bg-primary-50/50">
        {/* 骨骼轮廓 */}
        <svg viewBox="0 0 120 180" className="absolute inset-0 w-full h-full opacity-20">
          <ellipse cx="60" cy="25" rx="18" ry="20" fill="none" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1="60" y1="45" x2="60" y2="110" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1="60" y1="55" x2="30" y2="85" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1="60" y1="55" x2="90" y2="85" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1="60" y1="110" x2="40" y2="165" stroke="#16a34a" strokeWidth="1.5"/>
          <line x1="60" y1="110" x2="80" y2="165" stroke="#16a34a" strokeWidth="1.5"/>
        </svg>
        {/* 扫描线 */}
        <div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_12px_3px_rgba(34,197,94,0.6)]"
          style={{ top: `${(progress / 100) * 100}%`, transition: 'top 0.05s linear' }}
        />
        {/* 扫描区域遮罩 */}
        <div
          className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-primary-500/10 to-transparent"
          style={{ height: `${100 - progress}%` }}
        />
      </div>
      <div className="mt-6 text-center">
        <p className="text-primary-700 font-semibold text-lg">体态扫描中</p>
        <p className="text-primary-500 text-sm mt-1">AI 正在分析骨骼排列与肌肉状态</p>
        <div className="mt-3 w-48 h-2 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-primary-600 text-sm mt-2 font-mono">{progress}%</p>
      </div>
    </div>
  );
}

export default function ResultPanel({ result, isAnalyzing, imagePreview }: ResultPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (isAnalyzing) {
    return <ScanLoader />;
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-8 text-center shadow-xl shadow-primary-500/5">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <p className="text-primary-800 font-semibold text-lg">等待上传照片</p>
        <p className="text-primary-500 text-sm mt-2">上传后 AI 将自动分析体态</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6 overflow-y-auto shadow-xl shadow-primary-500/5">
      <ScoreCard score={result.score} issues={result.issues} />

      {/* 分析总结 */}
      {result.summary && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl border border-primary-200/50">
          <div className="flex items-start gap-3">
            <span className="text-xl">📝</span>
            <div>
              <h4 className="font-semibold text-primary-800 mb-1">分析总结</h4>
              <p className="text-sm text-primary-700 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-4 py-3 text-primary-600 text-sm font-medium bg-primary-50/50 hover:bg-primary-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        <span>{expanded ? '收起详细分析' : '查看详细分析'}</span>
        <span className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${expanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
      >
        <div className="space-y-6">
          <RadarChart data={result.radar} />
          <SuggestionList suggestions={result.suggestions} />
        </div>
      </div>

      {/* 导出报告 */}
      <div className="mt-6 pt-4 border-t border-primary-100">
        <ExportReport result={result} imagePreview={imagePreview ?? null} />
      </div>
    </div>
  );
}
