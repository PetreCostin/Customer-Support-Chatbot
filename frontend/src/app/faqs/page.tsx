'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await api.get('/faqs', { params: { search: search || undefined } });
        setFaqs(data);
      } catch {
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    const timeout = setTimeout(fetchFAQs, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8">
          <Link href="/chat" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to chat
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-500 mt-2">Find answers to common questions</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No FAQs found</div>
        ) : (
          <div className="space-y-6">
            {categories.map(cat => (
              <div key={cat}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 capitalize">{cat}</h2>
                <div className="space-y-2">
                  {faqs
                    .filter(f => f.category === cat)
                    .map(faq => (
                      <div key={faq.id} className="card p-0 overflow-hidden">
                        <button
                          onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-800">{faq.question}</span>
                          {openId === faq.id ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                        </button>
                        {openId === faq.id && <div className="px-5 pb-4 text-gray-600 text-sm border-t border-gray-100 pt-3">{faq.answer}</div>}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
