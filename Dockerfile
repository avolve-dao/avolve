# Dockerfile for Tailwind CSS Build
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install tailwindcss@4.1.4
CMD ["npx", "tailwindcss", "-i", "./test.css", "-o", "./out.css", "--config", "tailwind.config.js"]
