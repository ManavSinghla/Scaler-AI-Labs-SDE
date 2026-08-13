import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  CornerDownLeft, 
  Check, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  Keyboard, 
  RotateCcw,
  Star,
  CheckCircle2,
  Mail,
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  ChevronRight
} from 'lucide-react';
import { Form, Question, ResponseSubmit } from '../../types/form';
import { Background3D } from '../3d/Background3D';
import { Confetti3D } from '../3d/Confetti3D';
import { formApi } from '../../services/api';

interface FormRespondentFlowProps {
  form: Form;
  isPreviewMode?: boolean;
  onClosePreview?: () => void;
}

export const FormRespondentFlow: React.FC<FormRespondentFlowProps> = ({
  form,
  isPreviewMode = false,
  onClosePreview,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const questions = form.questions || [];
  const currentQuestion = questions[currentIndex] || null;

  // Auto-focus inputs on question step change
  useEffect(() => {
    setErrorMsg(null);
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [currentIndex]);

  // Global Keyboard Shortcuts Listener (Typeform Experience)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted) return;

      // Enter to advance or submit
      if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent default form submit
        if (e.target instanceof HTMLTextAreaElement) {
          // Allow enter inside text area unless Ctrl+Enter or Shift+Enter
          if (e.ctrlKey) {
            e.preventDefault();
            handleNext();
          }
        } else {
          e.preventDefault();
          handleNext();
        }
      }

      // Up Arrow -> Previous Question
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }

      // Down Arrow -> Next Question
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }

      // Keybindings for Multiple Choice / Dropdown / Yes-No / Rating
      if (currentQuestion) {
        const activeTagName = (document.activeElement?.tagName || '').toLowerCase();
        const isTypingText = activeTagName === 'input' || activeTagName === 'textarea';

        if (!isTypingText) {
          // Multiple Choice Hotkeys: A, B, C, D...
          if (['multiple_choice', 'dropdown'].includes(currentQuestion.question_type)) {
            const keyChar = e.key.toUpperCase();
            const charCode = keyChar.charCodeAt(0);
            if (keyChar.length === 1 && charCode >= 65 && charCode <= 90) {
              const optionIndex = charCode - 65;
              const targetOption = currentQuestion.options[optionIndex];
              if (targetOption) {
                e.preventDefault();
                handleOptionSelect(targetOption.option_value);
              }
            }
          }

          // Yes/No Hotkeys: Y = Yes, N = No
          if (currentQuestion.question_type === 'yes_no') {
            const keyChar = e.key.toUpperCase();
            if (keyChar === 'Y') {
              e.preventDefault();
              handleOptionSelect('Yes');
            } else if (keyChar === 'N') {
              e.preventDefault();
              handleOptionSelect('No');
            }
          }

          // Rating Hotkeys: 1-5
          if (currentQuestion.question_type === 'rating') {
            const val = parseInt(e.key);
            if (!isNaN(val) && val >= (currentQuestion.min_val || 1) && val <= (currentQuestion.max_val || 5)) {
              e.preventDefault();
              handleOptionSelect(val.toString());
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, currentQuestion, isSubmitted]);

  // Handle Option Select with auto-advance for single choices
  const handleOptionSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    setErrorMsg(null);
    // Auto advance after slight delay for tactile feeing
    setTimeout(() => {
      advanceStep(value);
    }, 250);
  };

  // Validate answer for current question
  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    const val = answers[currentQuestion.id] || '';

    if (currentQuestion.is_required && !val.trim()) {
      setErrorMsg('Please answer this question to continue');
      return false;
    }

    if (currentQuestion.question_type === 'email' && val.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val.trim())) {
        setErrorMsg('Please enter a valid email address');
        return false;
      }
    }

    if (currentQuestion.question_type === 'number' && val.trim()) {
      if (isNaN(Number(val))) {
        setErrorMsg('Please enter a valid number');
        return false;
      }
    }

    return true;
  };

  // Evaluate Logic Jumps to determine next step index
  const getNextIndex = (currentAnswerVal: string): number | 'END' => {
    if (!currentQuestion) return currentIndex + 1;

    const rules = (form.logic_rules || []).filter(
      (r) => r.source_question_id === currentQuestion.id
    );

    for (const rule of rules) {
      let matches = false;
      if (rule.condition_operator === 'equals' && currentAnswerVal.toLowerCase() === rule.condition_value.toLowerCase()) {
        matches = true;
      } else if (rule.condition_operator === 'not_equals' && currentAnswerVal.toLowerCase() !== rule.condition_value.toLowerCase()) {
        matches = true;
      } else if (rule.condition_operator === 'contains' && currentAnswerVal.toLowerCase().includes(rule.condition_value.toLowerCase())) {
        matches = true;
      }

      if (matches) {
        if (rule.target_question_id === 'END') return 'END';
        const targetIdx = questions.findIndex((q) => q.id === rule.target_question_id);
        if (targetIdx !== -1) return targetIdx;
      }
    }

    return currentIndex + 1;
  };

  // Advance Step
  const advanceStep = (explicitVal?: string) => {
    const currentVal = explicitVal !== undefined ? explicitVal : answers[currentQuestion?.id || ''] || '';
    
    // Check validation first
    if (!validateCurrentQuestion() && explicitVal === undefined) {
      return;
    }

    const nextTarget = getNextIndex(currentVal);

    if (nextTarget === 'END' || (typeof nextTarget === 'number' && nextTarget >= questions.length)) {
      // Reached the end of questions -> Submit!
      handleSubmit();
    } else if (typeof nextTarget === 'number') {
      setCurrentIndex(nextTarget);
    }
  };

  const handleNext = () => {
    advanceStep();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setErrorMsg(null);
    }
  };

  // Submit Final Answers
  const handleSubmit = async () => {
    if (isPreviewMode) {
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      const answerPayload = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        answer_value: val,
      }));

      const payload: ResponseSubmit = {
        answers: answerPayload,
        completion_time_seconds: completionTime,
      };

      await formApi.submitResponse(form.share_id, payload);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg('Failed to record submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : '';
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 100;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 md:p-8 overflow-hidden select-none">
      
      {/* 3D WebGL Background Canvas */}
      <Background3D theme={form.theme} stepIndex={currentIndex} />

      {/* 3D Celebration Particles on Submission */}
      {isSubmitted && <Confetti3D />}

      {/* Top Header Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] shadow-glow-cyan">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight">
            {form.title}
          </span>
        </div>

        {/* Progress Bar & Counter */}
        {!isSubmitted && questions.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-bold text-cyan-400">
                {progressPercent}% completed
              </span>
              <span className="text-[10px] text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="w-32 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 ease-out shadow-glow-cyan"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {isPreviewMode && (
              <button
                onClick={onClosePreview}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-500/30"
              >
                Close Preview
              </button>
            )}
          </div>
        )}
      </div>

      {/* Center 3D Conversational Question Card */}
      <div className="w-full max-w-2xl mx-auto my-auto z-20 py-8 perspective-1000">
        <AnimatePresence mode="wait">
          {!isSubmitted && currentQuestion ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 30, rotateX: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, rotateX: 8, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel rounded-3xl p-8 md:p-12 border border-slate-700/80 shadow-2xl space-y-6 relative overflow-hidden"
            >
              
              {/* Question Order Badge & Title */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                    {currentIndex + 1} →
                  </span>
                  {currentQuestion.is_required && (
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                      * Required
                    </span>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {currentQuestion.title}
                </h2>

                {currentQuestion.description && (
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {currentQuestion.description}
                  </p>
                )}
              </div>

              {/* Input Renderers by Question Type */}
              <div className="pt-2">
                
                {/* Short Text Input */}
                {currentQuestion.question_type === 'short_text' && (
                  <input
                    ref={inputRef as any}
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => {
                      setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                      setErrorMsg(null);
                    }}
                    placeholder={currentQuestion.placeholder || 'Type your answer here...'}
                    className="w-full glass-input px-5 py-4 rounded-2xl text-lg font-medium border-slate-700 focus:border-cyan-400"
                  />
                )}

                {/* Long Text Input */}
                {currentQuestion.question_type === 'long_text' && (
                  <textarea
                    ref={inputRef as any}
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => {
                      setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                      setErrorMsg(null);
                    }}
                    placeholder={currentQuestion.placeholder || 'Type your detailed answer here... (Ctrl+Enter to advance)'}
                    className="w-full glass-input px-5 py-4 rounded-2xl text-base font-medium border-slate-700 focus:border-cyan-400 resize-none"
                  />
                )}

                {/* Email Input */}
                {currentQuestion.question_type === 'email' && (
                  <div className="relative">
                    <Mail className="w-5 h-5 text-cyan-400 absolute left-4 top-4" />
                    <input
                      ref={inputRef as any}
                      type="email"
                      value={currentAnswer}
                      onChange={(e) => {
                        setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                        setErrorMsg(null);
                      }}
                      placeholder={currentQuestion.placeholder || 'name@example.com'}
                      className="w-full glass-input pl-12 pr-5 py-4 rounded-2xl text-lg font-medium border-slate-700 focus:border-cyan-400"
                    />
                  </div>
                )}

                {/* Number Input */}
                {currentQuestion.question_type === 'number' && (
                  <div className="relative">
                    <Hash className="w-5 h-5 text-amber-400 absolute left-4 top-4" />
                    <input
                      ref={inputRef as any}
                      type="number"
                      value={currentAnswer}
                      onChange={(e) => {
                        setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                        setErrorMsg(null);
                      }}
                      placeholder={currentQuestion.placeholder || '0'}
                      className="w-full glass-input pl-12 pr-5 py-4 rounded-2xl text-lg font-medium border-slate-700 focus:border-amber-400"
                    />
                  </div>
                )}

                {/* Multiple Choice Options */}
                {currentQuestion.question_type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((opt, optIdx) => {
                      const isSelected = currentAnswer === opt.option_value;
                      const hotkeyChar = String.fromCharCode(65 + optIdx);
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleOptionSelect(opt.option_value)}
                          className={`group cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan text-white'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center border ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:border-cyan-500/50'
                            }`}>
                              {hotkeyChar}
                            </span>
                            <span className="text-base font-semibold">{opt.option_label}</span>
                          </div>

                          {isSelected && <Check className="w-5 h-5 text-cyan-400 stroke-[3]" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown Select */}
                {currentQuestion.question_type === 'dropdown' && (
                  <div className="space-y-2">
                    <select
                      value={currentAnswer}
                      onChange={(e) => handleOptionSelect(e.target.value)}
                      className="w-full glass-input px-5 py-4 rounded-2xl text-base font-semibold cursor-pointer border-slate-700 focus:border-cyan-400"
                    >
                      <option value="">Select an option...</option>
                      {currentQuestion.options?.map((opt, idx) => (
                        <option key={idx} value={opt.option_value} className="bg-slate-900 text-white">
                          {opt.option_label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Yes / No Boolean */}
                {currentQuestion.question_type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['Yes', 'No'].map((choice) => {
                      const isSelected = currentAnswer === choice;
                      const hotkeyChar = choice[0];
                      return (
                        <div
                          key={choice}
                          onClick={() => handleOptionSelect(choice)}
                          className={`cursor-pointer rounded-2xl p-6 border transition-all text-center flex flex-col items-center justify-center space-y-2 ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-400 shadow-glow-cyan text-white'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Press {hotkeyChar}
                          </span>
                          <span className="text-xl font-bold">{choice}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rating Scale */}
                {currentQuestion.question_type === 'rating' && (
                  <div className="flex items-center justify-center space-x-3 py-4">
                    {Array.from({ length: (currentQuestion.max_val || 5) - (currentQuestion.min_val || 1) + 1 }).map((_, i) => {
                      const score = (currentQuestion.min_val || 1) + i;
                      const isSelected = Number(currentAnswer) >= score;
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleOptionSelect(score.toString())}
                          className={`w-12 h-12 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-110'
                              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-amber-400'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${isSelected ? 'fill-slate-950' : ''}`} />
                          <span className="text-[10px] font-bold">{score}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Error Alert Display */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* Action Bar (OK Button & Enter hint) */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-glow-cyan transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>OK</span>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400">
                    <span>press</span>
                    <kbd className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
                      <span>Enter</span>
                      <CornerDownLeft className="w-3 h-3 inline" />
                    </kbd>
                  </div>
                </div>

                {/* Keybindings guide trigger */}
                <button
                  onClick={() => setShowKeyHelp(!showKeyHelp)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1.5 text-xs"
                >
                  <Keyboard className="w-4 h-4 text-cyan-400" />
                  <span className="hidden md:inline">Shortcuts</span>
                </button>
              </div>

            </motion.div>
          ) : (
            
            /* Thank You Celebration Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl p-10 md:p-14 border border-slate-700/80 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-600 p-[2px] mx-auto shadow-glow-cyan animate-bounce">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                  {form.thank_you_title || 'Thank You!'}
                </h1>
                <p className="text-slate-300 text-base max-w-md mx-auto">
                  {form.thank_you_description || 'Your response has been recorded successfully.'}
                </p>
              </div>

              <div className="pt-4 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentIndex(0);
                    setAnswers({});
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all inline-flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Submit Another Response</span>
                </button>
              </div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Navigation Controls & Keyboard Shortcuts Drawer */}
      {!isSubmitted && (
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-20 pt-4">
          
          {/* Keyboard Shortcuts Drawer */}
          {showKeyHelp && (
            <div className="absolute bottom-16 right-8 z-40 w-72 glass-panel rounded-2xl p-4 border border-slate-700 shadow-2xl space-y-2.5">
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider block">
                Keyboard Shortcuts Guide
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Advance / Submit</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous Question</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">↑ Arrow</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Select Choice A-E</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">A / B / C</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Yes / No Answers</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">Y / N</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Star Rating 1-5</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono">1 - 5</kbd>
                </div>
              </div>
            </div>
          )}

          {/* Up & Down Floating Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-2xl border transition-all ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="Previous Question (Up Arrow)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-all"
              title="Next Question (Down Arrow)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Powered by Typeform 3D Engine
          </span>

        </div>
      )}

    </div>
  );
};
