const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'vivaresource',
});

const db = admin.firestore();

async function addAdminUser(uid, email) {
  try {
    console.log(`🔧 Agregando admin user: ${email}\n`);
    
    await db.collection('admin_users').doc(uid).set({
      uid: uid,
      email: email,
      role: 'admin',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Admin user agregado exitosamente!`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);
    console.log(`   UID: ${uid}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const uid = process.argv[2];
const email = process.argv[3] || 'dongeeodev@gmail.com';

if (!uid) {
  console.error('❌ Uso: node scripts/add-admin-user.js <UID> [EMAIL]');
  console.error('   Ejemplo: node scripts/add-admin-user.js abc123xyz dongeeodev@gmail.com');
  process.exit(1);
}

addAdminUser(uid, email);
