FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Roda o build em modo watch (atualiza o dist) e o preview (serve o dist) simultaneamente
CMD ["sh", "-c", "npm run build -- --watch & npm run preview -- --host 0.0.0.0 --port 3001"]
