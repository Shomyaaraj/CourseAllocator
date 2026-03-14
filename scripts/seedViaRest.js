// seed using native fetch (Node 18+)
const PROJECT_ID = 'vuca-course-allocation-app';
const API_KEY = 'AIzaSyA8Z76pLvgw8tydMIn_JNSdl4X74zu8Qcc';
const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/config/adminInvite?key=${API_KEY}`;

const body = {
  fields: {
    code:        { stringValue:  'VUCA-ADMIN-2024' },
    usesLeft:    { integerValue: '10' },
    description: { stringValue:  'Admin invite code for VUCA system administrators' },
    createdAt:   { stringValue:  new Date().toISOString() }
  }
};

fetch(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
  .then(r => r.json())
  .then(data => {
    if (data.name) {
      console.log('✅ config/adminInvite seeded!');
      console.log('   Invite code : VUCA-ADMIN-2024');
      console.log('   Uses left   : 10');
    } else {
      console.error('❌ Error:', JSON.stringify(data, null, 2));
    }
  })
  .catch(e => console.error('❌ Network error:', e));
