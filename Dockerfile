# Используем официальный образ Node.js
FROM node:14 AS builder

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Выводим содержимое package.json и yarn.lock для диагностики
RUN cat package.json
RUN cat yarn.lock

# Устанавливаем зависимости с использованием yarn
RUN yarn install --frozen-lockfile

# Копируем исходный код приложения
COPY . .

# Собираем приложение с использованием yarn
RUN yarn build

# Используем минимальный образ для запуска
FROM node:14-slim

# Копируем собранное приложение из предыдущего этапа
COPY --from=builder /app /app

# Устанавливаем глобально serve для раздачи статики
RUN yarn global add serve

# Открываем порт 3346
EXPOSE 3346

# Запускаем приложение
CMD ["serve", "-s", "build", "-l", "3346"]
