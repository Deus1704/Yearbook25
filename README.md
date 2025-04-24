# Yearbook25 Frontend

This repository contains the frontend code for the Yearbook25 application. It provides a user interface for viewing and interacting with profiles, messages, confessions, and memories.

## Technologies Used

- React.js
- React Router
- Bootstrap
- Firebase Authentication
- Axios for API requests

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Yearbook25
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```
   npm start
   ```

## Deployment to CPanel

1. Build the application:
   ```
   npm run build
   ```

2. Upload the contents of the `build` directory to your CPanel hosting.

3. In CPanel, navigate to the File Manager and upload the build files to the public_html directory or a subdirectory of your choice.

4. If you're deploying to a subdirectory, make sure to update the `homepage` field in `package.json` to match the subdirectory path.

## Features

- User authentication with Google (restricted to @iitgn.ac.in email addresses)
- Profile creation and viewing
- Messaging system
- Confessions board
- Memory lane with photo uploads
- Team page

## Backend Connection

This frontend is configured to connect to the backend API deployed at https://yearbook25-backend.onrender.com/api. If you want to use a different backend URL, update the `API_URL` constant in `src/services/api.js`.
