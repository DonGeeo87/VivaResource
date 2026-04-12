const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('../vivaresource-firebase-adminsdk-fbsvc-7f4fe61009.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const ADMIN_UID = '3TP4IksNrMOfTeEfmjrjiUq31nx2';

async function addAdminUser() {
  console.log('👤 Adding admin user...');
  
  await db.collection('admin_users').doc(ADMIN_UID).set({
    uid: ADMIN_UID,
    email: 'dongeeodev@gmail.com',
    role: 'admin',
    created_at: Timestamp.now(),
  });
  
  console.log(`✅ Admin user added: ${ADMIN_UID}`);
}

addAdminUser().catch(console.error);
