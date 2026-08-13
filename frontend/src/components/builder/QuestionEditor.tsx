import React from 'react';
import { Plus, Trash2, Settings, HelpCircle, CheckSquare } from 'lucide-react';
import { Question, QuestionType, QuestionOption } from '../../types/form';

interface QuestionEditorProps {
  question: Question | null;
  onUpdateQuestion: (updated: Partial<Question>) => void;
}

const typeOptions: { type: QuestionType; label: string }[] = [
  { type: 'short_text', label: 'Short Text' },
  { type: 'long_text', label: 'Long Text' },
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'yes_no', label: 'Yes / No' },
  { type: 'rating', label: 'Star Rating' },
];

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdateQuestion }) => {
  if (!question) {
    return (
      <div className="h-full flex items-center justify-center p-8 glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs">
        Select a question from the left list to edit settings.
      </div>
    );
  }

  const handleTitleChange = (val: string) => {
    onUpdateQuestion({ title: val });
  };

  const handleDescChange = (val: string) => {
    onUpdateQuestion({ description: val });
  };

  const handlePlaceholderChange = (val: string) => {
    onUpdateQuestion({ placeholder: val });
  };

  const handleTypeChange = (type: QuestionType) => {
    let opts = question.options || [];
    if ((type === 'multiple_choice' || type === 'dropdown') && opts.length === 0) {
      opts = [
        { option_label: 'Option 1', option_value: 'Option 1', order_index: 0 },
        { option_label: 'Option 2', option_value: 'Option 2', order_index: 1 },
      ];
    }
    onUpdateQuestion({ question_type: type, options: opts });
  };

  const handleRequiredToggle = (required: boolean) => {
    onUpdateQuestion({ is_required: required });
  };

  const handleAddOption = () => {
    const opts = question.options || [];
    const newOptNum = opts.length + 1;
    const updated = [
      ...opts,
      { option_label: `Option ${newOptNum}`, option_value: `Option ${newOptNum}`, order_index: opts.length }
    ];
    onUpdateQuestion({ options: updated });
  };

  const handleUpdateOption = (index: number, label: string) => {
    const opts = [...(question.options || [])];
    opts[index] = { ...opts[index], option_label: label, option_value: label };
    onUpdateQuestion({ options: opts });
  };

  const handleDeleteOption = (index: number) => {
    const opts = (question.options || []).filter((_, i) => i !== index);
    onUpdateQuestion({ options: opts });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-extrabold text-white">Question Settings</h3>
        </div>

        {/* Required Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-xs font-semibold text-slate-300">Required</span>
          <input
            type="checkbox"
            checked={question.is_required}
            onChange={(e) => handleRequiredToggle(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-400"
          />
        </label>
      </div>

      {/* Main Question Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Question Type
          </label>
          <select
            value={question.question_type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer"
          >
            {typeOptions.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Question Title <span className="text-cyan-400">*</span>
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Description / Help Text</span>
          </label>
          <input
            type="text"
            value={question.description || ''}
            onChange={(e) => handleDescChange(e.target.value)}
            placeholder="Add optional hint or context..."
            className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
          />
        </div>

        {/* Text Input Placeholder */}
        {['short_text', 'long_text', 'email', 'number'].includes(question.question_type) && (
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Input Placeholder
            </label>
            <input
              type="text"
              value={question.placeholder || ''}
              onChange={(e) => handlePlaceholderChange(e.target.value)}
              placeholder="e.g. Type your answer here..."
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
            />
          </div>
        )}

        {/* Rating Min/Max Config */}
        {question.question_type === 'rating' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Min Stars</label>
              <input
                type="number"
                value={question.min_val || 1}
                onChange={(e) => onUpdateQuestion({ min_val: parseInt(e.target.value) || 1 })}
                className="w-full glass-input px-3 py-1.5 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Max Stars</label>
              <input
                type="number"
                value={question.max_val || 5}
                onChange={(e) => onUpdateQuestion({ max_val: parseInt(e.target.value) || 5 })}
                className="w-full glass-input px-3 py-1.5 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* Options Builder (For Choice & Dropdown) */}
        {['multiple_choice', 'dropdown'].includes(question.question_type) && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Choices ({question.options?.length || 0})
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Choice</span>
              </button>
            </div>

            <div className="space-y-2">
              {question.options?.map((opt, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-[10px] font-bold text-slate-400 flex items-center justify-center border border-slate-800">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <input
                    type="text"
                    value={opt.option_label}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    placeholder={`Choice ${index + 1}`}
                    className="flex-1 glass-input px-3 py-1.5 rounded-xl text-xs"
                  />
                  {question.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
