const { connectDB, autoSeedMySQL, query } = require('./src/config/mysql');

async function seed() {
  console.log('\n🌱 =================================================');
  console.log('   Starting MySQL Database Seeding for Odoo HR System    ');
  console.log('===================================================\n');

  try {
    await connectDB();
    console.log('[Seed] Cleaning existing MySQL tables...');

    const tables = [
      'companies', 'departments', 'users', 'attendances',
      'time_offs', 'leave_balances', 'announcements',
      'expenses', 'goals', 'audit_logs', 'counters'
    ];

    for (const t of tables) {
      await query(`DELETE FROM ${t}`);
    }

    console.log('[Seed] Seeding fresh workforce records into MySQL...');
    await autoSeedMySQL();

    console.log('\n✅ =================================================');
    console.log('   🎉 MySQL Database Seeded Successfully!                ');
    console.log('=====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed Fatal Error]', err);
    process.exit(1);
  }
}

seed();
