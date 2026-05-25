'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  email: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
      toast.success('Status updated');
      fetchTickets();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="space-y-2">
                {tickets.length === 0 ? (
                  <p className="text-gray-500 text-center py-12">No tickets yet</p>
                ) : (
                  tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelected(ticket)}
                      className={`card cursor-pointer hover:border-primary-300 transition-colors ${selected?.id === ticket.id ? 'border-primary-500 bg-primary-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                          <p className="text-sm text-gray-500">{ticket.email}</p>
                          <p className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>{ticket.status}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selected && (
              <div className="w-80 card h-fit">
                <h2 className="font-semibold text-gray-900 mb-3">{selected.subject}</h2>
                <p className="text-sm text-gray-600 mb-4">{selected.description}</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="font-medium">Email:</span> {selected.email}</p>
                  <p><span className="font-medium">Priority:</span> <span className={`px-1.5 py-0.5 rounded text-xs ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority}</span></p>
                  <p><span className="font-medium">Created:</span> {new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input-field" value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}>
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
