import React, { useState } from 'react';
import { Form, Question, QuestionType, LogicRule } from '../../types/form';
import { DragDropQuestions } from './DragDropQuestions';
import { QuestionEditor } from './QuestionEditor';
import { LogicJumpEditor } from './LogicJumpEditor';
import { ThemeCustomizer } from './ThemeCustomizer';
import { FormRespondentFlow } from '../respondent/FormRespondentFlow';
import { Eye, Edit3, Settings, GitBranch, Palette, CheckCircle2, Share2, Save } from 'lucide-react';

interface FormBuilderProps {
  form: Form;
  onUpdateForm: (formId: string, data: Partial<Form>) => void;
  onAddQuestion: (type: QuestionType) => void;
  onUpdateQuestion: (questionId: string, data: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions: (newQuestions: Question[]) => void;
  onTogglePublish: (form: Form) => void;
  onShare: (form: Form) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  form,
  onUpdateForm,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onTogglePublish,
  onShare,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    form.questions[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<'editor' | 'logic' | 'theme'>('editor');
  const [showLivePreview, setShowLivePreview] = useState(false);

  const selectedQuestion = form.questions.find((q) => q.id === selectedQuestionId) || form.questions[0] || null;

  const handleTitleChange = (newTitle: string) => {
    onUpdateForm(form.id, { title: newTitle });
  };

  const handleDescChange = (newDesc: string) => {
    onUpdateForm(form.id, { description: newDesc });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      
      {/* Top Builder Control Header */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Form Title & Status */}
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-transparent text-xl font-extrabold text-white focus:outline-none focus:border-b border-cyan-400 py-0.5"
            placeholder="Untitled Form"
          />
          <input
            type="text"
            value={form.description || ''}
            onChange={(e) => handleDescChange(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-400 focus:outline-none focus:border-b border-slate-700"
            placeholder="Add description..."
          />
        </div>

        {/* Builder Toolbar Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              showLivePreview
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showLivePreview ? 'Exit Preview' : 'Split Live Preview'}</span>
          </button>

          <button
            onClick={() => onTogglePublish(form)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              form.status === 'published'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-glow-cyan'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{form.status === 'published' ? 'Published' : 'Publish Form'}</span>
          </button>

          <button
            onClick={() => onShare(form)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Share2 className="w-4 h-4 text-pink-400" />
          </button>
        </div>

      </div>

      {/* Main Workspace Layout (Builder vs Split Screen) */}
      <div className={`grid gap-6 ${showLivePreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-12'}`}>
        
        {/* Left / Main Builder Panel */}
        <div className={`${showLivePreview ? 'space-y-6' : 'lg:col-span-12 space-y-6'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Drag & Drop Questions Sidebar (5 Cols) */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800">
              <DragDropQuestions
                questions={form.questions}
                selectedQuestionId={selectedQuestion?.id || null}
                onSelectQuestion={(q) => setSelectedQuestionId(q.id)}
                onAddQuestion={onAddQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onReorder={onReorderQuestions}
              />
            </div>

            {/* Right Column: Config Tabs & Editor (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Tab Navigation */}
              <div className="flex items-center p-1 rounded-xl glass-panel border border-slate-800 space-x-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'editor'
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Question Editor</span>
                </button>

                <button
                  onClick={() => setActiveTab('logic')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'logic'
                      ? 'bg-slate-800 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Logic Jumps</span>
                </button>

                <button
                  onClick={() => setActiveTab('theme')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'theme'
                      ? 'bg-slate-800 text-pink-400 border border-pink-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Theme & Thank You</span>
                </button>
              </div>

              {/* Tab Body */}
              {activeTab === 'editor' && (
                <QuestionEditor
                  question={selectedQuestion}
                  onUpdateQuestion={(updated) => {
                    if (selectedQuestion) {
                      onUpdateQuestion(selectedQuestion.id, updated);
                    }
                  }}
                />
              )}

              {activeTab === 'logic' && (
                <LogicJumpEditor
                  questions={form.questions}
                  logicRules={form.logic_rules || []}
                  onUpdateRules={(rules) => onUpdateForm(form.id, { logic_rules: rules })}
                />
              )}

              {activeTab === 'theme' && (
                <ThemeCustomizer
                  form={form}
                  onUpdateForm={(updated) => onUpdateForm(form.id, updated)}
                />
              )}

            </div>

          </div>
        </div>

        {/* Right Live Preview Pane (When Live Preview is toggled) */}
        {showLivePreview && (
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 relative min-h-[600px] overflow-hidden flex flex-col justify-center">
            <div className="absolute top-4 right-4 z-20">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                Live Interactive Preview
              </span>
            </div>

            <FormRespondentFlow
              form={form}
              isPreviewMode={true}
              onClosePreview={() => setShowLivePreview(false)}
            />
          </div>
        )}

      </div>

    </div>
  );
};
