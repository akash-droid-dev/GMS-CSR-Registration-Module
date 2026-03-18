'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AadhaarAuth from '@/components/AadhaarAuth';
import FormField from '@/components/FormField';
import { BLOOD_GROUPS, CONTACT_PERSON_RELATIONS, KIT_SIZES, STATES, GENDERS, WOMEN_SHOE_SIZES, MEN_SHOE_SIZES } from '@/lib/constants';
import { validateAthleteStep1, validateAthleteStep2 } from '@/lib/validators';
import { setAuthSession, getAuthSession, setCurrentRegistration, fetchAllRecords } from '@/lib/store';

export default function AthleteRegistration() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [aadhaarRef, setAadhaarRef] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingExisting, setCheckingExisting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const checkExistingRecord = async (aadhaar: string) => {
    setCheckingExisting(true);
    try {
      const { records } = await fetchAllRecords({ search: aadhaar, category: 'Athlete' });
      const existing = records.find(r => r.aadhaarRef === aadhaar && r.category === 'Athlete');
      if (existing && existing.status === 'Flagged for Correction') {
        router.push('/register/correction?id=' + existing.id);
        return true;
      }
      if (existing && (existing.status === 'Submitted – Pending Verification' || existing.status === 'Correction Submitted – Pending Verification' || existing.status.startsWith('Verified'))) {
        router.push('/register/confirmation?status=' + encodeURIComponent(existing.status) + '&id=' + existing.id);
        return true;
      }
    } catch (err) {
      console.error('Failed to check existing record:', err);
    } finally {
      setCheckingExisting(false);
    }
    return false;
  };

  useEffect(() => {
    // Clear any previous auth session so user always starts fresh
    setAuthSession(null);
  }, []);

  const handleAuthSuccess = async (ref: string) => {
    setAadhaarRef(ref);
    setAuthenticated(true);
    setAuthSession({ aadhaarRef: ref, route: 'athlete' });
    // Check for existing record
    await checkExistingRecord(ref);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Reset shoe size if gender changes
      if (field === 'gender') next.shoeSize = '';
      return next;
    });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) {
        setErrors(prev => ({ ...prev, photo: 'Photo must be JPG, JPEG, or PNG' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Photo must not exceed 2 MB' }));
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      if (errors.photo) setErrors(prev => { const n = { ...prev }; delete n.photo; return n; });
    }
  };

  const handleNextStep = () => {
    const errs = validateAthleteStep1(formData, photoFile, !!photoPreview);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePreview = () => {
    const errs = validateAthleteStep2(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentRegistration({
      ...formData,
      photo: photoPreview,
      aadhaarRef,
      category: 'Athlete',
      route: 'athlete',
    });
    router.push('/register/preview');
  };

  if (!authenticated) {
    return <AadhaarAuth route="athlete" onSuccess={handleAuthSuccess} />;
  }

  if (checkingExisting) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  const shoeSizes = formData.gender === 'Female' ? [...WOMEN_SHOE_SIZES] : [...MEN_SHOE_SIZES];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">GMS — Athlete Registration</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                Step {step} of 2
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</div>
              <span className="text-sm font-medium hidden sm:inline">General & Contact & Address</span>
            </div>
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</div>
              <span className="text-sm font-medium hidden sm:inline">Kit Details</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* General Details */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                General Details
              </h3>
              <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="form-label">Photo Upload <span className="required">*</span></label>
                  <p className="text-xs text-slate-500 mb-2">Kindly attach Front Face Photo. Accepted: JPG, JPEG, PNG (Max 2 MB)</p>
                  <div className="flex items-center gap-4">
                    {photoPreview && (
                      <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200" />
                    )}
                    <div>
                      <input type="file" ref={fileRef} accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhotoChange} />
                      <button type="button" className="btn btn-outline text-sm" onClick={() => fileRef.current?.click()}>
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                    </div>
                  </div>
                  {errors.photo && <p className="form-error">{errors.photo}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="First Name" name="firstName" required value={formData.firstName} onChange={(v) => updateField('firstName', v)} error={errors.firstName} maxLength={100} />
                  <FormField label="Last Name" name="lastName" required value={formData.lastName} onChange={(v) => updateField('lastName', v)} error={errors.lastName} maxLength={100} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="Gender" name="gender" type="select" required options={[...GENDERS]} value={formData.gender} onChange={(v) => updateField('gender', v)} error={errors.gender} />
                  <FormField label="Date of Birth" name="dateOfBirth" required value={formData.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} error={errors.dateOfBirth} placeholder="dd/mm/yyyy" />
                  <FormField label="Blood Group" name="bloodGroup" type="select" required options={[...BLOOD_GROUPS]} value={formData.bloodGroup} onChange={(v) => updateField('bloodGroup', v)} error={errors.bloodGroup} />
                </div>
                <FormField label="Email ID" name="emailId" required value={formData.emailId} onChange={(v) => updateField('emailId', v)} error={errors.emailId} placeholder="athlete@example.com" />
              </div>
            </div>

            {/* Contact Details */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Details
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <FormField label="Contact Person Relation" name="contactPersonRelation" type="select" required options={[...CONTACT_PERSON_RELATIONS]} value={formData.contactPersonRelation} onChange={(v) => updateField('contactPersonRelation', v)} error={errors.contactPersonRelation} />
                <FormField label="Contact Person Name" name="contactPersonName" required value={formData.contactPersonName} onChange={(v) => updateField('contactPersonName', v)} error={errors.contactPersonName} maxLength={150} />
                <FormField label="Contact Person Mobile" name="contactPersonMobile" required value={formData.contactPersonMobile} onChange={(v) => updateField('contactPersonMobile', v)} error={errors.contactPersonMobile} placeholder="10-digit mobile" maxLength={10} />
              </div>
            </div>

            {/* Permanent Address */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Permanent Address Details
              </h3>
              <div className="space-y-4">
                <FormField label="Address Field 1" name="addressField1" required value={formData.addressField1} onChange={(v) => updateField('addressField1', v)} error={errors.addressField1} maxLength={250} />
                <FormField label="Address Field 2" name="addressField2" required value={formData.addressField2} onChange={(v) => updateField('addressField2', v)} error={errors.addressField2} maxLength={250} />
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="Pincode / Zipcode" name="pincode" required value={formData.pincode} onChange={(v) => updateField('pincode', v)} error={errors.pincode} placeholder="6-digit code" maxLength={6} />
                  <FormField label="State" name="state" type="select" required options={[...STATES]} value={formData.state} onChange={(v) => updateField('state', v)} error={errors.state} />
                  <div>
                    <label className="form-label">Country</label>
                    <input className="form-input" value="India" disabled />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Link href="/" className="btn btn-outline">Back to Home</Link>
              <button className="btn btn-primary btn-lg" onClick={handleNextStep}>
                Next: Kit Details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Kit Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField label="Kit Size" name="kitSize" type="select" required options={[...KIT_SIZES]} value={formData.kitSize} onChange={(v) => updateField('kitSize', v)} error={errors.kitSize} />
                <FormField
                  label="Shoe Size"
                  name="shoeSize"
                  type="select"
                  required
                  options={shoeSizes}
                  value={formData.shoeSize}
                  onChange={(v) => updateField('shoeSize', v)}
                  error={errors.shoeSize}
                  note={formData.gender ? `Showing ${formData.gender === 'Female' ? 'Women' : 'Men'} sizes based on selected gender` : 'Please select Gender first in General Details'}
                  disabled={!formData.gender}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button className="btn btn-outline" onClick={() => { setStep(1); window.scrollTo(0, 0); }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back: General Details
              </button>
              <button className="btn btn-blue btn-lg" onClick={handlePreview}>
                Preview Application
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
