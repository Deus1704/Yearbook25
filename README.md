# Yearbook25 Backend

This repository contains the backend code for the Yearbook25 application. It provides API endpoints for managing profiles, messages, confessions, and memories.

## Technologies Used

- Node.js
- Express.js
- SQLite3
- Multer for file uploads

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
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get a specific profile
- `GET /api/profiles/user/:userId` - Get profile by user ID
- `POST /api/profiles` - Create a new profile
- `PUT /api/profiles/:id` - Update a profile

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a new message

### Confessions
- `GET /api/confessions` - Get all confessions
- `POST /api/confessions` - Create a new confession

### Memories
- `GET /api/memories` - Get all memories
- `POST /api/memories` - Upload a new memory image

## Deployment

This backend is configured for deployment on Render. The `render.yaml` file provides the necessary configuration.

## Database

The application uses SQLite3 for data storage. The database file is located at `backend/yearbook.db`.
