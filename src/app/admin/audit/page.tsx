'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { fetchAuditLogs } from '@/lib/store';
import type { AuditLogEntry } from '@/lib/types';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchAuditLogs();
        all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(all);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actions = [...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    if (actionFilter && l.action !== actionFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return l.action.toLowerCase().includes(s) || l.actor.toLowerCase().includes(s) || l.details.toLowerCase().includes(s) || l.recordId.toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Audit Log</h2>
          <p className="text-slate-600 text-sm mt-1">Complete activity history for all CSR registration operations.</p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Search</label>
              <input className="form-input text-sm" placeholder="Search by action, actor, record ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Action Type</label>
              <select className="form-input text-sm" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="">All Actions</option>
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-outline text-sm w-full" onClick={() => { setSearch(''); setActionFilter(''); }}>Clear</button>
            </div>
          </div>
        </div>

        {/* Log Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Record ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Before / After</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No audit entries found</td></tr>
                ) : filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        log.action.includes('Verified') || log.action.includes('Bulk Verified') ? 'bg-green-100 text-green-700' :
                        log.action.includes('Flagged') ? 'bg-orange-100 text-orange-700' :
                        log.action.includes('Submitted') || log.action.includes('Correction') ? 'bg-blue-100 text-blue-700' :
                        log.action.includes('Upload') ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{log.actor}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{log.recordId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.beforeValue && <span className="line-through text-red-400">{log.beforeValue}</span>}
                      {log.afterValue && <span className="text-green-600 ml-1">{log.afterValue}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t text-sm text-slate-600">
            Showing {filtered.length} of {logs.length} entries
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
