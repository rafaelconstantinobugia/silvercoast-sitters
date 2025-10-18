// Validation utilities for edge functions

export interface ValidationResult {
  success: boolean;
  error?: string;
}

export function validateUUID(value: string, fieldName: string): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return { success: false, error: `${fieldName} must be a valid UUID` };
  }
  return { success: true };
}

export function validateURL(value: string, fieldName: string): ValidationResult {
  try {
    new URL(value);
    return { success: true };
  } catch {
    return { success: false, error: `${fieldName} must be a valid URL` };
  }
}

export function validateDateRange(startDate: string, endDate: string): ValidationResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, error: 'Invalid date format' };
  }
  
  if (start >= end) {
    return { success: false, error: 'Start date must be before end date' };
  }
  
  if (start < new Date()) {
    return { success: false, error: 'Start date must be in the future' };
  }
  
  return { success: true };
}

export function validateStringLength(value: string, fieldName: string, maxLength: number): ValidationResult {
  if (value.length > maxLength) {
    return { success: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }
  return { success: true };
}

export function validateArray(value: any, fieldName: string): ValidationResult {
  if (!Array.isArray(value)) {
    return { success: false, error: `${fieldName} must be an array` };
  }
  return { success: true };
}

export function validateUUIDArray(values: string[], fieldName: string): ValidationResult {
  if (!Array.isArray(values)) {
    return { success: false, error: `${fieldName} must be an array` };
  }
  
  for (const value of values) {
    const result = validateUUID(value, `${fieldName} item`);
    if (!result.success) {
      return result;
    }
  }
  
  return { success: true };
}

export function validatePositiveInteger(value: number, fieldName: string): ValidationResult {
  if (!Number.isInteger(value) || value <= 0) {
    return { success: false, error: `${fieldName} must be a positive integer` };
  }
  return { success: true };
}

export function validateEnum(value: string, fieldName: string, allowedValues: string[]): ValidationResult {
  if (!allowedValues.includes(value)) {
    return { success: false, error: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
  }
  return { success: true };
}
