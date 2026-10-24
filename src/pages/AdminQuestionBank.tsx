import React, { useState, useEffect } from 'react';
import { api, Question } from '../services/api.ts';
import {
  HelpCircle,
  Plus,
  Trash2,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
} from 'lucide-react';

export const AdminQuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New question form state
  const [subject, setSubject] = useState('Computer Networks');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [marks, setMarks] = useState(2);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      setLoading(true);
      const res = await api.getQuestionBank();
      setQuestions(res.questions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load question bank');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this question from the bank?')) return;
    try {
      await api.deleteQuestionFromBank(id);
      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || options.some((o) => !o.trim())) {
      alert('Please provide the question text and all options.');
      return;
    }

    try {
      await api.addQuestionToBank({
        subject,
        topic,
        text: text.trim(),
        options,
        correctAnswerIndex: Number(correctAnswerIndex),
        marks: Number(marks),
        negativeMarks: Number(negativeMarks),
        explanation: explanation.trim(),
      });
      setShowAddModal(false);
      setText('');
      setTopic('');
      setExplanation('');
      setOptions(['', '', '', '']);
      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Failed to add question');
    }
  };

  const subjects = ['All', ...new Set(questions.map((q) => q.subject))];

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesSearch =
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(search.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Question Bank</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Curated repository of academic questions for examination assembly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/30 transition text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question to Bank</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or topics..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No questions found.</p>
          <p className="text-xs text-slate-500 mt-1">Try another filter or create a new question.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-0.5 rounded-lg">
                      {q.subject}
                    </span>
                    {q.topic && (
                      <span className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                        {q.topic}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-white mb-4 leading-relaxed">
                  {q.text}
                </h4>

                <div className="space-y-1.5 mb-4 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctAnswerIndex === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[10px] w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            Answer Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {q.explanation && (
                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 block mb-0.5">Solution Guide:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Question to Question Bank</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Memory Management"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter detailed question statement..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Options & Correct Answer (Select radio for correct answer) *
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctAnswerIndex === idx}
                        onChange={() => setCorrectAnswerIndex(idx)}
                        className="text-purple-600 focus:ring-0"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marks</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    step="0.25"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Solution Explanation
                </label>
                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why the selected option is correct..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
