const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  NODE_ENV
} = require('./env');

let pool = null;
let isInMemoryFallback = false;
const inMemoryTables = new Map();

/**
 * Direct SQL Query Executor
 * Automatically maps parameterized queries (? placeholders)
 */
async function query(sql, params = []) {
  if (pool) {
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // Pure SQL In-Memory Engine Fallback (when local MySQL service is offline)
  return executeInMemorySQL(sql, params);
}

/**
 * Initialize Database Schema DDL
 */
async function initSchema() {
  console.log('🔄 [MySQL] Initializing SQL Database Schema DDL...');

  const tableDDLs = [
    // 1. Companies
    `CREATE TABLE IF NOT EXISTS companies (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      company_code VARCHAR(10) UNIQUE NOT NULL,
      logo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 2. Departments
    `CREATE TABLE IF NOT EXISTS departments (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      manager_id VARCHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_dept_company (company_id)
    )`,

    // 3. Users
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      login_id VARCHAR(64) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) DEFAULT '',
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(30) DEFAULT '',
      role VARCHAR(20) DEFAULT 'EMPLOYEE',
      department_id VARCHAR(36),
      designation VARCHAR(150) DEFAULT '',
      employee_code VARCHAR(50) DEFAULT '',
      joining_date DATE NOT NULL,
      location VARCHAR(255) DEFAULT '',
      status VARCHAR(20) DEFAULT 'present',
      gender VARCHAR(20) DEFAULT '',
      dob DATE,
      marital_status VARCHAR(20) DEFAULT '',
      nationality VARCHAR(50) DEFAULT 'Indian',
      address TEXT,
      personal_email VARCHAR(255) DEFAULT '',
      bank_name VARCHAR(100) DEFAULT '',
      account_number VARCHAR(50) DEFAULT '',
      ifsc VARCHAR(20) DEFAULT '',
      pan VARCHAR(20) DEFAULT '',
      uan VARCHAR(30) DEFAULT '',
      about TEXT,
      job_description TEXT,
      hobbies TEXT,
      skills TEXT,
      certifications TEXT,
      monthly_wage DECIMAL(12, 2) DEFAULT 0,
      avatar_color VARCHAR(20) DEFAULT '#e09f67',
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_company (company_id),
      INDEX idx_user_login (login_id),
      INDEX idx_user_email (email)
    )`,

    // 4. Attendances
    `CREATE TABLE IF NOT EXISTS attendances (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      date VARCHAR(10) NOT NULL,
      check_in DATETIME,
      check_out DATETIME,
      total_work_hours DECIMAL(5, 2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'present',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_att_emp_date (employee_id, date),
      INDEX idx_att_company (company_id)
    )`,

    // 5. Time Offs
    `CREATE TABLE IF NOT EXISTS time_offs (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      leave_type VARCHAR(20) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days INT NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      approved_by VARCHAR(36),
      approved_at DATETIME,
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_timeoff_emp (employee_id),
      INDEX idx_timeoff_company (company_id)
    )`,

    // 6. Leave Balances
    `CREATE TABLE IF NOT EXISTS leave_balances (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      pto_total INT DEFAULT 24,
      pto_used INT DEFAULT 0,
      sick_total INT DEFAULT 10,
      sick_used INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_lb_emp (employee_id)
    )`,

    // 7. Announcements
    `CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      author_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'General',
      pinned BOOLEAN DEFAULT FALSE,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ann_company (company_id)
    )`,

    // 8. Expenses
    `CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'Other',
      amount DECIMAL(10, 2) NOT NULL,
      expense_date DATE,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      approved_by VARCHAR(36),
      approved_at DATETIME,
      rejection_reason TEXT,
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_exp_emp (employee_id),
      INDEX idx_exp_company (company_id)
    )`,

    // 9. Goals
    `CREATE TABLE IF NOT EXISTS goals (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      quarter VARCHAR(20) DEFAULT 'Q3 2026',
      progress INT DEFAULT 0,
      category VARCHAR(100) DEFAULT 'Engineering',
      status VARCHAR(50) DEFAULT 'on_track',
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_goal_emp (employee_id),
      INDEX idx_goal_company (company_id)
    )`,

    // 10. Audit Logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(36) PRIMARY KEY,
      company_id VARCHAR(36) NOT NULL,
      actor_id VARCHAR(36),
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(100),
      target_id VARCHAR(36),
      metadata TEXT,
      ip VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_company (company_id)
    )`,

    // 11. Counters (Atomic sequence generator for Login IDs)
    `CREATE TABLE IF NOT EXISTS counters (
      id VARCHAR(64) PRIMARY KEY,
      seq INT DEFAULT 0
    )`
  ];

  for (const ddl of tableDDLs) {
    await query(ddl);
  }

  console.log('✅ [MySQL] All SQL tables created and verified successfully.');
}

/**
 * Connect to MySQL Database
 */
async function connectDB() {
  try {
    console.log(`[MySQL] Attempting connection to MySQL server at ${MYSQL_HOST}:${MYSQL_PORT}...`);

    // Step 1: Connect to server and ensure database exists
    const rootConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConn.end();

    // Step 2: Create connection pool
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0
    });

    const [test] = await pool.query('SELECT 1 as connected');
    if (test[0].connected === 1) {
      console.log(`✅ [MySQL] Connected to MySQL Database: ${MYSQL_DATABASE} on ${MYSQL_HOST}:${MYSQL_PORT}`);
    }

    await initSchema();
    await autoSeedMySQL();
    return pool;
  } catch (err) {
    console.warn(`\n⚠️  [MySQL Notice] Local MySQL service not detected on ${MYSQL_HOST}:${MYSQL_PORT} (${err.message}).`);
    console.log('🔄 [MySQL] Initializing pure SQL in-memory development storage engine...');

    isInMemoryFallback = true;
    initInMemoryTables();
    await autoSeedMySQL();
    console.log('✅ [MySQL] Pure SQL in-memory storage engine ready and seeded.');
    return null;
  }
}

/**
 * Auto-Seed Demo Workforce into MySQL
 */
async function autoSeedMySQL() {
  try {
    const existing = await query('SELECT id FROM companies LIMIT 1');
    if (existing && existing.length > 0) return;

    console.log('🌱 [MySQL] Empty database detected. Auto-seeding Odoo India workforce...');

    const companyId = uuidv4();
    const deptEngId = uuidv4();
    const deptDesignId = uuidv4();
    const deptHRId = uuidv4();
    const deptSalesId = uuidv4();

    // 1. Company
    await query(
      `INSERT INTO companies (id, name, email, company_code, logo) VALUES (?, ?, ?, ?, ?)`,
      [companyId, 'Odoo India', 'contact@odooindia.com', 'OI', '']
    );

    // 2. Departments
    await query(`INSERT INTO departments (id, company_id, name, description) VALUES (?, ?, ?, ?)`, [
      deptEngId, companyId, 'Engineering', 'Core software engineering & cloud platform'
    ]);
    await query(`INSERT INTO departments (id, company_id, name, description) VALUES (?, ?, ?, ?)`, [
      deptDesignId, companyId, 'Product & Design', 'Product strategy, UI/UX, and research'
    ]);
    await query(`INSERT INTO departments (id, company_id, name, description) VALUES (?, ?, ?, ?)`, [
      deptHRId, companyId, 'People Operations', 'HR, recruiting, and company culture'
    ]);
    await query(`INSERT INTO departments (id, company_id, name, description) VALUES (?, ?, ?, ?)`, [
      deptSalesId, companyId, 'Sales & Marketing', 'Go-to-market and customer growth'
    ]);

    const defaultPassword = 'Password@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const adminPasswordHash = await bcrypt.hash('nutan@1979', 10);

    // 3. Super Admin
    const adminId = uuidv4();
    await query(
      `INSERT INTO users (
        id, company_id, login_id, first_name, last_name, email, password_hash, phone, role,
        designation, employee_code, joining_date, location, status, gender, dob, marital_status,
        nationality, address, personal_email, bank_name, account_number, ifsc, pan, uan,
        about, job_description, hobbies, skills, certifications, monthly_wage, avatar_color, avatar_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId, companyId, 'OI220001', 'Ananya', 'Goyal', 'ananya00476@gmail.com', adminPasswordHash,
        '+91 98765 43210', 'SUPER_ADMIN', 'Managing Director & CEO', 'EMP-001', '2022-01-15',
        'Gandhinagar, Gujarat', 'present', 'Female', '1988-04-12', 'Married', 'Indian',
        '101 Horizon Heights, Infocity, Gandhinagar', 'ananya00476@gmail.com',
        'HDFC Bank', '50100482910293', 'HDFC0000123', 'ABCPS1234D', '100918273645',
        'Executive leader with 15+ years experience in enterprise SaaS systems.',
        'Strategic leadership, company growth, and organizational excellence.',
        'Golf, Angel Investing, Marathon Running',
        JSON.stringify(['Leadership', 'Corporate Strategy', 'SaaS Architecture', 'P&L Management']),
        JSON.stringify(['Executive Leadership Harvard', 'PMP Certified']),
        200000, '#DC586D', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
        1
      ]
    );

    // 4. HR Manager
    const hrId = uuidv4();
    await query(
      `INSERT INTO users (
        id, company_id, login_id, first_name, last_name, email, password_hash, phone, role,
        department_id, designation, employee_code, joining_date, location, status, gender, dob,
        marital_status, nationality, address, personal_email, bank_name, account_number, ifsc,
        pan, uan, about, job_description, hobbies, skills, certifications, monthly_wage, avatar_color, avatar_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hrId, companyId, 'OI220002', 'Priya', 'Patel', 'hr@odooindia.com', passwordHash,
        '+91 98234 56789', 'HR', deptHRId, 'Head of People Operations', 'EMP-002', '2022-03-01',
        'Gandhinagar, Gujarat', 'present', 'Female', '1990-08-24', 'Single', 'Indian',
        '404 Green Valley, SG Highway, Ahmedabad', 'priya.patel.hr@yahoo.com',
        'ICICI Bank', '234501987654', 'ICIC0000456', 'BCDPP5678E', '100827364519',
        'Passionate HR practitioner dedicated to employee well-being and positive culture.',
        'Oversee recruiting, payroll compliance, and talent growth.',
        'Classical Music, Baking, Yoga',
        JSON.stringify(['Talent Acquisition', 'HR Strategy', 'Conflict Resolution', 'Payroll Specialist']),
        JSON.stringify(['SHRM-CP Certified', 'Payroll Specialist']),
        95000, '#FB9590', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
        1
      ]
    );

    // 5. Senior Engineer: Shruthika Dutta
    const emp1Id = uuidv4();
    await query(
      `INSERT INTO users (
        id, company_id, login_id, first_name, last_name, email, password_hash, phone, role,
        department_id, designation, employee_code, joining_date, location, status, gender, dob,
        marital_status, nationality, address, personal_email, bank_name, account_number, ifsc,
        pan, uan, about, job_description, hobbies, skills, certifications, monthly_wage, avatar_color, avatar_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp1Id, companyId, 'OI220003', 'Shruthika', 'Dutta', 'shruthika.dutta@odooindia.com', passwordHash,
        '+91 97123 45678', 'EMPLOYEE', deptEngId, 'Senior Full Stack Engineer', 'EMP-003', '2022-05-10',
        'Gandhinagar, Gujarat', 'present', 'Female', '1994-11-18', 'Single', 'Indian',
        '22 Maple Woods, Bodakdev, Ahmedabad', 'shruthika.dutta@gmail.com',
        'HDFC Bank', '501009876543', 'HDFC0000987', 'CDESD9012F', '100736451928',
        'Full-stack engineer specialized in high-performance reactive applications and distributed APIs.',
        'Develop core web modules, design REST APIs, and optimize database querying.',
        'Coffee Brewing, Classical Dance, Painting',
        JSON.stringify(['React', 'Node.js', 'MySQL', 'System Design', 'Docker']),
        JSON.stringify(['AWS Certified Developer', 'MySQL Certified Professional']),
        120000, '#FFBB94', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
        1
      ]
    );

    // 6. Lead Designer: Aarav Mehta
    const emp2Id = uuidv4();
    await query(
      `INSERT INTO users (
        id, company_id, login_id, first_name, last_name, email, password_hash, phone, role,
        department_id, designation, employee_code, joining_date, location, status, gender, dob,
        marital_status, nationality, address, personal_email, bank_name, account_number, ifsc,
        pan, uan, about, job_description, hobbies, skills, certifications, monthly_wage, avatar_color, avatar_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp2Id, companyId, 'OI230004', 'Aarav', 'Mehta', 'aarav.mehta@odooindia.com', passwordHash,
        '+91 96543 21098', 'EMPLOYEE', deptDesignId, 'Lead UI/UX Designer', 'EMP-004', '2023-01-16',
        'Gandhinagar, Gujarat', 'present', 'Male', '1993-07-05', 'Married', 'Indian',
        '15 Sunflower Meadows, Thaltej, Ahmedabad', 'aarav.mehta.design@gmail.com',
        'Axis Bank', '918020084729', 'UTIB0000555', 'DEFAM3456G', '100645192837',
        'Design craftsman creating human-centric workspace interfaces and 3D design tokens.',
        'Design user research flows, design systems, and interaction physics.',
        'Architectural Sketching, Specialty Coffee, Cycling',
        JSON.stringify(['Figma', 'Design Systems', 'User Research', 'Motion Design', 'Tailwind CSS']),
        JSON.stringify(['Google UX Design Professional Certificate']),
        105000, '#852E4E', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
        1
      ]
    );

    // Set Department Managers
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, [emp1Id, deptEngId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, [emp2Id, deptDesignId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, [hrId, deptHRId]);

    // Leave Balances
    const users = [adminId, hrId, emp1Id, emp2Id];
    for (const uid of users) {
      await query(
        `INSERT INTO leave_balances (id, company_id, employee_id, pto_total, pto_used, sick_total, sick_used)
         VALUES (?, ?, ?, 24, ?, 10, 0)`,
        [uuidv4(), companyId, uid, uid === emp1Id ? 3 : 0]
      );
    }

    // Attendance Records (14 Days)
    const now = new Date();
    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - dayOffset);
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateString = targetDate.toISOString().split('T')[0];

      for (const uid of users) {
        const checkInTime = `${dateString} 09:15:00`;
        const checkOutTime = `${dateString} 18:00:00`;

        await query(
          `INSERT INTO attendances (id, company_id, employee_id, date, check_in, check_out, total_work_hours, status)
           VALUES (?, ?, ?, ?, ?, ?, 8.75, 'present')`,
          [uuidv4(), companyId, uid, dateString, checkInTime, dayOffset === 0 && uid === emp1Id ? null : checkOutTime]
        );
      }
    }

    // Announcements
    await query(
      `INSERT INTO announcements (id, company_id, author_id, title, content, category, pinned, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(), companyId, adminId, 'Q3 All-Hands Townhall & Product Roadmap Reveal',
        'Join us this Friday at 4:00 PM IST for our company retrospective, product roadmap reveals, and team awards.',
        'Townhall', true, JSON.stringify(['Townhall', 'Roadmap', 'AllHands'])
      ]
    );
    await query(
      `INSERT INTO announcements (id, company_id, author_id, title, content, category, pinned, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(), companyId, hrId, 'Annual Wellness & Health Insurance Policy Refresh',
        'Updated medical insurance coverage including outpatient reimbursements and mental health allowances.',
        'Policy', false, JSON.stringify(['Health', 'Insurance', 'Benefits'])
      ]
    );

    // Expenses
    await query(
      `INSERT INTO expenses (id, company_id, employee_id, title, category, amount, expense_date, description, status, approved_by, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, '2026-08-14', ?, 'approved', ?, '2026-08-15')`,
      [
        uuidv4(), companyId, emp1Id, 'AWS Certified Solutions Architect Exam Fee',
        'Training & Certifications', 12500, 'Certification examination fee reimbursement as per learning policy.',
        hrId
      ]
    );
    await query(
      `INSERT INTO expenses (id, company_id, employee_id, title, category, amount, expense_date, description, status)
       VALUES (?, ?, ?, ?, ?, ?, '2026-08-18', ?, 'pending')`,
      [
        uuidv4(), companyId, emp2Id, 'Ergonomic Mechanical Keyboard & Monitor Arm',
        'Equipment', 8400, 'Home office ergonomic setup equipment claim.'
      ]
    );

    // OKRs & Goals
    await query(
      `INSERT INTO goals (id, company_id, employee_id, title, description, quarter, progress, category, status, due_date)
       VALUES (?, ?, ?, ?, ?, 'Q3 2026', 75, 'Engineering', 'on_track', '2026-09-30')`,
      [
        uuidv4(), companyId, emp1Id, 'Reduce MySQL Query Latency Under 20ms',
        'Optimize compound database indexes, connection pooling, and connection lifetime metrics.'
      ]
    );
    await query(
      `INSERT INTO goals (id, company_id, employee_id, title, description, quarter, progress, category, status, due_date)
       VALUES (?, ?, ?, ?, ?, 'Q3 2026', 90, 'Product & Design', 'completed', '2026-08-30')`,
      [
        uuidv4(), companyId, emp2Id, 'Deliver Editorial Design System 2.0',
        'Complete high-precision typography tokens and 3D continuous revolving frame motion.'
      ]
    );

    // Counter sequence
    await query(`INSERT INTO counters (id, seq) VALUES (?, 4)`, [`OI_${new Date().getFullYear().toString().slice(-2)}`]);

    console.log('✅ [MySQL] Workforce seeded into MySQL successfully (Odoo India - OI)!');
  } catch (err) {
    console.error('⚠️ [MySQL Seed Error]', err.message);
  }
}

/**
 * Pure SQL In-Memory Storage Engine
 */
function initInMemoryTables() {
  inMemoryTables.set('companies', []);
  inMemoryTables.set('departments', []);
  inMemoryTables.set('users', []);
  inMemoryTables.set('attendances', []);
  inMemoryTables.set('time_offs', []);
  inMemoryTables.set('leave_balances', []);
  inMemoryTables.set('announcements', []);
  inMemoryTables.set('expenses', []);
  inMemoryTables.set('goals', []);
  inMemoryTables.set('audit_logs', []);
  inMemoryTables.set('counters', []);
}

function executeInMemorySQL(sql, params = []) {
  const cleanSQL = sql.trim();
  const lower = cleanSQL.toLowerCase();

  // 1. CREATE TABLE
  if (lower.startsWith('create table')) {
    const match = cleanSQL.match(/create table (?:if not exists )?`?([a-zA-Z0-9_]+)`?/i);
    if (match) {
      const tbl = match[1];
      if (!inMemoryTables.has(tbl)) inMemoryTables.set(tbl, []);
    }
    return [{ affectedRows: 0 }];
  }

  // 2. INSERT INTO / ON DUPLICATE KEY UPDATE
  if (lower.startsWith('insert into')) {
    const match = cleanSQL.match(/insert into `?([a-zA-Z0-9_]+)`?\s*\(([^)]+)\)\s*values/i);
    if (match) {
      const tbl = match[1];
      const cols = match[2].split(',').map((c) => c.trim().replace(/`/g, ''));
      const row = {};
      cols.forEach((col, idx) => {
        row[col] = params[idx] !== undefined ? params[idx] : null;
      });

      if (!inMemoryTables.has(tbl)) inMemoryTables.set(tbl, []);
      const tableList = inMemoryTables.get(tbl);

      if (tbl === 'counters') {
        const existingCounter = tableList.find((c) => c.id === row.id);
        if (existingCounter) {
          existingCounter.seq = (existingCounter.seq || 0) + 1;
          return [{ insertId: row.id, affectedRows: 1 }];
        }
      }

      tableList.push(row);
      return [{ insertId: row.id || 1, affectedRows: 1 }];
    }
  }

  // 3. SELECT
  if (lower.startsWith('select')) {
    const fromMatch = cleanSQL.match(/from `?([a-zA-Z0-9_]+)`?/i);
    if (!fromMatch) return [{ connected: 1 }];
    const tbl = fromMatch[1];
    let rows = [...(inMemoryTables.get(tbl) || [])];

    // Join with departments if users table
    if (tbl === 'users') {
      const deptList = inMemoryTables.get('departments') || [];
      rows = rows.map((u) => {
        const d = deptList.find((dept) => String(dept.id) === String(u.department_id));
        return {
          ...u,
          department_name: d ? d.name : ''
        };
      });
    }

    // Join with users for attendances, time_offs, announcements, expenses, goals, audit_logs
    if (['time_offs', 'announcements', 'expenses', 'goals', 'audit_logs'].includes(tbl)) {
      const userList = inMemoryTables.get('users') || [];
      rows = rows.map((item) => {
        const authorOrEmpId = item.employee_id || item.author_id || item.actor_id;
        const u = userList.find((usr) => String(usr.id) === String(authorOrEmpId));
        const approver = item.approved_by ? userList.find((usr) => String(usr.id) === String(item.approved_by)) : null;
        return {
          ...item,
          first_name: u ? u.first_name : '',
          last_name: u ? u.last_name : '',
          email: u ? u.email : '',
          designation: u ? u.designation : '',
          avatar_color: u ? u.avatar_color : '#e09f67',
          avatar_url: u ? u.avatar_url : '',
          approver_first: approver ? approver.first_name : '',
          approver_last: approver ? approver.last_name : ''
        };
      });
    }

    // WHERE clause processing
    if (lower.includes('where')) {
      const wherePart = cleanSQL.slice(lower.indexOf('where') + 5).split(/order by|limit/i)[0].trim();
      const whereLower = wherePart.toLowerCase();

      rows = rows.filter((r) => {
        // Matches login_id OR email (handles u.login_id, login_id, etc.)
        if (whereLower.includes('login_id = ?') && whereLower.includes('email = ?')) {
          const val1 = String(params[0] || '').trim().toUpperCase();
          const val2 = String(params[1] || '').trim().toLowerCase();
          return (
            String(r.login_id || '').toUpperCase() === val1 ||
            String(r.email || '').toLowerCase() === val2 ||
            String(r.email || '').toLowerCase() === val1.toLowerCase() ||
            String(r.personal_email || '').toLowerCase() === val2
          );
        }

        // Email alone
        if (whereLower.includes('email = ?') && !whereLower.includes('login_id')) {
          const targetEmail = String(params[0] || '').trim().toLowerCase();
          return String(r.email || '').toLowerCase() === targetEmail;
        }

        // Company code
        if (whereLower.includes('company_code = ?')) {
          const targetCode = String(params[0] || '').trim().toUpperCase();
          return String(r.company_code || '').toUpperCase() === targetCode;
        }

        // ID match (e.g. id = ?, u.id = ?)
        if (whereLower.match(/(?:^|\s|\()u?\.?id\s*=\s*\?/)) {
          const targetId = String(params[0] || '');
          return String(r.id) === targetId;
        }

        // Employee ID and Date match (attendances)
        if (whereLower.includes('employee_id = ?') && whereLower.includes('date = ?')) {
          const empId = String(params[0] || '');
          const dt = String(params[1] || '');
          return String(r.employee_id) === empId && String(r.date) === dt;
        }

        // Employee ID and Company ID match (leave_balances)
        if (whereLower.includes('employee_id = ?') && whereLower.includes('company_id = ?')) {
          const empId = String(params[0] || '');
          const compId = String(params[1] || '');
          return String(r.employee_id) === empId && String(r.company_id) === compId;
        }

        // Company ID match alone
        if (whereLower.includes('company_id = ?')) {
          const compId = String(params[0] || '');
          let match = String(r.company_id) === compId;

          // Additional filters
          if (whereLower.includes('employee_id = ?')) {
            const empId = String(params[1] || params[0]);
            match = match && String(r.employee_id) === empId;
          }
          if (whereLower.includes('status = ?')) {
            const st = String(params[params.length - 1] || '');
            if (st !== 'all') match = match && String(r.status) === st;
          }
          return match;
        }

        return true;
      });
    }

    // ORDER BY & LIMIT
    if (lower.includes('order by')) {
      if (lower.includes('created_at desc')) {
        rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }
    }

    if (lower.includes('limit 1')) {
      return rows.slice(0, 1);
    }

    return rows;
  }

  // 4. UPDATE
  if (lower.startsWith('update')) {
    const match = cleanSQL.match(/update `?([a-zA-Z0-9_]+)`?\s+set\s+(.+?)\s+where\s+(.+)/i);
    if (match) {
      const tbl = match[1];
      const rows = inMemoryTables.get(tbl) || [];
      const setPart = match[2];
      const setCols = setPart.split(',').map((c) => c.split('=')[0].trim().replace(/`/g, ''));
      const whereTargetId = params[params.length - 1];

      rows.forEach((r) => {
        if (String(r.id) === String(whereTargetId) || String(r.employee_id) === String(whereTargetId)) {
          setCols.forEach((col, idx) => {
            if (params[idx] !== undefined) {
              r[col] = params[idx];
            }
          });
        }
      });
      return [{ affectedRows: 1 }];
    }
  }

  // 5. DELETE
  if (lower.startsWith('delete')) {
    const match = cleanSQL.match(/from `?([a-zA-Z0-9_]+)`?/i);
    if (match) {
      const tbl = match[1];
      if (params.length === 0) {
        inMemoryTables.set(tbl, []);
        return [{ affectedRows: 1 }];
      }
      const targetId = params[0];
      const rows = inMemoryTables.get(tbl) || [];
      const filtered = rows.filter((r) => String(r.id) !== String(targetId));
      inMemoryTables.set(tbl, filtered);
      return [{ affectedRows: 1 }];
    }
  }

  return [];
}

module.exports = {
  connectDB,
  query,
  autoSeedMySQL
};
