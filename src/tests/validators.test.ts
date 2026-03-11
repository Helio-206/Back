import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateBI,
  validateName,
  validatePDFFile,
  validateDate,
  validateRequired,
} from '../utils/validators';

describe('Email Validation', () => {
  it('should accept valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.valid).toBe(true);
  });

  it('should accept valid .gov email', () => {
    const result = validateEmail('citizen@gov.ao');
    expect(result.valid).toBe(true);
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obrigatório');
  });

  it('should reject invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('inválido');
  });

  it('should reject email without domain', () => {
    const result = validateEmail('user@');
    expect(result.valid).toBe(false);
  });
});

describe('Password Validation', () => {
  it('should accept strong password', () => {
    const result = validatePassword('StrongPass123');
    expect(result.valid).toBe(true);
  });

  it('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obrigatória');
  });

  it('should reject password less than 8 chars', () => {
    const result = validatePassword('Pass1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8 caracteres');
  });

  it('should reject password without uppercase', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('maiúscula');
  });

  it('should reject password without lowercase', () => {
    const result = validatePassword('PASSWORD123');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('minúscula');
  });

  it('should reject password without number', () => {
    const result = validatePassword('Password');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('número');
  });
});

describe('BI Validation', () => {
  it('should accept valid BI format', () => {
    const result = validateBI('009593845LA0444');
    expect(result.valid).toBe(true);
  });

  it('should accept BI with lowercase letters', () => {
    const result = validateBI('009593845la0444');
    expect(result.valid).toBe(true);
  });

  it('should reject empty BI', () => {
    const result = validateBI('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obrigatório');
  });

  it('should reject BI with wrong format', () => {
    const result = validateBI('12345678AB1234');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('inválido');
  });

  it('should reject BI with special characters', () => {
    const result = validateBI('009593845-LA-0444');
    expect(result.valid).toBe(false);
  });
});

describe('Name Validation', () => {
  it('should accept valid name', () => {
    const result = validateName('João Silva');
    expect(result.valid).toBe(true);
  });

  it('should reject empty name', () => {
    const result = validateName('');
    expect(result.valid).toBe(false);
  });

  it('should reject single character name', () => {
    const result = validateName('J');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('2 caracteres');
  });

  it('should accept custom field name in error message', () => {
    const result = validateName('', 'Sobrenome');
    expect(result.message).toContain('Sobrenome');
  });
});

describe('PDF File Validation', () => {
  it('should accept valid PDF file', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    const result = validatePDFFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject non-PDF file', () => {
    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    const result = validatePDFFile(file);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('PDF');
  });

  it('should reject null file', () => {
    const result = validatePDFFile(null);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obrigatório');
  });

  it('should reject file exceeding 5MB', () => {
    const largeBuffer = new Uint8Array(6 * 1024 * 1024); // 6MB
    const file = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });
    const result = validatePDFFile(file);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('5MB');
  });
});

describe('Date Validation', () => {
  it('should accept valid date in YYYY-MM-DD format', () => {
    const result = validateDate('2026-01-15');
    expect(result.valid).toBe(true);
  });

  it('should reject empty date', () => {
    const result = validateDate('');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('obrigatória');
  });

  it('should reject invalid format', () => {
    const result = validateDate('15-01-2026');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('YYYY-MM-DD');
  });

  it('should reject invalid date', () => {
    const result = validateDate('2026-13-32');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('inválida');
  });

  it('should reject future date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];
    const result = validateDate(dateStr);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('futuro');
  });
});

describe('Required Field Validation', () => {
  it('should accept non-empty value', () => {
    const result = validateRequired('João Silva', 'Nome');
    expect(result.valid).toBe(true);
  });

  it('should reject empty value', () => {
    const result = validateRequired('', 'Campo');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Campo');
  });

  it('should reject whitespace-only value', () => {
    const result = validateRequired('   ', 'Campo');
    expect(result.valid).toBe(false);
  });
});
