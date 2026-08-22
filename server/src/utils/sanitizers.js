/**
 * Strips sensitive fields from a user object/document based on the viewer's role and ownership.
 * 
 * Rules:
 * - SUPER_ADMIN: Full view of all records.
 * - Self (any role): Full view of their own record (salary, bank details, personal info).
 * - HR viewing another employee: Strips bankInfo, salary details.
 * - EMPLOYEE viewing another employee: Strips salary, bankInfo, personalEmail, address, dob, maritalStatus, gender, phone.
 * 
 * @param {object|mongoose.Document} user
 * @param {string} viewerRole - 'SUPER_ADMIN' | 'HR' | 'EMPLOYEE'
 * @param {string|mongoose.Types.ObjectId} viewerId
 * @returns {object} Sanitized user plain object
 */
function sanitizeUser(user, viewerRole, viewerId) {
  if (!user) return null;

  // Convert Mongoose document to plain object if needed
  const userObj = typeof user.toObject === 'function' ? user.toObject({ virtuals: true }) : { ...user };

  // Always delete internal security hashes
  delete userObj.passwordHash;
  delete userObj.__v;

  const isSelf = viewerId && userObj._id && String(userObj._id) === String(viewerId);

  // SUPER_ADMIN or Self sees everything
  if (viewerRole === 'SUPER_ADMIN' || isSelf) {
    return userObj;
  }

  // HR viewing someone else
  if (viewerRole === 'HR') {
    delete userObj.bankInfo;
    delete userObj.salary;
    return userObj;
  }

  // EMPLOYEE viewing someone else (Directory view)
  delete userObj.bankInfo;
  delete userObj.salary;
  delete userObj.personalEmail;
  delete userObj.address;
  delete userObj.dob;
  delete userObj.gender;
  delete userObj.maritalStatus;
  delete userObj.nationality;
  delete userObj.phone;

  return userObj;
}

/**
 * Sanitizes an array of user objects.
 * @param {Array} users
 * @param {string} viewerRole
 * @param {string|mongoose.Types.ObjectId} viewerId
 * @returns {Array}
 */
function sanitizeUsers(users, viewerRole, viewerId) {
  if (!Array.isArray(users)) return [];
  return users.map((u) => sanitizeUser(u, viewerRole, viewerId));
}

module.exports = {
  sanitizeUser,
  sanitizeUsers
};
