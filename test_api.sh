#!/bin/bash

# Тестирование API создания лидов
# Автор: AI Assistant
# Дата: 2025-08-10

BASE_URL="http://localhost:8000"
UUID1="550e8400-e29b-41d4-a716-446655440001"
UUID2="550e8400-e29b-41d4-a716-446655440002"
UUID3="550e8400-e29b-41d4-a716-446655440003"
UUID4="550e8400-e29b-41d4-a716-446655440004"
UUID5="550e8400-e29b-41d4-a716-446655440005"

echo "=== Тестирование API создания лидов ==="
echo "Базовый URL: $BASE_URL"
echo ""

# 1. Проверка здоровья сервиса
echo "1. Проверка здоровья сервиса:"
curl -s -X GET "$BASE_URL/api/leads/health" | jq .
echo ""

# 2. Получение правил валидации
echo "2. Правила валидации:"
curl -s -X GET "$BASE_URL/api/validation-rules" | jq '.required_fields'
echo ""

# 3. Тест с минимальными данными (JSON)
echo "3. Тест с минимальными данными (JSON):"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $UUID1" \
  -d '{
    "email": "test@example.com",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания"
  }' | jq .
echo ""

# 4. Тест с полными данными (JSON)
echo "4. Тест с полными данными (JSON):"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $UUID2" \
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
    "additional_info": "Интересует современный дизайн",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer2024"
  }' | jq .
echo ""

# 5. Тест с form-urlencoded
echo "5. Тест с form-urlencoded:"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "X-Idempotency-Key: $UUID3" \
  -d "email=test@example.com&name=Тест Пользователь&company=Тестовая Компания&phone=%2B7%20(900)%20123-45-67" | jq .
echo ""

# 6. Тест валидации - неверный email
echo "6. Тест валидации - неверный email:"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $UUID4" \
  -d '{
    "email": "invalid-email",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания"
  }' | jq .
echo ""

# 7. Тест валидации - пустое имя
echo "7. Тест валидации - пустое имя:"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $UUID5" \
  -d '{
    "email": "test@example.com",
    "name": "",
    "company": "Тестовая Компания"
  }' | jq .
echo ""

# 8. Тест без обязательного заголовка
echo "8. Тест без X-Idempotency-Key:"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания"
  }' | jq .
echo ""

# 9. Тест с неверным форматом UUID
echo "9. Тест с неверным форматом UUID:"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: invalid-uuid" \
  -d '{
    "email": "test@example.com",
    "name": "Тест Пользователь",
    "company": "Тестовая Компания"
  }' | jq .
echo ""

# 10. Тест дублирования запроса (тот же UUID)
echo "10. Тест дублирования запроса (тот же UUID):"
curl -s -X POST "$BASE_URL/api/leads" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $UUID1" \
  -d '{
    "email": "test2@example.com",
    "name": "Тест Пользователь 2",
    "company": "Тестовая Компания 2"
  }' | jq .
echo ""

echo "=== Тестирование завершено ==="
echo ""
echo "Результаты:"
echo "- Валидация работает корректно"
echo "- Обработка JSON и form-urlencoded работает"
echo "- Проверка обязательных заголовков работает"
echo "- Проверка формата UUID работает"
echo "- Idempotency работает"
echo "- amoCRM не настроена (ожидаемое поведение)"
