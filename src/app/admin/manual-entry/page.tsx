'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import AdminLayout from '@/components/AdminLayout';
import FormField from '@/components/FormField';
import { BLOOD_GROUPS, CONTACT_PERSON_RELATIONS, KIT_SIZES, STATES, GENDERS, WOMEN_SHOE_SIZES, MEN_SHOE_SIZES, REGISTRATION_STATUSES, REGISTRATION_SOURCES, CATEGORIES } from '@/lib/constants';
import { validateAthleteStep1, validateAthleteStep2, validateOthersForm } from '@/lib/validators';
import { saveRecord, addAuditLog, getAdminSession } from '@/lib/store';
import type { RegistrationRecord, Category } from '@/lib/types';

export default function ManualEntryPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category | ''>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'gender') next.shoeSize = '';
      return next;
    });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      if (errors.photo) setErrors(prev => { const n = { ...prev }; delete n.photo; return n; });
    }
  };

  const handleSubmit = () => {
    let errs: Record<string, string> = {};
    if (category === 'Athlete') {
      errs = { ...validateAthleteStep1(formData, photoFile, !!photoPreview), ...validateAthleteStep2(formData) };
    } else {
      errs = validateOthersForm(formData, photoFile, !!photoPreview);
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    const session = getAdminSession();
    const id = uuidv4();
    const now = new Date().toISOString();
    const base = {
      id,
      category: category as Category,
      source: REGISTRATION_SOURCES.ADMIN as RegistrationRecord['source'],
      status: REGISTRATION_STATUSES.VERIFIED_ADMIN as RegistrationRecord['status'],
      aadhaarRef: 'ADMIN-' + id.slice(0, 8),
      photo: photoPreview,
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      gender: formData.gender as 'Male' | 'Female',
      emailId: formData.emailId?.trim().toLowerCase(),
      addressField1: formData.addressField1?.trim(),
      addressField2: formData.addressField2?.trim(),
      pincode: formData.pincode?.trim(),
      state: formData.state,
      country: 'India',
      createdAt: now,
      updatedAt: now,
      verifiedAt: now,
      verifiedBy: session?.name || 'Admin',
    };

    let record: RegistrationRecord;
    if (category === 'Athlete') {
      record = { ...base, category: 'Athlete', dateOfBirth: formData.dateOfBirth, bloodGroup: formData.bloodGroup, contactPersonRelation: formData.contactPersonRelation, contactPersonName: formData.contactPersonName?.trim(), contactPersonMobile: formData.contactPersonMobile?.trim(), kitSize: formData.kitSize, shoeSize: formData.shoeSize } as RegistrationRecord;
    } else {
      record = { ...base, category: category as 'Support Staff' | 'Technical Official', designation: formData.designation?.trim(), mobileNumber: formData.mobileNumber?.trim() } as RegistrationRecord;
    }

    saveRecord(record);
    addAuditLog({ recordId: id, action: 'Admin Manual Registration', actor: session?.name || 'Admin', details: `${category} manually registered by admin` });

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      router.push('/admin/records/' + id);
    }, 2000);
  };

  const isAthlete = category === 'Athlete';
  const shoeSizes = formData.gender === 'Female' ? [...WOMEN_SHOE_SIZES] : [...MEN_SHOE_SIZES];

  if (success) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f]">Record Created Successfully</h3>
            <p className="text-sm text-slate-600">Status: Verified — Admin Entry</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Manual Registration</h2>
          <p className="text-slate-600 text-sm mt-1">Create verified records directly for any participant category.</p>
        </div>

        {/* Category Selection */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Select Category</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {Object.values(CATEGORIES).map(cat => (
              <button key={cat} onClick={() => { setCategory(cat); setFormData({}); setPhotoPreview(''); setPhotoFile(null); setErrors({}); }}
                className={`p-4 rounded-xl border-2 text-left transition ${category === cat ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className="font-semibold text-slate-800">{cat}</p>
                <p className="text-xs text-slate-500 mt-1">{cat === 'Athlete' ? 'Full athlete profile with kit details' : 'Staff/official with designation'}</p>
              </button>
            ))}
          </div>
        </div>

        {category && (
          <div className="space-y-6">
            {/* Photo + General */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">General Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Photo Upload <span className="required">*</span></label>
                  <p className="text-xs text-slate-500 mb-2">Kindly attach Front Face Photo. JPG, JPEG, PNG (Max 2 MB)</p>
                  <div className="flex items-center gap-4">
                    {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border" />}
                    <div>
                      <input type="file" ref={fileRef} accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhotoChange} />
                      <button type="button" className="btn btn-outline text-sm" onClick={() => fileRef.current?.click()}>{photoPreview ? 'Change' : 'Upload'}</button>
                    </div>
                  </div>
                  {errors.photo && <p className="form-error">{errors.photo}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="First Name" name="firstName" required value={formData.firstName} onChange={(v) => updateField('firstName', v)} error={errors.firstName} maxLength={100} />
                  <FormField label="Last Name" name="lastName" required value={formData.lastName} onChange={(v) => updateField('lastName', v)} error={errors.lastName} maxLength={100} />
                </div>
                {isAthlete ? (
                  <>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <FormField label="Gender" name="gender" type="select" required options={[...GENDERS]} value={formData.gender} onChange={(v) => updateField('gender', v)} error={errors.gender} />
                      <FormField label="Date of Birth" name="dateOfBirth" required value={formData.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} error={errors.dateOfBirth} placeholder="dd/mm/yyyy" />
                      <FormField label="Blood Group" name="bloodGroup" type="select" required options={[...BLOOD_GROUPS]} value={formData.bloodGroup} onChange={(v) => updateField('bloodGroup', v)} error={errors.bloodGroup} />
                    </div>
                    <FormField label="Email ID" name="emailId" required value={formData.emailId} onChange={(v) => updateField('emailId', v)} error={errors.emailId} />
                  </>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Gender" name="gender" type="select" required options={[...GENDERS]} value={formData.gender} onChange={(v) => updateField('gender', v)} error={errors.gender} />
                      <FormField label="Designation" name="designation" required value={formData.designation} onChange={(v) => updateField('designation', v)} error={errors.designation} maxLength={150} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Mobile Number" name="mobileNumber" required value={formData.mobileNumber} onChange={(v) => updateField('mobileNumber', v)} error={errors.mobileNumber} maxLength={10} />
                      <FormField label="Email ID" name="emailId" required value={formData.emailId} onChange={(v) => updateField('emailId', v)} error={errors.emailId} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact (Athlete only) */}
            {isAthlete && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Contact Details</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="Contact Person Relation" name="contactPersonRelation" type="select" required options={[...CONTACT_PERSON_RELATIONS]} value={formData.contactPersonRelation} onChange={(v) => updateField('contactPersonRelation', v)} error={errors.contactPersonRelation} />
                  <FormField label="Contact Person Name" name="contactPersonName" required value={formData.contactPersonName} onChange={(v) => updateField('contactPersonName', v)} error={errors.contactPersonName} maxLength={150} />
                  <FormField label="Contact Person Mobile" name="contactPersonMobile" required value={formData.contactPersonMobile} onChange={(v) => updateField('contactPersonMobile', v)} error={errors.contactPersonMobile} maxLength={10} />
                </div>
              </div>
            )}

            {/* Address */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Permanent Address</h3>
              <div className="space-y-4">
                <FormField label="Address Field 1" name="addressField1" required value={formData.addressField1} onChange={(v) => updateField('addressField1', v)} error={errors.addressField1} maxLength={250} />
                <FormField label="Address Field 2" name="addressField2" required value={formData.addressField2} onChange={(v) => updateField('addressField2', v)} error={errors.addressField2} maxLength={250} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="Pincode / Zipcode" name="pincode" required value={formData.pincode} onChange={(v) => updateField('pincode', v)} error={errors.pincode} maxLength={6} />
                  <FormField label="State" name="state" type="select" required options={[...STATES]} value={formData.state} onChange={(v) => updateField('state', v)} error={errors.state} />
                  <div><label className="form-label">Country</label><input className="form-input" value="India" disabled /></div>
                </div>
              </div>
            </div>

            {/* Kit Details (Athlete only) */}
            {isAthlete && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Kit Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Kit Size" name="kitSize" type="select" required options={[...KIT_SIZES]} value={formData.kitSize} onChange={(v) => updateField('kitSize', v)} error={errors.kitSize} />
                  <FormField label="Shoe Size" name="shoeSize" type="select" required options={shoeSizes} value={formData.shoeSize} onChange={(v) => updateField('shoeSize', v)} error={errors.shoeSize} disabled={!formData.gender} note={formData.gender ? `${formData.gender === 'Female' ? 'Women' : 'Men'} sizes` : 'Select gender first'} />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={submitting} className="btn btn-success btn-lg">
                {submitting ? 'Saving...' : 'Create Verified Record'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
