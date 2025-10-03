FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]