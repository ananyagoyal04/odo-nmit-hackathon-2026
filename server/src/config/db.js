const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MONGODB_URI, NODE_ENV } = require('./env');

let mongodInstance = null;
const tenantDbConnections = new Map();

/**
 * Auto-seeds demo data with high-res portrait photography, announcements, expenses, OKRs
 */
async function autoSeedDemoData(connection = mongoose.connection) {
  try {
    const Company = connection.model('Company');
    const existing = await Company.findOne({});
    if (existing) return; // Already initialized

    console.log('🌱 [Database] Empty database detected. Auto-seeding Odoo India demo workforce...');
    const Department = connection.model('Department');
    const User = connection.model('User');
    const Attendance = connection.model('Attendance');
    const TimeOff = connection.model('TimeOff');
    const LeaveBalance = connection.model('LeaveBalance');
    const AuditLog = connection.model('AuditLog');
    const Announcement = connection.model('Announcement');
    const Expense = connection.model('Expense');
    const Goal = connection.model('Goal');
    const { generateLoginId } = require('../utils/loginIdGenerator');

    // 1. Company
    const company = await Company.create({
      name: 'Odoo India',
      email: 'contact@odooindia.com',
      companyCode: 'OI',
      logo: ''
    });

    // 2. Departments
    const deptEng = await Department.create({
      companyId: company._id,
      name: 'Engineering',
      description: 'Core platform, infrastructure, and software engineering'
    });
    const deptDesign = await Department.create({
      companyId: company._id,
      name: 'Product & Design',
      description: 'Product strategy, UX research, and UI design'
    });
    const deptHR = await Department.create({
      companyId: company._id,
      name: 'People Operations',
      description: 'Human resources, talent acquisition, and employee success'
    });
    const deptSales = await Department.create({
      companyId: company._id,
      name: 'Sales & Marketing',
      description: 'Go-to-market, growth marketing, and enterprise sales'
    });

    const defaultPassword = 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // 3. Super Admin (Rajesh Sharma)
    const adminLoginId = await generateLoginId({
      companyCode: 'OI',
      companyId: company._id,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      joiningDate: new Date('2022-01-15')
    });

    const adminUser = await User.create({
      companyId: company._id,
      loginId: adminLoginId,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'admin@odooindia.com',
      passwordHash,
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
      designation: 'Managing Director & CEO',
      employeeCode: 'EMP-001',
      joiningDate: new Date('2022-01-15'),
      location: 'Gandhinagar, Gujarat',
      status: 'present',
      gender: 'Male',
      dob: new Date('1985-04-12'),
      maritalStatus: 'Married',
      nationality: 'Indian',
      address: '101 Horizon Heights, Infocity, Gandhinagar',
      personalEmail: 'rajesh.sharma.personal@gmail.com',
      bankInfo: {
        bankName: 'HDFC Bank',
        accountNumber: '50100482910293',
        ifsc: 'HDFC0000123',
        pan: 'ABCPS1234D',
        uan: '100918273645'
      },
      about: 'Executive leader with 15+ years experience building enterprise SaaS platforms and leading hypergrowth engineering organizations.',
      jobDescription: 'Strategic leadership, company growth, investor relations, and organizational culture.',
      hobbies: 'Golf, Angel Investing, Vintage Watches, Marathon Running',
      skills: ['Leadership', 'Corporate Strategy', 'SaaS Architecture', 'P&L Management', 'Enterprise Sales'],
      certifications: ['Executive Leadership Harvard', 'PMP Certified'],
      salary: { monthlyWage: 200000 },
      avatarColor: '#DC586D',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
      isActive: true
    });

    // 4. HR Manager (Priya Patel)
    const hrLoginId = await generateLoginId({
      companyCode: 'OI',
      companyId: company._id,
      firstName: 'Priya',
      lastName: 'Patel',
      joiningDate: new Date('2022-03-01')
    });

    const hrUser = await User.create({
      companyId: company._id,
      loginId: hrLoginId,
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'hr@odooindia.com',
      passwordHash,
      phone: '+91 98234 56789',
      role: 'HR',
      department: deptHR._id,
      designation: 'Head of People Operations',
      employeeCode: 'EMP-002',
      joiningDate: new Date('2022-03-01'),
      location: 'Gandhinagar, Gujarat',
      status: 'present',
      gender: 'Female',
      dob: new Date('1990-08-24'),
      maritalStatus: 'Single',
      nationality: 'Indian',
      address: '404 Green Valley, SG Highway, Ahmedabad',
      personalEmail: 'priya.patel.hr@yahoo.com',
      bankInfo: {
        bankName: 'ICICI Bank',
        accountNumber: '234501987654',
        ifsc: 'ICIC0000456',
        pan: 'BCDPP5678E',
        uan: '100827364519'
      },
      about: 'Passionate HR practitioner dedicated to employee well-being, progressive talent programs, and inclusive culture.',
      jobDescription: 'Oversee recruiting, payroll, statutory compliance, performance appraisals, and employee happiness.',
      hobbies: 'Classical Music, Baking, Yoga, Travel Photography',
      skills: ['Talent Acquisition', 'HR Strategy', 'Conflict Resolution', 'Payroll Compliance', 'Culture Building'],
      certifications: ['SHRM-CP Certified', 'Certified Payroll Specialist'],
      salary: { monthlyWage: 95000 },
      avatarColor: '#FB9590',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
      isActive: true
    });

    // 5. Employee (Shruthika Dutta)
    const emp1LoginId = await generateLoginId({
      companyCode: 'OI',
      companyId: company._id,
      firstName: 'Shruthika',
      lastName: 'Dutta',
      joiningDate: new Date('2022-05-10')
    });

    const emp1 = await User.create({
      companyId: company._id,
      loginId: emp1LoginId,
      firstName: 'Shruthika',
      lastName: 'Dutta',
      email: 'shruthika.dutta@odooindia.com',
      passwordHash,
      phone: '+91 97123 45678',
      role: 'EMPLOYEE',
      department: deptEng._id,
      designation: 'Senior Full Stack Engineer',
      employeeCode: 'EMP-003',
      joiningDate: new Date('2022-05-10'),
      location: 'Gandhinagar, Gujarat',
      status: 'present',
      gender: 'Female',
      dob: new Date('1994-11-18'),
      maritalStatus: 'Single',
      nationality: 'Indian',
      address: '22 Maple Woods, Bodakdev, Ahmedabad',
      personalEmail: 'shruthika.dutta@gmail.com',
      bankInfo: {
        bankName: 'HDFC Bank',
        accountNumber: '501009876543',
        ifsc: 'HDFC0000987',
        pan: 'CDESD9012F',
        uan: '100736451928'
      },
      about: 'Full-stack software architect specializing in reactive frontend frameworks, distributed microservices, and high-load systems.',
      jobDescription: 'Build core web applications, design REST & GraphQL APIs, and optimize database querying performance.',
      hobbies: 'Coffee Brewing, Classical Dance, Painting, Cycling',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'System Design', 'Docker', 'GraphQL'],
      certifications: ['AWS Certified Developer Associate', 'MongoDB Certified Professional'],
      salary: { monthlyWage: 120000 },
      avatarColor: '#FFBB94',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
      isActive: true
    });

    // 6. Employee (Aarav Mehta)
    const emp2LoginId = await generateLoginId({
      companyCode: 'OI',
      companyId: company._id,
      firstName: 'Aarav',
      lastName: 'Mehta',
      joiningDate: new Date('2023-01-16')
    });

    const emp2 = await User.create({
      companyId: company._id,
      loginId: emp2LoginId,
      firstName: 'Aarav',
      lastName: 'Mehta',
      email: 'aarav.mehta@odooindia.com',
      passwordHash,
      phone: '+91 96543 21098',
      role: 'EMPLOYEE',
      department: deptDesign._id,
      designation: 'Lead UI/UX Designer',
      employeeCode: 'EMP-004',
      joiningDate: new Date('2023-01-16'),
      location: 'Gandhinagar, Gujarat',
      status: 'present',
      gender: 'Male',
      dob: new Date('1993-07-05'),
      maritalStatus: 'Married',
      nationality: 'Indian',
      address: '15 Sunflower Meadows, Thaltej, Ahmedabad',
      personalEmail: 'aarav.mehta.design@gmail.com',
      bankInfo: {
        bankName: 'Axis Bank',
        accountNumber: '918020084729',
        ifsc: 'UTIB0000555',
        pan: 'DEFAM3456G',
        uan: '100645192837'
      },
      about: 'Design craftsman turning complex enterprise workflows into human-centric, calm software experiences.',
      jobDescription: 'Own product design system, Figma component tokens, micro-animations, and user research interviews.',
      hobbies: 'Architectural Sketching, Specialty Coffee, Cycling, Mechanical Keyboards',
      skills: ['Figma', 'Design Systems', 'User Research', 'Motion Design', 'Tailwind CSS', 'Micro-interactions'],
      certifications: ['Google UX Design Professional Certificate', 'Interaction Design Foundation Master'],
      salary: { monthlyWage: 105000 },
      avatarColor: '#852E4E',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
      isActive: true
    });

    // Managers & balances
    deptEng.manager = emp1._id;
    await deptEng.save();
    deptDesign.manager = emp2._id;
    await deptDesign.save();
    deptHR.manager = hrUser._id;
    await deptHR.save();

    const users = [adminUser, hrUser, emp1, emp2];
    for (const u of users) {
      await LeaveBalance.create({
        employeeId: u._id,
        companyId: company._id,
        pto: { total: 24, used: u._id.equals(emp1._id) ? 3 : 0 },
        sick: { total: 10, used: 0 }
      });
    }

    // 14 days of realistic attendance
    const now = new Date();
    for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - dayOffset);
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      for (const u of users) {
        const checkInTime = new Date(targetDate);
        checkInTime.setHours(9, Math.floor(Math.random() * 20), 0, 0);

        const checkOutTime = new Date(targetDate);
        checkOutTime.setHours(17, 45 + Math.floor(Math.random() * 25), 0, 0);

        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        const workHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

        await Attendance.create({
          employeeId: u._id,
          companyId: company._id,
          date: dateString,
          checkIn: checkInTime,
          checkOut: dayOffset === 0 && u.role === 'EMPLOYEE' ? null : checkOutTime,
          totalWorkHours: dayOffset === 0 && u.role === 'EMPLOYEE' ? 0 : workHours,
          status: 'present'
        });
      }
    }

    // Initial Company Announcements
    await Announcement.create([
      {
        companyId: company._id,
        authorId: adminUser._id,
        title: 'Q3 All-Hands Townhall & Product Roadmap Reveal',
        content: 'Join us this Friday at 4:00 PM IST in the main amphitheater and via Zoom for our quarterly company retrospective, product updates, and employee excellence awards.',
        category: 'Townhall',
        pinned: true,
        tags: ['Quarterly', 'AllHands', 'Roadmap']
      },
      {
        companyId: company._id,
        authorId: hrUser._id,
        title: 'Annual Wellness & Health Insurance Policy Refresh',
        content: 'We have updated our comprehensive medical insurance coverage including outpatient consultation reimbursements and mental wellness credits for all team members.',
        category: 'Policy',
        pinned: false,
        tags: ['Health', 'Insurance', 'Benefits']
      },
      {
        companyId: company._id,
        authorId: emp1._id,
        title: 'New Microservices Architecture Deployed to Production',
        content: 'The core platform migration to high-throughput Kubernetes clusters with zero-downtime deployment pipelines has successfully gone live.',
        category: 'Tech',
        pinned: false,
        tags: ['Engineering', 'Cloud', 'Release']
      }
    ]);

    // Initial Expense Claims
    await Expense.create([
      {
        companyId: company._id,
        employeeId: emp1._id,
        title: 'AWS Certified Solutions Architect Exam Fee',
        category: 'Training & Certifications',
        amount: 12500,
        expenseDate: new Date('2026-08-14'),
        description: 'Certification examination fee reimbursement as per technical learning policy.',
        status: 'approved',
        approvedBy: hrUser._id,
        approvedAt: new Date('2026-08-15')
      },
      {
        companyId: company._id,
        employeeId: emp2._id,
        title: 'Ergonomic Mechanical Keyboard & Monitor Stand',
        category: 'Equipment',
        amount: 8400,
        expenseDate: new Date('2026-08-18'),
        description: 'Home office ergonomic setup equipment claim.',
        status: 'pending'
      }
    ]);

    // Initial Goals & OKRs
    await Goal.create([
      {
        companyId: company._id,
        employeeId: emp1._id,
        title: 'Reduce API Response Latency Under 45ms',
        description: 'Implement distributed Redis caching layer and optimize MongoDB compound indexes.',
        quarter: 'Q3 2026',
        progress: 75,
        category: 'Engineering',
        status: 'on_track',
        dueDate: new Date('2026-09-30')
      },
      {
        companyId: company._id,
        employeeId: emp2._id,
        title: 'Publish Global Design System 2.0 (Sunset Tokens)',
        description: 'Complete Figma design library and deliver interactive React motion tokens.',
        quarter: 'Q3 2026',
        progress: 90,
        category: 'Product & Design',
        status: 'completed',
        dueDate: new Date('2026-08-30')
      }
    ]);

    console.log('✅ [Database] Auto-seeded complete luxury demo workforce (Odoo India - OI)!');
  } catch (seedErr) {
    console.error('⚠️ [Database AutoSeed Error]', seedErr.message);
  }
}

