FROM node:12-alpine AS base
WORKDIR /usr/src/app
COPY package.json package.json
COPY . .

FROM base AS dependencies
RUN npm install

FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/src ./src
RUN rm -f package-lock.json

USER node

CMD ["start"]
ENTRYPOINT ["npm"]
