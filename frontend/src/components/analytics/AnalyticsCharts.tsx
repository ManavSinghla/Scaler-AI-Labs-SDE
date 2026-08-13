import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QuestionAnalytics } from '../../types/form';

interface AnalyticsChartsProps {
  analytics: QuestionAnalytics[];
}

const COLORS = ['#00f0ff', '#7000ff', '#ff007f', '#f59e0b', '#10b981', '#06b6d4'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
        Per-Question Visual Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analytics.map((q, idx) => {
          const chartData = Object.entries(q.option_counts || {}).map(([name, count]) => ({
            name: name.length > 20 ? `${name.slice(0, 18)}...` : name,
            count,
          }));

          return (
            <div key={q.question_id} className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-400">Q{idx + 1}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  {q.total_answers} Answers
                </span>
              </div>

              <h4 className="text-sm font-bold text-white line-clamp-1">{q.title}</h4>

              {/* Chart for Choices & Ratings */}
              {chartData.length > 0 ? (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : q.numeric_avg !== undefined ? (
                <div className="p-6 rounded-xl bg-slate-900/60 text-center border border-slate-800">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Average Rating Score</span>
                  <span className="text-3xl font-extrabold text-amber-400">{q.numeric_avg} / 5</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recent Answers</span>
                  {q.recent_answers?.slice(0, 4).map((ans, aIdx) => (
                    <div key={aIdx} className="p-2 rounded-lg bg-slate-900/80 text-xs text-slate-200 border border-slate-800">
                      "{ans}"
                    </div>
                  ))}
                  {(!q.recent_answers || q.recent_answers.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No responses recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
