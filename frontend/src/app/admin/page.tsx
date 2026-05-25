'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Ticket, HelpCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

interface Stats {
  totalUsers: number;
  totalTickets: number;
  openTickets: number;
  totalFAQs: number;
  totalSessions: number;
}

interface RecentTicket {
  id: string;
  subject: string;
  email: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

interface DashboardData {
  stats: Stats;
  recentTickets: RecentTicket[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = data
    ? [
        { label: 'Total Users', value: data.stats.totalUsers, icon: Users, color: 'bg-blue-500' },
        { label: 'Total Tickets', value: data.stats.totalTickets, icon: Ticket, color: 'bg-orange-500' },
        { label: 'Open Tickets', value: data.stats.openTickets, icon: TrendingUp, color: 'bg-red-500' },
        { label: 'FAQs', value: data.stats.totalFAQs, icon: HelpCircle, color: 'bg-green-500' },
        { label: 'Chat Sessions', value: data.stats.totalSessions, icon: MessageSquare, color: 'bg-purple-500' },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {statCards.map(card => (
                <div key={card.label} className="card flex items-center gap-4">
                  <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Recent Tickets</h2>
              {data?.recentTickets.length === 0 ? (
                <p className="text-gray-500 text-sm">No tickets yet</p>
              ) : (
                <div className="space-y-3">
                  {data?.recentTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{ticket.subject}</p>
                        <p className="text-xs text-gray-500">{ticket.email}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          ticket.status === 'OPEN'
                            ? 'bg-red-100 text-red-700'
                            : ticket.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/admin/tickets" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
                View all tickets →
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
