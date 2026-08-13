import React from 'react';
import { 
  FileText, 
  BarChart2, 
  Copy, 
  Trash2, 
  Share2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Sparkles 
} from 'lucide-react';
import { Form } from '../../types/form';

interface FormCardProps {
  form: Form;
  onEdit: (form: Form) => void;
  onAnalytics: (form: Form) => void;
  onDuplicate: (form: Form) => void;
  onDelete: (formId: string) => void;
  onTogglePublish: (form: Form) => void;
  onShare: (form: Form) => void;
  onPreview: (form: Form) => void;
}

const themeLabels: Record<string, { label: string; color: string }> = {
  cyber_neon: { label: 'Cyber Neon', color: 'from-cyan-500 to-purple-600' },
  deep_space: { label: 'Deep Space', color: 'from-indigo-500 to-amber-500' },
  sunset_glass: { label: 'Sunset Glass', color: 'from-orange-500 to-pink-500' },
  emerald_dark: { label: 'Emerald Jade', color: 'from-emerald-500 to-teal-500' },
};

export const FormCard: React.FC<FormCardProps> = ({
  form,
  onEdit,
  onAnalytics,
  onDuplicate,
  onDelete,
  onTogglePublish,
  onShare,
  onPreview,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const themeInfo = themeLabels[form.theme] || themeLabels.cyber_neon;

  return (
    <div className="group relative glass-panel rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-glow-cyan flex flex-col justify-between h-[270px]">
      
      {/* Top Header & Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center space-x-1.5 ${
                form.status === 'published'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
              }`}
            >
              {form.status === 'published' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>PUBLISHED</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>DRAFT</span>
                </>
              )}
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${themeInfo.color}`}>
              {themeInfo.label}
            </span>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                onMouseLeave={() => setShowMenu(false)}
                className="absolute right-0 top-8 z-30 w-44 glass-panel rounded-xl p-1.5 border border-slate-700 shadow-2xl space-y-0.5"
              >
                <button
                  onClick={() => { onEdit(form); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Edit Builder</span>
                </button>

                <button
                  onClick={() => { onAnalytics(form); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>View Responses</span>
                </button>

                <button
                  onClick={() => { onShare(form); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Share Form Link</span>
                </button>

                <button
                  onClick={() => { onDuplicate(form); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duplicate Form</span>
                </button>

                <button
                  onClick={() => { onTogglePublish(form); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{form.status === 'published' ? 'Unpublish' : 'Publish Form'}</span>
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={() => { onDelete(form.id); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Form</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 
          onClick={() => onEdit(form)}
          className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 cursor-pointer"
        >
          {form.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {form.description || 'No description provided.'}
        </p>
      </div>

      {/* Form Metadata Stats */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Questions</span>
            <span className="text-sm font-bold text-cyan-400">{form.questions?.length || 0}</span>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Responses</span>
            <span className="text-sm font-bold text-purple-400">{form.response_count || 0}</span>
          </div>
        </div>

        {/* Card Main Quick Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(form)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-center flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Builder</span>
          </button>

          <button
            onClick={() => onPreview(form)}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 transition-all flex items-center justify-center"
            title="Preview Form Flow"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => onAnalytics(form)}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 transition-all flex items-center justify-center"
            title="View Responses & Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
