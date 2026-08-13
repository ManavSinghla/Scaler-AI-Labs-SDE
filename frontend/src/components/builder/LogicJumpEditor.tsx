import React, { useState } from 'react';
import { GitBranch, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Question, LogicRule } from '../../types/form';

interface LogicJumpEditorProps {
  questions: Question[];
  logicRules: LogicRule[];
  onUpdateRules: (rules: LogicRule[]) => void;
}

export const LogicJumpEditor: React.FC<LogicJumpEditorProps> = ({
  questions,
  logicRules,
  onUpdateRules,
}) => {
  const [sourceId, setSourceId] = useState(questions[0]?.id || '');
  const [operator, setOperator] = useState<'equals' | 'not_equals' | 'contains'>('equals');
  const [condVal, setCondVal] = useState('');
  const [targetId, setTargetId] = useState(questions[1]?.id || 'END');

  const handleAddRule = () => {
    if (!sourceId || !condVal) return;
    const newRule: LogicRule = {
      source_question_id: sourceId,
      condition_operator: operator,
      condition_value: condVal,
      target_question_id: targetId,
    };
    onUpdateRules([...logicRules, newRule]);
    setCondVal('');
  };

  const handleDeleteRule = (index: number) => {
    const updated = logicRules.filter((_, i) => i !== index);
    onUpdateRules(updated);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-extrabold text-white">Conditional Logic Jumps</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
          BONUS FEATURE
        </span>
      </div>

      {/* New Rule Creator */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 block">Add Logic Jump Rule</span>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          {/* Source Question */}
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="glass-input px-2.5 py-1.5 rounded-lg font-medium"
          >
            {questions.map((q, idx) => (
              <option key={q.id} value={q.id}>
                IF Q{idx + 1}: {q.title.slice(0, 18)}...
              </option>
            ))}
          </select>

          {/* Condition Operator */}
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value as any)}
            className="glass-input px-2.5 py-1.5 rounded-lg font-medium"
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Does Not Equal</option>
            <option value="contains">Contains</option>
          </select>

          {/* Condition Value */}
          <input
            type="text"
            placeholder="e.g. Yes or Choice 1"
            value={condVal}
            onChange={(e) => setCondVal(e.target.value)}
            className="glass-input px-2.5 py-1.5 rounded-lg"
          />

          {/* Target Question */}
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="glass-input px-2.5 py-1.5 rounded-lg font-medium text-cyan-300"
          >
            <option value="END">JUMP TO: Submit / End Form</option>
            {questions.map((q, idx) => (
              <option key={q.id} value={q.id}>
                JUMP TO Q{idx + 1}: {q.title.slice(0, 18)}...
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddRule}
          className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Branch Rule</span>
        </button>
      </div>

      {/* Active Rules List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 block">Active Rules ({logicRules.length})</span>
        {logicRules.map((rule, idx) => {
          const srcQ = questions.find((q) => q.id === rule.source_question_id);
          const tgtQ = questions.find((q) => q.id === rule.target_question_id);
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-200"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-cyan-400 font-bold">IF "{srcQ?.title.slice(0, 20) || 'Question'}"</span>
                <span className="text-slate-400">{rule.condition_operator}</span>
                <span className="text-amber-300 font-bold">"{rule.condition_value}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="text-purple-300 font-bold">
                  {rule.target_question_id === 'END' ? 'Submit Form' : `JUMP TO "${tgtQ?.title.slice(0, 20)}"`}
                </span>
              </div>

              <button
                onClick={() => handleDeleteRule(idx)}
                className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {logicRules.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-2">No logic jumps configured. Questions will flow sequentially.</p>
        )}
      </div>

    </div>
  );
};
