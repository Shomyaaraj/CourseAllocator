/**
 * seedAdminInvite.js
 * ──────────────────
 * Run once to create the Firestore config/adminInvite document
 * that gates admin registration.
 *
 * Usage:  node scripts/seedAdminInvite.js
 *
 * Requirements:
 *   - Firebase Admin SDK service account key placed at
 *     scripts/serviceAccountKey.json   (DO NOT COMMIT to git)
 *   - npm install firebase-admin  (in project root)
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vuca-course-allocation-app',
});

const db = admin.firestore();

async function seed() {
  const ref = db.collection('config').doc('adminInvite');
  const snap = await ref.get();

  if (snap.exists) {
    console.log('✅ config/adminInvite already exists:', snap.data());
    process.exit(0);
  }

  await ref.set({
    code: 'VUCA-ADMIN-2024',        // ← Change this to your desired invite code
    usesLeft: 10,                   // ← Number of admins that can register with this code
    description: 'Admin invite code for VUCA system administrators',
    createdAt: new Date().toISOString(),
  });

  console.log('✅ Seeded config/adminInvite successfully!');
  console.log('   Invite code: VUCA-ADMIN-2024');
  console.log('   Uses left:   10');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error seeding:', err);
  process.exit(1);
});
