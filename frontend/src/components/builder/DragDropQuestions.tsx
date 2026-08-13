import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Type, AlignLeft, List, ChevronDown, Mail, Hash, ToggleLeft, Star, FileUp } from 'lucide-react';
import { Question, QuestionType } from '../../types/form';

interface DragDropQuestionsProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (question: Question) => void;
  onAddQuestion: (type: QuestionType) => void;
  onDeleteQuestion: (id: string) => void;
  onReorder: (newQuestions: Question[]) => void;
}

const typeIcons: Record<QuestionType, React.ReactNode> = {
  short_text: <Type className="w-3.5 h-3.5 text-cyan-400" />,
  long_text: <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />,
  multiple_choice: <List className="w-3.5 h-3.5 text-purple-400" />,
  dropdown: <ChevronDown className="w-3.5 h-3.5 text-purple-400" />,
  email: <Mail className="w-3.5 h-3.5 text-pink-400" />,
  number: <Hash className="w-3.5 h-3.5 text-amber-400" />,
  yes_no: <ToggleLeft className="w-3.5 h-3.5 text-emerald-400" />,
  rating: <Star className="w-3.5 h-3.5 text-amber-400" />,
  file_upload: <FileUp className="w-3.5 h-3.5 text-cyan-400" />,
};

const questionTypeOptions: { type: QuestionType; label: string }[] = [
  { type: 'short_text', label: 'Short Text' },
  { type: 'long_text', label: 'Long Text' },
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'yes_no', label: 'Yes / No' },
  { type: 'rating', label: 'Star Rating' },
];

export const DragDropQuestions: React.FC<DragDropQuestionsProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onReorder,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index
    const updated = items.map((q, idx) => ({ ...q, order_index: idx }));
    onReorder(updated);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Questions ({questions.length})
        </h3>

        {/* Add Question Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Question</span>
          </button>

          {showAddMenu && (
            <div 
              onMouseLeave={() => setShowAddMenu(false)}
              className="absolute right-0 top-9 z-30 w-48 glass-panel rounded-xl p-1.5 border border-slate-700 shadow-2xl space-y-0.5"
            >
              {questionTypeOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    onAddQuestion(opt.type);
                    setShowAddMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-left"
                >
                  {typeIcons[opt.type]}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag & Drop List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2 max-h-[500px] overflow-y-auto pr-1"
            >
              {questions.map((q, index) => {
                const isSelected = q.id === selectedQuestionId;
                return (
                  <Draggable key={q.id} draggableId={q.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onClick={() => onSelectQuestion(q)}
                        className={`group relative rounded-xl p-3 border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800/90 border-cyan-500 shadow-glow-cyan'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        } ${snapshot.isDragging ? 'shadow-2xl opacity-90 scale-[1.02]' : ''}`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          <div
                            {...provided.dragHandleProps}
                            className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-grab"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center border border-slate-700">
                            {index + 1}
                          </span>

                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            {typeIcons[q.question_type]}
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {q.title || `Question ${index + 1}`}
                            </span>
                            {q.is_required && (
                              <span className="text-[10px] text-pink-400 font-bold">*</span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteQuestion(q.id);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {questions.length === 0 && (
        <div className="p-8 text-center glass-panel rounded-xl border border-dashed border-slate-800">
          <p className="text-xs text-slate-400">No questions added yet.</p>
          <button
            onClick={() => onAddQuestion('short_text')}
            className="mt-2 text-xs font-bold text-cyan-400 hover:underline"
          >
            + Add Short Text Question
          </button>
        </div>
      )}

    </div>
  );
};
