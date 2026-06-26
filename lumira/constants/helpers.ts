const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const WEEKDAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const TODAY = '2026-06-26';

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLong(iso: string): string {
  const d = parseDate(iso);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMed(iso: string): string {
  const d = parseDate(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_LONG[month]} ${year}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '');
}

export function formatINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function formatINRShort(n: number): string {
  if (n >= 100000) {
    const v = n / 100000;
    const s = v % 1 === 0 ? v.toFixed(0) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return '₹' + s + 'L';
  }
  if (n >= 1000) return '₹' + Math.round(n / 1000) + 'K';
  return '₹' + n;
}

export function getPaidAmount(payments: { amount: number }[]): number {
  return payments.reduce((s, p) => s + p.amount, 0);
}

export { MONTHS_SHORT, MONTHS_LONG };
