import { v4 as uuidv4 } from 'uuid';
import type { RegistrationRecord, AuditLogEntry, BulkUploadBatch, AdminSession } from './types';

const RECORDS_KEY = 'gms_csr_records';
const AUDIT_KEY = 'gms_csr_audit';
const BATCHES_KEY = 'gms_csr_batches';
const ADMIN_SESSION_KEY = 'gms_admin_session';
const CURRENT_REG_KEY = 'gms_current_registration';
const AUTH_SESSION_KEY = 'gms_auth_session';

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

// Records
export function getAllRecords(): RegistrationRecord[] {
  return getFromStorage<RegistrationRecord[]>(RECORDS_KEY, []);
}

export function getRecordById(id: string): RegistrationRecord | undefined {
  return getAllRecords().find(r => r.id === id);
}

export function getRecordByAadhaarAndCategory(aadhaarRef: string, category: string): RegistrationRecord | undefined {
  return getAllRecords().find(r => r.aadhaarRef === aadhaarRef && r.category === category);
}

export function saveRecord(record: RegistrationRecord): RegistrationRecord {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    records[idx] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    records.push({ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setToStorage(RECORDS_KEY, records);
  return record;
}

export function saveMultipleRecords(newRecords: RegistrationRecord[]): void {
  const records = getAllRecords();
  records.push(...newRecords);
  setToStorage(RECORDS_KEY, records);
}

export function updateRecordStatus(id: string, status: RegistrationRecord['status'], extras?: Partial<RegistrationRecord>): void {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...extras, status, updatedAt: new Date().toISOString() } as RegistrationRecord;
    setToStorage(RECORDS_KEY, records);
  }
}

export function updateRecord(id: string, updates: Partial<RegistrationRecord>): void {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx >= 0) {
    records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() } as RegistrationRecord;
    setToStorage(RECORDS_KEY, records);
  }
}

// Audit Log
export function getAuditLogs(recordId?: string): AuditLogEntry[] {
  const logs = getFromStorage<AuditLogEntry[]>(AUDIT_KEY, []);
  if (recordId) return logs.filter(l => l.recordId === recordId);
  return logs;
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const logs = getFromStorage<AuditLogEntry[]>(AUDIT_KEY, []);
  logs.push({ ...entry, id: uuidv4(), timestamp: new Date().toISOString() });
  setToStorage(AUDIT_KEY, logs);
}

// Bulk Upload Batches
export function getBatches(): BulkUploadBatch[] {
  return getFromStorage<BulkUploadBatch[]>(BATCHES_KEY, []);
}

export function saveBatch(batch: BulkUploadBatch): void {
  const batches = getBatches();
  batches.push(batch);
  setToStorage(BATCHES_KEY, batches);
}

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
