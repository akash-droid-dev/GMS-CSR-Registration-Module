'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { SUBMISSION_MESSAGE, USER_VERIFIED_MESSAGE } from '@/lib/constants';
import { fetchRecordById, generateUserPassword } from '@/lib/store';
import type { RegistrationRecord } from '@/lib/types';

function ConfirmationContent() {
  const params = useSearchParams();
  const status = params.get('status') || 'Submitted – Pending Verification';
  const recordId = params.get('id');
  const isSubmitted = status.includes('Submitted') || status.includes('Pending');
  const isVerified = status.includes('Verified');
  const [record, setRecord] = useState<RegistrationRecord | null>(null);

  useEffect(() => {
    if (recordId && isVerified) {
      fetchRecordById(recordId).then(r => setRecord(r));
    }
  }, [recordId, isVerified]);

  const password = record ? (record.loginPassword || generateUserPassword(record)) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-bold">GMS — Registration Status</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center animate-fade-in">
          <div className="card p-10">
            {isVerified ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}

            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
              {isVerified ? 'Registration Verified' : isSubmitted ? 'Registration Submitted' : 'Application Status'}
            </h2>

            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
              isVerified ? 'badge-verified' : isSubmitted ? 'badge-pending' : 'badge-correction'
            }`}>
              {status}
            </div>

            <p className="text-slate-600 leading-relaxed">
              {isSubmitted ? SUBMISSION_MESSAGE : isVerified ? USER_VERIFIED_MESSAGE : `Your application is currently: ${status}`}
            </p>

            {isVerified && record && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left">
                <h3 className="font-bold text-emerald-900 text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  Your Login Credentials
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-emerald-700 font-medium">Email / Login ID</span>
                    <p className="font-mono text-sm font-bold text-emerald-900 bg-white px-3 py-1.5 rounded border border-emerald-200 mt-0.5">{record.emailId}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-medium">Password</span>
                    <p className="font-mono text-sm font-bold text-emerald-900 bg-white px-3 py-1.5 rounded border border-emerald-200 mt-0.5">{password}</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-3">Please save these credentials securely. You will need them to access your dashboard.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/" className="btn btn-outline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Back to Home
            </Link>
            {isVerified && (
              <Link href="/user/login" className="btn btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Login to Dashboard
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
