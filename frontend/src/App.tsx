import React, { useState, useEffect } from 'react';
import { Form, Question, QuestionType } from './types/form';
import { formApi } from './services/api';
import { Navbar } from './components/ui/Navbar';
import { FormList } from './components/dashboard/FormList';
import { FormBuilder } from './components/builder/FormBuilder';
import { FormRespondentFlow } from './components/respondent/FormRespondentFlow';
import { ResponsesDashboard } from './components/analytics/ResponsesDashboard';
import { CreateFormModal } from './components/dashboard/CreateFormModal';
import { ShareModal } from './components/dashboard/ShareModal';
import { RefreshCw, Sparkles } from 'lucide-react';

export function App() {
  const [forms, setForms] = useState<Form[]>([]);
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'analytics' | 'respondent_preview'>('dashboard');
  const [publicShareId, setPublicShareId] = useState<string | null>(null);
  const [publicForm, setPublicForm] = useState<Form | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shareModalForm, setShareModalForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  // Check URL pathname for public share link (/to/:shareId)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/to/')) {
      const shareId = path.replace('/to/', '');
      if (shareId) {
        setPublicShareId(shareId);
        loadPublicForm(shareId);
        return;
      }
    }
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await formApi.getForms();
      setForms(data);
      if (data.length > 0 && !activeForm) {
        setActiveForm(data[0]);
      }
    } catch (err) {
      console.error('Failed to load forms from backend', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicForm = async (shareId: string) => {
    setLoading(true);
    try {
      const data = await formApi.getPublicForm(shareId);
      setPublicForm(data);
    } catch (err) {
      console.error('Failed to load public form', err);
    } finally {
      setLoading(false);
    }
  };

  // Form Actions
  const handleCreateForm = async (title: string, description: string, theme: any) => {
    try {
      const newForm = await formApi.createForm({
        title,
        description,
        theme,
        status: 'draft',
        questions: [
          {
            id: crypto.randomUUID(),
            question_type: 'short_text',
            title: 'What is your name?',
            description: 'Enter your full name',
            order_index: 0,
            is_required: true,
            options: []
          }
        ]
      });
      setForms([newForm, ...forms]);
      setActiveForm(newForm);
      setCurrentView('builder');
    } catch (err) {
      console.error('Failed to create form', err);
    }
  };

  const handleUpdateForm = async (formId: string, data: Partial<Form>) => {
    try {
      const updated = await formApi.updateForm(formId, data);
      setForms(forms.map((f) => (f.id === formId ? updated : f)));
      if (activeForm?.id === formId) {
        setActiveForm(updated);
      }
    } catch (err) {
      console.error('Failed to update form', err);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    try {
      await formApi.deleteForm(formId);
      const remaining = forms.filter((f) => f.id !== formId);
      setForms(remaining);
      if (activeForm?.id === formId) {
        setActiveForm(remaining[0] || null);
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Failed to delete form', err);
    }
  };

  const handleDuplicateForm = async (form: Form) => {
    try {
      const duplicated = await formApi.duplicateForm(form.id);
      setForms([duplicated, ...forms]);
      setActiveForm(duplicated);
      setCurrentView('builder');
    } catch (err) {
      console.error('Failed to duplicate form', err);
    }
  };

  const handleTogglePublish = async (form: Form) => {
    try {
      const updated = await formApi.togglePublish(form.id);
      setForms(forms.map((f) => (f.id === form.id ? updated : f)));
      if (activeForm?.id === form.id) {
        setActiveForm(updated);
      }
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  // Question Actions
  const handleAddQuestion = async (type: QuestionType) => {
    if (!activeForm) return;
    try {
      const newQ = await formApi.addQuestion(activeForm.id, {
        question_type: type,
        title: `Untitled ${type.replace('_', ' ')} question`,
        is_required: false,
        options: type === 'multiple_choice' || type === 'dropdown' ? [
          { option_label: 'Choice 1', option_value: 'Choice 1', order_index: 0 },
          { option_label: 'Choice 2', option_value: 'Choice 2', order_index: 1 }
        ] : []
      });
      const updatedQuestions = [...activeForm.questions, newQ];
      const updatedForm = { ...activeForm, questions: updatedQuestions };
      setActiveForm(updatedForm);
      setForms(forms.map((f) => (f.id === activeForm.id ? updatedForm : f)));
    } catch (err) {
      console.error('Failed to add question', err);
    }
  };

  const handleUpdateQuestion = async (questionId: string, data: Partial<Question>) => {
    if (!activeForm) return;
    try {
      const updatedQ = await formApi.updateQuestion(questionId, data);
      const updatedQuestions = activeForm.questions.map((q) => (q.id === questionId ? updatedQ : q));
      const updatedForm = { ...activeForm, questions: updatedQuestions };
      setActiveForm(updatedForm);
      setForms(forms.map((f) => (f.id === activeForm.id ? updatedForm : f)));
    } catch (err) {
      console.error('Failed to update question', err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!activeForm) return;
    try {
      await formApi.deleteQuestion(questionId);
      const updatedQuestions = activeForm.questions.filter((q) => q.id !== questionId);
      const updatedForm = { ...activeForm, questions: updatedQuestions };
      setActiveForm(updatedForm);
      setForms(forms.map((f) => (f.id === activeForm.id ? updatedForm : f)));
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  const handleReorderQuestions = async (newQuestions: Question[]) => {
    if (!activeForm) return;
    const updatedForm = { ...activeForm, questions: newQuestions };
    setActiveForm(updatedForm);
    setForms(forms.map((f) => (f.id === activeForm.id ? updatedForm : f)));

    try {
      const items = newQuestions.map((q, idx) => ({ id: q.id, order_index: idx }));
      await formApi.reorderQuestions(activeForm.id, items);
    } catch (err) {
      console.error('Failed to persist question order', err);
    }
  };

  // If public route (/to/:shareId) is active
  if (publicShareId && publicForm) {
    return <FormRespondentFlow form={publicForm} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeForm={activeForm}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenShareModal={(form) => setShareModalForm(form)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-400 font-semibold">Connecting to Typeform 3D Engine...</span>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <FormList
                forms={forms}
                onSelectForm={(f) => {
                  setActiveForm(f);
                  setCurrentView('builder');
                }}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onDuplicate={handleDuplicateForm}
                onDelete={handleDeleteForm}
                onTogglePublish={handleTogglePublish}
                onShare={(f) => setShareModalForm(f)}
                onPreview={(f) => {
                  setActiveForm(f);
                  setCurrentView('respondent_preview');
                }}
                onOpenAnalytics={(f) => {
                  setActiveForm(f);
                  setCurrentView('analytics');
                }}
              />
            )}

            {currentView === 'builder' && activeForm && (
              <FormBuilder
                form={activeForm}
                onUpdateForm={handleUpdateForm}
                onAddQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onReorderQuestions={handleReorderQuestions}
                onTogglePublish={handleTogglePublish}
                onShare={(f) => setShareModalForm(f)}
              />
            )}

            {currentView === 'analytics' && activeForm && (
              <ResponsesDashboard form={activeForm} />
            )}

            {currentView === 'respondent_preview' && activeForm && (
              <FormRespondentFlow
                form={activeForm}
                isPreviewMode={true}
                onClosePreview={() => setCurrentView('builder')}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateForm}
      />

      <ShareModal
        form={shareModalForm}
        isOpen={!!shareModalForm}
        onClose={() => setShareModalForm(null)}
        onOpenPreview={(f) => {
          setActiveForm(f);
          setCurrentView('respondent_preview');
        }}
      />

    </div>
  );
}
