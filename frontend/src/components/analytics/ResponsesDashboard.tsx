import React, { useEffect, useState } from 'react';
import { Download, BarChart2, Clock, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { Form, AnalyticsSummary, FormResponse } from '../../types/form';
import { formApi } from '../../services/api';
import { AnalyticsCharts } from './AnalyticsCharts';
import { SubmissionsTable } from './SubmissionsTable';
import { SubmissionDetailModal } from './SubmissionDetailModal';

interface ResponsesDashboardProps {
  form: Form;
}

export const ResponsesDashboard: React.FC<ResponsesDashboardProps> = ({ form }) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anaData, respData] = await Promise.all([
        formApi.getFormAnalytics(form.id),
        formApi.getFormResponses(form.id),
      ]);
      setAnalytics(anaData);
      setResponses(respData);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [form.id]);

  const handleDownloadCsv = () => {
    window.open(formApi.getExportCsvUrl(form.id), '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400 font-semibold">Loading Form Responses & Analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Results & Analytics</span>
          <h1 className="text-2xl font-extrabold text-white">{form.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time submission stats and question breakdowns.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan transition-all flex items-center space-x-2"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Submissions</span>
            <h2 className="text-2xl font-extrabold text-white">{analytics?.total_responses || 0}</h2>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completion Rate</span>
            <h2 className="text-2xl font-extrabold text-white">{analytics?.completion_rate || 0}%</h2>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Completion Time</span>
            <h2 className="text-2xl font-extrabold text-white">{analytics?.avg_completion_time_seconds || 0}s</h2>
          </div>
        </div>
      </div>

      {/* Visual Question Charts */}
      {analytics?.question_analytics && (
        <AnalyticsCharts analytics={analytics.question_analytics} />
      )}

      {/* Submissions Table */}
      <SubmissionsTable
        responses={responses}
        questions={form.questions}
        onSelectResponse={(resp) => setSelectedResponse(resp)}
      />

      {/* Detail Modal */}
      <SubmissionDetailModal
        response={selectedResponse}
        questions={form.questions}
        isOpen={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
      />

    </div>
  );
};
