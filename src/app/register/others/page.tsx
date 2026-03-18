'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AadhaarAuth from '@/components/AadhaarAuth';
import FormField from '@/components/FormField';
import { GENDERS, STATES } from '@/lib/constants';
import { validateOthersForm } from '@/lib/validators';
import { setAuthSession, getAuthSession, setCurrentRegistration, fetchAllRecords } from '@/lib/store';
import type { Category } from '@/lib/types';

export default function OthersRegistration() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [aadhaarRef, setAadhaarRef] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Support Staff' | 'Technical Official' | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingExisting, setCheckingExisting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const checkExistingRecords = async (aadhaar: string, categories: Category[]): Promise<boolean> => {
    setCheckingExisting(true);
    try {
      for (const cat of categories) {
        const { records } = await fetchAllRecords({ search: aadhaar, category: cat });
        const existing = records.find(r => r.aadhaarRef === aadhaar && r.category === cat);
        if (existing && existing.status === 'Flagged for Correction') {
          router.push('/register/correction?id=' + existing.id);
          return true;
        }
        if (existing && (existing.status === 'Submitted – Pending Verification' || existing.status === 'Correction Submitted – Pending Verification' || existing.status.startsWith('Verified'))) {
          router.push('/register/confirmation?status=' + encodeURIComponent(existing.status) + '&id=' + existing.id);
          return true;
        }
      }
    } catch (err) {
      console.error('Failed to check existing records:', err);
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
    setAuthSession({ aadhaarRef: ref, route: 'others' });
    // Check for existing records in both categories
    await checkExistingRecords(ref, ['Support Staff', 'Technical Official']);
  };

  const handleCategorySelect = async (cat: 'Support Staff' | 'Technical Official') => {
    // Check for existing record
    const redirected = await checkExistingRecords(aadhaarRef, [cat]);
    if (redirected) return;
    setSelectedCategory(cat);
    setAuthSession({ aadhaarRef, route: 'others', category: cat });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) { setErrors(prev => ({ ...prev, photo: 'Photo must be JPG, JPEG, or PNG' })); return; }
      if (file.size > 2 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Photo must not exceed 2 MB' })); return; }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      if (errors.photo) setErrors(prev => { const n = { ...prev }; delete n.photo; return n; });
    }
  };

  const handlePreview = () => {
    const errs = validateOthersForm(formData, photoFile, !!photoPreview);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setCurrentRegistration({
      ...formData,
      photo: photoPreview,
      aadhaarRef,
      category: selectedCategory!,
      route: 'others',
    });
    router.push('/register/preview');
  };

  if (!authenticated) {
    return <AadhaarAuth route="others" onSuccess={handleAuthSuccess} />;
  }

  if (checkingExisting) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  // Category Selection - SCR-05
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        <header className="bg-[#1e3a5f] text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/" className="flex items-center gap-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-bold">GMS — Others Registration</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-3xl w-full animate-fade-in">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                Aadhaar Verified
              </div>
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">Select Your Category</h2>
              <p className="text-slate-600">Choose one category to proceed with registration. This selection is final for this session.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <button onClick={() => handleCategorySelect('Support Staff')} className="group text-left">
                <div className="card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200 h-full">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-200 transition">
                    <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Support Staff</h3>
                  <p className="text-slate-600 text-sm">Register as support staff for the Games event.</p>
                </div>
              </button>
              <button onClick={() => handleCategorySelect('Technical Official')} className="group text-left">
                <div className="card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-teal-200 h-full">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-200 transition">
                    <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Technical Official</h3>
                  <p className="text-slate-600 text-sm">Register as a technical official for the Games event.</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Support Staff / Technical Official Form - SCR-06 / SCR-07
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-bold">GMS — {selectedCategory} Registration</span>
            </Link>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedCategory === 'Support Staff' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>
              {selectedCategory}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="space-y-8 animate-fade-in">
          {/* General Details */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              General Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Photo Upload <span className="required">*</span></label>
                <p className="text-xs text-slate-500 mb-2">Kindly attach Front Face Photo. Accepted: JPG, JPEG, PNG (Max 2 MB)</p>
                <div className="flex items-center gap-4">
                  {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200" />}
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
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Gender" name="gender" type="select" required options={[...GENDERS]} value={formData.gender} onChange={(v) => updateField('gender', v)} error={errors.gender} />
                <FormField label="Designation" name="designation" required value={formData.designation} onChange={(v) => updateField('designation', v)} error={errors.designation} maxLength={150} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Mobile Number" name="mobileNumber" required value={formData.mobileNumber} onChange={(v) => updateField('mobileNumber', v)} error={errors.mobileNumber} placeholder="10-digit mobile" maxLength={10} />
                <FormField label="Email ID" name="emailId" required value={formData.emailId} onChange={(v) => updateField('emailId', v)} error={errors.emailId} placeholder="email@example.com" />
              </div>
            </div>
          </div>

          {/* Permanent Address */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
            <button className="btn btn-blue btn-lg" onClick={handlePreview}>
              Preview Application
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
