export type PasswordChecks = {
  minLength: boolean;
  hasLetter: boolean;
  hasDigit: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasDigit: /\d/.test(password),
  };
}

export function passwordMeetsAllRequirements(password: string): boolean {
  const c = getPasswordChecks(password);
  return c.minLength && c.hasLetter && c.hasDigit;
}
