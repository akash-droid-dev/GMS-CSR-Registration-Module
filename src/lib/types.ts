export type Category = 'Athlete' | 'Support Staff' | 'Technical Official';
export type RegistrationSource = 'Self-Registration' | 'Bulk Upload' | 'Admin Manual Entry';
export type Gender = 'Male' | 'Female';

export type RegistrationStatus =
  | 'Draft / In Progress'
  | 'Submitted – Pending Verification'
  | 'Flagged for Correction'
  | 'Correction Submitted – Pending Verification'
  | 'Verified'
  | 'Verified – Bulk Upload'
  | 'Verified – Admin Entry';

export interface AthleteRecord {
  id: string;
  category: 'Athlete';
  source: RegistrationSource;
  status: RegistrationStatus;
  aadhaarRef: string;
  // General Details
  photo: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  emailId: string;
  bloodGroup: string;
  // Contact Details
  contactPersonRelation: string;
  contactPersonName: string;
  contactPersonMobile: string;
  // Permanent Address
  addressField1: string;
  addressField2: string;
  pincode: string;
  state: string;
  country: string;
  // Kit Details
  kitSize: string;
  shoeSize: string;
  // Access Area
  accessArea?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  // Correction
  flaggedFields?: FlaggedField[];
  flagRemarks?: string;
}

export interface SupportStaffRecord {
  id: string;
  category: 'Support Staff';
  source: RegistrationSource;
  status: RegistrationStatus;
  aadhaarRef: string;
  // General Details
  photo: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  designation: string;
  mobileNumber: string;
  emailId: string;
  // Permanent Address
  addressField1: string;
  addressField2: string;
  pincode: string;
  state: string;
  country: string;
  // Access Area
  accessArea?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  // Correction
  flaggedFields?: FlaggedField[];
  flagRemarks?: string;
}

export interface TechnicalOfficialRecord {
  id: string;
  category: 'Technical Official';
  source: RegistrationSource;
  status: RegistrationStatus;
  aadhaarRef: string;
  // General Details
  photo: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  designation: string;
  mobileNumber: string;
  emailId: string;
  // Permanent Address
  addressField1: string;
  addressField2: string;
  pincode: string;
  state: string;
  country: string;
  // Access Area
  accessArea?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  // Correction
  flaggedFields?: FlaggedField[];
  flagRemarks?: string;
}

export type RegistrationRecord = AthleteRecord | SupportStaffRecord | TechnicalOfficialRecord;

export interface FlaggedField {
  fieldName: string;
  section: string;
  remark: string;
}

export interface AuditLogEntry {
  id: string;
  recordId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface BulkUploadBatch {
  id: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: BulkUploadError[];
  uploadedBy: string;
  uploadedAt: string;
}

export interface BulkUploadError {
  row: number;
  column: string;
  reason: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  loginId: string;
  name: string;
  role: string;
  loginTime: string;
}
