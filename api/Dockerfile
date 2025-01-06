FROM node:23.5.0-alpine

# Add a non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /usr/src/app

# Copy package-docker.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Expose the port the app runs on
EXPOSE 8080

# Use a non-root user for security
USER appuser

# Start the application
CMD ["node", "index.js"]