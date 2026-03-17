'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { getAllRecords } from '@/lib/store';
import type { RegistrationRecord } from '@/lib/types';

export default function AdminDashboard() {
  const [records, setRecords] = useState<RegistrationRecord[]>([]);

  useEffect(() => { setRecords(getAllRecords()); }, []);

  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'Submitted – Pending Verification' || r.status === 'Correction Submitted – Pending Verification').length,
    flagged: records.filter(r => r.status === 'Flagged for Correction').length,
    verified: records.filter(r => r.status.startsWith('Verified')).length,
    athletes: records.filter(r => r.category === 'Athlete').length,
    supportStaff: records.filter(r => r.category === 'Support Staff').length,
    technicalOfficials: records.filter(r => r.category === 'Technical Official').length,
    selfReg: records.filter(r => r.source === 'Self-Registration').length,
    bulkUpload: records.filter(r => r.source === 'Bulk Upload').length,
    adminManual: records.filter(r => r.source === 'Admin Manual Entry').length,
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Dashboard Overview</h2>
          <p className="text-slate-600 text-sm mt-1">CSR Registration Module — Real-time statistics</p>
        </div>

        {/* Status Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Records</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="card p-5 border-l-4 border-l-amber-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Verification</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="card p-5 border-l-4 border-l-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Flagged for Correction</p>
                <p className="text-3xl font-bold text-red-600">{stats.flagged}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
            </div>
          </div>
          <div className="card p-5 border-l-4 border-l-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Verified</p>
                <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Source Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="font-bold text-[#1e3a5f] mb-4">By Category</h3>
            <div className="space-y-3">
              {[
                { label: 'Athletes', count: stats.athletes, color: 'bg-blue-500' },
                { label: 'Support Staff', count: stats.supportStaff, color: 'bg-purple-500' },
                { label: 'Technical Officials', count: stats.technicalOfficials, color: 'bg-teal-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-[#1e3a5f] mb-4">By Source</h3>
            <div className="space-y-3">
              {[
                { label: 'Self-Registration', count: stats.selfReg, color: 'bg-blue-500' },
                { label: 'Bulk Upload', count: stats.bulkUpload, color: 'bg-amber-500' },
                { label: 'Admin Manual Entry', count: stats.adminManual, color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/records" className="btn btn-outline justify-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Review Pending
            </Link>
            <Link href="/admin/bulk-upload" className="btn btn-outline justify-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Bulk Upload Athletes
            </Link>
            <Link href="/admin/manual-entry" className="btn btn-outline justify-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Manual Registration
            </Link>
            <Link href="/admin/audit" className="btn btn-outline justify-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              View Audit Log
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
