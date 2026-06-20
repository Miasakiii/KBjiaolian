'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { Target, Crosshair, Image } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';

interface ExportReportProps {
  result: AnalysisResult;
  imagePreview: string | null;
}

export default function ExportReport({ result, imagePreview }: ExportReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const severityText = {
    mild: '轻微',
    moderate: '中度',
    severe: '严重',
  };

  const severityColor = {
    mild: 'text-yellow-600 bg-yellow-50',
    moderate: 'text-orange-600 bg-orange-50',
    severe: 'text-red-600 bg-red-50',
  };

  const scoreColor = result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-orange-600' : 'text-red-600';
  const scoreBg = result.score >= 80 ? 'bg-green-50' : result.score >= 60 ? 'bg-orange-50' : 'bg-red-50';

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`KB教练-体态分析报告-${new Date().toLocaleDateString('zh-CN')}.pdf`);
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `KB教练-体态分析报告-${new Date().toLocaleDateString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 导出按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <span>📄</span>
              导出 PDF 报告
            </>
          )}
        </button>
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex-1 py-3 px-4 bg-white hover:bg-primary-50 disabled:bg-primary-50 text-primary-700 font-medium rounded-xl border border-primary-200 transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Image size={16} />
              导出图片
            </>
          )}
        </button>
      </div>

      {/* 报告模板（隐藏，用于截图） */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={reportRef} className="w-[800px] bg-white p-8">
          {/* 报告头部 */}
          <div className="text-center mb-8 pb-6 border-b-2 border-primary-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white"></span>
              </div>
              <h1 className="text-3xl font-bold text-primary-800">KB教练 - 体态分析报告</h1>
            </div>
            <p className="text-primary-400">
              生成时间：{new Date().toLocaleString('zh-CN')}
            </p>
          </div>

          {/* 评分区域 */}
          <div className="flex gap-8 mb-8">
            {imagePreview && (
              <div className="w-48 h-64 rounded-xl overflow-hidden border-2 border-primary-200">
                <img src={imagePreview} alt="分析照片" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className={`${scoreBg} rounded-2xl p-6 mb-4`}>
                <div className="text-sm text-primary-500 mb-2">体态综合评分</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-bold ${scoreColor}`}>{result.score}</span>
                  <span className="text-2xl text-primary-300">/100</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.issues.map((issue) => (
                  <span
                    key={issue.name}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${severityColor[issue.severity]}`}
                  >
                    {issue.name}（{severityText[issue.severity]}）
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 分析总结 */}
          {result.summary && (
            <div className="mb-8 p-5 bg-primary-50 rounded-xl border border-primary-100">
              <h2 className="text-lg font-semibold text-primary-800 mb-3 flex items-center gap-2">
                <span>📝</span> 分析总结
              </h2>
              <p className="text-primary-600 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* 雷达图数据 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
              <span></span> 体态问题分析
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'headForward', label: '头前伸' },
                { key: 'roundShoulder', label: '圆肩' },
                { key: 'pelvicTilt', label: '骨盆前倾' },
                { key: 'kneeExtension', label: '膝超伸' },
              ].map((item) => {
                const value = result.radar[item.key as keyof typeof result.radar];
                const barColor = value >= 70 ? 'bg-red-400' : value >= 40 ? 'bg-orange-400' : 'bg-green-400';
                return (
                  <div key={item.key} className="p-4 bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-primary-700">{item.label}</span>
                      <span className="ml-auto text-sm font-bold text-primary-500">{value}%</span>
                    </div>
                    <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 建议方案 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
              <Target size={18} className="text-primary-600" /> 改善建议
            </h2>
            <div className="space-y-4">
              {result.suggestions.map((s, i) => (
                <div key={i} className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-primary-700">{s.exercise}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{s.sets}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{s.targetMuscle}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{s.difficulty}</span>
                    </div>
                  </div>
                  <p className="text-sm text-primary-500 mb-3">{s.description}</p>
                  {s.steps && s.steps.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-primary-400 mb-1">训练步骤：</div>
                      <ol className="text-sm text-primary-500 space-y-1 pl-4">
                        {s.steps.map((step, j) => (
                          <li key={j}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {s.tips && s.tips.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-primary-400 mb-1">训练要点：</div>
                      <ul className="text-sm text-primary-500 space-y-1 pl-4">
                        {s.tips.map((tip, j) => (
                          <li key={j} className="flex gap-1">
                            <span className="text-primary-400">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 报告底部 */}
          <div className="pt-6 border-t-2 border-primary-200 text-center text-sm text-primary-400">
            <p>本报告由 KB教练 AI 体态分析系统生成</p>
            <p className="mt-1">仅供参考，如有严重体态问题请咨询专业康复师</p>
          </div>
        </div>
      </div>
    </div>
  );
}
