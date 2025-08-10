# Быстрая настройка системы

## 🚀 Быстрый старт (5 минут)

### 1. Клонирование и запуск
```bash
git clone <repository-url>
cd aiportal_leads
cp env.example .env
docker-compose up -d
```

### 2. Настройка amoCRM (обязательно!)

#### 2.1 Создать приложение в amoCRM
1. Перейти на https://www.amocrm.ru/developers/
2. Создать приложение с Redirect URI: `http://localhost:8000/oauth/callback`
3. Скопировать Client ID и Client Secret

#### 2.2 Создать поля в amoCRM
**Контакты:**
- Компания (текстовое)
- Telegram (текстовое)
- WhatsApp (текстовое)
- Роль в компании (текстовое)

**Сделки:**
- Канал связи (текстовое)
- Дата встречи (дата)
- Время встречи (текстовое)
- Размер компании (текстовое)
- Основная задача (многострочное)
- Дополнительная информация (многострочное)

#### 2.3 Настроить .env
```env
AMOCRM_CLIENT_ID=ваш_client_id
AMOCRM_CLIENT_SECRET=ваш_client_secret
AMOCRM_SUBDOMAIN=ваш_subdomain
AMOCRM_REDIRECT_URI=http://localhost:8000/oauth/callback

# Заменить ID полей на реальные из amoCRM
AMOCRM_EMAIL_FIELD_ID=123456
AMOCRM_PHONE_FIELD_ID=123457
AMOCRM_COMPANY_FIELD_ID=123458
# ... остальные поля
```

#### 2.4 Авторизация OAuth2
```bash
# 1. Получить URL авторизации
docker-compose run --rm app php scripts/init-oauth.php authorize

# 2. Открыть URL в браузере, получить код

# 3. Обменять код на токены
docker-compose run --rm app php scripts/init-oauth.php callback ВАШ_КОД

# 4. Проверить статус
docker-compose run --rm app php scripts/init-oauth.php status
```

### 3. Тестирование
```bash
# Проверка здоровья
curl -X GET http://localhost:8000/api/leads/health

# Создание тестового лида
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-$(date +%s)" \
  -d '{
    "email": "test@example.com",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания"
  }'
```

## 📋 Структура лидформы

### Обязательные поля:
- `email` - Рабочий email
- `name` - Имя
- `company` - Компания

### Опциональные поля:
- `contact_channel` - Удобный канал связи
- `telegram` - Ник телеграмм
- `whatsapp` - Номер WhatsApp
- `phone` - Номер телефона
- `meeting_date` - Дата встречи (YYYY-MM-DD)
- `meeting_time` - Время встречи (HH:MM)
- `company_size` - Размер компании
- `role` - Роль в компании
- `main_task` - Основная задача
- `additional_info` - Дополнительная информация

## 🔧 Основные команды

### Управление системой
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Логи
docker-compose logs -f app
```

### Управление токенами amoCRM
```bash
# Статус токенов
docker-compose run --rm app php scripts/init-oauth.php status

# Обновить токены
docker-compose run --rm app php scripts/init-oauth.php refresh

# Очистить токены
docker-compose run --rm app php scripts/init-oauth.php clear
```

### Тестирование
```bash
# Все тесты
docker-compose run --rm app ./vendor/bin/phpunit

# Конкретные тесты
docker-compose run --rm app ./vendor/bin/phpunit tests/ValidationTest.php
```

## 🚨 Частые проблемы

### "amocrm_auth": "not_configured"
```bash
docker-compose run --rm app php scripts/init-oauth.php clear
docker-compose run --rm app php scripts/init-oauth.php authorize
```

### "Field ID not found"
- Проверить, что все поля созданы в amoCRM
- Убедиться, что ID полей правильно указаны в .env

### "Token expired"
```bash
docker-compose run --rm app php scripts/init-oauth.php refresh
```

### "Permission denied"
```bash
chmod 600 storage/amo_tokens.json
chmod 755 storage/
```

## 📝 Примеры запросов

### Минимальный лид
```bash
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-$(date +%s)" \
  -d '{
    "email": "test@example.com",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания"
  }'
```

### Полный лид
```bash
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-full-$(date +%s)" \
  -d '{
    "email": "ivan@company.ru",
    "name": "Иван Иванов",
    "company": "ООО Компания",
    "contact_channel": "email",
    "telegram": "@ivan_ivanov",
    "phone": "+7 (900) 123-45-67",
    "meeting_date": "2024-01-20",
    "meeting_time": "14:30",
    "company_size": "50-100",
    "role": "Менеджер",
    "main_task": "Разработка сайта",
    "additional_info": "Интересует современный дизайн"
  }'
```

### Проверка здоровья
```bash
curl -X GET http://localhost:8000/api/leads/health
```

## 📚 Дополнительная документация

- [Подробное руководство по настройке amoCRM](AMOCRM_SETUP_GUIDE.md)
- [OAuth2 настройка](AMOCRM_OAUTH_SETUP.md)
- [API документация](API_DOCUMENTATION.md)
- [Переменные окружения](ENVIRONMENT_VARIABLES.md)
- [Безопасность](SECURITY.md)
