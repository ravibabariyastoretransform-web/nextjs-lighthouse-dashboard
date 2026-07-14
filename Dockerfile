FROM node:18-slim

# Install Google Chrome dependencies and Chromium for Lighthouse CLI engine
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome Environment path flags for headless CLI execution
ENV CHROME_PATH=/usr/bin/chromium

# Initialize App Workspace
WORKDIR /app

# Copy Dependency definitions
COPY package*.json ./

# Install packages
RUN npm install

# Copy application source files
COPY . .

# Build production bundle of the Next.js app
RUN npm run build

# Set Node environment to production
ENV NODE_ENV=production

# Expose Dash Port
EXPOSE 3000

# Start Next Server
CMD ["npm", "start"]
