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
  // Instant serverless engine for Vercel when no external remote database is configured
  if (process.env.VERCEL && (!process.env.MYSQL_HOST || process.env.MYSQL_HOST === '127.0.0.1' || process.env.MYSQL_HOST === 'localhost')) {
    isInMemoryFallback = true;
    initInMemoryTables();
    await autoSeedMySQL();
    console.log('✅ [MySQL] Pure SQL in-memory engine ready for Vercel deployment.');
    return null;
  }

  try {
    console.log(`[MySQL] Attempting connection to MySQL server at ${MYSQL_HOST}:${MYSQL_PORT}...`);

    // Step 1: Connect to server and ensure database exists (with fast timeout)
    const rootConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      connectTimeout: 1000
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
      queueLimit: 0,
      connectTimeout: 2000
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
 * Auto-Seed High-Grade Professional Enterprise MNC Dataset
 */
async function autoSeedMySQL() {
  try {
    const existing = await query('SELECT id FROM companies LIMIT 1');
    if (existing && existing.length > 0) return;

    console.log('🌱 [MySQL] Seeding Enterprise Multi-Tenant Dataset for Odoo Technologies India...');

    const companyId = 'e0c8a9ec-ef42-4b17-b984-d7479b2d6122';

    // 8 Real Software MNC Departments
    const deptEngId = 'd1111111-1111-4111-8111-111111111111';
    const deptDesignId = 'd2222222-2222-4222-8222-222222222222';
    const deptHRId = 'd3333333-3333-4333-8333-333333333333';
    const deptDevOpsId = 'd4444444-4444-4444-8444-444444444444';
    const deptAIId = 'd5555555-5555-4555-8555-555555555555';
    const deptFinanceId = 'd6666666-6666-4666-8666-666666666666';
    const deptQAId = 'd7777777-7777-4777-8777-777777777777';
    const deptSolutionsId = 'd8888888-8888-4888-8888-888888888888';

    // 1. Company
    await query(
      `INSERT INTO companies (id, name, email, company_code, logo) VALUES (?, ?, ?, ?, ?)`,
      [companyId, 'Odoo Technologies India Pvt. Ltd.', 'contact@odooindia.com', 'OI', '']
    );

    // 2. Insert Departments
    const depts = [
      [deptEngId, companyId, 'Core Engineering & Platform', 'High-throughput microservices, distributed caching, and backend API architecture.'],
      [deptDesignId, companyId, 'Product Strategy & Design', 'UI/UX systems, product design tokens, spatial ergonomics, and customer workflows.'],
      [deptHRId, companyId, 'People Operations & HR', 'Talent acquisition, organizational culture, statutory compliance, and employee benefits.'],
      [deptDevOpsId, companyId, 'Cloud Infrastructure & SRE', 'Multi-region AWS Kubernetes clusters, CI/CD pipelines, and 99.99% service availability.'],
      [deptAIId, companyId, 'AI & Data Intelligence', 'Machine learning algorithms, autonomous workflow agents, and predictive workforce analytics.'],
      [deptFinanceId, companyId, 'Finance, Payroll & Legal', 'Statutory payroll processing, EPF & TDS filing, financial auditing, and corporate governance.'],
      [deptQAId, companyId, 'Quality Engineering & SecOps', 'End-to-end automated testing pipelines, vulnerability assessments, and ISO 27001 compliance.'],
      [deptSolutionsId, companyId, 'Client Solutions & Enterprise Success', 'Enterprise customer onboarding, technical solution architecture, and 24/7 SLA management.']
    ];

    for (const d of depts) {
      await query(`INSERT INTO departments (id, company_id, name, description) VALUES (?, ?, ?, ?)`, d);
    }

    const defaultPassword = 'Password@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const adminPasswordHash = await bcrypt.hash('nutan@1979', 10);

    // 3. Realistic MNC Employees (12 Profiles)
    const employeesData = [
      {
        id: 'u1111111-1111-4111-8111-111111111111',
        loginId: 'OI220001',
        firstName: 'Rajesh',
        lastName: 'Sharma',
        email: 'admin@odooindia.com',
        altEmail: 'ananya00476@gmail.com',
        hash: adminPasswordHash,
        phone: '+91 98765 43210',
        role: 'SUPER_ADMIN',
        deptId: deptEngId,
        designation: 'Managing Director & VP Engineering',
        code: 'EMP-1001',
        joiningDate: '2021-08-01',
        location: 'Bengaluru / Gandhinagar Hub',
        status: 'present',
        gender: 'Male',
        dob: '1982-06-14',
        marital: 'Married',
        address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka - 560066',
        bankName: 'HDFC Bank',
        acc: '50100482910293',
        ifsc: 'HDFC0000123',
        pan: 'ABCPS1234D',
        uan: '100918273645',
        about: 'Executive technology leader with 18+ years building hyperscale enterprise SaaS platforms and distributed engineering organizations across India & North America.',
        jobDesc: 'Drive strategic architecture, corporate governance, engineering execution, and multi-tenant cloud operations.',
        hobbies: 'Angel Investing, Golf, Marathon Running, Strategic Chess',
        skills: ['Executive Leadership', 'Distributed Systems', 'System Architecture', 'P&L Strategy', 'Kubernetes'],
        certs: ['Stanford Executive Leadership Program', 'AWS Certified Solutions Architect Professional'],
        wage: 400000, // ₹48.0 LPA
        color: '#DC586D',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u2222222-2222-4222-8222-222222222222',
        loginId: 'OI220002',
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'hr@odooindia.com',
        altEmail: 'priya.patel@odooindia.com',
        hash: passwordHash,
        phone: '+91 98234 56789',
        role: 'HR',
        deptId: deptHRId,
        designation: 'Head of People Operations & HRBP',
        code: 'EMP-1002',
        joiningDate: '2022-01-10',
        location: 'Gandhinagar Hub, Gujarat',
        status: 'present',
        gender: 'Female',
        dob: '1989-11-20',
        marital: 'Married',
        address: '404 Green Valley, SG Highway, Bodakdev, Ahmedabad - 380054',
        bankName: 'ICICI Bank',
        acc: '234501987654',
        ifsc: 'ICIC0000456',
        pan: 'BCDPP5678E',
        uan: '100827364519',
        about: 'Senior HR business partner and talent strategist passionate about high-trust workplace culture, transparent compensation models, and high-velocity recruitment.',
        jobDesc: 'Oversee corporate hiring, statutory payroll audits, employee well-being initiatives, and executive performance cycles.',
        hobbies: 'Classical Indian Music, Yoga & Mindfulness, Artisan Baking',
        skills: ['Talent Strategy', 'Statutory Compliance', 'HRBP Leadership', 'Conflict Resolution', 'Compensation & Benefits'],
        certs: ['SHRM Senior Certified Professional (SHRM-SCP)', 'Certified Compensation & Benefits Manager (AON)'],
        wage: 180000, // ₹21.6 LPA
        color: '#FB9590',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u3333333-3333-4333-8333-333333333333',
        loginId: 'OI220003',
        firstName: 'Shruthika',
        lastName: 'Dutta',
        email: 'shruthika.dutta@odooindia.com',
        altEmail: 'shruthika.dutta@gmail.com',
        hash: passwordHash,
        phone: '+91 97123 45678',
        role: 'EMPLOYEE',
        deptId: deptEngId,
        designation: 'Staff Software Architect & Lead Backend Engineer',
        code: 'EMP-1003',
        joiningDate: '2022-04-18',
        location: 'Bengaluru Tech Campus',
        status: 'present',
        gender: 'Female',
        dob: '1993-08-15',
        marital: 'Single',
        address: 'Flat 702, Prestige Lakeside Habitat, Varthur, Bengaluru - 560087',
        bankName: 'HDFC Bank',
        acc: '501009876543',
        ifsc: 'HDFC0000987',
        pan: 'CDESD9012F',
        uan: '100736451928',
        about: 'Staff Architect with deep mastery of reactive node frameworks, low-latency MySQL schema optimizations, and distributed event-driven systems.',
        jobDesc: 'Design core multi-tenant data structures, optimize database query engines, and lead technical standards across the engineering org.',
        hobbies: 'Specialty Coffee Brewing, Trekking in Western Ghats, Oil Painting',
        skills: ['Node.js', 'React', 'MySQL 8.0', 'Redis Caching', 'System Design', 'Docker', 'GraphQL'],
        certs: ['AWS Certified Solutions Architect Associate', 'Oracle MySQL 8.0 Database Developer'],
        wage: 280000, // ₹33.6 LPA
        color: '#FFBB94',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u4444444-4444-4444-8444-444444444444',
        loginId: 'OI230004',
        firstName: 'Aarav',
        lastName: 'Mehta',
        email: 'aarav.mehta@odooindia.com',
        altEmail: 'aarav.mehta.design@gmail.com',
        hash: passwordHash,
        phone: '+91 96543 21098',
        role: 'EMPLOYEE',
        deptId: deptDesignId,
        designation: 'Principal Product Designer & Spatial UI Lead',
        code: 'EMP-1004',
        joiningDate: '2023-02-01',
        location: 'Gandhinagar Hub, Gujarat',
        status: 'present',
        gender: 'Male',
        dob: '1992-04-28',
        marital: 'Married',
        address: '15 Sunflower Meadows, Thaltej, Ahmedabad, Gujarat - 380059',
        bankName: 'Axis Bank',
        acc: '918020084729',
        ifsc: 'UTIB0000555',
        pan: 'DEFAM3456G',
        uan: '100645192837',
        about: 'Visionary product craftsman blending 3D spatial UI physics, continuous micro-interactions, and accessible typography into delightful enterprise workflows.',
        jobDesc: 'Lead the 5-theme global design system, 3D architectural canvas animations, and design tokens across mobile and web.',
        hobbies: 'Architectural Photography, Mechanical Keyboards, Long-Distance Cycling',
        skills: ['Figma Mastery', 'Design Systems', '3D Spatial Ergonomics', 'Motion Choreography', 'User Research'],
        certs: ['Google Professional UX Design Certificate', 'Nielsen Norman Group UX Master'],
        wage: 210000, // ₹25.2 LPA
        color: '#852E4E',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u5555555-5555-4555-8555-555555555555',
        loginId: 'OI220005',
        firstName: 'Vikramaditya',
        lastName: 'Singhania',
        email: 'vikram.singh@odooindia.com',
        altEmail: 'vikram.singhania@gmail.com',
        hash: passwordHash,
        phone: '+91 99887 76655',
        role: 'EMPLOYEE',
        deptId: deptDevOpsId,
        designation: 'Director of Cloud Infrastructure & SRE',
        code: 'EMP-1005',
        joiningDate: '2022-03-15',
        location: 'Hyderabad Tech Hub',
        status: 'present',
        gender: 'Male',
        dob: '1985-10-12',
        marital: 'Married',
        address: 'Tower 4, My Home Bhooja, HITEC City, Hyderabad, Telangana - 500081',
        bankName: 'State Bank of India',
        acc: '394820194829',
        ifsc: 'SBIN0004567',
        pan: 'EFGVS7890H',
        uan: '100556281930',
        about: 'Cloud infrastructure leader responsible for multi-tenant AWS Kubernetes infrastructure, 99.99% uptime SLAs, and zero-trust perimeter network security.',
        jobDesc: 'Orchestrate global AWS clusters, automated multi-AZ disaster recovery failover, and continuous monitoring.',
        hobbies: 'Astronomy, Woodworking, Road Trips',
        skills: ['Kubernetes (EKS)', 'Terraform', 'AWS Multi-Account', 'Prometheus & Grafana', 'Zero Trust Architecture'],
        certs: ['AWS Certified DevOps Engineer Professional', 'Certified Kubernetes Administrator (CKA)'],
        wage: 350000, // ₹42.0 LPA
        color: '#2E6F40',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u6666666-6666-4666-8666-666666666666',
        loginId: 'OI230006',
        firstName: 'Ananya',
        lastName: 'Deshmukh',
        email: 'ananya.deshmukh@odooindia.com',
        altEmail: 'ananya.ai@gmail.com',
        hash: passwordHash,
        phone: '+91 98345 67890',
        role: 'EMPLOYEE',
        deptId: deptAIId,
        designation: 'Lead AI & Machine Learning Scientist',
        code: 'EMP-1006',
        joiningDate: '2023-05-15',
        location: 'Bengaluru Tech Campus',
        status: 'present',
        gender: 'Female',
        dob: '1991-03-22',
        marital: 'Single',
        address: 'B-304, Sobha Silicon Oasis, Hosa Road, Electronic City, Bengaluru - 560100',
        bankName: 'Kotak Mahindra Bank',
        acc: '849201928374',
        ifsc: 'KKBK0000234',
        pan: 'FGHAD2345I',
        uan: '100445392817',
        about: 'AI researcher and NLP practitioner creating autonomous workforce agent models, predictive attrition telemetry, and natural language analytics engines.',
        jobDesc: 'Lead LLM fine-tuning pipelines, intelligent conversational HR bots, and automated payroll anomaly detectors.',
        hobbies: 'Classical Violin, Sci-Fi Literature, Bird Watching',
        skills: ['Python', 'PyTorch', 'LLMs & RAG', 'HuggingFace', 'FastAPI', 'MLOps', 'Vector Databases'],
        certs: ['DeepLearning.AI Generative AI Specialist', 'TensorFlow Developer Certified'],
        wage: 300000, // ₹36.0 LPA
        color: '#6B4E71',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u7777777-7777-4777-8777-777777777777',
        loginId: 'OI230007',
        firstName: 'Rohan',
        lastName: 'Kulkarni',
        email: 'rohan.kulkarni@odooindia.com',
        altEmail: 'rohan.kulkarni.dev@gmail.com',
        hash: passwordHash,
        phone: '+91 95432 10987',
        role: 'EMPLOYEE',
        deptId: deptDevOpsId,
        designation: 'Senior DevOps & Site Reliability Engineer',
        code: 'EMP-1007',
        joiningDate: '2023-08-01',
        location: 'Pune Tech Center',
        status: 'present',
        gender: 'Male',
        dob: '1994-12-05',
        marital: 'Single',
        address: '42 Orchid Towers, Baner-Pashan Link Road, Pune, Maharashtra - 411045',
        bankName: 'HDFC Bank',
        acc: '501007382910',
        ifsc: 'HDFC0000345',
        pan: 'GHIJK6789J',
        uan: '100334481920',
        about: 'DevOps engineer focused on infrastructure-as-code automation, Docker container security, and automated zero-downtime blue/green deployment pipelines.',
        jobDesc: 'Build GitHub Actions CI/CD workflows, manage Helm charts, and maintain Grafana application telemetry dashboards.',
        hobbies: 'Formula 1 Racing, Synthwave Music, Swimming',
        skills: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Linux Kernel', 'Shell Scripting', 'Datadog'],
        certs: ['Certified Kubernetes Application Developer (CKAD)', 'HashiCorp Certified Terraform Associate'],
        wage: 190000, // ₹22.8 LPA
        color: '#3A6073',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u8888888-8888-4888-8888-888888888888',
        loginId: 'OI230008',
        firstName: 'Neha',
        lastName: 'Subramanian',
        email: 'neha.subramanian@odooindia.com',
        altEmail: 'neha.subramanian@gmail.com',
        hash: passwordHash,
        phone: '+91 97654 32109',
        role: 'EMPLOYEE',
        deptId: deptDesignId,
        designation: 'Senior Product Manager - Enterprise HRMS',
        code: 'EMP-1008',
        joiningDate: '2023-09-12',
        location: 'Bengaluru Tech Campus',
        status: 'present',
        gender: 'Female',
        dob: '1992-07-19',
        marital: 'Married',
        address: 'A-1002, Purva Skywood, Haralur Road, Off Sarjapur Road, Bengaluru - 560102',
        bankName: 'ICICI Bank',
        acc: '234509182736',
        ifsc: 'ICIC0000789',
        pan: 'IJKLM0123K',
        uan: '100223371829',
        about: 'Product leader translating complex labor law compliances, statutory Indian taxation, and multi-tenant organizational dynamics into intuitive software features.',
        jobDesc: 'Define product roadmap, prioritize sprint backlogs with engineering, and conduct client discovery sessions.',
        hobbies: 'Podcasting, Specialty Tea Enthusiast, Pilates',
        skills: ['Product Strategy', 'Agile Scrum', 'Roadmap Prioritization', 'Data-Driven Analytics', 'User Story Mapping'],
        certs: ['Certified Scrum Product Owner (CSPO)', 'Pragmatic Institute Certified (PMC-III)'],
        wage: 240000, // ₹28.8 LPA
        color: '#E07A5F',
        avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'u9999999-9999-4999-8999-999999999999',
        loginId: 'OI240009',
        firstName: 'Kavita',
        lastName: 'Venkatesh',
        email: 'kavita.v@odooindia.com',
        altEmail: 'kavita.venkatesh@gmail.com',
        hash: passwordHash,
        phone: '+91 98456 12345',
        role: 'EMPLOYEE',
        deptId: deptQAId,
        designation: 'Lead QA Automation & Security Specialist',
        code: 'EMP-1009',
        joiningDate: '2024-01-08',
        location: 'Chennai Tech Center',
        status: 'present',
        gender: 'Female',
        dob: '1995-02-17',
        marital: 'Single',
        address: 'Plot 28, Karpagam Gardens, Adyar, Chennai, Tamil Nadu - 600020',
        bankName: 'Axis Bank',
        acc: '918010092837',
        ifsc: 'UTIB0000222',
        pan: 'JKLMN4567L',
        uan: '100112261738',
        about: 'Quality engineering pioneer building automated Playwright/Cypress end-to-end testing frameworks, API performance benchmarking, and OWASP security vulnerability sweeps.',
        jobDesc: 'Ensure zero-regression releases, maintain TestSprite automated test pipelines, and conduct security audits.',
        hobbies: 'Badminton, Classical Bharatanatyam, Board Games',
        skills: ['Playwright', 'TestSprite Automation', 'Cypress', 'Jest', 'Postman API Testing', 'OWASP Top 10', 'Performance Testing'],
        certs: ['ISTQB Certified Tester Advanced Level (CTAL)', 'Certified Ethical Hacker (CEH)'],
        wage: 160000, // ₹19.2 LPA
        color: '#81B29A',
        avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'uaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        loginId: 'OI240010',
        firstName: 'Aditya',
        lastName: 'Vardhan Rao',
        email: 'aditya.rao@odooindia.com',
        altEmail: 'aditya.vardhan.ca@gmail.com',
        hash: passwordHash,
        phone: '+91 99123 98765',
        role: 'EMPLOYEE',
        deptId: deptFinanceId,
        designation: 'Finance Lead & Statutory Tax Controller',
        code: 'EMP-1010',
        joiningDate: '2024-02-15',
        location: 'Hyderabad Tech Hub',
        status: 'present',
        gender: 'Male',
        dob: '1990-09-08',
        marital: 'Married',
        address: '502 Fortune Heights, Madhapur, Hyderabad, Telangana - 500086',
        bankName: 'HDFC Bank',
        acc: '501008192837',
        ifsc: 'HDFC0000678',
        pan: 'KLMNO8901M',
        uan: '100001151627',
        about: 'Chartered Accountant specializing in Indian statutory payroll compliance, EPF/EPS formulations, Professional Tax slabs, TDS under Sec 192, and corporate treasury management.',
        jobDesc: 'Manage company financial reconciliations, statutory payroll tax filings, external financial audits, and expense disbursements.',
        hobbies: 'Cricket, Financial Modeling, Stock Market Research',
        skills: ['Statutory Tax Law', 'EPF & ESIC Compliance', 'TDS Formulation', 'Corporate Accounting', 'Financial Modeling'],
        certs: ['Chartered Accountant (ICAI)', 'Certified Treasury Professional (CTP)'],
        wage: 200000, // ₹24.0 LPA
        color: '#F2CC8F',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'ubbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        loginId: 'OI240011',
        firstName: 'Meera',
        lastName: 'Nambiar',
        email: 'meera.nambiar@odooindia.com',
        altEmail: 'meera.nambiar.frontend@gmail.com',
        hash: passwordHash,
        phone: '+91 98111 22334',
        role: 'EMPLOYEE',
        deptId: deptEngId,
        designation: 'Frontend Specialist & Design Systems Engineer',
        code: 'EMP-1011',
        joiningDate: '2024-05-02',
        location: 'Kochi / Bengaluru Hub',
        status: 'present',
        gender: 'Female',
        dob: '1996-10-30',
        marital: 'Single',
        address: 'Villa 8, Skyline Riverdale, Kakkanad, Kochi, Kerala - 682030',
        bankName: 'State Bank of India',
        acc: '394810293847',
        ifsc: 'SBIN0008901',
        pan: 'LMNOP2345N',
        uan: '100998841526',
        about: 'Frontend specialist crafting butter-smooth 60fps animations, accessible React components, and responsive cross-browser experiences.',
        jobDesc: 'Develop modern interactive React modules, CSS theme systems, and dynamic data visualization charts.',
        hobbies: 'Indie Video Games, Specialty Pour-Over Coffee, Digital Illustration',
        skills: ['React 18', 'Vite', 'TypeScript', 'CSS3 & Vanilla CSS', 'Framer Motion', 'Web Accessibility (a11y)'],
        certs: ['Meta Certified Front-End Developer', 'Responsive Web Design FreeCodeCamp'],
        wage: 130000, // ₹15.6 LPA
        color: '#3D405B',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80'
      },
      {
        id: 'uccccccc-cccc-4ccc-8ccc-cccccccccccc',
        loginId: 'OI250012',
        firstName: 'Tanmay',
        lastName: 'Joshi',
        email: 'tanmay.joshi@odooindia.com',
        altEmail: 'tanmay.joshi.code@gmail.com',
        hash: passwordHash,
        phone: '+91 97222 33445',
        role: 'EMPLOYEE',
        deptId: deptEngId,
        designation: 'Associate Backend Engineer',
        code: 'EMP-1012',
        joiningDate: '2025-01-15',
        location: 'Pune Tech Center',
        status: 'present',
        gender: 'Male',
        dob: '1998-05-18',
        marital: 'Single',
        address: 'Flat 301, Silver Crest, Wakad, Pune, Maharashtra - 411057',
        bankName: 'ICICI Bank',
        acc: '234508291029',
        ifsc: 'ICIC0000123',
        pan: 'MNOPQ6789O',
        uan: '100887731425',
        about: 'Energetic backend engineer with a solid foundation in Express routing, input validation sanitizers, and database index optimization.',
        jobDesc: 'Implement secure REST APIs, unit tests, and performance instrumentation.',
        hobbies: 'Speedcubing, Table Tennis, Open Source Contributing',
        skills: ['Node.js', 'Express', 'MySQL', 'Git', 'RESTful API Design', 'Jest'],
        certs: ['Node.js Application Developer (JSNAD)', 'Postman API Fundamentals Student Expert'],
        wage: 70000, // ₹8.4 LPA
        color: '#F4A261',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80'
      }
    ];

    for (const emp of employeesData) {
      await query(
        `INSERT INTO users (
          id, company_id, login_id, first_name, last_name, email, password_hash, phone, role,
          department_id, designation, employee_code, joining_date, location, status, gender, dob,
          marital_status, nationality, address, personal_email, bank_name, account_number, ifsc,
          pan, uan, about, job_description, hobbies, skills, certifications, monthly_wage, avatar_color, avatar_url, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          emp.id, companyId, emp.loginId, emp.firstName, emp.lastName, emp.email, emp.hash,
          emp.phone, emp.role, emp.deptId, emp.designation, emp.code, emp.joiningDate,
          emp.location, emp.status, emp.gender, emp.dob, emp.marital, 'Indian',
          emp.address, emp.altEmail, emp.bankName, emp.acc, emp.ifsc, emp.pan, emp.uan,
          emp.about, emp.jobDesc, emp.hobbies, JSON.stringify(emp.skills), JSON.stringify(emp.certs),
          emp.wage, emp.color, emp.avatarUrl, 1
        ]
      );
    }

    // Set Department Managers
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u1111111-1111-4111-8111-111111111111', deptEngId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u4444444-4444-4444-8444-444444444444', deptDesignId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u2222222-2222-4222-8222-222222222222', deptHRId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u5555555-5555-4555-8555-555555555555', deptDevOpsId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u6666666-6666-4666-8666-666666666666', deptAIId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['uaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', deptFinanceId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u9999999-9999-4999-8999-999999999999', deptQAId]);
    await query(`UPDATE departments SET manager_id = ? WHERE id = ?`, ['u8888888-8888-4888-8888-888888888888', deptSolutionsId]);

    // Leave Balances for all employees
    for (const emp of employeesData) {
      await query(
        `INSERT INTO leave_balances (id, company_id, employee_id, pto_total, pto_used, sick_total, sick_used)
         VALUES (?, ?, ?, 24, ?, 10, ?)`,
        [uuidv4(), companyId, emp.id, emp.id === 'u3333333-3333-4333-8333-333333333333' ? 4 : 1, 0]
      );
    }

    // 30 Days of Authentic MNC Attendance Timestamps (09:05 - 18:45 IST)
    const now = new Date();
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - dayOffset);
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Saturday / Sunday

      const dateString = targetDate.toISOString().split('T')[0];

      for (let i = 0; i < employeesData.length; i++) {
        const emp = employeesData[i];
        // Generate natural variance: check-ins between 08:55 AM and 09:28 AM
        const checkInMin = 55 + (i * 3) % 35;
        const checkInHr = checkInMin >= 60 ? 9 : 8;
        const actualMin = checkInMin % 60;
        const checkInStr = `${dateString} ${String(checkInHr).padStart(2, '0')}:${String(actualMin).padStart(2, '0')}:${String(10 + (i * 4) % 45).padStart(2, '0')}`;

        // Check-out between 18:15 and 19:10
        const checkOutMin = (15 + (i * 5) % 55);
        const checkOutHr = 18 + Math.floor(checkOutMin / 60);
        const actualOutMin = checkOutMin % 60;
        const checkOutStr = `${dateString} ${String(checkOutHr).padStart(2, '0')}:${String(actualOutMin).padStart(2, '0')}:${String(20 + (i * 3) % 35).padStart(2, '0')}`;

        const workHours = Number((8.5 + ((i * 7) % 15) / 10).toFixed(2));

        await query(
          `INSERT INTO attendances (id, company_id, employee_id, date, check_in, check_out, total_work_hours, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'present')`,
          [
            uuidv4(),
            companyId,
            emp.id,
            dateString,
            checkInStr,
            dayOffset === 0 && emp.id === 'u3333333-3333-4333-8333-333333333333' ? null : checkOutStr,
            dayOffset === 0 && emp.id === 'u3333333-3333-4333-8333-333333333333' ? 0 : workHours
          ]
        );
      }
    }

    // Authentic Enterprise Time Off Requests
    await query(
      `INSERT INTO time_offs (id, company_id, employee_id, leave_type, start_date, end_date, days, reason, status, approved_by, approved_at)
       VALUES (?, ?, ?, 'Paid Time Off', '2026-08-20', '2026-08-22', 3, 'Family annual vacation and travel to native place.', 'approved', 'u2222222-2222-4222-8222-222222222222', '2026-08-18 11:30:00')`,
      [uuidv4(), companyId, 'u3333333-3333-4333-8333-333333333333']
    );
    await query(
      `INSERT INTO time_offs (id, company_id, employee_id, leave_type, start_date, end_date, days, reason, status)
       VALUES (?, ?, ?, 'Paid Time Off', '2026-09-18', '2026-09-19', 2, 'Attending International Tech Summit in Bangalore.', 'pending')`,
      [uuidv4(), companyId, 'u4444444-4444-4444-8444-444444444444']
    );
    await query(
      `INSERT INTO time_offs (id, company_id, employee_id, leave_type, start_date, end_date, days, reason, status)
       VALUES (?, ?, ?, 'Sick Leave', '2026-09-10', '2026-09-10', 1, 'Medical consultation and seasonal recovery.', 'pending')`,
      [uuidv4(), companyId, 'u7777777-7777-4777-8777-777777777777']
    );

    // Authentic Enterprise Announcements
    const announcementsList = [
      {
        author: 'u1111111-1111-4111-8111-111111111111',
        title: '🏛️ Q3 2026 Global Town Hall & FY27 Strategic Roadmap',
        content: 'Dear Team, Join us this Friday at 4:30 PM IST for our quarterly all-hands townhall. We will be sharing our record customer expansion metrics, unveiling our autonomous AI agents roadmap, and celebrating our quarterly peer recognition award winners!',
        cat: 'Townhall',
        pin: true,
        tags: ['Townhall', 'Strategy', 'Roadmap', 'AllHands']
      },
      {
        author: 'u2222222-2222-4222-8222-222222222222',
        title: '🪔 Festive Holiday Schedule: Diwali & Dussehra 2026 Office Operations',
        content: 'Please note the upcoming mandatory corporate holidays for Diwali and Dussehra. The offices will remain closed from Nov 1st to Nov 4th. Emergency SRE and on-call rotations will receive 2.5x compensatory allowance.',
        cat: 'Holiday',
        pin: true,
        tags: ['Holidays', 'Festive', 'Operations', 'Culture']
      },
      {
        author: 'u2222222-2222-4222-8222-222222222222',
        title: '🏥 Annual Corporate Health Checkup & Family GMC Insurance Enrollment',
        content: 'The window for updating your Group Medical Cover (GMC) and adding dependents or parents is open until Sept 30. All full-time employees are covered under ₹10,00,000 cashless family floater policy with zero co-pay.',
        cat: 'Policy',
        pin: false,
        tags: ['Insurance', 'Health', 'Wellness', 'Benefits']
      },
      {
        author: 'u3333333-3333-4333-8333-333333333333',
        title: '🚀 Odoo India Hackathon 2026: AI Agents & Spatial Workspaces',
        content: 'Registration is live for our 48-hour internal hackathon! Teams can build high-impact innovations in AI agent workflows, spatial design, and high-performance database engines. Total prize pool of ₹5,00,000!',
        cat: 'Tech',
        pin: false,
        tags: ['Hackathon', 'Innovation', 'AI', 'Prizes']
      },
      {
        author: 'u9999999-9999-4999-8999-999999999999',
        title: '🛡️ Mandatory ISO 27001 & SOC 2 Security Refresher Module',
        content: 'All team members across engineering, product, and HR are requested to complete the 20-minute online SOC 2 security compliance training module on our internal portal before the audit cycle starts next week.',
        cat: 'Policy',
        pin: false,
        tags: ['Security', 'Compliance', 'SOC2', 'ISO27001']
      }
    ];

    for (const a of announcementsList) {
      await query(
        `INSERT INTO announcements (id, company_id, author_id, title, content, category, pinned, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), companyId, a.author, a.title, a.content, a.cat, a.pin, JSON.stringify(a.tags)]
      );
    }

    // Authentic Enterprise Expenses in Indian Rupees (₹)
    const expensesList = [
      {
        emp: 'u3333333-3333-4333-8333-333333333333',
        title: 'AWS Certified Solutions Architect Professional Exam Fee',
        cat: 'Training & Certifications',
        amount: 24500,
        date: '2026-08-12',
        desc: 'Official examination fee reimbursement as per company continuous learning policy.',
        status: 'approved',
        approver: 'u2222222-2222-4222-8222-222222222222',
        appDate: '2026-08-14'
      },
      {
        emp: 'u4444444-4444-4444-8444-444444444444',
        title: 'Ergonomic Dual-Monitor Desk Arm & Mechanical Keyboard',
        cat: 'Equipment',
        amount: 18400,
        date: '2026-08-19',
        desc: 'Ergonomic home office equipment reimbursement allowance.',
        status: 'approved',
        approver: 'u2222222-2222-4222-8222-222222222222',
        appDate: '2026-08-20'
      },
      {
        emp: 'u5555555-5555-4555-8555-555555555555',
        title: 'Client Onsite Architectural Workshop Flights & Hotel (IndiGo BLR)',
        cat: 'Travel & Accommodation',
        amount: 32650,
        date: '2026-08-28',
        desc: 'Round-trip airfare and 2-night corporate hotel stay for enterprise customer architectural summit.',
        status: 'approved',
        approver: 'u1111111-1111-4111-8111-111111111111',
        appDate: '2026-08-29'
      },
      {
        emp: 'u7777777-7777-4777-8777-777777777777',
        title: 'JetBrains All Products Pack & Docker Desktop Annual Team License',
        cat: 'Software & Subscriptions',
        amount: 28900,
        date: '2026-09-02',
        desc: 'Annual developer tooling license renewal for core platform engineering.',
        status: 'pending'
      },
      {
        emp: 'u8888888-8888-4888-8888-888888888888',
        title: 'Q3 Engineering Sprint Milestone Team Dinner (ITC Gardenia BLR)',
        cat: 'Team Events',
        amount: 16800,
        date: '2026-09-03',
        desc: 'Team celebration dinner upon shipping HRMS v2.4 Microservices migration.',
        status: 'pending'
      }
    ];

    for (const exp of expensesList) {
      await query(
        `INSERT INTO expenses (id, company_id, employee_id, title, category, amount, expense_date, description, status, approved_by, approved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), companyId, exp.emp, exp.title, exp.cat, exp.amount, exp.date, exp.desc, exp.status, exp.approver || null, exp.appDate || null]
      );
    }

    // Authentic Enterprise OKRs & Goals
    const goalsList = [
      {
        emp: 'u3333333-3333-4333-8333-333333333333',
        title: 'Achieve Sub-15ms MySQL Query Latency & Zero Failover Loss',
        desc: 'Optimize compound indexing, connection pooling parameters, and connection lifetime metrics for 100K active concurrent records.',
        quarter: 'Q3 2026',
        progress: 88,
        cat: 'Engineering',
        status: 'on_track',
        dueDate: '2026-09-30'
      },
      {
        emp: 'u4444444-4444-4444-8444-444444444444',
        title: 'Deliver 3D Continuous Revolving Spatial Workspace & 5-Theme Engine',
        desc: 'Complete high-precision typography tokens, continuous mouse gyro physics, and dark mode palette consistency.',
        quarter: 'Q3 2026',
        progress: 95,
        cat: 'Product & Design',
        status: 'completed',
        dueDate: '2026-08-30'
      },
      {
        emp: 'u5555555-5555-4555-8555-555555555555',
        title: 'Migrate AWS Infrastructure to Multi-Region Active-Active Kubernetes Clusters',
        desc: 'Deploy Terraform modules for automated failover between AWS ap-south-1 (Mumbai) and ap-south-2 (Hyderabad).',
        quarter: 'Q3 2026',
        progress: 75,
        cat: 'DevOps & SRE',
        status: 'on_track',
        dueDate: '2026-09-30'
      },
      {
        emp: 'u6666666-6666-4666-8666-666666666666',
        title: 'Deploy Autonomous RAG AI Agent for Employee Self-Service Payroll',
        desc: 'Fine-tune open-weights LLM on corporate HR policy and Indian labor compliance for instant automated employee queries.',
        quarter: 'Q3 2026',
        progress: 82,
        cat: 'AI & Data',
        status: 'on_track',
        dueDate: '2026-09-30'
      },
      {
        emp: 'u2222222-2222-4222-8222-222222222222',
        title: 'Scale High-Performance Engineering Workforce by 25 Senior Engineers',
        desc: 'Streamline technical interview loops, achieve 85% offer acceptance rate, and execute seamless onboarding.',
        quarter: 'Q3 2026',
        progress: 70,
        cat: 'People Operations',
        status: 'on_track',
        dueDate: '2026-09-30'
      },
      {
        emp: 'uaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        title: 'Automate 100% Statutory EPF & Monthly TDS Form 24Q Filing Pipelines',
        desc: 'Eliminate manual spreadsheet reconciliations and implement one-click automated bank direct-debit batch disbursements.',
        quarter: 'Q3 2026',
        progress: 100,
        cat: 'Finance',
        status: 'completed',
        dueDate: '2026-08-31'
      }
    ];

    for (const g of goalsList) {
      await query(
        `INSERT INTO goals (id, company_id, employee_id, title, description, quarter, progress, category, status, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), companyId, g.emp, g.title, g.desc, g.quarter, g.progress, g.cat, g.status, g.dueDate]
      );
    }

    // Authentic Enterprise Security Audit Logs
    const auditLogsList = [
      {
        actorId: 'u1111111-1111-4111-8111-111111111111',
        action: 'SUPER_ADMIN_AUTH',
        targetType: 'AuthSession',
        targetId: 'u1111111-1111-4111-8111-111111111111',
        metadata: { clearance: 'LEVEL_5_ROOT', mfa: 'HARDWARE_TOKEN_VERIFIED', location: 'Bengaluru HQ' },
        ip: '10.0.4.12'
      },
      {
        actorId: 'uaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        action: 'STATUTORY_PAYROLL_RUN',
        targetType: 'PayrollBatch',
        targetId: 'PB-2026-09',
        metadata: { month: 'September 2026', totalDisbursed: 2840000, epfContribution: 170400, taxDeducted: 426000 },
        ip: '172.16.20.14'
      },
      {
        actorId: 'u2222222-2222-4222-8222-222222222222',
        action: 'TIMEOFF_APPROVE',
        targetType: 'TimeOff',
        targetId: 'u3333333-3333-4333-8333-333333333333',
        metadata: { employee: 'Shruthika Dutta', leaveType: 'Paid Time Off', days: 3, approvedBalance: 21 },
        ip: '192.168.1.104'
      },
      {
        actorId: 'u1111111-1111-4111-8111-111111111111',
        action: 'SALARY_UPDATE',
        targetType: 'Compensation',
        targetId: 'u3333333-3333-4333-8333-333333333333',
        metadata: { employee: 'Shruthika Dutta', oldWage: 240000, newWage: 280000, appraisalQuarter: 'Q3 2026', designation: 'Staff Software Architect' },
        ip: '10.0.4.12'
      },
      {
        actorId: 'u2222222-2222-4222-8222-222222222222',
        action: 'EXPENSE_APPROVED',
        targetType: 'ExpenseClaim',
        targetId: 'EXP-8891',
        metadata: { employee: 'Shruthika Dutta', category: 'Training & Certifications', amount: 24500, title: 'AWS Certified Solutions Architect Professional' },
        ip: '192.168.1.104'
      },
      {
        actorId: 'u1111111-1111-4111-8111-111111111111',
        action: 'DEPARTMENT_CREATE',
        targetType: 'Department',
        targetId: deptAIId,
        metadata: { departmentName: 'AI & Data Intelligence', lead: 'Ananya Deshmukh', budgetAllocationLakhs: 45 },
        ip: '10.0.4.12'
      },
      {
        actorId: 'u9999999-9999-4999-8999-999999999999',
        action: 'SECURITY_AUDIT_CHECK',
        targetType: 'ISO_27001_COMPLIANCE',
        targetId: 'SOC2-TYPE-II',
        metadata: { scanEngine: 'OWASP_ZAP_AUTOMATED', vulnerabilitiesFound: 0, tlsStatus: 'TLS_1_3_ENFORCED', posture: 'COMPLIANT' },
        ip: '10.2.14.88'
      },
      {
        actorId: 'u2222222-2222-4222-8222-222222222222',
        action: 'EMPLOYEE_CREATE',
        targetType: 'User',
        targetId: 'uccccccc-cccc-4ccc-8ccc-cccccccccccc',
        metadata: { employeeCode: 'EMP-1012', loginId: 'OI250012', name: 'Tanmay Joshi', department: 'Core Engineering & Platform' },
        ip: '192.168.1.104'
      },
      {
        actorId: 'u1111111-1111-4111-8111-111111111111',
        action: 'ROLE_MODIFIED',
        targetType: 'RBAC_Policy',
        targetId: 'u2222222-2222-4222-8222-222222222222',
        metadata: { user: 'Priya Patel', grantedRoles: ['HR_ADMIN', 'PAYROLL_APPROVER'], approvedBy: 'Rajesh Sharma' },
        ip: '10.0.4.12'
      },
      {
        actorId: 'u2222222-2222-4222-8222-222222222222',
        action: 'POLICY_BROADCAST',
        targetType: 'Announcement',
        targetId: 'ANN-2026-Q3',
        metadata: { title: 'Annual Corporate Health Checkup & Family GMC Insurance', priority: 'HIGH', broadcastAudience: 'ALL_EMPLOYEES' },
        ip: '192.168.1.104'
      }
    ];

    for (const log of auditLogsList) {
      await query(
        `INSERT INTO audit_logs (id, company_id, actor_id, action, target_type, target_id, metadata, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), companyId, log.actorId, log.action, log.targetType, log.targetId, JSON.stringify(log.metadata), log.ip]
      );
    }

    // Counter sequence
    await query(`INSERT INTO counters (id, seq) VALUES (?, 12)`, [`OI_${new Date().getFullYear().toString().slice(-2)}`]);

    console.log('✅ [MySQL] Enterprise Workforce seeded into MySQL successfully (Odoo Technologies India - OI)!');
  } catch (err) {
    console.error('⚠️ [MySQL Seed Error]', err.message);
  }
}

/**
 * Pure SQL In-Memory Storage Engine with Comprehensive SQL Parser
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

        // Company ID match alone with optional extra filters
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
      if (lower.includes('pinned desc')) {
        rows.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      } else if (lower.includes('created_at desc') || lower.includes('date desc')) {
        rows.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
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
