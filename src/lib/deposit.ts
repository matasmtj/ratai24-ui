/**
 * Client-side mirror of the backend deposit calculator
 * (`ratai24/src/pricing/calculators/deposit.calculator.js`).
 *
 * Used as a fallback when a Contract response does not include the
 * server-computed `requiredDeposit` field. Keep brackets in sync with
 * the backend.
 *
 * Brackets (inclusive bounds, in days):
 *   1 to 3  -> €50
 *   4 to 7  -> €100
 *   8 to 15 -> €300
 *  16 to 30 -> €300
 *  31+      -> €500
 */

const BRACKETS: Array<{ maxDays: number; deposit: number }> = [
  { maxDays: 3, deposit: 50 },
  { maxDays: 7, deposit: 100 },
  { maxDays: 15, deposit: 300 },
  { maxDays: 30, deposit: 300 },
];
const LONG_TERM_DEPOSIT = 500;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function rentalDurationDays(
  startDate: string | number | Date,
  endDate: string | number | Date
): number {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  const ms = end.getTime() - start.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 1;
  return Math.max(1, Math.ceil(ms / MS_PER_DAY));
}

export function getDepositForDays(days: number): number {
  const d = Number.isFinite(days) ? Math.max(1, Math.ceil(days)) : 1;
  for (const bracket of BRACKETS) {
    if (d <= bracket.maxDays) return bracket.deposit;
  }
  return LONG_TERM_DEPOSIT;
}

export function calculateRequiredDeposit(
  startDate: string | number | Date,
  endDate: string | number | Date
): number {
  return getDepositForDays(rentalDurationDays(startDate, endDate));
}

/**
 * Resolve the deposit amount for a contract: prefer the server-computed
 * `requiredDeposit`, fall back to a local calculation from the dates.
 */
export function resolveContractDeposit(contract: {
  requiredDeposit?: number | null;
  startDate?: string | Date;
  endDate?: string | Date;
}): number {
  if (typeof contract.requiredDeposit === 'number' && contract.requiredDeposit > 0) {
    return contract.requiredDeposit;
  }
  if (contract.startDate && contract.endDate) {
    return calculateRequiredDeposit(contract.startDate, contract.endDate);
  }
  return 50;
}
