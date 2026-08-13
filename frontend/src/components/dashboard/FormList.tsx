import React, { useState } from 'react';
import { Plus, Search, Filter, Layers, BarChart, CheckCircle, Sparkles } from 'lucide-react';
import { Form } from '../../types/form';
import { FormCard } from './FormCard';

interface FormListProps {
  forms: Form[];
  onSelectForm: (form: Form) => void;
  onOpenCreateModal: () => void;
  onDuplicate: (form: Form) => void;
  onDelete: (formId: string) => void;
  onTogglePublish: (form: Form) => void;
  onShare: (form: Form) => void;
  onPreview: (form: Form) => void;
  onOpenAnalytics: (form: Form) => void;
}

export const FormList: React.FC<FormListProps> = ({
  forms,
  onSelectForm,
  onOpenCreateModal,
  onDuplicate,
  onDelete,
  onTogglePublish,
  onShare,
  onPreview,
  onOpenAnalytics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredForms = forms.filter((form) => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalResponses = forms.reduce((acc, f) => acc + (f.response_count || 0), 0);
  const publishedCount = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
            <Layers className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Forms</span>
            <h2 className="text-2xl font-extrabold text-white">{forms.length}</h2>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center">
            <BarChart className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Responses Collected</span>
            <h2 className="text-2xl font-extrabold text-white">{totalResponses}</h2>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Published</span>
            <h2 className="text-2xl font-extrabold text-white">{publishedCount}</h2>
          </div>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <span>Form Builder Workspace</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage, edit, publish, and view 3D responses for your forms.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="glass-input px-3 py-2 rounded-xl text-xs font-medium cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-glow-cyan transition-all flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onEdit={onSelectForm}
              onAnalytics={onOpenAnalytics}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
              onShare={onShare}
              onPreview={onPreview}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">No forms found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm ? 'No forms match your search criteria.' : 'Create your first 3D Typeform to start collecting conversational responses.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Form</span>
          </button>
        </div>
      )}

    </div>
  );
};
