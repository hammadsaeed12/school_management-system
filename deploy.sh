#!/bin/bash

# School Management System Deployment Script

echo "Starting deployment process..."

# 1. Pull the latest changes from the repository
echo "Pulling latest changes from the repository..."
git pull

# 2. Install dependencies
echo "Installing dependencies..."
yarn install

# 3. Build the application
echo "Building the application..."
yarn build

# 4. Restart the application (if using PM2)
echo "Restarting the application..."
pm2 restart school-management || pm2 start yarn --name "school-management" -- start

echo "Deployment completed successfully!" 