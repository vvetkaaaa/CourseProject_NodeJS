FROM node:18-alpine AS builder

WORKDIR /app/frontend

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
# RUN npm install http-proxy-agent@4.0.1 --legacy-peer-deps


COPY . .

RUN npm run build

RUN echo "Содержимое /app/frontend после сборки:"
RUN ls -la /app/frontend/
RUN echo "Содержимое /app/frontend/build:"
RUN ls -la /app/frontend/build/

FROM nginx:alpine

COPY --from=builder /app/frontend/build /usr/share/nginx/html

##
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]