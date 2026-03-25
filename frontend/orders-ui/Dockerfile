FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["sh", "-c", "npm run build && npm run preview -- --host 0.0.0.0 --port 3001"]
