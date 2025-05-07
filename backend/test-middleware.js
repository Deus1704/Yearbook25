/**
 * Test script for the graduating student check middleware
 * 
 * This script simulates HTTP requests to test the middleware functionality
 */

const checkGraduatingStudent = require('./middleware/graduatingStudentCheck');

// Mock Express request and response objects
function createMockReq(email) {
  return {
    body: { email }
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

async function runTests() {
  try {
    console.log('Testing graduating student check middleware...\n');
    
    // Test with a graduating student email (should call next)
    const graduatingEmail = 'shashank.shekhar@iitgn.ac.in';
    const reqGraduating = createMockReq(graduatingEmail);
    const resGraduating = createMockRes();
    let nextCalled = false;
    
    await checkGraduatingStudent(reqGraduating, resGraduating, () => {
      nextCalled = true;
    });
    
    console.log(`Test with graduating email (${graduatingEmail}):`);
    console.log(`Next function called: ${nextCalled}`);
    console.log(`Status code: ${resGraduating.statusCode || 'Not set'}`);
    console.log(`Response data: ${JSON.stringify(resGraduating.data || 'Not set')}\n`);
    
    // Test with a non-graduating student email (should return 403)
    const nonGraduatingEmail = 'test@example.com';
    const reqNonGraduating = createMockReq(nonGraduatingEmail);
    const resNonGraduating = createMockRes();
    let nextCalledNonGraduating = false;
    
    await checkGraduatingStudent(reqNonGraduating, resNonGraduating, () => {
      nextCalledNonGraduating = true;
    });
    
    console.log(`Test with non-graduating email (${nonGraduatingEmail}):`);
    console.log(`Next function called: ${nextCalledNonGraduating}`);
    console.log(`Status code: ${resNonGraduating.statusCode}`);
    console.log(`Response data: ${JSON.stringify(resNonGraduating.data)}\n`);
    
    // Test with missing email (should return 400)
    const reqMissingEmail = createMockReq(null);
    const resMissingEmail = createMockRes();
    let nextCalledMissingEmail = false;
    
    await checkGraduatingStudent(reqMissingEmail, resMissingEmail, () => {
      nextCalledMissingEmail = true;
    });
    
    console.log(`Test with missing email:`);
    console.log(`Next function called: ${nextCalledMissingEmail}`);
    console.log(`Status code: ${resMissingEmail.statusCode}`);
    console.log(`Response data: ${JSON.stringify(resMissingEmail.data)}`);
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
