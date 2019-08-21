FROM node:12-alpine

ARG NODE_ENV
WORKDIR /usr/src/app
COPY .npmrc  package.json ./
RUN npm i --quiet && rm .npmrc
COPY . .

RUN apk add --no-cache bash vim curl iputils

USER node

CMD ["start"]
ENTRYPOINT ["npm"]
