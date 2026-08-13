import React from 'react';
import { Layers, Plus, BarChart3, Edit3, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { Form } from '../../types/form';

interface NavbarProps {
  currentView: 'dashboard' | 'builder' | 'analytics' | 'respondent_preview';
  setCurrentView: (view: 'dashboard' | 'builder' | 'analytics' | 'respondent_preview') => void;
  activeForm: Form | null;
  onOpenCreateModal: () => void;
  onOpenShareModal: (form: Form) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeForm,
  onOpenCreateModal,
  onOpenShareModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-500 p-[1.5px] shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Typeform 3D
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 -mt-0.5">Conversational 3D Experience</p>
          </div>
        </div>

        {/* View Switching Tabs (When an Active Form is selected) */}
        {activeForm && currentView !== 'respondent_preview' && (
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setCurrentView('builder')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'builder'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Builder</span>
            </button>

            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'analytics'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Results & Analytics</span>
              {activeForm.response_count !== undefined && activeForm.response_count > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-purple-500/30 text-purple-300 font-bold">
                  {activeForm.response_count}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {activeForm && currentView !== 'dashboard' && (
            <>
              <button
                onClick={() => onOpenShareModal(activeForm)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:border-slate-500"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share Link</span>
              </button>

              <button
                onClick={() => setCurrentView('respondent_preview')}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Flow</span>
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-glow-cyan transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Form</span>
          </button>
        </div>

      </div>
    </header>
  );
};
