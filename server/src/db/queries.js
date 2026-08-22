const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/mysql');

/**
 * Format raw user row to JSON object
 */
function formatUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    companyId: row.company_id,
    loginId: row.login_id,
    firstName: row.first_name,
    lastName: row.last_name || '',
    fullName: `${row.first_name} ${row.last_name || ''}`.trim(),
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone || '',
    role: row.role || 'EMPLOYEE',
    department: row.department_id
      ? {
          _id: row.department_id,
          id: row.department_id,
          name: row.department_name || 'Department'
        }
      : null,
    designation: row.designation || '',
    employeeCode: row.employee_code || '',
    joiningDate: row.joining_date,
    location: row.location || '',
    status: row.status || 'present',
    gender: row.gender || '',
    dob: row.dob,
    maritalStatus: row.marital_status || '',
    nationality: row.nationality || 'Indian',
    address: row.address || '',
    personalEmail: row.personal_email || '',
    bankInfo: {
      bankName: row.bank_name || '',
      accountNumber: row.account_number || '',
      ifsc: row.ifsc || '',
      pan: row.pan || '',
      uan: row.uan || ''
    },
    about: row.about || '',
    jobDescription: row.job_description || '',
    hobbies: row.hobbies || '',
    skills: typeof row.skills === 'string' && row.skills.startsWith('[')
      ? JSON.parse(row.skills)
      : row.skills ? String(row.skills).split(',').map((s) => s.trim()) : [],
    certifications: typeof row.certifications === 'string' && row.certifications.startsWith('[')
      ? JSON.parse(row.certifications)
      : row.certifications ? String(row.certifications).split(',').map((c) => c.trim()) : [],
    salary: {
      monthlyWage: Number(row.monthly_wage) || 0
    },
    avatarColor: row.avatar_color || '#e09f67',
    avatarUrl: row.avatar_url || '',
    isActive: row.is_active === 0 || row.is_active === false || row.is_active === '0' ? false : true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = {
  // -------------------------------------------------------------
  // COMPANIES
  // -------------------------------------------------------------
  async findCompanyById(id) {
    const rows = await query(`SELECT * FROM companies WHERE id = ? LIMIT 1`, [id]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      _id: r.id,
      id: r.id,
      name: r.name,
      email: r.email,
      companyCode: r.company_code,
      logo: r.logo || '',
      createdAt: r.created_at
    };
  },

  async findCompanyByCode(code) {
    const rows = await query(`SELECT * FROM companies WHERE company_code = ? LIMIT 1`, [code.toUpperCase()]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      _id: r.id,
      id: r.id,
      name: r.name,
      email: r.email,
      companyCode: r.company_code,
      logo: r.logo || ''
    };
  },

  async findCompanyByEmail(email) {
    const rows = await query(`SELECT * FROM companies WHERE email = ? LIMIT 1`, [email.toLowerCase().trim()]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return { _id: r.id, id: r.id, name: r.name, email: r.email, companyCode: r.company_code };
  },

  async createCompany({ name, email, companyCode, logo = '' }) {
    const id = uuidv4();
    await query(
      `INSERT INTO companies (id, name, email, company_code, logo) VALUES (?, ?, ?, ?, ?)`,
      [id, name.trim(), email.toLowerCase().trim(), companyCode.toUpperCase().trim(), logo]
    );
    return this.findCompanyById(id);
  },

  // -------------------------------------------------------------
  // ATOMIC LOGIN ID GENERATION
  // -------------------------------------------------------------
  async generateAtomicLoginId(companyCode, yearDigits) {
    const counterKey = `${companyCode.toUpperCase()}_${yearDigits}`;
    await query(`INSERT INTO counters (id, seq) VALUES (?, 1) ON DUPLICATE KEY UPDATE seq = seq + 1`, [counterKey]);
    const rows = await query(`SELECT seq FROM counters WHERE id = ? LIMIT 1`, [counterKey]);
    const seqNum = rows && rows.length > 0 ? rows[0].seq : 1;
    const padded = String(seqNum).padStart(4, '0');
    return `${companyCode.toUpperCase()}${yearDigits}${padded}`;
  },

  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------
  async findUserById(id) {
    const sql = `
      SELECT u.*, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ? LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows && rows.length > 0 ? formatUser(rows[0]) : null;
  },

  async findUserByLoginOrEmail(identifier) {
    const clean = identifier.trim();
    const sql = `
      SELECT u.*, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.login_id = ? OR u.email = ?
      LIMIT 1
    `;
    const rows = await query(sql, [clean.toUpperCase(), clean.toLowerCase()]);
    return rows && rows.length > 0 ? formatUser(rows[0]) : null;
  },

  async createUser(data) {
    const id = data.id || uuidv4();
    await query(
      `INSERT INTO users (
        id, company_id, login_id, first_name, last_name, email, password_hash, phone, role,
        department_id, designation, employee_code, joining_date, location, status, gender, dob,
        marital_status, nationality, address, personal_email, bank_name, account_number, ifsc,
        pan, uan, about, job_description, hobbies, skills, certifications, monthly_wage, avatar_color, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.companyId,
        data.loginId.toUpperCase(),
        data.firstName,
        data.lastName || '',
        data.email.toLowerCase(),
        data.passwordHash,
        data.phone || '',
        data.role || 'EMPLOYEE',
        data.departmentId || data.department || null,
        data.designation || '',
        data.employeeCode || '',
        data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        data.location || '',
        data.status || 'present',
        data.gender || '',
        data.dob ? new Date(data.dob).toISOString().split('T')[0] : null,
        data.maritalStatus || '',
        data.nationality || 'Indian',
        data.address || '',
        data.personalEmail || '',
        data.bankInfo?.bankName || data.bankName || '',
        data.bankInfo?.accountNumber || data.accountNumber || '',
        data.bankInfo?.ifsc || data.ifsc || '',
        data.bankInfo?.pan || data.pan || '',
        data.bankInfo?.uan || data.uan || '',
        data.about || '',
        data.jobDescription || '',
        data.hobbies || '',
        JSON.stringify(data.skills || []),
        JSON.stringify(data.certifications || []),
        data.monthlyWage || data.salary?.monthlyWage || 0,
        data.avatarColor || '#e09f67',
        data.avatarUrl || ''
      ]
    );

    return this.findUserById(id);
  },

  async updateUser(id, companyId, data) {
    const user = await this.findUserById(id);
    if (!user) return null;

    const fields = [];
    const params = [];

    if (data.firstName !== undefined) { fields.push('first_name = ?'); params.push(data.firstName); }
    if (data.lastName !== undefined) { fields.push('last_name = ?'); params.push(data.lastName); }
    if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email.toLowerCase()); }
    if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone); }
    if (data.role !== undefined) { fields.push('role = ?'); params.push(data.role); }
    if (data.departmentId !== undefined || data.department !== undefined) {
      fields.push('department_id = ?');
      params.push(data.departmentId || data.department || null);
    }
    if (data.designation !== undefined) { fields.push('designation = ?'); params.push(data.designation); }
    if (data.location !== undefined) { fields.push('location = ?'); params.push(data.location); }
    if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
    if (data.gender !== undefined) { fields.push('gender = ?'); params.push(data.gender); }
    if (data.dob !== undefined) { fields.push('dob = ?'); params.push(data.dob ? new Date(data.dob).toISOString().split('T')[0] : null); }
    if (data.maritalStatus !== undefined) { fields.push('marital_status = ?'); params.push(data.maritalStatus); }
    if (data.nationality !== undefined) { fields.push('nationality = ?'); params.push(data.nationality); }
    if (data.address !== undefined) { fields.push('address = ?'); params.push(data.address); }
    if (data.personalEmail !== undefined) { fields.push('personal_email = ?'); params.push(data.personalEmail); }
    if (data.about !== undefined) { fields.push('about = ?'); params.push(data.about); }
    if (data.jobDescription !== undefined) { fields.push('job_description = ?'); params.push(data.jobDescription); }
    if (data.hobbies !== undefined) { fields.push('hobbies = ?'); params.push(data.hobbies); }
    if (data.skills !== undefined) { fields.push('skills = ?'); params.push(JSON.stringify(data.skills)); }
    if (data.certifications !== undefined) { fields.push('certifications = ?'); params.push(JSON.stringify(data.certifications)); }
    if (data.avatarUrl !== undefined) { fields.push('avatar_url = ?'); params.push(data.avatarUrl); }
    if (data.passwordHash !== undefined) { fields.push('password_hash = ?'); params.push(data.passwordHash); }
    if (data.monthlyWage !== undefined || data.salary?.monthlyWage !== undefined) {
      fields.push('monthly_wage = ?');
      params.push(Number(data.monthlyWage || data.salary?.monthlyWage) || 0);
    }
    if (data.bankInfo) {
      if (data.bankInfo.bankName !== undefined) { fields.push('bank_name = ?'); params.push(data.bankInfo.bankName); }
      if (data.bankInfo.accountNumber !== undefined) { fields.push('account_number = ?'); params.push(data.bankInfo.accountNumber); }
      if (data.bankInfo.ifsc !== undefined) { fields.push('ifsc = ?'); params.push(data.bankInfo.ifsc); }
      if (data.bankInfo.pan !== undefined) { fields.push('pan = ?'); params.push(data.bankInfo.pan); }
      if (data.bankInfo.uan !== undefined) { fields.push('uan = ?'); params.push(data.bankInfo.uan); }
    }

    if (fields.length > 0) {
      params.push(id);
      params.push(companyId);
      await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ? AND company_id = ?`, params);
    }

    return this.findUserById(id);
  },

  async getEmployees(companyId, filters = {}) {
    let sql = `
      SELECT u.*, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.company_id = ?
    `;
    const params = [companyId];

    if (filters.search && filters.search.trim()) {
      sql += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.login_id LIKE ?)`;
      const s = `%${filters.search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (filters.department && filters.department !== 'all') {
      sql += ` AND u.department_id = ?`;
      params.push(filters.department);
    }

    if (filters.role && filters.role !== 'all') {
      sql += ` AND u.role = ?`;
      params.push(filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      sql += ` AND u.status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const rows = await query(sql, params);
    return (rows || []).map(formatUser);
  },

  // -------------------------------------------------------------
  // ATTENDANCES
  // -------------------------------------------------------------
  async getAttendanceToday(employeeId, date) {
    const rows = await query(
      `SELECT * FROM attendances WHERE employee_id = ? AND date = ? LIMIT 1`,
      [employeeId, date]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      _id: r.id,
      id: r.id,
      employeeId: r.employee_id,
      companyId: r.company_id,
      date: r.date,
      checkIn: r.check_in,
      checkOut: r.check_out,
      totalWorkHours: Number(r.total_work_hours) || 0,
      status: r.status
    };
  },

  async getAttendanceHistory(employeeId, limit = 30) {
    const rows = await query(
      `SELECT * FROM attendances WHERE employee_id = ? ORDER BY date DESC LIMIT ?`,
      [employeeId, limit]
    );
    return (rows || []).map((r) => ({
      _id: r.id,
      id: r.id,
      date: r.date,
      checkIn: r.check_in,
      checkOut: r.check_out,
      totalWorkHours: Number(r.total_work_hours) || 0,
      status: r.status
    }));
  },

  async createAttendance(data) {
    const id = uuidv4();
    await query(
      `INSERT INTO attendances (id, company_id, employee_id, date, check_in, check_out, total_work_hours, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.companyId, data.employeeId, data.date, data.checkIn, data.checkOut, data.totalWorkHours || 0, data.status || 'present']
    );
    return this.getAttendanceToday(data.employeeId, data.date);
  },

  async updateAttendance(id, data) {
    await query(
      `UPDATE attendances SET check_out = ?, total_work_hours = ?, status = ? WHERE id = ?`,
      [data.checkOut, data.totalWorkHours, data.status || 'present', id]
    );
    const rows = await query(`SELECT * FROM attendances WHERE id = ? LIMIT 1`, [id]);
    return rows && rows.length > 0 ? rows[0] : null;
  },

  // -------------------------------------------------------------
  // TIME OFFS & LEAVE BALANCES
  // -------------------------------------------------------------
  async getLeaveBalance(employeeId, companyId) {
    const rows = await query(
      `SELECT * FROM leave_balances WHERE employee_id = ? AND company_id = ? LIMIT 1`,
      [employeeId, companyId]
    );
    if (!rows || rows.length === 0) {
      const id = uuidv4();
      await query(
        `INSERT INTO leave_balances (id, company_id, employee_id, pto_total, pto_used, sick_total, sick_used)
         VALUES (?, ?, ?, 24, 0, 10, 0)`,
        [id, companyId, employeeId]
      );
      return { pto: { total: 24, used: 0 }, sick: { total: 10, used: 0 } };
    }
    const r = rows[0];
    return {
      pto: { total: r.pto_total, used: r.pto_used },
      sick: { total: r.sick_total, used: r.sick_used }
    };
  },

  async updateLeaveBalance(employeeId, companyId, leaveType, days) {
    if (leaveType === 'pto') {
      await query(
        `UPDATE leave_balances SET pto_used = pto_used + ? WHERE employee_id = ? AND company_id = ?`,
        [days, employeeId, companyId]
      );
    } else if (leaveType === 'sick') {
      await query(
        `UPDATE leave_balances SET sick_used = sick_used + ? WHERE employee_id = ? AND company_id = ?`,
        [days, employeeId, companyId]
      );
    }
  },

  async getTimeOffs(companyId, filters = {}) {
    let sql = `
      SELECT t.*, u.first_name, u.last_name, u.email, u.designation, u.avatar_color, u.avatar_url
      FROM time_offs t
      LEFT JOIN users u ON t.employee_id = u.id
      WHERE t.company_id = ?
    `;
    const params = [companyId];

    if (filters.employeeId) {
      sql += ` AND t.employee_id = ?`;
      params.push(filters.employeeId);
    }
    if (filters.status && filters.status !== 'all') {
      sql += ` AND t.status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY t.created_at DESC`;
    const rows = await query(sql, params);

    return (rows || []).map((r) => ({
      _id: r.id,
      id: r.id,
      leaveType: r.leave_type,
      startDate: r.start_date,
      endDate: r.end_date,
      days: r.days,
      reason: r.reason,
      status: r.status,
      employeeId: {
        _id: r.employee_id,
        id: r.employee_id,
        fullName: `${r.first_name} ${r.last_name || ''}`.trim(),
        email: r.email,
        designation: r.designation,
        avatarColor: r.avatar_color,
        avatarUrl: r.avatar_url
      },
      createdAt: r.created_at
    }));
  },

  async createTimeOff(data) {
    const id = uuidv4();
    await query(
      `INSERT INTO time_offs (id, company_id, employee_id, leave_type, start_date, end_date, days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, data.companyId, data.employeeId, data.leaveType, data.startDate, data.endDate, data.days, data.reason]
    );
    const list = await this.getTimeOffs(data.companyId, { employeeId: data.employeeId });
    return list.find((t) => t.id === id);
  },

  // -------------------------------------------------------------
  // DEPARTMENTS
  // -------------------------------------------------------------
  async getDepartments(companyId) {
    const sql = `
      SELECT d.*, u.first_name, u.last_name,
        (SELECT COUNT(*) FROM users WHERE department_id = d.id) as employee_count
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE d.company_id = ?
      ORDER BY d.name ASC
    `;
    const rows = await query(sql, [companyId]);
    return (rows || []).map((r) => ({
      _id: r.id,
      id: r.id,
      name: r.name,
      description: r.description || '',
      manager: r.manager_id ? { _id: r.manager_id, fullName: `${r.first_name} ${r.last_name || ''}`.trim() } : null,
      employeeCount: Number(r.employee_count) || 0,
      createdAt: r.created_at
    }));
  },

  async createDepartment({ companyId, name, description = '', managerId = null }) {
    const id = uuidv4();
    await query(
      `INSERT INTO departments (id, company_id, name, description, manager_id) VALUES (?, ?, ?, ?, ?)`,
      [id, companyId, name.trim(), description.trim(), managerId || null]
    );
    const list = await this.getDepartments(companyId);
    return list.find((d) => d.id === id);
  },

  // -------------------------------------------------------------
  // ANNOUNCEMENTS, EXPENSES & GOALS
  // -------------------------------------------------------------
  async getAnnouncements(companyId, filters = {}) {
    let sql = `
      SELECT a.*, u.first_name, u.last_name, u.designation, u.avatar_color, u.avatar_url
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.company_id = ?
    `;
    const params = [companyId];
    if (filters.category && filters.category !== 'all') {
      sql += ` AND a.category = ?`;
      params.push(filters.category);
    }
    sql += ` ORDER BY a.pinned DESC, a.created_at DESC`;
    const rows = await query(sql, params);
    return (rows || []).map((r) => ({
      _id: r.id,
      id: r.id,
      title: r.title,
      content: r.content,
      category: r.category,
      pinned: Boolean(r.pinned),
      tags: typeof r.tags === 'string' && r.tags.startsWith('[') ? JSON.parse(r.tags) : [],
      authorId: {
        _id: r.author_id,
        fullName: `${r.first_name} ${r.last_name || ''}`.trim(),
        designation: r.designation,
        avatarColor: r.avatar_color,
        avatarUrl: r.avatar_url
      },
      createdAt: r.created_at
    }));
  },

  async createAnnouncement(data) {
    const id = uuidv4();
    await query(
      `INSERT INTO announcements (id, company_id, author_id, title, content, category, pinned, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.companyId, data.authorId, data.title, data.content, data.category || 'General', Boolean(data.pinned), JSON.stringify(data.tags || [])]
    );
    const list = await this.getAnnouncements(data.companyId);
    return list.find((a) => a.id === id);
  },

  async deleteAnnouncement(id, companyId) {
    await query(`DELETE FROM announcements WHERE id = ? AND company_id = ?`, [id, companyId]);
    return true;
  },

  async getExpenses(companyId, filters = {}) {
    let sql = `
      SELECT e.*, u.first_name, u.last_name, u.email, u.designation, u.avatar_color, u.avatar_url,
             a.first_name as approver_first, a.last_name as approver_last
      FROM expenses e
      LEFT JOIN users u ON e.employee_id = u.id
      LEFT JOIN users a ON e.approved_by = a.id
      WHERE e.company_id = ?
    `;
    const params = [companyId];
    if (filters.employeeId) {
      sql += ` AND e.employee_id = ?`;
      params.push(filters.employeeId);
    }
    if (filters.status && filters.status !== 'all') {
      sql += ` AND e.status = ?`;
      params.push(filters.status);
    }
    sql += ` ORDER BY e.created_at DESC`;
    const rows = await query(sql, params);
    return (rows || []).map((r) => ({
      _id: r.id,
      id: r.id,
      title: r.title,
      category: r.category,
      amount: Number(r.amount) || 0,
      expenseDate: r.expense_date,
      description: r.description,
      status: r.status,
      receiptUrl: r.receipt_url,
      employeeId: {
        _id: r.employee_id,
        fullName: `${r.first_name} ${r.last_name || ''}`.trim(),
        email: r.email,
        designation: r.designation,
        avatarColor: r.avatar_color,
        avatarUrl: r.avatar_url
      },
      approvedBy: r.approved_by ? { fullName: `${r.approver_first} ${r.approver_last || ''}`.trim() } : null,
      createdAt: r.created_at
    }));
  },

  async createExpense(data) {
    const id = uuidv4();
    await query(
      `INSERT INTO expenses (id, company_id, employee_id, title, category, amount, expense_date, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, data.companyId, data.employeeId, data.title, data.category || 'Other', Number(data.amount), data.expenseDate || new Date().toISOString().split('T')[0], data.description || '']
    );
    const list = await this.getExpenses(data.companyId, { employeeId: data.employeeId });
    return list.find((e) => e.id === id);
  },

  async reviewExpense(id, companyId, { status, approvedBy, rejectionReason }) {
    await query(
      `UPDATE expenses SET status = ?, approved_by = ?, rejection_reason = ?, approved_at = NOW() WHERE id = ? AND company_id = ?`,
      [status, approvedBy, rejectionReason || '', id, companyId]
    );
    const list = await this.getExpenses(companyId);
    return list.find((e) => e.id === id);
  },

  async getGoals(companyId, filters = {}) {
    let sql = `
      SELECT g.*, u.first_name, u.last_name, u.designation, u.avatar_color, u.avatar_url
      FROM goals g
      LEFT JOIN users u ON g.employee_id = u.id
      WHERE g.company_id = ?
    `;
    const params = [companyId];
    if (filters.employeeId) {
      sql += ` AND g.employee_id = ?`;
      params.push(filters.employeeId);
    }
    if (filters.quarter && filters.quarter !== 'all') {
      sql += ` AND g.quarter = ?`;
      params.push(filters.quarter);
    }
    sql += ` ORDER BY g.created_at DESC`;
    const rows = await query(sql, params);
    return (rows || []).map((r) => ({
      _id: r.id,
      id: r.id,
      title: r.title,
      description: r.description,
      quarter: r.quarter,
      progress: Number(r.progress) || 0,
      category: r.category,
      status: r.status,
      dueDate: r.due_date,
      employeeId: {
        _id: r.employee_id,
        fullName: `${r.first_name} ${r.last_name || ''}`.trim(),
        designation: r.designation,
        avatarColor: r.avatar_color,
        avatarUrl: r.avatar_url
      },
      createdAt: r.created_at
    }));
  },

  async createGoal(data) {
    const id = uuidv4();
    await query(
      `INSERT INTO goals (id, company_id, employee_id, title, description, quarter, progress, category, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'on_track', ?)`,
      [id, data.companyId, data.employeeId, data.title, data.description || '', data.quarter || 'Q3 2026', data.category || 'Engineering', data.dueDate || null]
    );
    const list = await this.getGoals(data.companyId, { employeeId: data.employeeId });
    return list.find((g) => g.id === id);
  },

  async updateGoal(id, companyId, { progress, status }) {
    await query(
      `UPDATE goals SET progress = ?, status = ? WHERE id = ? AND company_id = ?`,
      [progress, status, id, companyId]
    );
    const list = await this.getGoals(companyId);
    return list.find((g) => g.id === id);
  },

  async createAuditLog(data) {
    const id = uuidv4();
    await query(
      `INSERT INTO audit_logs (id, company_id, actor_id, action, target_type, target_id, metadata, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.companyId, data.actorId || null, data.action, data.targetType || '', data.targetId || '', JSON.stringify(data.metadata || {}), data.ip || '127.0.0.1']
    );
  }
};
