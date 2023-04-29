FROM node:18.14.2-alpine As build

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

RUN npm ci

USER node

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force


FROM node:18.14.2-alpine As production

COPY --chown=node:node --from=build /home/node/app/node_modules ./node_modules
COPY --chown=node:node --from=build /home/node/app/dist ./dist

CMD ["node", "dist/main.js"]
