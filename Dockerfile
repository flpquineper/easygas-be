FROM node:20-alpine3.21 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine3.21
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma 

COPY entrypoint.sh .

RUN chmod +x ./entrypoint.sh

EXPOSE 3305

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "run", "start"]