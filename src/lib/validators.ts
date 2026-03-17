import { BLOOD_GROUPS, CONTACT_PERSON_RELATIONS, KIT_SIZES, STATES, WOMEN_SHOE_SIZES, MEN_SHOE_SIZES, GENDERS } from './constants';

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email ID is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Invalid email format';
  return null;
}

export function validateMobile(mobile: string): string | null {
  if (!mobile.trim()) return 'Mobile number is required';
  if (!/^[6-9]\d{9}$/.test(mobile.trim())) return 'Must be a valid 10-digit Indian mobile number starting with 6-9';
  return null;
}

export function validatePincode(pincode: string): string | null {
  if (!pincode.trim()) return 'Pincode is required';
  if (!/^\d{6}$/.test(pincode.trim())) return 'Must be a valid 6-digit Indian postal code';
  return null;
}

export function validateDateOfBirth(dob: string): string | null {
  if (!dob.trim()) return 'Date of Birth is required';
  const re = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dob.trim().match(re);
  if (!match) return 'Format must be dd/mm/yyyy';
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return 'Invalid calendar date';
  }
  if (date > new Date()) return 'Date of Birth cannot be in the future';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return null;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value && value.length > max) return `${fieldName} must not exceed ${max} characters`;
  return null;
}

export function validateDropdown(value: string, options: readonly string[], fieldName: string): string | null {
  if (!value) return `${fieldName} is required`;
  if (!options.includes(value)) return `Invalid ${fieldName} value`;
  return null;
}

export function validatePhoto(file: File | null): string | null {
  if (!file) return 'Photo is required';
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowed.includes(file.type)) return 'Photo must be JPG, JPEG, or PNG';
  if (file.size > 2 * 1024 * 1024) return 'Photo must not exceed 2 MB';
  return null;
}

export function validateAthleteStep1(data: Record<string, string>, photoFile: File | null, hasExistingPhoto: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!hasExistingPhoto) {
    const photoErr = validatePhoto(photoFile);
    if (photoErr) errors.photo = photoErr;
  }
  const req = (field: string, name: string, max?: number) => {
    const e = validateRequired(data[field] || '', name);
    if (e) { errors[field] = e; return; }
    if (max) { const me = validateMaxLength(data[field] || '', max, name); if (me) errors[field] = me; }
  };
  req('firstName', 'First Name', 100);
  req('lastName', 'Last Name', 100);
  const gErr = validateDropdown(data.gender || '', [...GENDERS], 'Gender');
  if (gErr) errors.gender = gErr;
  const dobErr = validateDateOfBirth(data.dateOfBirth || '');
  if (dobErr) errors.dateOfBirth = dobErr;
  const emailErr = validateEmail(data.emailId || '');
  if (emailErr) errors.emailId = emailErr;
  const bgErr = validateDropdown(data.bloodGroup || '', [...BLOOD_GROUPS], 'Blood Group');
  if (bgErr) errors.bloodGroup = bgErr;
  const crErr = validateDropdown(data.contactPersonRelation || '', [...CONTACT_PERSON_RELATIONS], 'Contact Person Relation');
  if (crErr) errors.contactPersonRelation = crErr;
  req('contactPersonName', 'Contact Person Name', 150);
  const mErr = validateMobile(data.contactPersonMobile || '');
  if (mErr) errors.contactPersonMobile = mErr;
  req('addressField1', 'Address Field 1', 250);
  req('addressField2', 'Address Field 2', 250);
  const pErr = validatePincode(data.pincode || '');
  if (pErr) errors.pincode = pErr;
  const sErr = validateDropdown(data.state || '', [...STATES], 'State');
  if (sErr) errors.state = sErr;
  return errors;
}

export function validateAthleteStep2(data: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  const ksErr = validateDropdown(data.kitSize || '', [...KIT_SIZES], 'Kit Size');
  if (ksErr) errors.kitSize = ksErr;
  const gender = data.gender;
  const shoeSizes = gender === 'Female' ? [...WOMEN_SHOE_SIZES] : [...MEN_SHOE_SIZES];
  const ssErr = validateDropdown(data.shoeSize || '', shoeSizes, 'Shoe Size');
  if (ssErr) errors.shoeSize = ssErr;
  return errors;
}

export function validateOthersForm(data: Record<string, string>, photoFile: File | null, hasExistingPhoto: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!hasExistingPhoto) {
    const photoErr = validatePhoto(photoFile);
    if (photoErr) errors.photo = photoErr;
  }
  const req = (field: string, name: string, max?: number) => {
    const e = validateRequired(data[field] || '', name);
    if (e) { errors[field] = e; return; }
    if (max) { const me = validateMaxLength(data[field] || '', max, name); if (me) errors[field] = me; }
  };
  req('firstName', 'First Name', 100);
  req('lastName', 'Last Name', 100);
  const gErr = validateDropdown(data.gender || '', [...GENDERS], 'Gender');
  if (gErr) errors.gender = gErr;
  req('designation', 'Designation', 150);
  const mErr = validateMobile(data.mobileNumber || '');
  if (mErr) errors.mobileNumber = mErr;
  const emailErr = validateEmail(data.emailId || '');
  if (emailErr) errors.emailId = emailErr;
  req('addressField1', 'Address Field 1', 250);
  req('addressField2', 'Address Field 2', 250);
  const pErr = validatePincode(data.pincode || '');
  if (pErr) errors.pincode = pErr;
  const sErr = validateDropdown(data.state || '', [...STATES], 'State');
  if (sErr) errors.state = sErr;
  return errors;
}
