FROM node:10-alpine AS base
WORKDIR /usr/src/app
COPY ./src src 
COPY ./package.json ./
COPY ./.babelrc ./

FROM base AS dependencies
RUN apk add --no-cache make gcc g++ python
RUN npm install --quiet
RUN npm prune --production

FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
CMD ["npm", "start"]
