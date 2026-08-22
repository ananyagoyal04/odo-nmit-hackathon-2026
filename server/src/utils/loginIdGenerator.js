const Counter = require('../models/Counter');

/**
 * Derives a 2-4 letter company code from the company name.
 * e.g. "Odoo India" -> "OI", "Tech Solutions" -> "TS", "Acme" -> "AC"
 * @param {string} name
 * @returns {string}
 */
function deriveCompanyCode(name) {
  if (!name || typeof name !== 'string') return 'CO';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length >= 2) {
    return clean.slice(0, 2);
  }
  return clean.padEnd(2, 'X');
}

/**
 * Extracts initials for Login ID generation.
 * Takes first 2 alphabetic characters, uppercased, padded with 'X' if shorter than 2.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  const clean = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (clean.length === 0) return 'XX';
  if (clean.length === 1) return clean + 'X';
  return clean.slice(0, 2);
}

/**
 * Generates an atomic, collision-free Login ID for an employee.
 * Format: <companyCode><firstNameInitials(2)><lastNameInitials(2)><joiningYear><4-digit serial>
 * e.g. OISHDU20220001
 * 
 * @param {object} params
 * @param {string} params.companyCode - e.g. "OI"
 * @param {string|mongoose.Types.ObjectId} params.companyId
 * @param {string} params.firstName
 * @param {string} [params.lastName]
 * @param {Date|string} [params.joiningDate]
 * @returns {Promise<string>}
 */
async function generateLoginId({ companyCode, companyId, firstName, lastName, joiningDate }) {
  const code = (companyCode || 'CO').toUpperCase().slice(0, 4);
  const firstInitials = getInitials(firstName);
  
  // If no lastName, use firstName for last initials too as specified
  const lastSource = (lastName && lastName.trim().length > 0) ? lastName : firstName;
  const lastInitials = getInitials(lastSource);

  const dateObj = joiningDate ? new Date(joiningDate) : new Date();
  const year = isNaN(dateObj.getFullYear()) ? new Date().getFullYear() : dateObj.getFullYear();

  // Atomic counter key scoped per company and year: "<companyId>:<year>"
  const counterKey = `${companyId}:${year}`;
  const seq = await Counter.nextSequence(counterKey);
  const serial = String(seq).padStart(4, '0');

  return `${code}${firstInitials}${lastInitials}${year}${serial}`;
}

module.exports = {
  deriveCompanyCode,
  getInitials,
  generateLoginId
};
