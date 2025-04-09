FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Install backend dependencies
WORKDIR /app/backend
RUN npm install || echo "No separate package.json for backend, using root dependencies"

# Go back to app directory
WORKDIR /app

# Build the React app
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Make the entry-point script executable
COPY entry-point.sh /app/entry-point.sh
RUN chmod +x /app/entry-point.sh

# Expose ports for frontend and backend
EXPOSE 3000 5000

# Set the entry point
ENTRYPOINT ["/app/entry-point.sh"]
