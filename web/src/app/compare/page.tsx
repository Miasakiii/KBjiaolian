'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import { HistoryRecord, ComparisonResult } from '@/types/analysis';
import { getAllRecords } from '@/lib/storage';
import { authFetch } from '@/lib/auth';
import RadarChart from '@/components/RadarChart';

export default function ComparePage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIResult, setShowAIResult] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      const data = await getAllRecords();
      setRecords(data);
    };
    loadRecords();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setComparison(null);
    setShowAIResult(false);
    setError(null);
  };

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
  const record1 = selectedRecords[0];
  const record2 = selectedRecords[1];

  // 本地对比计算
  const getChange = (val1: number, val2: number) => {
    // 对于雷达图：分数越低越好，所以 val2 < val1 是改善
    const diff = val1 - val2;
    if (diff > 0) return { text: `↓${diff}`, color: 'text-green-600', improved: true };
    if (diff < 0) return { text: `↑${Math.abs(diff)}`, color: 'text-red-600', improved: false };
    return { text: '—', color: 'text-primary-400', improved: false };
  };

  const getScoreChange = (val1: number, val2: number) => {
    // 评分：越高越好
    const diff = val2 - val1;
    if (diff > 0) return { text: `+${diff}`, color: 'text-green-600' };
    if (diff < 0) return { text: `${diff}`, color: 'text-red-600' };
    return { text: '0', color: 'text-primary-400' };
  };

  const radarLabels: { key: keyof HistoryRecord['result']['radar']; label: string }[] = [
    { key: 'headForward', label: '头前伸' },
    { key: 'roundShoulder', label: '圆肩' },
    { key: 'pelvicTilt', label: '骨盆前倾' },
    { key: 'kneeExtension', label: '膝超伸' },
    { key: 'spineCurve', label: '脊柱侧弯' },
    { key: 'shoulderHeight', label: '高低肩' },
    { key: 'legAlignment', label: 'X/O型腿' },
    { key: 'coreStability', label: '核心稳定' },
  ];

  // AI 对比分析
  const handleAICompare = useCallback(async () => {
    if (!record1 || !record2) return;

    setLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await authFetch(`${API_BASE}/analyze/compare`, {
        method: 'POST',
        body: JSON.stringify({ beforeId: record1.id, afterId: record2.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'AI 对比分析失败');
      }

      const data = await response.json();
      setComparison(data);
      setShowAIResult(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 对比分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [record1, record2]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <header className="text-center pt-12 pb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-2xl"></span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">进度对比</h1>
        </div>
        <p className="text-primary-600 text-lg">选择两条记录，查看体态变化</p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* 操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回历史
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-500">
              已选择 {selectedIds.length}/2 条记录
            </span>
            {record1 && record2 && (
              <button
                onClick={handleAICompare}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI 分析中...
                  </>
                ) : (
                  <>AI 智能对比</>
                )}
              </button>
            )}
          </div>
        </div>

        {records.length < 2 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera size={32} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-primary-800 mb-2">记录不足</h2>
            <p className="text-primary-500 mb-6">需要至少两条分析记录才能进行对比</p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              去分析
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* 记录选择列表 */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <h3 className="font-semibold text-primary-800 mb-2">选择记录</h3>
              {records.map((record) => {
                const isSelected = selectedIds.includes(record.id);
                const date = new Date(record.timestamp);
                const idx = selectedIds.indexOf(record.id);
                return (
                  <button
                    key={record.id}
                    onClick={() => toggleSelect(record.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-primary-200/50 bg-white/80 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? idx === 0 ? 'border-gray-400 bg-gray-400 text-white' : 'border-primary-500 bg-primary-500 text-white'
                          : 'border-primary-300'
                      }`}>
                        {isSelected ? (idx === 0 ? '前' : '后') : ''}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-primary-700">
                            {date.toLocaleDateString('zh-CN')}
                          </span>
                          <span className={`text-sm font-bold ${
                            record.result.score >= 80 ? 'text-green-600' :
                            record.result.score >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {record.result.score}分
                          </span>
                        </div>
                        {record.result.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.result.issues.slice(0, 3).map((issue) => (
                              <span key={issue.name} className="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-500 rounded">
                                {issue.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 对比结果 */}
            <div className="md:col-span-2">
              {record1 && record2 ? (
                <div className="space-y-6">
                  {/* 评分对比 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">体态评分对比</h3>
                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <div className="text-xs text-primary-400 mb-1">之前</div>
                        <div className={`text-4xl font-bold ${
                          record1.result.score >= 80 ? 'text-green-600' :
                          record1.result.score >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {record1.result.score}
                        </div>
                        <div className="text-sm text-primary-500 mt-1">
                          {new Date(record1.timestamp).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-2xl text-primary-400">→</div>
                      <div className="text-center">
                        <div className="text-xs text-primary-400 mb-1">之后</div>
                        <div className={`text-4xl font-bold ${
                          record2.result.score >= 80 ? 'text-green-600' :
                          record2.result.score >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {record2.result.score}
                        </div>
                        <div className="text-sm text-primary-500 mt-1">
                          {new Date(record2.timestamp).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreChange(record1.result.score, record2.result.score).color}`}>
                        {getScoreChange(record1.result.score, record2.result.score).text}
                      </div>
                    </div>
                  </div>

                  {/* 雷达图对比 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">雷达图对比</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-xs text-primary-400 mb-2">之前</p>
                        <RadarChart data={record1.result.radar} size={180} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-primary-400 mb-2">之后</p>
                        <RadarChart data={record2.result.radar} size={180} />
                      </div>
                    </div>
                  </div>

                  {/* 各维度数据对比 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">各维度数据对比</h3>
                    <div className="space-y-3">
                      {radarLabels.map(({ key, label }) => {
                        const val1 = record1.result.radar[key] ?? 0;
                        const val2 = record2.result.radar[key] ?? 0;
                        const change = getChange(val1, val2);
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="w-16 text-xs text-primary-700 text-right">{label}</span>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="w-10 text-right text-xs font-medium text-primary-400">{val1}</div>
                              <div className="flex-1 h-2 bg-primary-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${val1}%`,
                                    backgroundColor: val1 > 60 ? '#ef4444' : val1 > 40 ? '#f97316' : '#22c55e'
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-primary-300 text-xs">→</span>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-primary-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${val2}%`,
                                    backgroundColor: val2 > 60 ? '#ef4444' : val2 > 40 ? '#f97316' : '#22c55e'
                                  }}
                                />
                              </div>
                              <div className="w-10 text-xs font-medium text-primary-400">{val2}</div>
                            </div>
                            <span className={`w-12 text-right text-xs font-bold ${change.color}`}>
                              {change.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-primary-300 mt-3 text-center">
                      雷达图分数越低越好：↓ 改善 ↑ 退步
                    </p>
                  </div>

                  {/* 问题变化 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200/50 p-6">
                    <h3 className="font-semibold text-primary-800 mb-4">体态问题变化</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-primary-400 mb-2">之前</h4>
                        <div className="flex flex-wrap gap-2">
                          {record1.result.issues.length > 0 ? record1.result.issues.map((issue) => (
                            <span key={issue.name} className={`px-3 py-1.5 rounded-lg text-sm ${
                              issue.severity === 'severe' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {issue.name}
                            </span>
                          )) : <span className="text-sm text-primary-300">无问题</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm text-primary-400 mb-2">之后</h4>
                        <div className="flex flex-wrap gap-2">
                          {record2.result.issues.length > 0 ? record2.result.issues.map((issue) => (
                            <span key={issue.name} className={`px-3 py-1.5 rounded-lg text-sm ${
                              issue.severity === 'severe' ? 'bg-red-100 text-red-700' :
                              issue.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {issue.name}
                            </span>
                          )) : <span className="text-sm text-primary-300">无问题</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI 智能对比结果 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
                      {error}
                    </div>
                  )}

                  {showAIResult && comparison && (
                    <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-200 p-6 shadow-lg">
                      <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
                        AI 智能分析报告
                      </h3>

                      {/* 总评 */}
                      <p className="text-primary-600 leading-relaxed mb-4">{comparison.overallAssessment}</p>

                      {comparison.encouragement && (
                        <p className="text-primary-600 font-medium mb-4">{comparison.encouragement}</p>
                      )}

                      {/* 改善/退步/建议 */}
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        {comparison.improvedAreas.length > 0 && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <h4 className="text-green-800 text-sm font-semibold mb-2">改善方面</h4>
                            <ul className="space-y-1">
                              {comparison.improvedAreas.map((area, i) => (
                                <li key={i} className="text-green-700 text-xs">• {area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {comparison.worsenedAreas.length > 0 && (
                          <div className="bg-red-50 rounded-xl p-4">
                            <h4 className="text-red-800 text-sm font-semibold mb-2">需关注</h4>
                            <ul className="space-y-1">
                              {comparison.worsenedAreas.map((area, i) => (
                                <li key={i} className="text-red-700 text-xs">• {area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {comparison.recommendations.length > 0 && (
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="text-blue-800 text-sm font-semibold mb-2">💡 下一步建议</h4>
                            <ul className="space-y-1">
                              {comparison.recommendations.map((rec, i) => (
                                <li key={i} className="text-blue-700 text-xs">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white/50 rounded-2xl border border-dashed border-primary-200 p-8">
                  <div className="text-center">
                    <span className="text-4xl">👈</span>
                    <p className="text-primary-500 mt-4">请选择两条记录进行对比</p>
                    <p className="text-primary-400 text-sm mt-1">灰色圆圈 = 之前，绿色圆圈 = 之后</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
