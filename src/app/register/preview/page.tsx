'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentRegistration, setCurrentRegistration, saveRecord, addAuditLog, setAuthSession } from '@/lib/store';
import { REGISTRATION_STATUSES, REGISTRATION_SOURCES } from '@/lib/constants';
import type { RegistrationRecord } from '@/lib/types';

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const reg = getCurrentRegistration();
    if (!reg) { router.push('/'); return; }
    setData(reg as Record<string, string>);
  }, [router]);

  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  const isAthlete = data.category === 'Athlete';

  const sections = isAthlete ? [
    { title: 'General Details', id: 'general', fields: [
      { label: 'First Name', value: data.firstName },
      { label: 'Last Name', value: data.lastName },
      { label: 'Gender', value: data.gender },
      { label: 'Date of Birth', value: data.dateOfBirth },
      { label: 'Email ID', value: data.emailId },
      { label: 'Blood Group', value: data.bloodGroup },
    ]},
    { title: 'Contact Details', id: 'contact', fields: [
      { label: 'Contact Person Relation', value: data.contactPersonRelation },
      { label: 'Contact Person Name', value: data.contactPersonName },
      { label: 'Contact Person Mobile', value: data.contactPersonMobile },
    ]},
    { title: 'Permanent Address', id: 'address', fields: [
      { label: 'Address Field 1', value: data.addressField1 },
      { label: 'Address Field 2', value: data.addressField2 },
      { label: 'Pincode / Zipcode', value: data.pincode },
      { label: 'State', value: data.state },
      { label: 'Country', value: 'India' },
    ]},
    { title: 'Kit Details', id: 'kit', fields: [
      { label: 'Kit Size', value: data.kitSize },
      { label: 'Shoe Size', value: data.shoeSize },
    ]},
  ] : [
    { title: 'General Details', id: 'general', fields: [
      { label: 'First Name', value: data.firstName },
      { label: 'Last Name', value: data.lastName },
      { label: 'Gender', value: data.gender },
      { label: 'Designation', value: data.designation },
      { label: 'Mobile Number', value: data.mobileNumber },
      { label: 'Email ID', value: data.emailId },
    ]},
    { title: 'Permanent Address', id: 'address', fields: [
      { label: 'Address Field 1', value: data.addressField1 },
      { label: 'Address Field 2', value: data.addressField2 },
      { label: 'Pincode / Zipcode', value: data.pincode },
      { label: 'State', value: data.state },
      { label: 'Country', value: 'India' },
    ]},
  ];

  const handleSubmit = () => {
    setSubmitting(true);
    const id = uuidv4();
    const now = new Date().toISOString();
    const base = {
      id,
      category: data.category as RegistrationRecord['category'],
      source: REGISTRATION_SOURCES.SELF as RegistrationRecord['source'],
      status: REGISTRATION_STATUSES.SUBMITTED as RegistrationRecord['status'],
      aadhaarRef: data.aadhaarRef,
      photo: data.photo,
      firstName: (data.firstName).trim(),
      lastName: (data.lastName).trim(),
      gender: data.gender as RegistrationRecord['gender'],
      emailId: (data.emailId).trim().toLowerCase(),
      addressField1: (data.addressField1).trim(),
      addressField2: (data.addressField2).trim(),
      pincode: (data.pincode).trim(),
      state: data.state,
      country: 'India',
      createdAt: now,
      updatedAt: now,
    };

    let record: RegistrationRecord;
    if (isAthlete) {
      record = {
        ...base,
        category: 'Athlete',
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,
        contactPersonRelation: data.contactPersonRelation,
        contactPersonName: (data.contactPersonName).trim(),
        contactPersonMobile: (data.contactPersonMobile).trim(),
        kitSize: data.kitSize,
        shoeSize: data.shoeSize,
      } as RegistrationRecord;
    } else {
      record = {
        ...base,
        category: data.category as 'Support Staff' | 'Technical Official',
        designation: (data.designation).trim(),
        mobileNumber: (data.mobileNumber).trim(),
      } as RegistrationRecord;
    }

    saveRecord(record);
    addAuditLog({ recordId: id, action: 'Submitted', actor: 'Applicant (Self)', details: `${data.category} self-registration submitted` });
    setCurrentRegistration(null);
    setAuthSession(null);
    setTimeout(() => {
      router.push('/register/confirmation?id=' + id);
    }, 1000);
  };

  const handleEdit = (sectionId: string) => {
    if (isAthlete) {
      if (sectionId === 'kit') {
        router.push('/register/athlete?step=2');
      } else {
        router.push('/register/athlete?step=1&section=' + sectionId);
      }
    } else {
      router.push('/register/others?section=' + sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <span className="font-bold flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              GMS — Application Preview
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Review Your Application</h2>
            <p className="text-slate-600 text-sm">Please review all information before submitting. Click any section header to edit.</p>
            <div className="inline-flex items-center gap-2 mt-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              {data.category as string}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="card p-4 mb-6">
            <p className="text-xs font-semibold text-slate-500 mb-2">JUMP TO SECTION</p>
            <div className="flex flex-wrap gap-2">
              {sections.map(s => (
                <a key={s.id} href={`#section-${s.id}`} className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition">
                  {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Photo */}
          {data.photo && (
            <div className="card p-6 mb-6 flex items-center gap-4">
              <img src={data.photo as string} alt="Applicant" className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200" />
              <div>
                <p className="font-semibold text-[#1e3a5f]">{data.firstName as string} {data.lastName as string}</p>
                <p className="text-sm text-slate-500">{data.category as string}</p>
              </div>
            </div>
          )}

          {/* Sections */}
          {sections.map(section => (
            <div key={section.id} id={`section-${section.id}`} className="card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1e3a5f]">{section.title}</h3>
                <button onClick={() => handleEdit(section.id)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {section.fields.map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-500 font-medium">{f.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{f.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-between items-center mt-8">
            <button onClick={() => router.back()} className="btn btn-outline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Form
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-success btn-lg">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Submitting...
                </span>
              ) : (
                <>
                  Final Submit
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
