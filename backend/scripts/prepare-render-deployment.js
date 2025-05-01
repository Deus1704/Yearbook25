/**
 * Script to prepare for Render deployment
 * 
 * This script helps prepare your application for deployment to Render.com
 * It checks for required files and environment variables
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Paths to check
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const ENV_PRODUCTION_PATH = path.join(__dirname, '..', '.env.production');

// Check if credentials.json exists
function checkCredentials() {
  console.log('Checking for Google Drive credentials...');
  
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ credentials.json not found!');
    console.error('Please place your Google Drive service account credentials in backend/credentials.json');
    return false;
  }
  
  console.log('✅ credentials.json found');
  
  // Validate the credentials file
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    if (!credentials.client_email || !credentials.private_key) {
      console.error('❌ credentials.json is missing required fields (client_email or private_key)');
      return false;
    }
    console.log('✅ credentials.json is valid');
    return true;
  } catch (error) {
    console.error('❌ Error parsing credentials.json:', error.message);
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\nChecking environment variables...');
  
  // Check .env.production file
  if (!fs.existsSync(ENV_PRODUCTION_PATH)) {
    console.error('❌ .env.production file not found!');
    console.error('Creating a template .env.production file...');
    
    const envTemplate = `PORT=5000
NODE_ENV=production
FRONTEND_URL=https://students.iitgn.ac.in
CORS_ALLOW_ALL=true
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
`;
    
    fs.writeFileSync(ENV_PRODUCTION_PATH, envTemplate);
    console.log('✅ Created template .env.production file');
    console.log('⚠️ Please update the GOOGLE_DRIVE_FOLDER_ID in .env.production');
    return false;
  }
  
  // Read .env.production file
  const envContent = fs.readFileSync(ENV_PRODUCTION_PATH, 'utf8');
  const missingVars = [];
  
  // Check for required variables
  if (!envContent.includes('FRONTEND_URL=')) missingVars.push('FRONTEND_URL');
  if (!envContent.includes('GOOGLE_DRIVE_FOLDER_ID=')) missingVars.push('GOOGLE_DRIVE_FOLDER_ID');
  if (!envContent.includes('CORS_ALLOW_ALL=')) missingVars.push('CORS_ALLOW_ALL');
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing environment variables in .env.production: ${missingVars.join(', ')}`);
    return false;
  }
  
  // Check if GOOGLE_DRIVE_FOLDER_ID has a value
  const folderIdMatch = envContent.match(/GOOGLE_DRIVE_FOLDER_ID=([^\s]+)/);
  if (!folderIdMatch || folderIdMatch[1] === 'your_folder_id_here') {
    console.error('❌ GOOGLE_DRIVE_FOLDER_ID is not set in .env.production');
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

// Check render.yaml
function checkRenderConfig() {
  console.log('\nChecking render.yaml configuration...');
  
  const renderYamlPath = path.join(__dirname, '..', '..', 'render.yaml');
  
  if (!fs.existsSync(renderYamlPath)) {
    console.error('❌ render.yaml not found in the project root!');
    return false;
  }
  
  const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
  
  // Check for required configurations
  const missingConfigs = [];
  
  if (!renderYaml.includes('CORS_ALLOW_ALL')) missingConfigs.push('CORS_ALLOW_ALL environment variable');
  if (!renderYaml.includes('Access-Control-Allow-Origin')) missingConfigs.push('CORS headers');
  if (!renderYaml.includes('GOOGLE_DRIVE_FOLDER_ID')) missingConfigs.push('GOOGLE_DRIVE_FOLDER_ID environment variable');
  
  if (missingConfigs.length > 0) {
    console.error(`❌ Missing configurations in render.yaml: ${missingConfigs.join(', ')}`);
    return false;
  }
  
  console.log('✅ render.yaml is properly configured');
  return true;
}

// Main function
function main() {
  console.log('=== Render Deployment Preparation ===\n');
  
  const credentialsOk = checkCredentials();
  const envVarsOk = checkEnvironmentVariables();
  const renderConfigOk = checkRenderConfig();
  
  console.log('\n=== Summary ===');
  
  if (credentialsOk && envVarsOk && renderConfigOk) {
    console.log('✅ All checks passed! Your application is ready for deployment to Render.');
    console.log('\nNext steps:');
    console.log('1. Commit your changes (excluding credentials.json)');
    console.log('2. Push to your repository');
    console.log('3. Deploy to Render using the Blueprint feature');
    console.log('\nFor detailed instructions, see RENDER_DEPLOYMENT.md');
    return 0;
  } else {
    console.log('❌ Some checks failed. Please fix the issues before deploying to Render.');
    console.log('For detailed instructions, see RENDER_DEPLOYMENT.md');
    return 1;
  }
}

// Run the script
const exitCode = main();
process.exit(exitCode);
