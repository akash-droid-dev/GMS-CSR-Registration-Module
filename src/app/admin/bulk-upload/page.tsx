'use client';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AdminLayout from '@/components/AdminLayout';
import { BULK_UPLOAD_COLUMNS, BLOOD_GROUPS, CONTACT_PERSON_RELATIONS, KIT_SIZES, STATES, GENDERS, WOMEN_SHOE_SIZES, MEN_SHOE_SIZES, REGISTRATION_STATUSES, REGISTRATION_SOURCES } from '@/lib/constants';
import { saveMultipleRecords, saveBatch, addAuditLog, getAdminSession, getAllRecords } from '@/lib/store';
import type { AthleteRecord, BulkUploadBatch, BulkUploadError } from '@/lib/types';
import * as XLSX from 'xlsx';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<BulkUploadBatch | null>(null);
  const [error, setError] = useState('');

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([BULK_UPLOAD_COLUMNS as unknown as string[]]);
    // Add sample row
    const sampleRow = [
      'https://drive.google.com/photo-link',
      'John', 'Doe', '15/06/2000', 'Male', 'john@example.com',
      'A+', 'Father', 'Robert Doe', '9876543210',
      '123 Main Street', 'Apt 4B', '400001', 'Maharashtra', 'India',
      'L', 'M-UK9'
    ];
    XLSX.utils.sheet_add_aoa(ws, [sampleRow], { origin: 'A2' });
    XLSX.utils.book_append_sheet(wb, ws, 'Athletes');
    XLSX.writeFile(wb, 'GMS_Athlete_Bulk_Upload_Template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10 MB');
        return;
      }
      setFile(f);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (rows.length < 2) {
        setError('File is empty or contains only headers.');
        setProcessing(false);
        return;
      }

      // Validate headers
      const headers = rows[0].map(h => (h || '').toString().trim());
      const expectedHeaders = [...BULK_UPLOAD_COLUMNS];
      for (let i = 0; i < expectedHeaders.length; i++) {
        if (headers[i] !== expectedHeaders[i]) {
          setError(`Structural error: Column ${i + 1} expected "${expectedHeaders[i]}" but found "${headers[i] || '(missing)'}". Upload rejected.`);
          setProcessing(false);
          return;
        }
      }
      if (headers.length !== expectedHeaders.length) {
        setError(`Structural error: Expected ${expectedHeaders.length} columns but found ${headers.length}. Upload rejected.`);
        setProcessing(false);
        return;
      }

      const session = getAdminSession();
      const existingRecords = getAllRecords();
      const errors: BulkUploadError[] = [];
      const validRecords: AthleteRecord[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.every(c => !c || !c.toString().trim())) continue;

        const val = (idx: number) => (row[idx] || '').toString().trim();
        const rowNum = i + 1;
        let hasError = false;
        const addErr = (col: string, reason: string) => { errors.push({ row: rowNum, column: col, reason }); hasError = true; };

        // Validate each column
        if (!val(1)) addErr('First Name', 'Required');
        if (!val(2)) addErr('Last Name', 'Required');
        if (!val(3)) addErr('Date of Birth', 'Required');
        else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val(3))) addErr('Date of Birth', 'Format must be dd/mm/yyyy');
        if (!val(4)) addErr('Gender', 'Required');
        else if (![...GENDERS].includes(val(4) as typeof GENDERS[number])) addErr('Gender', `Invalid value. Must be: ${GENDERS.join(', ')}`);
        if (!val(5)) addErr('Email ID', 'Required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val(5))) addErr('Email ID', 'Invalid email format');
        if (!val(6)) addErr('Blood Group', 'Required');
        else if (![...BLOOD_GROUPS].includes(val(6) as typeof BLOOD_GROUPS[number])) addErr('Blood Group', `Invalid value`);
        if (!val(7)) addErr('Contact Person Relation', 'Required');
        else if (![...CONTACT_PERSON_RELATIONS].includes(val(7) as typeof CONTACT_PERSON_RELATIONS[number])) addErr('Contact Person Relation', 'Invalid value');
        if (!val(8)) addErr('Contact Person Name', 'Required');
        if (!val(9)) addErr('Contact Person Mobile Number', 'Required');
        else if (!/^[6-9]\d{9}$/.test(val(9))) addErr('Contact Person Mobile Number', 'Must be valid 10-digit Indian mobile');
        if (!val(10)) addErr('Address Field 1', 'Required');
        if (!val(11)) addErr('Address Field 2', 'Required');
        if (!val(12)) addErr('Pincode / Zipcode', 'Required');
        else if (!/^\d{6}$/.test(val(12))) addErr('Pincode / Zipcode', 'Must be 6-digit code');
        if (!val(13)) addErr('State', 'Required');
        else if (![...STATES].includes(val(13) as typeof STATES[number])) addErr('State', 'Invalid state');
        if (val(14) && val(14) !== 'India') addErr('Country', 'Must be India');
        if (!val(15)) addErr('Kit Size', 'Required');
        else if (![...KIT_SIZES].includes(val(15) as typeof KIT_SIZES[number])) addErr('Kit Size', 'Invalid value');
        if (!val(16)) addErr('Shoe Size', 'Required');
        else {
          const gender = val(4);
          const validSizes: string[] = gender === 'Female' ? [...WOMEN_SHOE_SIZES] : [...MEN_SHOE_SIZES];
          if (!validSizes.includes(val(16))) addErr('Shoe Size', 'Invalid shoe size for gender');
        }

        // Duplicate check
        const emailExists = existingRecords.some(r => r.emailId.toLowerCase() === val(5).toLowerCase() && r.category === 'Athlete');
        if (emailExists) addErr('Email ID', 'Duplicate: athlete with this email already exists');

        if (!hasError) {
          const id = uuidv4();
          const now = new Date().toISOString();
          validRecords.push({
            id,
            category: 'Athlete',
            source: REGISTRATION_SOURCES.BULK as AthleteRecord['source'],
            status: REGISTRATION_STATUSES.VERIFIED_BULK as AthleteRecord['status'],
            aadhaarRef: 'BULK-' + id.slice(0, 8),
            photo: val(0),
            firstName: val(1),
            lastName: val(2),
            dateOfBirth: val(3),
            gender: val(4) as 'Male' | 'Female',
            emailId: val(5).toLowerCase(),
            bloodGroup: val(6),
            contactPersonRelation: val(7),
            contactPersonName: val(8),
            contactPersonMobile: val(9),
            addressField1: val(10),
            addressField2: val(11),
            pincode: val(12),
            state: val(13),
            country: val(14) || 'India',
            kitSize: val(15),
            shoeSize: val(16),
            createdAt: now,
            updatedAt: now,
            verifiedAt: now,
            verifiedBy: session?.name || 'Admin (Bulk Upload)',
          });
        }
      }

      // Save valid records
      if (validRecords.length > 0) saveMultipleRecords(validRecords);

      // Save batch info
      const batch: BulkUploadBatch = {
        id: uuidv4(),
        fileName: file.name,
        fileSize: file.size,
        totalRows: rows.length - 1,
        successCount: validRecords.length,
        errorCount: errors.length,
        errors,
        uploadedBy: session?.name || 'Admin',
        uploadedAt: new Date().toISOString(),
      };
      saveBatch(batch);

      // Audit logs for each imported record
      validRecords.forEach(r => {
        addAuditLog({ recordId: r.id, action: 'Bulk Upload Import', actor: session?.name || 'Admin', details: `Athlete imported from bulk upload: ${file.name}` });
      });

      setResult(batch);
    } catch (err) {
      setError('Failed to process file. Please ensure it is a valid Excel file (.xlsx).');
    }
    setProcessing(false);
  };

  return (
    <AdminLayout>
      <div className="animate-fade-in max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Athlete Bulk Upload</h2>
          <p className="text-slate-600 text-sm mt-1">Upload athletes using the approved Excel template. Valid records will be created directly in Verified status.</p>
        </div>

        {/* Help / Demo Area */}
        <div className="card p-6 mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Template &amp; Instructions
          </h3>
          <p className="text-sm text-blue-800 mb-3">Download the approved template below. The file must contain exactly 17 columns in the specified order. Any deviation will cause the upload to be rejected.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadTemplate} className="btn btn-blue text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download Template (.xlsx)
            </button>
          </div>
          <div className="mt-3 text-xs text-blue-700">
            <p className="font-semibold">Required columns (in order):</p>
            <p className="mt-1">{BULK_UPLOAD_COLUMNS.join(' | ')}</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-[#1e3a5f] mb-4">Upload File</h3>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" id="bulk-upload" />
            <label htmlFor="bulk-upload" className="cursor-pointer">
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="text-slate-600 font-medium">Click to select file or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">Excel files only (.xlsx) — Max 10 MB</p>
            </label>
          </div>
          {file && (
            <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={handleUpload} disabled={processing} className="btn btn-success text-sm">
                {processing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Processing...
                  </span>
                ) : 'Upload & Validate'}
              </button>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <p className="font-semibold">Upload Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="card p-6 animate-fade-in">
            <h3 className="font-bold text-[#1e3a5f] mb-4">Upload Results</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">{result.totalRows}</p>
                <p className="text-xs text-slate-500">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                <p className="text-xs text-green-700">Successfully Imported</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
                <p className="text-xs text-red-700">Failed Rows</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-red-700 mb-2">Error Details</h4>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50 sticky top-0"><tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Row</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Column</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Reason</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {result.errors.map((err, i) => (
                        <tr key={i} className="text-xs">
                          <td className="px-3 py-2 font-mono">{err.row}</td>
                          <td className="px-3 py-2">{err.column}</td>
                          <td className="px-3 py-2 text-red-600">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
