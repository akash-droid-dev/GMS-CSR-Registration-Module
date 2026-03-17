'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { getRecordById, updateRecordStatus, updateRecord, addAuditLog, getAdminSession, getAuditLogs } from '@/lib/store';
import { ACCESS_AREAS } from '@/lib/constants';
import type { RegistrationRecord, FlaggedField, AuditLogEntry } from '@/lib/types';

export default function RecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagFields, setFlagFields] = useState<FlaggedField[]>([]);
  const [currentFlag, setCurrentFlag] = useState({ fieldName: '', section: '', remark: '' });
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessArea, setAccessArea] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState({ name: '', value: '', label: '' });

  const loadRecord = () => {
    const r = getRecordById(id);
    if (!r) { router.push('/admin/records'); return; }
    setRecord(r);
    setAccessArea(r.accessArea || '');
    setAuditLogs(getAuditLogs(id));
  };

  useEffect(() => { loadRecord(); }, [id, router]);

  if (!record) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div></AdminLayout>;

  const session = getAdminSession();
  const actorName = session?.name || 'Admin';
  const isAthlete = record.category === 'Athlete';
  const canVerify = record.status === 'Submitted – Pending Verification' || record.status === 'Correction Submitted – Pending Verification';
  const canFlag = record.status === 'Submitted – Pending Verification' || record.status === 'Correction Submitted – Pending Verification';

  const handleVerify = () => {
    updateRecordStatus(record.id, 'Verified', { verifiedAt: new Date().toISOString(), verifiedBy: actorName });
    addAuditLog({ recordId: record.id, action: 'Verified', actor: actorName, details: 'Record verified by admin' });
    loadRecord();
  };

  const handleAddFlag = () => {
    if (!currentFlag.fieldName.trim() || !currentFlag.remark.trim()) return;
    setFlagFields(prev => [...prev, { ...currentFlag }]);
    setCurrentFlag({ fieldName: '', section: '', remark: '' });
  };

  const handleSubmitFlags = () => {
    if (flagFields.length === 0) return;
    updateRecord(record.id, { flaggedFields: flagFields, flagRemarks: flagFields.map(f => `${f.fieldName}: ${f.remark}`).join('; ') });
    updateRecordStatus(record.id, 'Flagged for Correction');
    addAuditLog({ recordId: record.id, action: 'Flagged for Correction', actor: actorName, details: `Fields flagged: ${flagFields.map(f => f.fieldName).join(', ')}` });
    setShowFlagModal(false);
    setFlagFields([]);
    loadRecord();
  };

  const handleUpdateAccess = () => {
    const oldArea = record.accessArea || 'None';
    updateRecord(record.id, { accessArea });
    addAuditLog({ recordId: record.id, action: 'Access Area Updated', actor: actorName, details: `Access area changed`, beforeValue: oldArea, afterValue: accessArea });
    setShowAccessModal(false);
    loadRecord();
  };

  const handleEditSave = () => {
    const oldValue = (record as unknown as unknown as Record<string, unknown>)[editField.name] as string || '';
    updateRecord(record.id, { [editField.name]: editField.value } as Partial<RegistrationRecord>);
    addAuditLog({ recordId: record.id, action: 'Field Edited', actor: actorName, details: `${editField.label} updated`, beforeValue: oldValue, afterValue: editField.value });
    setShowEditModal(false);
    loadRecord();
  };

  const openEdit = (name: string, label: string, currentValue: string) => {
    setEditField({ name, value: currentValue, label });
    setShowEditModal(true);
  };

  const allFields = isAthlete ? [
    { section: 'General Details', fields: [
      { name: 'firstName', label: 'First Name', value: record.firstName },
      { name: 'lastName', label: 'Last Name', value: record.lastName },
      { name: 'gender', label: 'Gender', value: record.gender },
      { name: 'dateOfBirth', label: 'Date of Birth', value: (record as unknown as Record<string, unknown>).dateOfBirth as string },
      { name: 'emailId', label: 'Email ID', value: record.emailId },
      { name: 'bloodGroup', label: 'Blood Group', value: (record as unknown as Record<string, unknown>).bloodGroup as string },
    ]},
    { section: 'Contact Details', fields: [
      { name: 'contactPersonRelation', label: 'Contact Person Relation', value: (record as unknown as Record<string, unknown>).contactPersonRelation as string },
      { name: 'contactPersonName', label: 'Contact Person Name', value: (record as unknown as Record<string, unknown>).contactPersonName as string },
      { name: 'contactPersonMobile', label: 'Contact Person Mobile', value: (record as unknown as Record<string, unknown>).contactPersonMobile as string },
    ]},
    { section: 'Permanent Address', fields: [
      { name: 'addressField1', label: 'Address Field 1', value: record.addressField1 },
      { name: 'addressField2', label: 'Address Field 2', value: record.addressField2 },
      { name: 'pincode', label: 'Pincode', value: record.pincode },
      { name: 'state', label: 'State', value: record.state },
      { name: 'country', label: 'Country', value: record.country },
    ]},
    { section: 'Kit Details', fields: [
      { name: 'kitSize', label: 'Kit Size', value: (record as unknown as Record<string, unknown>).kitSize as string },
      { name: 'shoeSize', label: 'Shoe Size', value: (record as unknown as Record<string, unknown>).shoeSize as string },
    ]},
  ] : [
    { section: 'General Details', fields: [
      { name: 'firstName', label: 'First Name', value: record.firstName },
      { name: 'lastName', label: 'Last Name', value: record.lastName },
      { name: 'gender', label: 'Gender', value: record.gender },
      { name: 'designation', label: 'Designation', value: (record as unknown as Record<string, unknown>).designation as string },
      { name: 'mobileNumber', label: 'Mobile Number', value: (record as unknown as Record<string, unknown>).mobileNumber as string },
      { name: 'emailId', label: 'Email ID', value: record.emailId },
    ]},
    { section: 'Permanent Address', fields: [
      { name: 'addressField1', label: 'Address Field 1', value: record.addressField1 },
      { name: 'addressField2', label: 'Address Field 2', value: record.addressField2 },
      { name: 'pincode', label: 'Pincode', value: record.pincode },
      { name: 'state', label: 'State', value: record.state },
      { name: 'country', label: 'Country', value: record.country },
    ]},
  ];

  const allFieldNames = allFields.flatMap(s => s.fields.map(f => ({ name: f.name, label: f.label, section: s.section })));

  return (
    <AdminLayout>
      <div className="animate-fade-in">
        <button onClick={() => router.push('/admin/records')} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Records
        </button>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {record.photo ? (
                <img src={record.photo} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200" />
              ) : (
                <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-500">{record.firstName.charAt(0)}{record.lastName.charAt(0)}</div>
              )}
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">{record.firstName} {record.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    record.category === 'Athlete' ? 'bg-blue-100 text-blue-700' :
                    record.category === 'Support Staff' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                  }`}>{record.category}</span>
                  <span className="text-xs text-slate-500">{record.source}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge ${record.status.includes('Flagged') ? 'badge-flagged' : record.status.includes('Verified') ? 'badge-verified' : record.status.includes('Pending') ? 'badge-pending' : 'badge-correction'}`}>{record.status}</span>
                  {record.accessArea && <span className="badge bg-indigo-100 text-indigo-700">{record.accessArea}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {canVerify && <button onClick={handleVerify} className="btn btn-success text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Verify
              </button>}
              {canFlag && <button onClick={() => setShowFlagModal(true)} className="btn btn-warning text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                Flag for Correction
              </button>}
              <button onClick={() => setShowAccessModal(true)} className="btn btn-blue text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                Access Area
              </button>
            </div>
          </div>
        </div>

        {/* Record Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {allFields.map(section => (
              <div key={section.section} className="card p-6">
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">{section.section}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {section.fields.map(field => (
                    <div key={field.name} className="group">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">{field.label}</p>
                        <button onClick={() => openEdit(field.name, field.label, field.value)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{field.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar: Metadata & Audit */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-3">Record Metadata</h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-xs text-slate-500">Record ID</span><p className="font-mono text-xs">{record.id}</p></div>
                <div><span className="text-xs text-slate-500">Aadhaar Ref</span><p className="font-mono text-xs">****{record.aadhaarRef.slice(-4)}</p></div>
                <div><span className="text-xs text-slate-500">Created</span><p>{new Date(record.createdAt).toLocaleString()}</p></div>
                <div><span className="text-xs text-slate-500">Last Updated</span><p>{new Date(record.updatedAt).toLocaleString()}</p></div>
                {record.verifiedAt && <div><span className="text-xs text-slate-500">Verified</span><p>{new Date(record.verifiedAt).toLocaleString()} by {record.verifiedBy}</p></div>}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-3">Activity Log</h3>
              <div className="space-y-3">
                {auditLogs.length === 0 ? <p className="text-sm text-slate-500">No activity recorded</p> : auditLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="border-l-2 border-slate-200 pl-3 py-1">
                    <p className="text-xs font-semibold text-slate-700">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.actor} — {new Date(log.timestamp).toLocaleString()}</p>
                    {log.details && <p className="text-xs text-slate-400">{log.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flag Modal */}
        {showFlagModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Flag for Correction</h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Field to Flag</label>
                  <select className="form-input text-sm" value={currentFlag.fieldName} onChange={(e) => {
                    const sel = allFieldNames.find(f => f.name === e.target.value);
                    setCurrentFlag({ fieldName: e.target.value, section: sel?.section || '', remark: '' });
                  }}>
                    <option value="">Select Field</option>
                    {allFieldNames.map(f => <option key={f.name} value={f.name}>{f.label} ({f.section})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Remark <span className="required">*</span></label>
                  <textarea className="form-input text-sm" rows={2} placeholder="Enter correction remark..." value={currentFlag.remark} onChange={(e) => setCurrentFlag(prev => ({ ...prev, remark: e.target.value }))} />
                </div>
                <button onClick={handleAddFlag} disabled={!currentFlag.fieldName || !currentFlag.remark.trim()} className="btn btn-blue text-sm">Add Flag</button>

                {flagFields.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-semibold mb-2">Flagged Fields ({flagFields.length})</p>
                    {flagFields.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-orange-50 rounded p-2 mb-2 text-sm">
                        <div><span className="font-medium">{f.fieldName}</span>: {f.remark}</div>
                        <button onClick={() => setFlagFields(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => { setShowFlagModal(false); setFlagFields([]); }} className="btn btn-outline text-sm">Cancel</button>
                <button onClick={handleSubmitFlags} disabled={flagFields.length === 0} className="btn btn-warning text-sm">Submit Flags</button>
              </div>
            </div>
          </div>
        )}

        {/* Access Area Modal */}
        {showAccessModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Update Access Area</h3>
              <select className="form-input mb-4" value={accessArea} onChange={(e) => setAccessArea(e.target.value)}>
                <option value="">Select Access Area</option>
                {ACCESS_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAccessModal(false)} className="btn btn-outline text-sm">Cancel</button>
                <button onClick={handleUpdateAccess} className="btn btn-blue text-sm">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Field Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Edit {editField.label}</h3>
              <input className="form-input mb-4" value={editField.value} onChange={(e) => setEditField(prev => ({ ...prev, value: e.target.value }))} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowEditModal(false)} className="btn btn-outline text-sm">Cancel</button>
                <button onClick={handleEditSave} className="btn btn-blue text-sm">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
