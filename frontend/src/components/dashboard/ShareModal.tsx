import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Share2, Globe } from 'lucide-react';
import { Form } from '../../types/form';

interface ShareModalProps {
  form: Form | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: (form: Form) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ form, isOpen, onClose, onOpenPreview }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !form) return null;

  const publicUrl = `${window.location.origin}/to/${form.share_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-pink-950/80 border border-pink-500/30 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Share Form Link</h2>
              <span className="text-[10px] text-slate-400">No login required for respondents</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Share URL Box */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public Shareable URL</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono text-cyan-300 bg-slate-900/90"
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code & Status info */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
              {/* QR Mock graphic */}
              <div className="w-full h-full border-2 border-slate-950 flex flex-col justify-between p-0.5">
                <div className="flex justify-between">
                  <div className="w-2.5 h-2.5 bg-slate-950" />
                  <div className="w-2.5 h-2.5 bg-slate-950" />
                </div>
                <div className="flex justify-center">
                  <div className="w-2 h-2 bg-slate-950" />
                </div>
                <div className="flex justify-between">
                  <div className="w-2.5 h-2.5 bg-slate-950" />
                  <div className="w-2.5 h-2.5 bg-slate-950" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Scan to Open Form</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Share with respondents via email, chat, or social links.</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={() => { onClose(); onOpenPreview(form); }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Public Flow in Preview</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
