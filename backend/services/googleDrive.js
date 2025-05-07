const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

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
    return new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
  }

  // If neither is available, throw an error
  throw new Error('No Google Drive credentials found. Please provide credentials.json file or GOOGLE_CREDENTIALS environment variable.');
}

// Try to create auth client
let auth;
let drive;

try {
  auth = getAuthClient();
  // Create a Google Drive client
  drive = google.drive({ version: 'v3', auth });
} catch (error) {
  console.error('Failed to initialize Google Drive client:', error.message);
}

// Folder ID for the Yearbook25 application
const YEARBOOK_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Initialize Google Drive service
 * Creates the main folder if it doesn't exist
 */
async function initGoogleDrive() {
  try {
    // Check if drive client is initialized
    if (!drive) {
      throw new Error('Google Drive client not initialized. Check your credentials.');
    }

    // Check if the main folder exists
    if (!YEARBOOK_FOLDER_ID) {
      // Create the main folder
      const folderMetadata = {
        name: 'Yearbook25',
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });

      console.log(`Main folder created with ID: ${folder.data.id}`);
      console.log(`Please set GOOGLE_DRIVE_FOLDER_ID=${folder.data.id} in your .env file`);
    } else {
      console.log(`Using existing Google Drive folder with ID: ${YEARBOOK_FOLDER_ID}`);
    }

    return true;
  } catch (error) {
    console.error('Error initializing Google Drive:', error.message);
    throw error;
  }
}

/**
 * Upload a file to Google Drive
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The MIME type of the file
 * @param {string} folderId - The folder ID to upload to (optional)
 * @returns {Promise<Object>} - The uploaded file metadata
 */
async function uploadFile(fileBuffer, fileName, mimeType, folderId = YEARBOOK_FOLDER_ID) {
  try {
    // Check if drive client is initialized
    if (!drive) {
      throw new Error('Google Drive client not initialized. Check your credentials.');
    }

    // File metadata
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Convert buffer to readable stream
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer));
    readableStream.push(null); // Signal the end of the stream

    // Use the stream as the media body
    const media = {
      mimeType: mimeType,
      body: readableStream,
    };

    // Upload the file
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log(`File uploaded with ID: ${file.data.id}`);
    return file.data;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error.message);
    throw error;
  }
}

/**
 * Get a file from Google Drive
 * @param {string} fileId - The ID of the file to get
 * @returns {Promise<Object>} - The file metadata and content
 */
async function getFile(fileId) {
  try {
    // Check if drive client is initialized
    if (!drive) {
      throw new Error('Google Drive client not initialized. Check your credentials.');
    }

    // Get the file metadata
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink',
    });

    // Get the file content
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, { responseType: 'arraybuffer' });

    return {
      metadata: file.data,
      content: Buffer.from(response.data),
    };
  } catch (error) {
    console.error('Error getting file from Google Drive:', error.message);
    throw error;
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - The ID of the file to delete
 * @returns {Promise<boolean>} - True if the file was deleted successfully
 */
async function deleteFile(fileId) {
  try {
    // Check if drive client is initialized
    if (!drive) {
      throw new Error('Google Drive client not initialized. Check your credentials.');
    }

    await drive.files.delete({
      fileId: fileId,
    });

    console.log(`File deleted with ID: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error.message);
    throw error;
  }
}

/**
 * Create a folder in Google Drive
 * @param {string} folderName - The name of the folder to create
 * @param {string} parentFolderId - The parent folder ID (optional)
 * @returns {Promise<Object>} - The created folder metadata
 */
async function createFolder(folderName, parentFolderId = YEARBOOK_FOLDER_ID) {
  try {
    // Check if drive client is initialized
    if (!drive) {
      throw new Error('Google Drive client not initialized. Check your credentials.');
    }

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name, webViewLink',
    });

    console.log(`Folder created with ID: ${folder.data.id}`);
    return folder.data;
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error.message);
    throw error;
  }
}

/**
 * List files in a folder
 * @param {string} folderId - The ID of the folder to list files from
 * @returns {Promise<Array>} - The list of files in the folder
 */
async function listFiles(folderId = YEARBOOK_FOLDER_ID) {
  try {
    // Check if drive client is initialized
    if (!drive) {
      throw new Error('Google Drive client not initialized. Check your credentials.');
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
    });

    return response.data.files;
  } catch (error) {
    console.error('Error listing files from Google Drive:', error.message);
    throw error;
  }
}

module.exports = {
  initGoogleDrive,
  uploadFile,
  getFile,
  deleteFile,
  createFolder,
  listFiles,
};
