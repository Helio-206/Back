/**
 * Validation utilities for form inputs
 */

export interface ValidationError {
  valid: boolean;
  message?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, message: 'Email é obrigatório' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Email inválido' };
  }
  
  return { valid: true };
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): ValidationError {
  if (!password) {
    return { valid: false, message: 'Senha é obrigatória' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos um número' };
  }
  
  return { valid: true };
}

/**
 * Validate BI (Bilhete de Identidade) format
 * Format: 9 digits + 2 letters + 3-4 digits (e.g., 009593845LA0444 or 007654844BO042)
 */
export function validateBI(bi: string): ValidationError {
  // Aceita 9 dígitos + 2 letras + 3 ou 4 dígitos
  const biRegex = /^\d{9}[A-Z]{2}\d{3,4}$/;
  
  if (!bi) {
    return { valid: false, message: 'BI é obrigatório' };
  }
  
  if (!biRegex.test(bi.toUpperCase())) {
    return { valid: false, message: 'BI inválido. Formato: 9 dígitos + 2 letras + 3-4 dígitos (ex: 007654844BO042)' };
  }
  
  return { valid: true };
}

/**
 * Validate nome/sobrenome (not empty, min 2 chars)
 */
export function validateName(name: string, fieldName: string = 'Nome'): ValidationError {
  if (!name) {
    return { valid: false, message: `${fieldName} é obrigatório` };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: `${fieldName} deve ter no mínimo 2 caracteres` };
  }
  
  return { valid: true };
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File | null): ValidationError {
  if (!file) {
    return { valid: false, message: 'Ficheiro é obrigatório' };
  }
  
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  
  // Aceita PDF ou qualquer imagem comum
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, message: 'Apenas ficheiros PDF e imagens (JPG, PNG) são permitidos' };
  }
  
  if (file.size > maxSizeBytes) {
    return { valid: false, message: 'Ficheiro não deve exceder 10MB' };
  }
  
  return { valid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(dateStr: string): ValidationError {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateStr) {
    return { valid: false, message: 'Data é obrigatória' };
  }
  
  if (!dateRegex.test(dateStr)) {
    return { valid: false, message: 'Data inválida. Formato: YYYY-MM-DD' };
  }
  
  // Check if date is valid
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Data inválida' };
  }
  
  // Check if date is not in the future
  if (date > new Date()) {
    return { valid: false, message: 'Data não pode ser no futuro' };
  }
  
  return { valid: true };
}

/**
 * Validate required text field
 */
export function validateRequired(value: string, fieldName: string): ValidationError {
  if (!value || !value.trim()) {
    return { valid: false, message: `${fieldName} é obrigatório` };
  }
  
  return { valid: true };
}
