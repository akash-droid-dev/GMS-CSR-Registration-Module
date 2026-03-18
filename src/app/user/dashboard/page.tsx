'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserSession, setUserSession, fetchRecordById } from '@/lib/store';
import type { RegistrationRecord } from '@/lib/types';

function getStatusBadgeClass(status: string): string {
  if (status.startsWith('Verified')) return 'badge-verified';
  if (status.includes('Pending')) return 'badge-pending';
  if (status.includes('Flagged')) return 'badge-flagged';
  if (status.includes('Correction')) return 'badge-correction';
  return 'badge-draft';
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function isFlaggedField(fieldName: string, record: RegistrationRecord): boolean {
  return record.flaggedFields?.some((f) => f.fieldName === fieldName) ?? false;
}

function getFlagRemark(fieldName: string, record: RegistrationRecord): string | undefined {
  return record.flaggedFields?.find((f) => f.fieldName === fieldName)?.remark;
}

function FieldRow({ label, value, fieldName, record }: { label: string; value: string | undefined; fieldName?: string; record?: RegistrationRecord }) {
  if (!value && value !== '') return null;
  const flagged = fieldName && record ? isFlaggedField(fieldName, record) : false;
  const remark = fieldName && record ? getFlagRemark(fieldName, record) : undefined;

  return (
    <div className={`py-3 px-4 rounded-lg ${flagged ? 'bg-orange-50 border border-orange-200' : ''}`}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || '-'}</p>
      {flagged && remark && (
        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {remark}
        </p>
      )}
    </div>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ReturnType<typeof getUserSession>>(null);

  useEffect(() => {
    const s = getUserSession();
    if (!s || !s.isAuthenticated) {
      router.push('/user/login');
      return;
    }
    setSession(s);

    fetchRecordById(s.recordId).then((rec) => {
      if (rec) {
        setRecord(rec);
      }
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = () => {
    setUserSession(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-[#1e3a5f] mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="card p-8 text-center max-w-md">
          <p className="text-slate-600 mb-4">Could not load your registration record.</p>
          <Link href="/user/login" className="btn btn-primary">Back to Login</Link>
        </div>
      </div>
    );
  }

  const isAthlete = record.category === 'Athlete';
  const rec = record as unknown as Record<string, string>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">GMS — My Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-200 hidden sm:inline">{session?.name}</span>
              <button onClick={handleSignOut} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Section */}
        <div className="animate-fade-in mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-1">
            Welcome, {record.firstName} {record.lastName}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="badge badge-verified">{record.category}</span>
            <span className="text-sm text-slate-500">ID: {record.id}</span>
          </div>
        </div>

        {/* Status Card */}
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Application Status</p>
              <span className={`badge ${getStatusBadgeClass(record.status)}`}>{record.status}</span>
            </div>
            {record.status === 'Flagged for Correction' && (
              <Link href="/register/correction" className="btn btn-warning text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Submit Correction
              </Link>
            )}
          </div>
          {record.flagRemarks && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
              <strong>Remarks:</strong> {record.flagRemarks}
            </div>
          )}
        </div>

        {/* Photo Section */}
        {record.photo && (
          <div className="card p-6 mb-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Photo</h3>
            <div className="w-32 h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={record.photo} alt="Participant photo" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* General Details */}
        <div className="card p-6 mb-6 animate-fade-in">
          <h3 className="text-base font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            General Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <FieldRow label="First Name" value={record.firstName} fieldName="firstName" record={record} />
            <FieldRow label="Last Name" value={record.lastName} fieldName="lastName" record={record} />
            <FieldRow label="Gender" value={record.gender} fieldName="gender" record={record} />
            {isAthlete && (
              <FieldRow label="Date of Birth" value={rec.dateOfBirth} fieldName="dateOfBirth" record={record} />
            )}
            <FieldRow label="Email" value={record.emailId} fieldName="emailId" record={record} />
            {isAthlete && (
              <FieldRow label="Blood Group" value={rec.bloodGroup} fieldName="bloodGroup" record={record} />
            )}
            {!isAthlete && (
              <>
                <FieldRow label="Designation" value={rec.designation} fieldName="designation" record={record} />
                <FieldRow label="Mobile Number" value={rec.mobileNumber} fieldName="mobileNumber" record={record} />
              </>
            )}
          </div>
        </div>

        {/* Contact Details (Athlete only) */}
        {isAthlete && (
          <div className="card p-6 mb-6 animate-fade-in">
            <h3 className="text-base font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <FieldRow label="Contact Person Relation" value={rec.contactPersonRelation} fieldName="contactPersonRelation" record={record} />
              <FieldRow label="Contact Person Name" value={rec.contactPersonName} fieldName="contactPersonName" record={record} />
              <FieldRow label="Contact Person Mobile" value={rec.contactPersonMobile} fieldName="contactPersonMobile" record={record} />
            </div>
          </div>
        )}

        {/* Permanent Address */}
        <div className="card p-6 mb-6 animate-fade-in">
          <h3 className="text-base font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Permanent Address
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <FieldRow label="Address Line 1" value={record.addressField1} fieldName="addressField1" record={record} />
            <FieldRow label="Address Line 2" value={record.addressField2} fieldName="addressField2" record={record} />
            <FieldRow label="Pincode" value={record.pincode} fieldName="pincode" record={record} />
            <FieldRow label="State" value={record.state} fieldName="state" record={record} />
            <FieldRow label="Country" value={record.country} fieldName="country" record={record} />
          </div>
        </div>

        {/* Kit Details (Athlete only) */}
        {isAthlete && (
          <div className="card p-6 mb-6 animate-fade-in">
            <h3 className="text-base font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Kit Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <FieldRow label="Kit Size" value={rec.kitSize} fieldName="kitSize" record={record} />
              <FieldRow label="Shoe Size" value={rec.shoeSize} fieldName="shoeSize" record={record} />
            </div>
          </div>
        )}

        {/* Access Area */}
        {record.accessArea && (
          <div className="card p-6 mb-6 animate-fade-in">
            <h3 className="text-base font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Access Area
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <FieldRow label="Assigned Access Area" value={record.accessArea} />
            </div>
          </div>
        )}

        {/* Record Metadata */}
        <div className="card p-6 mb-6 animate-fade-in">
          <h3 className="text-base font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Record Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <FieldRow label="Registration Date" value={formatDate(record.createdAt)} />
            <FieldRow label="Last Updated" value={formatDate(record.updatedAt)} />
            <FieldRow label="Verified Date" value={formatDate(record.verifiedAt)} />
            <FieldRow label="Verified By" value={record.verifiedBy || '-'} />
            <FieldRow label="Registration Source" value={record.source} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-4 py-6">
          <Link href="/" className="btn btn-outline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
