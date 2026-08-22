const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/config/mysql');
const db = require('../src/db/queries');

async function test() {
  console.log('Testing Admin Login against MySQL engine...');
  await connectDB();

  const user = await db.findUserByLoginOrEmail('ananya00476@gmail.com');
  console.log('Lookup Result for ananya00476@gmail.com:', user ? {
    id: user.id,
    loginId: user.loginId,
    email: user.email,
    role: user.role,
    firstName: user.firstName
  } : 'NOT FOUND');

  if (!user) {
    console.error('❌ User not found!');
    process.exit(1);
  }

  const match = await bcrypt.compare('nutan@1979', user.passwordHash);
  console.log('Password "nutan@1979" match result:', match);

  if (match) {
    console.log('✅ AUTHENTICATION VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ Password mismatch!');
    process.exit(1);
  }
}

test();
