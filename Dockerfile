FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/profile

EXPOSE 3000

CMD ["npm", "start"]
