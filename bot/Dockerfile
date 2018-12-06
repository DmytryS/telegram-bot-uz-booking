FROM node:10-alpine AS base
WORKDIR /usr/src/app
COPY ./bot/src src 
COPY ./bot/package.json ./
COPY ./bot/.babelrc ./

FROM base AS dependencies
RUN apk add --no-cache make gcc g++ python
RUN npm install --quiet
RUN npm run build
RUN npm prune --production

FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/build ./build
CMD ["npm", "start"]

