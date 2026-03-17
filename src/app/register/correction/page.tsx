'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormField from '@/components/FormField';
import { getRecordById, updateRecord, updateRecordStatus, addAuditLog } from '@/lib/store';
import { BLOOD_GROUPS, CONTACT_PERSON_RELATIONS, KIT_SIZES, STATES, GENDERS, WOMEN_SHOE_SIZES, MEN_SHOE_SIZES } from '@/lib/constants';
import type { RegistrationRecord, FlaggedField } from '@/lib/types';

function CorrectionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const recordId = params.get('id');
  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recordId) { router.push('/'); return; }
    const r = getRecordById(recordId);
    if (!r || r.status !== 'Flagged for Correction') { router.push('/'); return; }
    setRecord(r);
    setPhotoPreview(r.photo);
    const d: Record<string, string> = {};
    Object.entries(r).forEach(([k, v]) => { if (typeof v === 'string') d[k] = v; });
    setFormData(d);
  }, [recordId, router]);

  if (!record) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  const flaggedFields = record.flaggedFields || [];
  const flaggedNames = new Set(flaggedFields.map(f => f.fieldName));
  const getFlagRemark = (fieldName: string) => flaggedFields.find(f => f.fieldName === fieldName)?.remark || '';
  const isFlagged = (fieldName: string) => flaggedNames.has(fieldName);
  const isFieldEditable = (fieldName: string) => {
    if (flaggedNames.has(fieldName)) return true;
    // Check if entire section is flagged
    const sectionFlagged = flaggedFields.some(f => f.fieldName === f.section);
    return sectionFlagged;
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResubmit = () => {
    setSubmitting(true);
    const updates: Partial<RegistrationRecord> = {};
    flaggedFields.forEach(ff => {
      const key = ff.fieldName as keyof RegistrationRecord;
      if (formData[key] !== undefined) {
        (updates as Record<string, unknown>)[key] = formData[key];
      }
    });
    if (photoFile) (updates as Record<string, unknown>).photo = photoPreview;
    (updates as Record<string, unknown>).flaggedFields = [];
    (updates as Record<string, unknown>).flagRemarks = '';

    updateRecord(record.id, updates);
    updateRecordStatus(record.id, 'Correction Submitted – Pending Verification');
    addAuditLog({ recordId: record.id, action: 'Correction Resubmitted', actor: 'Applicant (Self)', details: 'Corrected flagged fields and resubmitted' });

    setTimeout(() => {
      router.push('/register/confirmation?status=' + encodeURIComponent('Correction Submitted – Pending Verification') + '&id=' + record.id);
    }, 1000);
  };

  const isAthlete = record.category === 'Athlete';
  const shoeSizes = formData.gender === 'Female' ? [...WOMEN_SHOE_SIZES] : [...MEN_SHOE_SIZES];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <span className="font-bold flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              GMS — Correction Required
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="animate-fade-in">
          <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 mb-6 flex gap-3">
            <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <div>
              <p className="font-semibold text-orange-800">Correction Required</p>
              <p className="text-sm text-orange-700">The admin has flagged the following fields for correction. Please update the highlighted fields and resubmit.</p>
            </div>
          </div>

          {/* Flagged Fields Summary */}
          <div className="card p-4 mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-2">Flagged Items ({flaggedFields.length})</p>
            <div className="space-y-2">
              {flaggedFields.map((ff, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">{ff.fieldName}</span>
                  <span className="text-slate-600">{ff.remark}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Photo</h3>
            <div className="flex items-center gap-4">
              {photoPreview && <img src={photoPreview} alt="Photo" className="w-20 h-20 rounded-lg object-cover border" />}
              {isFlagged('photo') && (
                <div>
                  <input type="file" ref={fileRef} accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhotoChange} />
                  <button className="btn btn-outline text-sm" onClick={() => fileRef.current?.click()}>Change Photo</button>
                  <p className="text-xs text-orange-600 mt-1">Admin: {getFlagRemark('photo')}</p>
                </div>
              )}
            </div>
          </div>

          {/* General Details */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">General Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="First Name" name="firstName" required value={formData.firstName} onChange={(v) => updateField('firstName', v)} disabled={!isFieldEditable('firstName')} flagged={isFlagged('firstName')} flagRemark={getFlagRemark('firstName')} error={errors.firstName} />
              <FormField label="Last Name" name="lastName" required value={formData.lastName} onChange={(v) => updateField('lastName', v)} disabled={!isFieldEditable('lastName')} flagged={isFlagged('lastName')} flagRemark={getFlagRemark('lastName')} error={errors.lastName} />
              <FormField label="Gender" name="gender" type="select" required options={[...GENDERS]} value={formData.gender} onChange={(v) => updateField('gender', v)} disabled={!isFieldEditable('gender')} flagged={isFlagged('gender')} flagRemark={getFlagRemark('gender')} />
              {isAthlete && <FormField label="Date of Birth" name="dateOfBirth" required value={formData.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} disabled={!isFieldEditable('dateOfBirth')} flagged={isFlagged('dateOfBirth')} flagRemark={getFlagRemark('dateOfBirth')} />}
              <FormField label="Email ID" name="emailId" required value={formData.emailId} onChange={(v) => updateField('emailId', v)} disabled={!isFieldEditable('emailId')} flagged={isFlagged('emailId')} flagRemark={getFlagRemark('emailId')} />
              {isAthlete && <FormField label="Blood Group" name="bloodGroup" type="select" required options={[...BLOOD_GROUPS]} value={formData.bloodGroup} onChange={(v) => updateField('bloodGroup', v)} disabled={!isFieldEditable('bloodGroup')} flagged={isFlagged('bloodGroup')} flagRemark={getFlagRemark('bloodGroup')} />}
              {!isAthlete && <FormField label="Designation" name="designation" required value={formData.designation} onChange={(v) => updateField('designation', v)} disabled={!isFieldEditable('designation')} flagged={isFlagged('designation')} flagRemark={getFlagRemark('designation')} />}
              {!isAthlete && <FormField label="Mobile Number" name="mobileNumber" required value={formData.mobileNumber} onChange={(v) => updateField('mobileNumber', v)} disabled={!isFieldEditable('mobileNumber')} flagged={isFlagged('mobileNumber')} flagRemark={getFlagRemark('mobileNumber')} />}
            </div>
          </div>

          {/* Contact Details (Athlete only) */}
          {isAthlete && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Contact Details</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <FormField label="Contact Person Relation" name="contactPersonRelation" type="select" required options={[...CONTACT_PERSON_RELATIONS]} value={formData.contactPersonRelation} onChange={(v) => updateField('contactPersonRelation', v)} disabled={!isFieldEditable('contactPersonRelation')} flagged={isFlagged('contactPersonRelation')} flagRemark={getFlagRemark('contactPersonRelation')} />
                <FormField label="Contact Person Name" name="contactPersonName" required value={formData.contactPersonName} onChange={(v) => updateField('contactPersonName', v)} disabled={!isFieldEditable('contactPersonName')} flagged={isFlagged('contactPersonName')} flagRemark={getFlagRemark('contactPersonName')} />
                <FormField label="Contact Person Mobile" name="contactPersonMobile" required value={formData.contactPersonMobile} onChange={(v) => updateField('contactPersonMobile', v)} disabled={!isFieldEditable('contactPersonMobile')} flagged={isFlagged('contactPersonMobile')} flagRemark={getFlagRemark('contactPersonMobile')} />
              </div>
            </div>
          )}

          {/* Address */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Permanent Address</h3>
            <div className="space-y-4">
              <FormField label="Address Field 1" name="addressField1" required value={formData.addressField1} onChange={(v) => updateField('addressField1', v)} disabled={!isFieldEditable('addressField1')} flagged={isFlagged('addressField1')} flagRemark={getFlagRemark('addressField1')} />
              <FormField label="Address Field 2" name="addressField2" required value={formData.addressField2} onChange={(v) => updateField('addressField2', v)} disabled={!isFieldEditable('addressField2')} flagged={isFlagged('addressField2')} flagRemark={getFlagRemark('addressField2')} />
              <div className="grid sm:grid-cols-3 gap-4">
                <FormField label="Pincode" name="pincode" required value={formData.pincode} onChange={(v) => updateField('pincode', v)} disabled={!isFieldEditable('pincode')} flagged={isFlagged('pincode')} flagRemark={getFlagRemark('pincode')} />
                <FormField label="State" name="state" type="select" required options={[...STATES]} value={formData.state} onChange={(v) => updateField('state', v)} disabled={!isFieldEditable('state')} flagged={isFlagged('state')} flagRemark={getFlagRemark('state')} />
                <div><label className="form-label">Country</label><input className="form-input" value="India" disabled /></div>
              </div>
            </div>
          </div>

          {/* Kit Details (Athlete only) */}
          {isAthlete && (
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Kit Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Kit Size" name="kitSize" type="select" required options={[...KIT_SIZES]} value={formData.kitSize} onChange={(v) => updateField('kitSize', v)} disabled={!isFieldEditable('kitSize')} flagged={isFlagged('kitSize')} flagRemark={getFlagRemark('kitSize')} />
                <FormField label="Shoe Size" name="shoeSize" type="select" required options={shoeSizes} value={formData.shoeSize} onChange={(v) => updateField('shoeSize', v)} disabled={!isFieldEditable('shoeSize')} flagged={isFlagged('shoeSize')} flagRemark={getFlagRemark('shoeSize')} />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <a href="/" className="btn btn-outline">Back to Home</a>
            <button onClick={handleResubmit} disabled={submitting} className="btn btn-success btn-lg">
              {submitting ? 'Resubmitting...' : 'Resubmit Corrected Application'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CorrectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <CorrectionContent />
    </Suspense>
  );
}
