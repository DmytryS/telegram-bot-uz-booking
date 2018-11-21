FROM node:8-alpine AS base
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install --production --quiet

EXPOSE 30123
CMD ["npm", "start"]