/**
 * Connect to primary MongoDB cluster
 */
const connectDB = async () => {
  try {
    const isAtlas = MONGODB_URI.startsWith('mongodb+srv://');
    console.log(`[Database] Connecting to ${isAtlas ? 'MongoDB Atlas Cluster' : 'MongoDB'}...`);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 20
    });
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedDemoData(conn.connection);
    return conn;
  } catch (error) {
    console.warn(`\n⚠️  [Database Notice] Connection to ${MONGODB_URI} not available (${error.message}).`);

    if (NODE_ENV !== 'production') {
      try {
        console.log('🔄 [Database] Initializing in-memory MongoDB development engine...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: { launchTimeout: 60000 }
        });
        const memUri = mongodInstance.getUri();
        const conn = await mongoose.connect(memUri, { maxPoolSize: 20 });
        console.log(`✅ [Database] In-Memory MongoDB Connected at: ${memUri}`);
        await autoSeedDemoData(conn.connection);
        return conn;
      } catch (memErr) {
        console.error('\n❌ [Database Error] Could not start in-memory MongoDB:', memErr.message);
      }
    }

    console.error('\n❌ [Database Fatal Error] Failed to connect to database.');
    console.error('👉 Please make sure MongoDB is running on port 27017, OR set a valid MONGODB_URI in server/.env\n');
    process.exit(1);
  }
};

function getTenantDB(companyId) {
  if (!companyId) return mongoose.connection;
  const dbName = `tenant_${String(companyId).toLowerCase()}`;

  if (tenantDbConnections.has(dbName)) {
    return tenantDbConnections.get(dbName);
  }

  const tenantConnection = mongoose.connection.useDb(dbName, { useCache: true });
  tenantDbConnections.set(dbName, tenantConnection);
  return tenantConnection;
}

module.exports = {
  connectDB,
  getTenantDB,
  autoSeedDemoData
};
