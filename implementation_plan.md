# Интеграция "Скрытого Накопления Контекста" (Hidden Context Aggregation)

Этот план описывает, как мы внедрим твои требования на уровне ИИ и на уровне архитектуры бэкенда, учитывая все критические правки безопасности и надежности.

## Proposed Changes

### 1. Изменение базы данных (Гарантия порядка)
#### [MODIFY] [app/models/task.py](file:///home/amin/Projects/FullStack/ait_practice_platform/backend/app/models/task.py)
Вместо `created_at` мы добавим строгое поле `order_index` (Integer).
- Сгенерируем миграцию Alembic.
- В `app/crud/project.py` при парсинге ответа от Groq (где задачи идут массивом по порядку), мы будем явно присваивать им `order_index = 1, 2, 3...` Это даст 100% гарантию правильной склейки кода.

### 2. Изменения в промптах ИИ (Vertical Scaling)
#### [MODIFY] [app/services/ai_service.py](file:///home/amin/Projects/FullStack/ait_practice_platform/backend/app/services/ai_service.py)
Я перепишу `generate_project_draft`.
- Генерация строго 10–15 последовательных уникальных задач.
- ИИ должен писать тесты, проверяющие краевые случаи (edge cases), типы данных (UUID) и выбросы исключений (`except CapacityExceeded: pass`).
- Импорты должны выноситься аккуратно, чтобы не вызывать конфликтов при склеивании строк.

### 3. Сборка "Франкенштейна" (GraderService) и защита
#### [MODIFY] [app/services/grader.py](file:///home/amin/Projects/FullStack/ait_practice_platform/backend/app/services/grader.py)
Создам функцию `build_execution_context` и обновлю логику `evaluate_code`:
1. Запрашивает все `passed` сабмишены пользователя для текущего проекта.
2. Берет **самый свежий (latest)** успешный сабмишен для каждой предыдущей задачи (сортировка по `submitted_at` DESC), группирует по `task_id` и сортирует их по `order_index` самой задачи.
3. Склеивает "Прошлый код" + "Текущий код" + "Тесты".
4. **Защита `exec()`:** Исполнение будет обернуто в отдельный процесс (через `multiprocessing.Process`) с жестким тайм-аутом (например, 5 секунд). Если студент напишет `while True:`, процесс просто будет "убит", а бэкенд FastAPI продолжит работу и вернет студенту ошибку "Timeout Exception".

### 4. Новые эндпоинты (Интеграция)
#### [MODIFY] [app/api/v1/endpoints/submissions.py](file:///home/amin/Projects/FullStack/ait_practice_platform/backend/app/api/v1/endpoints/submissions.py)
- Эндпоинт `POST /api/v1/submissions/` теперь будет использовать `build_execution_context` перед вызовом песочницы.

#### [MODIFY] [app/api/v1/endpoints/projects.py](file:///home/amin/Projects/FullStack/ait_practice_platform/backend/app/api/v1/endpoints/projects.py)
- Добавлю эндпоинт **`GET /api/v1/projects/{id}/tasks/{task_id}/context`**.
- Он будет возвращать склеенный текст прошлых решений студента (до `task_id`). Фронтенд будет вызывать его, чтобы показать студенту Read-Only вкладку с его историей кода для текущего проекта.

## User Review Required

> [!IMPORTANT]
> Твои замечания были абсолютно в точку! Ограничение `exec` по времени с помощью процессов — это критический фикс, иначе первый же бесконечный цикл положил бы сервер. И `order_index` действительно безопаснее, чем `created_at`.
> План обновлен. Жду зеленого света для написания кода!

## Verification Plan
1. Накатим миграцию для `Task.order_index`.
2. Обновим `grader.py`, добавив `multiprocessing`.
3. Сгенерируем 10-15 задач через ИИ.
4. Проверим `/context` эндпоинт, чтобы убедиться, что он возвращает правильный прошлый код.
5. Намеренно отправим `while True: pass` в сабмишен и проверим, что сервер не падает, а возвращает ошибку `Timeout`.
