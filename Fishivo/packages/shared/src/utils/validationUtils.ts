// validationUtils.ts - Validation utility functions
// Adapted for TurboRepo structure

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email adresi gereklidir' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Geçerli bir email adresi giriniz' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Şifre gereklidir' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Şifre en az 6 karakter olmalıdır' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Şifre en fazla 128 karakter olabilir' };
  }
  
  // En az bir harf ve bir rakam içermeli
  const hasLetter = /[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Şifre en az bir harf ve bir rakam içermelidir' };
  }
  
  return { isValid: true };
};

// Strong password validation
export const validateStrongPassword = (password: string): ValidationResult => {
  const basicValidation = validatePassword(password);
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Güçlü şifre en az 8 karakter olmalıdır' };
  }
  
  const hasUpperCase = /[A-ZĞÜŞİÖÇ]/.test(password);
  const hasLowerCase = /[a-zğüşıöç]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const requirements = [];
  if (!hasUpperCase) requirements.push('büyük harf');
  if (!hasLowerCase) requirements.push('küçük harf');
  if (!hasNumber) requirements.push('rakam');
  if (!hasSpecialChar) requirements.push('özel karakter');
  
  if (requirements.length > 0) {
    return { 
      isValid: false, 
      error: `Güçlü şifre şunları içermelidir: ${requirements.join(', ')}` 
    };
  }
  
  return { isValid: true };
};

// Phone number validation (Turkish format)
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Telefon numarası gereklidir' };
  }
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Turkish phone number patterns
  const turkishMobileRegex = /^(90)?(5\d{9})$/; // +90 5XX XXX XX XX
  const turkishLandlineRegex = /^(90)?(\d{3}\d{7})$/; // +90 XXX XXX XX XX
  
  if (!turkishMobileRegex.test(cleanPhone) && !turkishLandlineRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Geçerli bir Türkiye telefon numarası giriniz' };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'İsim'): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} gereklidir` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} en az 2 karakter olmalıdır` };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} en fazla 50 karakter olabilir` };
  }
  
  // Only letters, spaces, and Turkish characters
  const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: `${fieldName} sadece harf içerebilir` };
  }
  
  return { isValid: true };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL gereklidir' };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Geçerli bir URL giriniz' };
  }
};

// Number validation
export const validateNumber = (
  value: string | number, 
  min?: number, 
  max?: number, 
  fieldName: string = 'Değer'
): ValidationResult => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} geçerli bir sayı olmalıdır` };
  }
  
  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `${fieldName} en az ${min} olmalıdır` };
  }
  
  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${fieldName} en fazla ${max} olabilir` };
  }
  
  return { isValid: true };
};

// Date validation
export const validateDate = (date: string | Date, fieldName: string = 'Tarih'): ValidationResult => {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} geçerli bir tarih olmalıdır` };
  }
  
  return { isValid: true };
};

// Future date validation
export const validateFutureDate = (date: string | Date, fieldName: string = 'Tarih'): ValidationResult => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  if (dateObj <= now) {
    return { isValid: false, error: `${fieldName} gelecekte bir tarih olmalıdır` };
  }
  
  return { isValid: true };
};

// Past date validation
export const validatePastDate = (date: string | Date, fieldName: string = 'Tarih'): ValidationResult => {
  const dateValidation = validateDate(date, fieldName);
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  if (dateObj >= now) {
    return { isValid: false, error: `${fieldName} geçmişte bir tarih olmalıdır` };
  }
  
  return { isValid: true };
};

// Age validation (birth date)
export const validateAge = (birthDate: string | Date, minAge: number = 13, maxAge: number = 120): ValidationResult => {
  const dateValidation = validatePastDate(birthDate, 'Doğum tarihi');
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { isValid: false, error: `Yaş en az ${minAge} olmalıdır` };
  }
  
  if (age > maxAge) {
    return { isValid: false, error: `Yaş en fazla ${maxAge} olabilir` };
  }
  
  return { isValid: true };
};

// Generic field validation with rules
export const validateField = (value: any, rules: ValidationRule, fieldName: string = 'Alan'): ValidationResult => {
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, error: rules.message || `${fieldName} gereklidir` };
  }
  
  // If value is empty and not required, it's valid
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true };
  }
  
  const stringValue = String(value);
  
  // Min length check
  if (rules.minLength && stringValue.length < rules.minLength) {
    return { 
      isValid: false, 
      error: rules.message || `${fieldName} en az ${rules.minLength} karakter olmalıdır` 
    };
  }
  
  // Max length check
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return { 
      isValid: false, 
      error: rules.message || `${fieldName} en fazla ${rules.maxLength} karakter olabilir` 
    };
  }
  
  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return { 
      isValid: false, 
      error: rules.message || `${fieldName} geçerli formatta olmalıdır` 
    };
  }
  
  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return { 
      isValid: false, 
      error: rules.message || `${fieldName} geçerli değil` 
    };
  }
  
  return { isValid: true };
};

// Validate multiple fields
export const validateFields = (data: Record<string, any>, rules: Record<string, ValidationRule>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[fieldName], fieldRules, fieldName);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Fishing-specific validations
export const validateFishWeight = (weight: string | number): ValidationResult => {
  return validateNumber(weight, 0.001, 1000, 'Balık ağırlığı');
};

export const validateFishLength = (length: string | number): ValidationResult => {
  return validateNumber(length, 0.1, 500, 'Balık boyu');
};

export const validateDepth = (depth: string | number): ValidationResult => {
  return validateNumber(depth, 0, 11000, 'Derinlik');
};

export const validateCoordinates = (latitude: number, longitude: number): ValidationResult => {
  const latValidation = validateNumber(latitude, -90, 90, 'Enlem');
  if (!latValidation.isValid) {
    return latValidation;
  }
  
  const lngValidation = validateNumber(longitude, -180, 180, 'Boylam');
  if (!lngValidation.isValid) {
    return lngValidation;
  }
  
  return { isValid: true };
};

// Clean and format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('90')) {
    const number = cleanPhone.substring(2);
    if (number.length === 10) {
      return `+90 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 8)} ${number.substring(8)}`;
    }
  } else if (cleanPhone.length === 10) {
    return `+90 ${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6, 8)} ${cleanPhone.substring(8)}`;
  }
  
  return phone;
};

// Sanitize string (remove dangerous characters)
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous HTML characters
    .trim();
};

// Validate and sanitize user input
export const validateAndSanitize = (value: string, rules: ValidationRule, fieldName: string = 'Alan'): {
  isValid: boolean;
  value: string;
  error?: string;
} => {
  const sanitized = sanitizeString(value);
  const validation = validateField(sanitized, rules, fieldName);
  
  return {
    isValid: validation.isValid,
    value: sanitized,
    error: validation.error
  };
};

export default {
  validateEmail,
  validatePassword,
  validateStrongPassword,
  validatePhoneNumber,
  validateName,
  validateUrl,
  validateNumber,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateAge,
  validateField,
  validateFields,
  validateFishWeight,
  validateFishLength,
  validateDepth,
  validateCoordinates,
  formatPhoneNumber,
  sanitizeString,
  validateAndSanitize
};