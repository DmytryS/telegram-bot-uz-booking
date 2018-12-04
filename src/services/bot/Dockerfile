FROM node:8-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
RUN npm install 

ENV NODE_ENV=production

RUN npm install

# Build the built version
RUN npm run build
# Remove dev packages
RUN npm prune --production

RUN npm run start

# EXPOSE 4445
# EXPOSE 9229

