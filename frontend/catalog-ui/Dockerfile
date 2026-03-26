FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3003

CMD ["sh", "-c", "npm run build && npm run preview -- --host 0.0.0.0 --port 3003"]
