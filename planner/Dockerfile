FROM node:12-alpine AS base
ARG NODE_ENV
WORKDIR /usr/src/app
COPY package.json ./
COPY . .
RUN apk add --no-cache bash vim curl iputils

FROM base AS dependencies
RUN npm i --quiet


FROM base AS release
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/src ./src
RUN rm -f package-lock.json

USER node

CMD ["start"]
ENTRYPOINT ["npm"]
