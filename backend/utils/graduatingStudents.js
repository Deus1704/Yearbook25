/**
 * Utility for managing graduating student email validation
 * 
 * This module provides functions to:
 * 1. Parse the graduating_list.csv file
 * 2. Extract and validate email addresses
 * 3. Check if a given email belongs to a graduating student
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Path to the graduating list CSV file
const GRADUATING_LIST_PATH = path.join(__dirname, '..', '..', 'graduating_list.csv');

// Store the list of graduating emails in memory for quick lookups
let graduatingEmails = new Set();
let isInitialized = false;

/**
 * Initialize the graduating emails list by parsing the CSV file
 * @returns {Promise<Set<string>>} A set of graduating student email addresses
 */
async function initGraduatingEmails() {
  return new Promise((resolve, reject) => {
    if (isInitialized) {
      return resolve(graduatingEmails);
    }

    // Check if the file exists
    if (!fs.existsSync(GRADUATING_LIST_PATH)) {
      console.error(`Graduating list file not found at ${GRADUATING_LIST_PATH}`);
      reject(new Error('Graduating list file not found'));
      return;
    }

    // Parse the CSV file
    const emails = new Set();
    fs.createReadStream(GRADUATING_LIST_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Extract the email from the row
        const email = row['Email ID'];
        if (email && email.includes('@')) {
          emails.add(email.toLowerCase().trim());
        }
      })
      .on('end', () => {
        console.log(`Loaded ${emails.size} graduating student emails`);
        graduatingEmails = emails;
        isInitialized = true;
        resolve(emails);
      })
      .on('error', (error) => {
        console.error('Error parsing graduating list CSV:', error);
        reject(error);
      });
  });
}

/**
 * Check if an email belongs to a graduating student
 * @param {string} email The email address to check
 * @returns {Promise<boolean>} True if the email belongs to a graduating student
 */
async function isGraduatingStudent(email) {
  if (!email) return false;
  
  // Initialize the list if not already done
  if (!isInitialized) {
    try {
      await initGraduatingEmails();
    } catch (error) {
      console.error('Error initializing graduating emails:', error);
      return false;
    }
  }

  // Check if the email is in the set (case-insensitive)
  return graduatingEmails.has(email.toLowerCase().trim());
}

/**
 * Get the list of all graduating student emails
 * @returns {Promise<string[]>} Array of graduating student emails
 */
async function getAllGraduatingEmails() {
  if (!isInitialized) {
    try {
      await initGraduatingEmails();
    } catch (error) {
      console.error('Error initializing graduating emails:', error);
      return [];
    }
  }
  
  return Array.from(graduatingEmails);
}

module.exports = {
  initGraduatingEmails,
  isGraduatingStudent,
  getAllGraduatingEmails
};
