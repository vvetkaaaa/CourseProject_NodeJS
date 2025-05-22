FROM node:18-alpine

WORKDIR /app/backend

# Установка необходимых пакетов и tzdata
RUN apk add --no-cache openssl tzdata

# Установка часового пояса
ENV TZ=Europe/Moscow
RUN cp /usr/share/zoneinfo/Europe/Moscow /etc/localtime && \
    echo "Europe/Moscow" > /etc/timezone

# Установка необходимых пакетов (если нужен openssl)
RUN apk add --no-cache openssl

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем всё (включая .env, если есть) — до генерации Prisma клиента
COPY . .

# Генерация Prisma Client после полной копии кода (и наличия DATABASE_URL)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]