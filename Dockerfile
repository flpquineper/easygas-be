FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # Este comando compila seu TS para JS (geralmente em uma pasta /dist)

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3305

CMD ["node", "dist/index.js"]