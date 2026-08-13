export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating'
  | 'file_upload';

export type ThemeType = 'cyber_neon' | 'deep_space' | 'sunset_glass' | 'emerald_dark';

export interface QuestionOption {
  id?: string;
  option_label: string;
  option_value: string;
  order_index?: number;
}

export interface Question {
  id: string;
  form_id?: string;
  question_type: QuestionType;
  title: string;
  description?: string;
  order_index: number;
  is_required: boolean;
  placeholder?: string;
  min_val?: number;
  max_val?: number;
  options: QuestionOption[];
}

export interface LogicRule {
  id?: string;
  form_id?: string;
  source_question_id: string;
  condition_operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  condition_value: string;
  target_question_id: string; // question id or 'END'
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  status: 'draft' | 'published';
  theme: ThemeType;
  share_id: string;
  thank_you_title?: string;
  thank_you_description?: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
  logic_rules: LogicRule[];
  response_count?: number;
}

export interface AnswerSubmit {
  question_id: string;
  answer_value: string;
}

export interface ResponseSubmit {
  answers: AnswerSubmit[];
  completion_time_seconds: number;
}

export interface AnswerOut {
  id: string;
  question_id: string;
  answer_value: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time_seconds: number;
  answers: AnswerOut[];
}

export interface QuestionAnalytics {
  question_id: string;
  title: string;
  question_type: QuestionType;
  total_answers: number;
  option_counts: Record<string, number>;
  numeric_avg?: number;
  recent_answers?: string[];
}

export interface AnalyticsSummary {
  total_responses: number;
  completion_rate: number;
  avg_completion_time_seconds: number;
  question_analytics: QuestionAnalytics[];
}
