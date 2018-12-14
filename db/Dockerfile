FROM node:8-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json .

ENV NODE_ENV=production
ENV DB_URL=mongodb://127.0.0.1:27017/uzbooking-bot

RUN npm install --production

COPY moleculer.config.js service.js ./

EXPOSE 4445
EXPOSE 9229

