FROM node as builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:slim

ENV NODE_ENV=production
USER node

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY .env ./

RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

CMD [ "npm", "run", "serve"]