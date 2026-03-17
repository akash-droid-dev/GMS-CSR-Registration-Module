'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { getAllRecords, updateRecordStatus, addAuditLog, getAdminSession } from '@/lib/store';
import { CATEGORIES, REGISTRATION_STATUSES, REGISTRATION_SOURCES } from '@/lib/constants';
import type { RegistrationRecord } from '@/lib/types';

function getStatusBadge(status: string) {
  if (status.includes('Flagged')) return 'badge-flagged';
  if (status.includes('Verified')) return 'badge-verified';
  if (status.includes('Pending')) return 'badge-pending';
  if (status.includes('Correction Submitted')) return 'badge-correction';
  return 'badge-draft';
}

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [filtered, setFiltered] = useState<RegistrationRecord[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadRecords = () => {
    const all = getAllRecords();
    setRecords(all);
  };

  useEffect(() => { loadRecords(); }, []);

  useEffect(() => {
    let result = [...records];
    if (categoryFilter) result = result.filter(r => r.category === categoryFilter);
    if (statusFilter) result = result.filter(r => r.status === statusFilter);
    if (sourceFilter) result = result.filter(r => r.source === sourceFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(r =>
        r.firstName.toLowerCase().includes(s) ||
        r.lastName.toLowerCase().includes(s) ||
        r.emailId.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s)
      );
    }
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setFiltered(result);
  }, [records, categoryFilter, statusFilter, sourceFilter, search]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };

  const handleBulkVerify = () => {
    const session = getAdminSession();
    const eligible = filtered.filter(r =>
      selected.has(r.id) &&
      (r.status === 'Submitted – Pending Verification' || r.status === 'Correction Submitted – Pending Verification')
    );
    if (eligible.length === 0) return;
    // Ensure all same category
    const categories = new Set(eligible.map(r => r.category));
    if (categories.size > 1) { alert('Bulk verify requires all selected records to be in the same category.'); return; }

    eligible.forEach(r => {
      updateRecordStatus(r.id, 'Verified', { verifiedAt: new Date().toISOString(), verifiedBy: session?.name || 'Admin' });
      addAuditLog({ recordId: r.id, action: 'Bulk Verified', actor: session?.name || 'Admin', details: 'Record verified via bulk verification' });
    });
    setSelected(new Set());
    loadRecords();
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Search</label>
              <input className="form-input text-sm" placeholder="Name, email, ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Category</label>
              <select className="form-input text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {Object.values(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
              <select className="form-input text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {Object.values(REGISTRATION_STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Source</label>
              <select className="form-input text-sm" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="">All Sources</option>
                {Object.values(REGISTRATION_SOURCES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-outline text-sm w-full" onClick={() => { setCategoryFilter(''); setStatusFilter(''); setSourceFilter(''); setSearch(''); }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="card p-3 mb-4 flex items-center justify-between bg-blue-50 border-blue-200">
            <span className="text-sm font-medium text-blue-800">{selected.size} record(s) selected</span>
            <div className="flex gap-2">
              <button onClick={handleBulkVerify} className="btn btn-success text-sm py-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Bulk Verify
              </button>
              <button onClick={() => setSelected(new Set())} className="btn btn-outline text-sm py-1.5">Clear</button>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No records found</td></tr>
                ) : filtered.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(record.id)} onChange={() => toggleSelect(record.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {record.photo ? (
                          <img src={record.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">{record.firstName.charAt(0)}{record.lastName.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{record.firstName} {record.lastName}</p>
                          <p className="text-xs text-slate-500">{record.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        record.category === 'Athlete' ? 'bg-blue-100 text-blue-700' :
                        record.category === 'Support Staff' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                      }`}>{record.category}</span>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${getStatusBadge(record.status)}`}>{record.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-600">{record.source}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{record.emailId}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{new Date(record.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.push('/admin/records/' + record.id)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t text-sm text-slate-600">
            Showing {filtered.length} of {records.length} records
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
