// Master Data Constants - CSR Registration Module
// Per BRD/FRD v3.0 Production Release

export const BLOOD_GROUPS = ['A+', 'A–', 'B+', 'B–', 'O+', 'O–', 'AB+', 'AB–'] as const;

export const CONTACT_PERSON_RELATIONS = [
  'Elder Brother', 'Elder Sister', 'Mother', 'Father', 'Guardian'
] as const;

export const KIT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export const GENDERS = ['Male', 'Female'] as const;

export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
] as const;

export const WOMEN_SHOE_SIZES = [
  'W-UK2', 'W-UK2.5', 'W-UK3', 'W-UK3.5', 'W-UK4', 'W-UK4.5',
  'W-UK5', 'W-UK5.5', 'W-UK6', 'W-UK6.5', 'W-UK7', 'W-UK7.5',
  'W-UK8', 'W-UK8.5', 'W-UK9', 'W-UK9.5', 'W-UK10'
] as const;

export const MEN_SHOE_SIZES = [
  'M-UK5.5', 'M-UK6', 'M-UK6.5', 'M-UK7', 'M-UK7.5', 'M-UK8',
  'M-UK8.5', 'M-UK9', 'M-UK9.5', 'M-UK10', 'M-UK10.5', 'M-UK11',
  'M-UK11.5', 'M-UK12.5', 'M-UK13.5', 'M-UK14.5', 'M-UK15.5'
] as const;

export const ACCESS_AREAS = [
  'Zone A - VIP Area', 'Zone B - Competition Area', 'Zone C - Training Area',
  'Zone D - Media Area', 'Zone E - General Area', 'Zone F - Accommodation Area'
] as const;

export const REGISTRATION_STATUSES = {
  DRAFT: 'Draft / In Progress',
  SUBMITTED: 'Submitted – Pending Verification',
  FLAGGED: 'Flagged for Correction',
  CORRECTION_SUBMITTED: 'Correction Submitted – Pending Verification',
  VERIFIED: 'Verified',
  VERIFIED_BULK: 'Verified – Bulk Upload',
  VERIFIED_ADMIN: 'Verified – Admin Entry',
} as const;

export const REGISTRATION_SOURCES = {
  SELF: 'Self-Registration',
  BULK: 'Bulk Upload',
  ADMIN: 'Admin Manual Entry',
} as const;

export const CATEGORIES = {
  ATHLETE: 'Athlete',
  SUPPORT_STAFF: 'Support Staff',
  TECHNICAL_OFFICIAL: 'Technical Official',
} as const;

export const SUPPORT_NOTE = 'If you experience any difficulty during the authentication process, please contact our support team at +91-11-2345-6789 or +91-11-2345-6790.';

export const SUBMISSION_MESSAGE = 'Thank you for completing your registration. Your application has been successfully submitted and is currently undergoing verification. You will receive an email notification once the verification process is complete.';

export const BULK_UPLOAD_COLUMNS = [
  'Photo Upload (Front Facing Image through Drive Link)',
  'First Name', 'Last Name', 'Date of Birth (dd/mm/yyyy)', 'Gender',
  'Email ID', 'Blood Group', 'Contact Person Relation', 'Contact Person Name',
  'Contact Person Mobile Number', 'Address Field 1', 'Address Field 2',
  'Pincode / Zipcode', 'State', 'Country', 'Kit Size', 'Shoe Size'
] as const;

// Admin credentials
export const ADMIN_CREDENTIALS = {
  loginId: 'admin@gms.gov.in',
  password: 'GMS@Admin2026#Secure',
  name: 'System Administrator',
  role: 'Super Admin',
};
