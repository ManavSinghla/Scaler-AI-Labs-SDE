import React, { useState } from 'react';
import { Eye, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { FormResponse, Question } from '../../types/form';

interface SubmissionsTableProps {
  responses: FormResponse[];
  questions: Question[];
  onSelectResponse: (resp: FormResponse) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  responses,
  questions,
  onSelectResponse,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
          Individual Submissions ({responses.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Submission ID</th>
              <th className="py-3 px-4">Submitted At</th>
              <th className="py-3 px-4">Time Taken</th>
              <th className="py-3 px-4">Primary Answer</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {responses.map((resp) => {
              const formattedDate = new Date(resp.submitted_at).toLocaleString();
              const firstAnswer = resp.answers[0]?.answer_value || 'N/A';
              return (
                <tr key={resp.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-cyan-400 font-medium">
                    #{resp.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formattedDate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px]">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{resp.completion_time_seconds}s</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium max-w-xs truncate">
                    {firstAnswer}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectResponse(resp)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-all inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Response</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {responses.length === 0 && (
          <div className="py-8 text-center text-slate-500 italic">No submissions recorded for this form yet.</div>
        )}
      </div>
    </div>
  );
};
