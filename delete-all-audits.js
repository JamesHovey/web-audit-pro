const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllAudits() {
  try {
    console.log('🔍 Checking total audit count...');
    
    const totalCount = await prisma.audit.count();
    console.log(`📊 Found ${totalCount} total audit(s) in database`);
    
    if (totalCount === 0) {
      console.log('✅ Database is already clean - no audits to delete');
      return;
    }
    
    console.log('🗑️ Deleting ALL audit data to eliminate any fake data contamination...');
    
    const deleteResult = await prisma.audit.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.count} audit(s) from database.`);
    console.log('🎯 All audit data eliminated - database is now completely clean!');
    console.log('📋 Fresh start: All future audits will use 100% real API data only');
    
  } catch (error) {
    console.error('❌ Error deleting audits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllAudits();