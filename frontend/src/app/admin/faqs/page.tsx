'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
}

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' });
  const [editForm, setEditForm] = useState<Partial<FAQ>>({});

  const fetchFAQs = async () => {
    try {
      const { data } = await api.get('/faqs');
      setFaqs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/faqs', form);
      toast.success('FAQ created');
      setShowForm(false);
      setForm({ question: '', answer: '', category: 'general' });
      fetchFAQs();
    } catch {
      toast.error('Failed to create FAQ');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/faqs/${id}`, editForm);
      toast.success('FAQ updated');
      setEditingId(null);
      fetchFAQs();
    } catch {
      toast.error('Failed to update FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success('FAQ deleted');
      fetchFAQs();
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">New FAQ</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" className="input-field" placeholder="Question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
              <textarea className="input-field resize-none" rows={3} placeholder="Answer" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} required />
              <input type="text" className="input-field" placeholder="Category (e.g. general, billing)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.id} className="card">
                {editingId === faq.id ? (
                  <div className="space-y-3">
                    <input type="text" className="input-field" value={editForm.question ?? faq.question} onChange={e => setEditForm({ ...editForm, question: e.target.value })} />
                    <textarea className="input-field resize-none" rows={3} value={editForm.answer ?? faq.answer} onChange={e => setEditForm({ ...editForm, answer: e.target.value })} />
                    <input type="text" className="input-field" value={editForm.category ?? faq.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(faq.id)} className="btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{faq.question}</p>
                      <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-2 inline-block capitalize">{faq.category}</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingId(faq.id); setEditForm({}); }} className="text-gray-400 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(faq.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
