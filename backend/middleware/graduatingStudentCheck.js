/**
 * Middleware to check if a user is a graduating student
 * 
 * This middleware validates if the user's email is in the graduating_list.csv file
 * and only allows profile creation for graduating students.
 */

const { isGraduatingStudent } = require('../utils/graduatingStudents');

/**
 * Middleware to check if a user is a graduating student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function checkGraduatingStudent(req, res, next) {
  // Extract email from request body
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required',
      message: 'Please provide an email address to create a profile'
    });
  }

  try {
    // Check if the email belongs to a graduating student
    const isGraduating = await isGraduatingStudent(email);
    
    if (!isGraduating) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only graduating students can create profiles. You can still interact with the yearbook through comments, messages, and photo uploads.'
      });
    }
    
    // User is a graduating student, proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error checking graduating student status:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred while checking graduating student status'
    });
  }
}

module.exports = checkGraduatingStudent;
