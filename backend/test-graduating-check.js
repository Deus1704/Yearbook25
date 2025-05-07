/**
 * Test script for the graduating student check utility
 * 
 * This script tests the functionality of the graduating student check utility
 * by checking if various email addresses are in the graduating_list.csv file.
 */

const { initGraduatingEmails, isGraduatingStudent, getAllGraduatingEmails } = require('./utils/graduatingStudents');

async function runTests() {
  try {
    console.log('Initializing graduating emails list...');
    await initGraduatingEmails();
    
    console.log('\nTesting with sample emails:');
    
    // Test with some emails from the CSV file (should return true)
    const testEmails = [
      'shashank.shekhar@iitgn.ac.in',
      'jerene.george@iitgn.ac.in',
      'krishna.bhavsar@iitgn.ac.in'
    ];
    
    for (const email of testEmails) {
      const result = await isGraduatingStudent(email);
      console.log(`${email}: ${result ? 'Is a graduating student' : 'Not a graduating student'}`);
    }
    
    // Test with some emails not in the CSV file (should return false)
    const nonGraduatingEmails = [
      'test@example.com',
      'random@iitgn.ac.in',
      'notinlist@iitgn.ac.in'
    ];
    
    for (const email of nonGraduatingEmails) {
      const result = await isGraduatingStudent(email);
      console.log(`${email}: ${result ? 'Is a graduating student' : 'Not a graduating student'}`);
    }
    
    // Get all graduating emails and print the count
    const allEmails = await getAllGraduatingEmails();
    console.log(`\nTotal graduating students: ${allEmails.length}`);
    console.log('First 5 graduating emails:');
    allEmails.slice(0, 5).forEach(email => console.log(`- ${email}`));
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
