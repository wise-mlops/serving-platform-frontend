FROM node:18-alpine3.17

WORKDIR /app
COPY . .

RUN npm install --production
RUN npm run build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
