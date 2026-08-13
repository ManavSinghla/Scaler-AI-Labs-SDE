import React from 'react';
import { Palette, HeartHandshake } from 'lucide-react';
import { Form, ThemeType } from '../../types/form';

interface ThemeCustomizerProps {
  form: Form;
  onUpdateForm: (updated: Partial<Form>) => void;
}

const themeOptions: { id: ThemeType; label: string; desc: string; colors: string }[] = [
  { id: 'cyber_neon', label: 'Cyber Neon', desc: 'Electric Cyan & Purple WebGL Glow', colors: 'from-cyan-500 to-purple-600' },
  { id: 'deep_space', label: 'Deep Space Glass', desc: 'Cosmic Indigo & Amber Lights', colors: 'from-indigo-600 to-amber-500' },
  { id: 'sunset_glass', label: 'Sunset Glass', desc: 'Peach, Coral & Soft Gold Warmth', colors: 'from-orange-500 to-pink-500' },
  { id: 'emerald_dark', label: 'Emerald Jade', desc: 'Mint Neon & Deep Cyan Matrix', colors: 'from-emerald-500 to-teal-500' },
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ form, onUpdateForm }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
      
      {/* 3D Theme Picker */}
      <div>
        <div className="flex items-center space-x-2 mb-3 border-b border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-extrabold text-white">3D Ambient Visual Theme</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((th) => (
            <div
              key={th.id}
              onClick={() => onUpdateForm({ theme: th.id })}
              className={`cursor-pointer rounded-xl p-3 border transition-all ${
                form.theme === th.id
                  ? 'bg-slate-800/90 border-cyan-500 shadow-glow-cyan'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`h-3 w-full rounded-full bg-gradient-to-r ${th.colors} mb-2`} />
              <span className="text-xs font-bold text-white block">{th.label}</span>
              <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">{th.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Thank You Screen Settings */}
      <div>
        <div className="flex items-center space-x-2 mb-3 border-b border-slate-800 pb-3">
          <HeartHandshake className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-extrabold text-white">Thank You Screen Setup</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Closing Heading
            </label>
            <input
              type="text"
              value={form.thank_you_title || 'Thank you!'}
              onChange={(e) => onUpdateForm({ thank_you_title: e.target.value })}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Closing Message
            </label>
            <textarea
              rows={2}
              value={form.thank_you_description || 'Your response has been recorded.'}
              onChange={(e) => onUpdateForm({ thank_you_description: e.target.value })}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs resize-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
