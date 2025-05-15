/**
 * Maps backend role values to numeric roles:
 * 0 = Admin, 1 = Staff, 2 = Adopter
 * Accepts: 'Admin', 'Staff', 'Adopter', 0, 1, 2, '0', '1', '2', etc.
 * Returns null if the value is not recognized.
 */
export function validateRole(roleValue) {
  if (roleValue === undefined || roleValue === null) return null;
  if (typeof roleValue === 'number' && [0, 1, 2].includes(roleValue)) return roleValue;
  if (typeof roleValue === 'string') {
    const lower = roleValue.toLowerCase();
    if (lower === 'admin' || roleValue === '0') return 0;
    if (lower === 'staff' || lower === 'shelterstaff' || roleValue === '1') return 1;
    if (lower === 'adopter' || roleValue === '2') return 2;
    // Try converting to number if it's a numeric string
    const numericRole = Number(roleValue);
    if (!isNaN(numericRole) && [0, 1, 2].includes(numericRole)) return numericRole;
  }
  // Not recognized
  return null;
} 