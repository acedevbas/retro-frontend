# Используем официальный образ Node.js
FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Собираем приложение
RUN npm run build

# Устанавливаем глобально serve для раздачи статики
RUN npm install -g serve

# Открываем порт 3000
EXPOSE 3000

# Запускаем приложение
CMD ["serve", "-s", "build", "-l", "3000"]
