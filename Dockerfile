FROM node:18-slim

# Update package list and install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    software-properties-common \
    ffmpeg

# Add Debian testing repository for newer streamlink
RUN echo "deb http://deb.debian.org/debian testing main" >> /etc/apt/sources.list

# Update package list and install streamlink
RUN apt-get update && apt-get install -y streamlink

# Clean up
RUN rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
