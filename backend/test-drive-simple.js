/**
 * Simple test script for Google Drive API
 * 
 * This script tests the basic Google Drive API functionality
 * without using the fileStorage service.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Function to get auth client
function getAuthClient() {
  // Check if credentials are provided as an environment variable
  if (process.env.GOOGLE_CREDENTIALS) {
    try {
      // Parse the credentials from the environment variable
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

      // Create a JWT client using the credentials from environment variable
      return new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });
    } catch (error) {
      console.error('Error parsing GOOGLE_CREDENTIALS environment variable:', error.message);
      console.log('Falling back to credentials.json file');
    }
  }

  // Fall back to credentials file if environment variable is not available or invalid
  if (fs.existsSync(CREDENTIALS_PATH)) {
    console.log('Using credentials from file:', CREDENTIALS_PATH);
    return new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
  }

  // If neither is available, throw an error
  throw new Error('No Google Drive credentials found. Please provide credentials.json file or GOOGLE_CREDENTIALS environment variable.');
}

async function testGoogleDriveAPI() {
  try {
    console.log('Testing Google Drive API...');
    
    // Get auth client
    const auth = getAuthClient();
    console.log('Auth client created successfully');
    
    // Create a Google Drive client
    const drive = google.drive({ version: 'v3', auth });
    console.log('Drive client created successfully');
    
    // Get folder ID from environment variable
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    console.log('Using folder ID:', folderId);
    
    if (!folderId) {
      console.error('GOOGLE_DRIVE_FOLDER_ID environment variable is not set');
      return;
    }
    
    // List files in the folder
    console.log('Listing files in folder...');
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
    });
    
    console.log('Files in folder:');
    if (response.data.files.length === 0) {
      console.log('No files found.');
    } else {
      response.data.files.forEach(file => {
        console.log(`${file.name} (${file.id})`);
      });
    }
    
    // Create a simple text file
    console.log('\nCreating a test file...');
    const fileMetadata = {
      name: 'test-file-' + Date.now() + '.txt',
      parents: [folderId],
    };
    
    const media = {
      mimeType: 'text/plain',
      body: 'This is a test file created at ' + new Date().toISOString(),
    };
    
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });
    
    console.log('File created:');
    console.log(`Name: ${file.data.name}`);
    console.log(`ID: ${file.data.id}`);
    console.log(`Web View Link: ${file.data.webViewLink}`);
    console.log(`Web Content Link: ${file.data.webContentLink}`);
    
    // Make the file publicly accessible
    console.log('\nMaking file publicly accessible...');
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    console.log('File is now publicly accessible');
    
    // Delete the file
    console.log('\nDeleting the test file...');
    await drive.files.delete({
      fileId: file.data.id,
    });
    
    console.log('File deleted successfully');
    
    console.log('\nGoogle Drive API test completed successfully!');
  } catch (error) {
    console.error('Error testing Google Drive API:', error);
  }
}

// Run the test
testGoogleDriveAPI();
