FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts --legacy-peer-deps

COPY . .

CMD ["npx", "tsx", "src/scripts/discord_news_bot.ts"]
