# Simple Lead Generation
Ключевая идея - сделать простой микросервис на PHP, полностью сгенерированный и сопровождаемый AI-агентами Cursor

1. За основу взят шаблон: Vibe-Coding-Template [https://github.com/jpke/cursor-vibe-coding-template]
2. Добавлены Cursor Rules для PHP: Awesome-cursorrules[https://github.com/PatrickJS/awesome-cursorrules]
3. Настроен и инициирован планировщик работ: TaskMaster[https://www.task-master.dev/]
4. С помощью Perplexity проверен prd.txt и декомпозиция: Perplexity AI [https://www.perplexity.ai/]
5. Донастроены MCP-тулы работы с Git

## Цель сервиса:
- простенький PHP микросервис на базе Slim PHP с чистой архитектурой для обработки лидов с сайта
- замерить качество и стоимость разработки

## Задачи:
- планирование и декомпозиция задачи (Task Master)
- чистая архитектура на PHP (Cursor Rules)
- соблюдение workflow процессов разработки (Cursor Rules)
- ведение git issues, соблюдение git-flow и PR (Github MCP)
- создать POST метод, принимает заявку с формы, сохраняет в amoCRM
- упаковка и запуск в Docker
- обеспечить безопасность данных (.env, .config и прочие)
- написание автотестов
- описание документации по завершению