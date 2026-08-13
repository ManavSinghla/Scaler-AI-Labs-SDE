import axios from 'axios';
import { Form, Question, ResponseSubmit, FormResponse, AnalyticsSummary } from '../types/form';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const formApi = {
  // Form Management
  getForms: async (): Promise<Form[]> => {
    const res = await api.get('/forms');
    return res.data;
  },

  getForm: async (formId: string): Promise<Form> => {
    const res = await api.get(`/forms/${formId}`);
    return res.data;
  },

  createForm: async (formData: Partial<Form>): Promise<Form> => {
    const res = await api.post('/forms', formData);
    return res.data;
  },

  updateForm: async (formId: string, formData: Partial<Form>): Promise<Form> => {
    const res = await api.put(`/forms/${formId}`, formData);
    return res.data;
  },

  deleteForm: async (formId: string): Promise<void> => {
    await api.delete(`/forms/${formId}`);
  },

  duplicateForm: async (formId: string): Promise<Form> => {
    const res = await api.post(`/forms/${formId}/duplicate`);
    return res.data;
  },

  togglePublish: async (formId: string): Promise<Form> => {
    const res = await api.patch(`/forms/${formId}/publish`);
    return res.data;
  },

  // Questions
  addQuestion: async (formId: string, questionData: Partial<Question>): Promise<Question> => {
    const res = await api.post(`/forms/${formId}/questions`, questionData);
    return res.data;
  },

  updateQuestion: async (questionId: string, questionData: Partial<Question>): Promise<Question> => {
    const res = await api.put(`/questions/${questionId}`, questionData);
    return res.data;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await api.delete(`/questions/${questionId}`);
  },

  reorderQuestions: async (formId: string, items: { id: string; order_index: number }[]): Promise<void> => {
    await api.post(`/forms/${formId}/reorder-questions`, items);
  },

  // Respondent Flow
  getPublicForm: async (shareId: string): Promise<Form> => {
    const res = await api.get(`/public/forms/${shareId}`);
    return res.data;
  },

  submitResponse: async (shareId: string, responseData: ResponseSubmit): Promise<{ response_id: string }> => {
    const res = await api.post(`/public/forms/${shareId}/submit`, responseData);
    return res.data;
  },

  // Analytics & Exports
  getFormResponses: async (formId: string): Promise<FormResponse[]> => {
    const res = await api.get(`/forms/${formId}/responses`);
    return res.data;
  },

  getFormAnalytics: async (formId: string): Promise<AnalyticsSummary> => {
    const res = await api.get(`/forms/${formId}/analytics`);
    return res.data;
  },

  getExportCsvUrl: (formId: string): string => {
    return `${API_BASE_URL}/forms/${formId}/export/csv`;
  },
};
