# Use official Node.js image as base
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /src

# Copy only package.json and package-lock.json (if available) first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (change if your app uses another port)
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
