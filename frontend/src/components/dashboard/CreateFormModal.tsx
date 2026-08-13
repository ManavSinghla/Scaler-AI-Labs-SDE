import React, { useState } from 'react';
import { X, Sparkles, Layout, Palette } from 'lucide-react';
import { ThemeType } from '../../types/form';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, theme: ThemeType) => void;
}

const themes: { id: ThemeType; label: string; desc: string; colors: string }[] = [
  { id: 'cyber_neon', label: 'Cyber Neon', desc: 'Electric Cyan & Purple WebGL Glow', colors: 'from-cyan-500 to-purple-600' },
  { id: 'deep_space', label: 'Deep Space Glass', desc: 'Cosmic Indigo & Amber Lights', colors: 'from-indigo-600 to-amber-500' },
  { id: 'sunset_glass', label: 'Sunset Glass', desc: 'Peach, Coral & Soft Gold Warmth', colors: 'from-orange-500 to-pink-500' },
  { id: 'emerald_dark', label: 'Emerald Jade', desc: 'Mint Neon & Deep Cyan Matrix', colors: 'from-emerald-500 to-teal-500' },
];

export const CreateFormModal: React.FC<CreateFormModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('cyber_neon');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim(), selectedTheme);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Create 3D Typeform</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Form Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Customer Satisfaction Survey 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or instructions for respondents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-medium resize-none"
            />
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Choose 3D Ambient Theme</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((th) => (
                <div
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all ${
                    selectedTheme === th.id
                      ? 'bg-slate-800/90 border-cyan-500 shadow-glow-cyan'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${th.colors} mb-2`} />
                  <span className="text-xs font-bold text-white block">{th.label}</span>
                  <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">{th.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-glow-cyan transition-all"
            >
              Create Form
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
