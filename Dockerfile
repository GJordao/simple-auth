FROM node:12.21-alpine3.12

# Create app directory
WORKDIR /usr/simpleauth

# Copy the source
COPY . .

# Make sure no node_modules are present
RUN rm -rf node_modules

# Install dependencies
RUN npm ci

# Build application
RUN npm run build

CMD [ "npm", "run", "start:prod" ]
