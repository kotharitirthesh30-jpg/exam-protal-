import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, Exam, Question } from '../services/api.ts';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  Calendar,
  X,
  PlusCircle,
  Search,
} from 'lucide-react';

export const AdminManageExams: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('Computer Science');
  const [newExamDescription, setNewExamDescription] = useState('');
  const [newExamDuration, setNewExamDuration] = useState(30);
  const [newExamPassingMarks, setNewExamPassingMarks] = useState(10);
  const [newExamNegativeMarking, setNewExamNegativeMarking] = useState(true);
  const [newExamQuestions, setNewExamQuestions] = useState<
    {
      text: string;
      options: string[];
      correctAnswerIndex: number;
      marks: number;
      explanation: string;
    }[]
  >([
    {
      text: 'Sample Question: Which data structure operates on a First-In-First-Out (FIFO) basis?',
      options: ['Stack', 'Queue', 'Binary Tree', 'Graph'],
      correctAnswerIndex: 1,
      marks: 2,
      explanation: 'Queue maintains FIFO ordering where elements are enqueued at rear and dequeued from front.',
    },
  ]);

  useEffect(() => {
    loadExams();
    if (searchParams.get('create') === '1') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  async function loadExams() {
    try {
      setLoading(true);
      const res = await api.getExams();
      setExams(res.exams || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load examinations');
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePublish = async (exam: Exam) => {
    try {
      await api.updateExam(exam.id, { isPublished: !exam.isPublished });
      loadExams();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status');
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await api.deleteExam(id);
      setDeleteConfirmId(null);
      loadExams();
    } catch (err: any) {
      alert(err.message || 'Failed to delete examination');
    }
  };

  const handleAddQuestionToForm = () => {
    setNewExamQuestions([
      ...newExamQuestions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        marks: 2,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestionFromForm = (idx: number) => {
    setNewExamQuestions(newExamQuestions.filter((_, i) => i !== idx));
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || newExamQuestions.length === 0) {
      alert('Please provide an examination title and at least one question.');
      return;
    }

    try {
      await api.createExam({
        title: newExamTitle.trim(),
        subject: newExamSubject.trim(),
        description: newExamDescription.trim(),
        durationMinutes: Number(newExamDuration),
        passingMarks: Number(newExamPassingMarks),
        negativeMarking: newExamNegativeMarking,
        questions: newExamQuestions,
        isPublished: true,
      });

      setShowCreateModal(false);
      // Reset form
      setNewExamTitle('');
      setNewExamDescription('');
      loadExams();
    } catch (err: any) {
      alert(err.message || 'Failed to create examination');
    }
  };

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manage Examinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, publish, configure questions, and schedule academic assessments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/30 transition text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Examination</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter examinations..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Examinations Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading examinations...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No examinations configured yet.</p>
          <p className="text-xs text-slate-500 mt-1">Click the button above to create your first examination.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Title & Subject</th>
                  <th className="py-4 px-6 text-center">Duration</th>
                  <th className="py-4 px-6 text-center">Questions</th>
                  <th className="py-4 px-6 text-center">Total Marks</th>
                  <th className="py-4 px-6 text-center">Publication</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{exam.title}</div>
                      <div className="text-xs text-purple-400 font-medium">{exam.subject}</div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-slate-300">
                      {exam.durationMinutes} Mins
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-slate-300">
                      {exam.questionCount || 0}
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-white font-bold">
                      {exam.totalMarks}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleTogglePublish(exam)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                          exam.isPublished
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                        title="Click to toggle publication"
                      >
                        {exam.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{exam.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDeleteConfirmId(exam.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete examination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Examination?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this examination? All associated attempts and questions will be removed.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExam(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Examination Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-3xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Create New Examination</h3>
                <p className="text-xs text-slate-400">Configure parameters, timing, and question items</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Examination Title *
                  </label>
                  <input
                    type="text"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    placeholder="e.g. Operating Systems - Midterm"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={newExamSubject}
                    onChange={(e) => setNewExamSubject(e.target.value)}
                    placeholder="e.g. Operating Systems"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={newExamDescription}
                  onChange={(e) => setNewExamDescription(e.target.value)}
                  placeholder="Summary of topics tested..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Passing Marks *</label>
                  <input
                    type="number"
                    min={1}
                    value={newExamPassingMarks}
                    onChange={(e) => setNewExamPassingMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={newExamNegativeMarking}
                      onChange={(e) => setNewExamNegativeMarking(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Negative Marking (-0.5)</span>
                  </label>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Questions ({newExamQuestions.length})</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionToForm}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {newExamQuestions.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 font-mono">
                          Question #{qIndex + 1}
                        </span>
                        {newExamQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionFromForm(qIndex)}
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Enter question text..."
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...newExamQuestions];
                          updated[qIndex].text = e.target.value;
                          setNewExamQuestions(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${qIndex}`}
                              checked={q.correctAnswerIndex === oIndex}
                              onChange={() => {
                                const updated = [...newExamQuestions];
                                updated[qIndex].correctAnswerIndex = oIndex;
                                setNewExamQuestions(updated);
                              }}
                              className="text-purple-600 focus:ring-0"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...newExamQuestions];
                                updated[qIndex].options[oIndex] = e.target.value;
                                setNewExamQuestions(updated);
                              }}
                              className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Explanation for solution key..."
                        value={q.explanation}
                        onChange={(e) => {
                          const updated = [...newExamQuestions];
                          updated[qIndex].explanation = e.target.value;
                          setNewExamQuestions(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/30"
                >
                  Publish Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
