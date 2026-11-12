FROM node:22-alpine

WORKDIR /app

# Dependências primeiro: esta camada só é refeita quando o lock muda
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Servidor de desenvolvimento do Vite, acessível de fora do container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
