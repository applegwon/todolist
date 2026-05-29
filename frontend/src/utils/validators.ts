export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// NFR-204: 8자 이상, 영문 1자 이상, 숫자 1자 이상, 공백 불허
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (/\s/.test(password)) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
