FROM node:12.19.0-alpine3.10

# Create app directory
WORKDIR /usr/simpleauth

# Copy the source
COPY . .

# Make sure no node_modules are present
RUN rm -rf node_modules

# Install dependencies
RUN npm install

# Build application
RUN npm run build

CMD [ "npm", "run", "start:prod" ]