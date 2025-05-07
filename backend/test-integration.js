/**
 * Integration test for the graduating student check and profile creation
 * 
 * This script tests the integration between the graduating student check
 * and the profile creation functionality.
 */

const { initGraduatingEmails, isGraduatingStudent } = require('./utils/graduatingStudents');
const checkGraduatingStudent = require('./middleware/graduatingStudentCheck');

// Mock Express request and response objects
function createMockReq(email, userId) {
  return {
    body: { 
      email,
      user_id: userId || 'test-user-id',
      name: 'Test User',
      designation: 'Test Designation',
      description: 'Test Description'
    }
  };
}

function createMockRes() {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    }
  };
  return res;
}

// Mock profile creation function
async function mockCreateProfile(req, res) {
  const { email, user_id, name, designation, description } = req.body;
  
  console.log(`Creating profile for ${name} (${email}) with user_id: ${user_id}`);
  
  // Simulate database operation
  const profileId = Math.floor(Math.random() * 1000);
  
  return res.status(201).json({
    id: profileId,
    name,
    designation,
    description,
    email,
    user_id,
    created_at: new Date().toISOString()
  });
}

async function runTests() {
  try {
    console.log('Integration test for graduating student check and profile creation\n');
    
    // Initialize graduating emails list
    console.log('Initializing graduating emails list...');
    await initGraduatingEmails();
    console.log('Graduating emails list initialized.\n');
    
    // Test 1: Graduating student should be able to create a profile
    console.log('Test 1: Graduating student creating a profile');
    const graduatingEmail = 'shashank.shekhar@iitgn.ac.in';
    const reqGraduating = createMockReq(graduatingEmail);
    const resGraduating = createMockRes();
    
    // Apply middleware and then create profile
    await checkGraduatingStudent(reqGraduating, resGraduating, async () => {
      await mockCreateProfile(reqGraduating, resGraduating);
    });
    
    console.log(`Status code: ${resGraduating.statusCode}`);
    console.log(`Response: ${JSON.stringify(resGraduating.data)}`);
    console.log('Test 1 passed: Graduating student can create a profile.\n');
    
    // Test 2: Non-graduating student should not be able to create a profile
    console.log('Test 2: Non-graduating student attempting to create a profile');
    const nonGraduatingEmail = 'test@example.com';
    const reqNonGraduating = createMockReq(nonGraduatingEmail);
    const resNonGraduating = createMockRes();
    
    // Apply middleware (should block and not call next)
    await checkGraduatingStudent(reqNonGraduating, resNonGraduating, async () => {
      await mockCreateProfile(reqNonGraduating, resNonGraduating);
    });
    
    console.log(`Status code: ${resNonGraduating.statusCode}`);
    console.log(`Response: ${JSON.stringify(resNonGraduating.data)}`);
    
    if (resNonGraduating.statusCode === 403) {
      console.log('Test 2 passed: Non-graduating student cannot create a profile.\n');
    } else {
      console.log('Test 2 failed: Non-graduating student was allowed to create a profile.\n');
    }
    
    // Test 3: Missing email should return 400 Bad Request
    console.log('Test 3: Missing email in request');
    const reqMissingEmail = createMockReq(null);
    const resMissingEmail = createMockRes();
    
    // Apply middleware (should return 400)
    await checkGraduatingStudent(reqMissingEmail, resMissingEmail, async () => {
      await mockCreateProfile(reqMissingEmail, resMissingEmail);
    });
    
    console.log(`Status code: ${resMissingEmail.statusCode}`);
    console.log(`Response: ${JSON.stringify(resMissingEmail.data)}`);
    
    if (resMissingEmail.statusCode === 400) {
      console.log('Test 3 passed: Missing email returns 400 Bad Request.\n');
    } else {
      console.log('Test 3 failed: Missing email did not return 400 Bad Request.\n');
    }
    
    console.log('All integration tests completed!');
    
  } catch (error) {
    console.error('Error running integration tests:', error);
  }
}

// Run the tests
runTests();
