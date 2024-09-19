# Используем официальный образ Node.js
FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости с использованием yarn
RUN yarn install

# Копируем исходный код приложения
COPY . .

# Собираем приложение с использованием yarn
RUN yarn build

# Устанавливаем глобально serve для раздачи статики
RUN yarn global add serve

# Открываем порт 3346
EXPOSE 3346

# Запускаем приложение
CMD ["serve", "-s", "build", "-l", "3346"]
