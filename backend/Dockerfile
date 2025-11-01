FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN chmod +x ./entrypoint.sh || true
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "./entrypoint.sh"]
