# Руководство по настройке amoCRM

Это подробное руководство по настройке интеграции с amoCRM для обработки лидов.

## Содержание

1. [Создание приложения в amoCRM](#1-создание-приложения-в-amocrm)
2. [Создание пользовательских полей](#2-создание-пользовательских-полей)
3. [Настройка переменных окружения](#3-настройка-переменных-окружения)
4. [Инициализация OAuth2](#4-инициализация-oauth2)
5. [Тестирование интеграции](#5-тестирование-интеграции)
6. [Устранение неполадок](#6-устранение-неполадок)

## 1. Создание приложения в amoCRM

### Шаг 1: Регистрация в Developer Portal

1. Перейдите на [amoCRM Developer Portal](https://www.amocrm.ru/developers/)
2. Войдите в свой аккаунт amoCRM
3. Нажмите "Создать приложение"

### Шаг 2: Настройка приложения

Заполните форму создания приложения:

- **Название**: `leads.aiworkplace` (или любое другое)
- **Описание**: `Микросервис для обработки лидов с веб-форм`
- **Redirect URI**: 
  - Для разработки: `http://localhost:8000/oauth/callback`
  - Для продакшена: `https://your-domain.com/oauth/callback`

### Шаг 3: Получение учетных данных

После создания приложения вы получите:
- **Client ID** - идентификатор приложения
- **Client Secret** - секретный ключ приложения
- **Subdomain** - ваш поддомен amoCRM (например, если ваш URL `mycompany.amocrm.ru`, то subdomain = `mycompany`)

## 2. Создание пользовательских полей

### Поля для контактов

Перейдите в amoCRM: **Настройки → Поля и воронки → Контакты → Добавить поле**

#### 2.1 Поле "Компания"
- **Тип поля**: Текстовое поле
- **Название**: Компания
- **Обязательное**: Да
- **Запишите ID поля** (понадобится для .env)

#### 2.2 Поле "Telegram"
- **Тип поля**: Текстовое поле
- **Название**: Telegram
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.3 Поле "WhatsApp"
- **Тип поля**: Текстовое поле
- **Название**: WhatsApp
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.4 Поле "Роль в компании"
- **Тип поля**: Текстовое поле
- **Название**: Роль в компании
- **Обязательное**: Нет
- **Запишите ID поля**

### Поля для сделок

Перейдите в amoCRM: **Настройки → Поля и воронки → Сделки → Добавить поле**

#### 2.5 Поле "Канал связи"
- **Тип поля**: Текстовое поле
- **Название**: Канал связи
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.6 Поле "Дата встречи"
- **Тип поля**: Поле даты
- **Название**: Дата встречи
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.7 Поле "Время встречи"
- **Тип поля**: Текстовое поле
- **Название**: Время встречи
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.8 Поле "Размер компании"
- **Тип поля**: Текстовое поле
- **Название**: Размер компании
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.9 Поле "Основная задача"
- **Тип поля**: Многострочное текстовое поле
- **Название**: Основная задача
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.10 Поле "Дополнительная информация"
- **Тип поля**: Многострочное текстовое поле
- **Название**: Дополнительная информация
- **Обязательное**: Нет
- **Запишите ID поля**

### UTM параметры (опционально)

Если у вас еще нет UTM полей, создайте их:

#### 2.11 UTM Source
- **Тип поля**: Текстовое поле
- **Название**: UTM Source
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.12 UTM Medium
- **Тип поля**: Текстовое поле
- **Название**: UTM Medium
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.13 UTM Campaign
- **Тип поля**: Текстовое поле
- **Название**: UTM Campaign
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.14 UTM Term
- **Тип поля**: Текстовое поле
- **Название**: UTM Term
- **Обязательное**: Нет
- **Запишите ID поля**

#### 2.15 UTM Content
- **Тип поля**: Текстовое поле
- **Название**: UTM Content
- **Обязательное**: Нет
- **Запишите ID поля**

## 3. Настройка переменных окружения

### Шаг 1: Создание .env файла

```bash
cp env.example .env
```

### Шаг 2: Настройка OAuth2 параметров

Отредактируйте `.env` файл:

```env
# amoCRM OAuth2 Configuration
AMOCRM_CLIENT_ID=ваш_client_id_здесь
AMOCRM_CLIENT_SECRET=ваш_client_secret_здесь
AMOCRM_SUBDOMAIN=ваш_subdomain
AMOCRM_REDIRECT_URI=http://localhost:8000/oauth/callback
```

### Шаг 3: Настройка ID полей

Замените ID полей на реальные значения из amoCRM:

```env
# Contact Fields (Поля контактов)
AMOCRM_EMAIL_FIELD_ID=123456
AMOCRM_PHONE_FIELD_ID=123457
AMOCRM_COMPANY_FIELD_ID=123458
AMOCRM_TELEGRAM_FIELD_ID=123459
AMOCRM_WHATSAPP_FIELD_ID=123460
AMOCRM_ROLE_FIELD_ID=123461

# Lead Fields (Поля сделок)
AMOCRM_CONTACT_CHANNEL_FIELD_ID=123462
AMOCRM_MEETING_DATE_FIELD_ID=123463
AMOCRM_MEETING_TIME_FIELD_ID=123464
AMOCRM_COMPANY_SIZE_FIELD_ID=123465
AMOCRM_MAIN_TASK_FIELD_ID=123466
AMOCRM_ADDITIONAL_INFO_FIELD_ID=123467

# UTM Parameters
AMOCRM_UTM_SOURCE_FIELD_ID=123470
AMOCRM_UTM_MEDIUM_FIELD_ID=123471
AMOCRM_UTM_CAMPAIGN_FIELD_ID=123472
AMOCRM_UTM_TERM_FIELD_ID=123473
AMOCRM_UTM_CONTENT_FIELD_ID=123474
```

## 4. Инициализация OAuth2

### Шаг 1: Генерация URL авторизации

```bash
docker-compose run --rm app php scripts/init-oauth.php authorize
```

Вы получите URL вида:
```
https://your-subdomain.amocrm.ru/oauth/authorize?client_id=...&response_type=code&state=...
```

### Шаг 2: Авторизация приложения

1. Откройте полученный URL в браузере
2. Войдите в свой аккаунт amoCRM
3. Разрешите доступ приложению
4. Скопируйте код авторизации из URL (параметр `code`)

### Шаг 3: Обмен кода на токены

```bash
docker-compose run --rm app php scripts/init-oauth.php callback ВАШ_КОД_АВТОРИЗАЦИИ
```

### Шаг 4: Проверка статуса

```bash
docker-compose run --rm app php scripts/init-oauth.php status
```

Ожидаемый результат:
```
Token Status:
Status: valid
Expires at: 2024-01-16 10:30:00
Last updated: 2024-01-15 10:30:00
```

## 5. Тестирование интеграции

### Шаг 1: Проверка здоровья системы

```bash
curl -X GET http://localhost:8000/api/leads/health \
  -H "Content-Type: application/json"
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "checks": {
    "amocrm_auth": "ok"
  },
  "overall_status": "ok"
}
```

### Шаг 2: Тест создания лида

```bash
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: test-$(date +%s)" \
  -d '{
    "email": "test@example.com",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания",
    "contact_channel": "email",
    "telegram": "@testuser",
    "phone": "+7 (900) 123-45-67",
    "meeting_date": "2024-01-20",
    "meeting_time": "14:30",
    "company_size": "10-50",
    "role": "Менеджер",
    "main_task": "Разработка сайта",
    "additional_info": "Интересует современный дизайн"
  }'
```

### Шаг 3: Проверка в amoCRM

1. Войдите в amoCRM
2. Перейдите в раздел "Контакты"
3. Найдите созданный контакт
4. Перейдите в раздел "Сделки"
5. Найдите созданную сделку
6. Проверьте, что все поля заполнены корректно

## 6. Устранение неполадок

### Проблема: "amocrm_auth": "not_configured"

**Решение:**
1. Проверьте, что все переменные окружения установлены
2. Выполните инициализацию OAuth2 заново:
```bash
docker-compose run --rm app php scripts/init-oauth.php clear
docker-compose run --rm app php scripts/init-oauth.php authorize
```

### Проблема: "Invalid Client ID/Secret"

**Решение:**
1. Проверьте правильность Client ID и Secret в `.env`
2. Убедитесь, что приложение создано в amoCRM Developer Portal
3. Проверьте, что Redirect URI совпадает

### Проблема: "Field ID not found"

**Решение:**
1. Проверьте, что все пользовательские поля созданы в amoCRM
2. Убедитесь, что ID полей правильно указаны в `.env`
3. Проверьте права доступа к полям

### Проблема: "Token expired"

**Решение:**
```bash
# Обновить токены вручную
docker-compose run --rm app php scripts/init-oauth.php refresh

# Или переавторизоваться
docker-compose run --rm app php scripts/init-oauth.php clear
docker-compose run --rm app php scripts/init-oauth.php authorize
```

### Проблема: "Permission denied"

**Решение:**
1. Проверьте права доступа к файлу токенов:
```bash
chmod 600 storage/amo_tokens.json
```
2. Убедитесь, что директория storage доступна для записи:
```bash
chmod 755 storage/
```

## Полезные команды

### Управление токенами

```bash
# Проверить статус токенов
docker-compose run --rm app php scripts/init-oauth.php status

# Обновить токены вручную
docker-compose run --rm app php scripts/init-oauth.php refresh

# Очистить токены
docker-compose run --rm app php scripts/init-oauth.php clear
```

### Логирование

```bash
# Просмотр логов приложения
tail -f storage/logs/app.log

# Просмотр OAuth логов
tail -f storage/logs/oauth.log
```

### Тестирование

```bash
# Запуск тестов
docker-compose run --rm app ./vendor/bin/phpunit

# Тестирование конкретных компонентов
docker-compose run --rm app ./vendor/bin/phpunit tests/ValidationTest.php
docker-compose run --rm app ./vendor/bin/phpunit tests/LeadControllerTest.php
```

## Безопасность

### Рекомендации по безопасности

1. **Храните .env файл в безопасном месте**
2. **Не коммитьте .env файл в Git**
3. **Используйте HTTPS в продакшене**
4. **Регулярно обновляйте токены**
5. **Мониторьте логи на предмет подозрительной активности**

### Продакшен настройки

Для продакшена измените следующие параметры:

```env
APP_ENV=production
APP_DEBUG=false
AMOCRM_REDIRECT_URI=https://your-domain.com/oauth/callback
LOG_LEVEL=warning
```

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `storage/logs/app.log`
2. Убедитесь, что все поля созданы в amoCRM
3. Проверьте права доступа к файлам
4. Убедитесь, что система запущена: `docker-compose ps`

Для получения дополнительной помощи обратитесь к документации amoCRM API или создайте issue в репозитории проекта.
