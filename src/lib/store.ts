import type { RegistrationRecord, AuditLogEntry, BulkUploadBatch, AdminSession } from './types';

const RECORDS_KEY = 'gms_records';
const AUDIT_KEY = 'gms_audit_logs';
const BATCHES_KEY = 'gms_batches';
const ADMIN_SESSION_KEY = 'gms_admin_session';
const CURRENT_REG_KEY = 'gms_current_registration';
const AUTH_SESSION_KEY = 'gms_auth_session';
const USER_SESSION_KEY = 'gms_user_session';

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== Record Operations =====

export function getAllRecords(): RegistrationRecord[] {
  return getFromStorage<RegistrationRecord[]>(RECORDS_KEY, []);
}

export async function fetchAllRecords(filters?: {
  category?: string;
  status?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ records: RegistrationRecord[]; total: number }> {
  let records = getAllRecords();
  if (filters?.category) records = records.filter(r => r.category === filters.category);
  if (filters?.status) records = records.filter(r => r.status === filters.status);
  if (filters?.source) records = records.filter(r => r.source === filters.source);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    records = records.filter(r =>
      r.firstName.toLowerCase().includes(s) ||
      r.lastName.toLowerCase().includes(s) ||
      r.emailId.toLowerCase().includes(s) ||
      r.id.toLowerCase().includes(s) ||
      r.aadhaarRef.toLowerCase().includes(s)
    );
  }
  const total = records.length;
  if (filters?.offset) records = records.slice(filters.offset);
  if (filters?.limit) records = records.slice(0, filters.limit);
  return { records, total };
}

export function getRecordById(id: string): RegistrationRecord | undefined {
  return getAllRecords().find(r => r.id === id);
}

export async function fetchRecordById(id: string): Promise<RegistrationRecord | null> {
  return getRecordById(id) || null;
}

export function getRecordByAadhaarAndCategory(aadhaarRef: string, category: string): RegistrationRecord | undefined {
  return getAllRecords().find(r => r.aadhaarRef === aadhaarRef && r.category === category);
}

export async function saveRecord(record: RegistrationRecord): Promise<void> {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  setToStorage(RECORDS_KEY, records);
}

export async function saveMultipleRecords(newRecords: RegistrationRecord[]): Promise<void> {
  const records = getAllRecords();
  for (const r of newRecords) {
    const idx = records.findIndex(ex => ex.id === r.id);
    if (idx >= 0) records[idx] = r;
    else records.push(r);
  }
  setToStorage(RECORDS_KEY, records);
}

export async function updateRecord(id: string, updates: Partial<Record<string, unknown>>, audit?: {
  action: string;
  actor: string;
  details?: string;
  beforeValue?: string;
  afterValue?: string;
}): Promise<RegistrationRecord> {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx < 0) throw new Error('Record not found');
  const updated = { ...records[idx], ...updates, updatedAt: new Date().toISOString() } as RegistrationRecord;
  records[idx] = updated;
  setToStorage(RECORDS_KEY, records);
  if (audit) {
    await addAuditLog({
      recordId: id,
      action: audit.action,
      actor: audit.actor,
      details: audit.details || '',
      beforeValue: audit.beforeValue,
      afterValue: audit.afterValue,
    });
  }
  return updated;
}

export async function updateRecordStatus(
  id: string,
  status: RegistrationRecord['status'],
  extras?: Partial<Record<string, unknown>>,
  audit?: { action: string; actor: string; details?: string; beforeValue?: string; afterValue?: string }
): Promise<void> {
  await updateRecord(id, { status, ...extras }, audit);
}

// ===== Audit Log Operations =====

export function getAuditLogs(recordId?: string): AuditLogEntry[] {
  const all = getFromStorage<AuditLogEntry[]>(AUDIT_KEY, []);
  if (recordId) return all.filter(l => l.recordId === recordId);
  return all;
}

export async function fetchAuditLogs(recordId?: string): Promise<AuditLogEntry[]> {
  return getAuditLogs(recordId);
}

export async function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const logs = getFromStorage<AuditLogEntry[]>(AUDIT_KEY, []);
  logs.push({
    ...entry,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
  });
  setToStorage(AUDIT_KEY, logs);
}

// ===== Bulk Upload =====

export function getBatches(): BulkUploadBatch[] {
  return getFromStorage<BulkUploadBatch[]>(BATCHES_KEY, []);
}

export function saveBatch(batch: BulkUploadBatch): void {
  const batches = getBatches();
  batches.push(batch);
  setToStorage(BATCHES_KEY, batches);
}

export async function bulkUpload(records: RegistrationRecord[], batch: BulkUploadBatch): Promise<{
  inserted: number;
  duplicates: number;
  duplicateDetails: string[];
}> {
  const existing = getAllRecords();
  const duplicateDetails: string[] = [];
  const toInsert: RegistrationRecord[] = [];
  for (const r of records) {
    const dup = existing.find(e => e.emailId.toLowerCase() === r.emailId.toLowerCase() && e.category === r.category);
    if (dup) {
      duplicateDetails.push(`${r.emailId} (${r.category})`);
    } else {
      toInsert.push(r);
    }
  }
  await saveMultipleRecords(toInsert);
  saveBatch(batch);
  return { inserted: toInsert.length, duplicates: duplicateDetails.length, duplicateDetails };
}

// ===== Stats =====

export async function fetchStats(): Promise<Record<string, number>> {
  const records = getAllRecords();
  return {
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
}

// ===== Client-only localStorage Operations =====

// Admin Session
export function getAdminSession(): AdminSession | null {
  return getFromStorage<AdminSession | null>(ADMIN_SESSION_KEY, null);
}

export function setAdminSession(session: AdminSession | null): void {
  setToStorage(ADMIN_SESSION_KEY, session);
}

// Current Registration (in-progress form data)
export function getCurrentRegistration(): Record<string, unknown> | null {
  return getFromStorage<Record<string, unknown> | null>(CURRENT_REG_KEY, null);
}

export function setCurrentRegistration(data: Record<string, unknown> | null): void {
  setToStorage(CURRENT_REG_KEY, data);
}

// Auth Session (Aadhaar authenticated session for public flow)
export function getAuthSession(): { aadhaarRef: string; route: string; category?: string } | null {
  return getFromStorage<{ aadhaarRef: string; route: string; category?: string } | null>(AUTH_SESSION_KEY, null);
}

export function setAuthSession(data: { aadhaarRef: string; route: string; category?: string } | null): void {
  setToStorage(AUTH_SESSION_KEY, data);
}

// User Session (for registered user login)
export function getUserSession(): { isAuthenticated: boolean; recordId: string; email: string; name: string; category: string; loginTime: string } | null {
  return getFromStorage<{ isAuthenticated: boolean; recordId: string; email: string; name: string; category: string; loginTime: string } | null>(USER_SESSION_KEY, null);
}

export function setUserSession(data: { isAuthenticated: boolean; recordId: string; email: string; name: string; category: string; loginTime: string } | null): void {
  setToStorage(USER_SESSION_KEY, data);
}

// Generate login password for verified user
export function generateUserPassword(record: { firstName: string; lastName: string; aadhaarRef: string }): string {
  const namePart = (record.firstName.slice(0, 2) + record.lastName.slice(0, 2)).toUpperCase();
  const aadhaarPart = record.aadhaarRef.slice(-4);
  return 'GMS' + namePart + aadhaarPart + '!';
}
