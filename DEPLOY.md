# Deploying Yearbook25 on Render

This guide explains how to deploy the Yearbook25 application on Render using Docker.

## Prerequisites

- A [Render](https://render.com) account
- Git repository with your Yearbook25 code

## Deployment Steps

### Option 1: Manual Deployment

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your repository
4. Choose "Docker" as the environment
5. Set the following configuration:
   - Name: yearbook25 (or your preferred name)
   - Environment: Docker
   - Branch: main (or your default branch)
   - Docker Command: leave empty
6. Click "Create Web Service"

### Option 2: Using render.yaml (Blueprint)

1. Ensure the `render.yaml` file is in your repository
2. Log in to your Render account
3. Click on "New" and select "Blueprint"
4. Connect your repository
5. Render will automatically detect the `render.yaml` file and configure the services
6. Review the configuration and click "Apply"

## Environment Variables

Make sure to set the following environment variables in your Render dashboard:

- `PORT`: 3000
- `NODE_ENV`: production
- Any other environment variables required by your application (database credentials, API keys, etc.)

## Dockerfile Explanation

The Dockerfile uses a multi-stage build process:

1. **Build Stage**:
   - Uses Node.js 18 Alpine as the base image
   - Installs dependencies
   - Builds the React application

2. **Production Stage**:
   - Uses a fresh Node.js 18 Alpine image
   - Copies only the necessary files from the build stage
   - Installs production dependencies
   - Sets up the entry point script

## Entry Point Script

The entry point script (`entry-point.sh`) does the following:

1. Starts the backend server in the background
2. Serves the built React application using the `serve` package

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Render logs for error messages
2. Ensure all required environment variables are set
3. Verify that the backend server is starting correctly
4. Check that the frontend is being served properly

For more help, refer to the [Render documentation](https://render.com/docs) or contact Render support.
