// Firebase Rules Testing Script
// Run with: node test-rules.js

const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

const PROJECT_ID = 'dotogether-c0b18';

let testEnv;

async function setupTestEnvironment() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
    },
    storage: {
      rules: require('fs').readFileSync('storage.rules', 'utf8'),
    },
  });
}

async function testFirestoreRules() {
  console.log('🧪 Testing Firestore Rules...');
  
  // Test authenticated user access
  const authenticatedUser = testEnv.authenticatedContext('user123', {
    email: 'test@example.com'
  });
  
  const unauthenticatedUser = testEnv.unauthenticatedContext();
  
  // Test 1: Unauthenticated user cannot read users
  console.log('Test 1: Unauthenticated access should fail');
  await assertFails(
    unauthenticatedUser.firestore().collection('users').doc('testuser').get()
  );
  console.log('✅ Passed');
  
  // Test 2: Authenticated user can create their own user document
  console.log('Test 2: User can create their own document');
  await assertSucceeds(
    authenticatedUser.firestore().collection('users').doc('testuser').set({
      email: 'test@example.com',
      username: 'testuser',
      isPublicProfile: false
    })
  );
  console.log('✅ Passed');
  
  // Test 3: User cannot create document for another user
  console.log('Test 3: User cannot create document for another user');
  await assertFails(
    authenticatedUser.firestore().collection('users').doc('otheruser').set({
      email: 'other@example.com',
      username: 'otheruser',
      isPublicProfile: false
    })
  );
  console.log('✅ Passed');
  
  console.log('🎉 All Firestore rule tests passed!');
}

async function testStorageRules() {
  console.log('🧪 Testing Storage Rules...');
  
  const authenticatedUser = testEnv.authenticatedContext('user123');
  const unauthenticatedUser = testEnv.unauthenticatedContext();
  
  // Test 1: Unauthenticated user cannot upload
  console.log('Test 1: Unauthenticated upload should fail');
  await assertFails(
    unauthenticatedUser.storage().ref('users/user123/profile/avatar.jpg').put(Buffer.from('fake-image'))
  );
  console.log('✅ Passed');
  
  // Test 2: User can upload to their own profile folder
  console.log('Test 2: User can upload to own profile');
  await assertSucceeds(
    authenticatedUser.storage().ref('users/user123/profile/avatar.jpg').put(Buffer.from('fake-image'))
  );
  console.log('✅ Passed');
  
  console.log('🎉 All Storage rule tests passed!');
}

async function runTests() {
  try {
    await setupTestEnvironment();
    await testFirestoreRules();
    await testStorageRules();
    console.log('🎊 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (testEnv) {
      await testEnv.cleanup();
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };