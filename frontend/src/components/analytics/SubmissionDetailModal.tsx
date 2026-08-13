import React from 'react';
import { X, Calendar, Clock, CheckCircle2, FileText } from 'lucide-react';
import { FormResponse, Question } from '../../types/form';

interface SubmissionDetailModalProps {
  response: FormResponse | null;
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  response,
  questions,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !response) return null;

  const ansMap = new Map(response.answers.map((a) => [a.question_id, a.answer_value]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Submission Detail</h2>
              <span className="text-[10px] font-mono text-cyan-400">ID: {response.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata stats */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date(response.submitted_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-purple-300 font-bold">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Time Taken: {response.completion_time_seconds} seconds</span>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const ansVal = ansMap.get(q.id) || 'No answer provided';
            return (
              <div key={q.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Question {idx + 1}: {q.question_type.replace('_', ' ')}
                </span>
                <h4 className="text-xs font-bold text-white">{q.title}</h4>
                <div className="p-2.5 rounded-lg bg-slate-950 text-xs font-medium text-slate-200 border border-slate-800/80 mt-1">
                  {ansVal}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
