# Цели Яндекс.Метрики — Точка Сборки

**Счётчик:** 109303611  
**Сайт:** https://tochkasborki-vortexvoyager21.amvera.io  
**Последнее обновление:** Май 2026

---

## 📋 Таблица целей

| № | Идентификатор (ID) | Название (рус.) | Тип | Описание | Где срабатывает |
|---|-------------------|-----------------|-----|----------|-----------------|
| 1 | `cta_click` | Клик по CTA-кнопке | JavaScript-событие | Пользователь нажал на кнопку с призывом к действию | Любая кнопка с `data-analytics="cta"` |
| 2 | `external_link_click` | Переход по внешней ссылке | JavaScript-событие | Клик по ссылке на внешний ресурс | Telegram, VK, GitHub, email ссылки |
| 3 | `form_field_focus` | Начало заполнения формы | JavaScript-событие | Пользователь кликнул в поле формы | Любое поле ввода (input/textarea) |
| 4 | `scroll_depth` | Глубина прокрутки | JavaScript-событие | Пользователь проскроллил страницу | 25%, 50%, 75%, 100% страницы |
| 5 | `time_on_page` | Время на странице | JavaScript-событие | Пользователь провёл на странице N секунд | 30с, 60с, 120с |
| 6 | `web-vital-fcp` | Web Vital: FCP | JavaScript-событие | First Contentful Paint — первый контент отрисован | Автоматически при загрузке |
| 7 | `web-vital-lcp` | Web Vital: LCP | JavaScript-событие | Largest Contentful Paint — главный элемент загружен | Автоматически при загрузке |
| 8 | `web-vital-cls` | Web Vital: CLS | JavaScript-событие | Cumulative Layout Shift — стабильность макета | Автоматически при загрузке |
| 9 | `web-vital-fid` | Web Vital: FID | JavaScript-событие | First Input Delay — задержка первого ввода | Автоматически при взаимодействии |
| 10 | `NAV_CLICK_COMPANY` | Навигация: Для компаний | JavaScript-событие | Клик в меню "Для компаний" | Header/Menu → "Компаниям" |
| 11 | `NAV_CLICK_STUDENT` | Навигация: Для студентов | JavaScript-событие | Клик в меню "Для студентов" | Header/Menu → "Студентам" |
| 12 | `NAV_CLICK_HOW_IT_WORKS` | Навигация: Как это работает | JavaScript-событие | Клик в меню "Как это работает" | Header/Menu → "Как это работает" |
| 13 | `COMPANY_FORM_SUBMIT` | Форма: Заявка от компании | JavaScript-событие | Успешная отправка формы компании | Страница /company-path → отправка |
| 14 | `STUDENT_FORM_SUBMIT` | Форма: Заявка от студента | JavaScript-событие | Успешная отправка формы студента | Страница /student-path → отправка |
| 15 | `CONTACT_FORM_SUBMIT` | Форма: Контактная заявка | JavaScript-событие | Отправка формы "Контакты" | Страница /contacts → отправка |
| 16 | `OPEN_TELEGRAM` | Переход в Telegram | JavaScript-событие | Клик по ссылке на Telegram-канал | Footer/Header → Telegram |
| 17 | `OPEN_VK_GROUP` | Переход во ВКонтакте | JavaScript-событие | Клик по ссылке на группу VK | Footer/Header → VK |
| 18 | `OPEN_MAX_CHANNEL` | Переход на Max | JavaScript-событие | Клик по ссылке на Max | Footer/Header → Max |

---

## 🎯 Как добавить цель в Яндекс.Метрике

### Шаг 1: Откройте настройки
1. Перейдите в [metrika.yandex.ru](https://metrika.yandex.ru)
2. Выберите счётчик **109303611** ("Точка Сборки")
3. Меню слева: **Настройки** → **Цели**

### Шаг 2: Добавьте цель
Нажмите кнопку **"Добавить цель"** и заполните:
┌─────────────────────────────────────┐
│ Тип условия: │
│ ● JavaScript-событие ← Выберите │
│ │
│ Идентификатор цели: │
│ [ cta_click ] ← Скопируйте из таблицы │
│ │
│ Название цели (необязательно): │
│ [ Клик по CTA-кнопке ] ← На русском │
└─────────────────────────────────────┘

### Шаг 3: Сохраните
- Нажмите **"Добавить"**
- Повторите для всех целей из таблицы
- В конце страницы нажмите **"Сохранить"** (внизу)

> ⏱️ **Важно:** Новые цели появляются в отчётах с задержкой **5-15 минут**.

---

## 🧪 Как проверить, что цель работает

### Быстрый тест в консоли браузера

1. Откройте сайт → F12 → Console
2. Выполните команду:
   ```javascript
   ym(109303611, 'reachGoal', 'cta_click');
   console.log('✅ Goal sent!');

   Откройте Yandex Metrica → Отчёты → Онлайн
Через 10-30 секунд должно появиться событие cta_click
Проверка всех целей сразу

// Скопируйте в консоль браузера:
const goals = [
  'cta_click',
  'external_link_click',
  'form_field_focus',
  'web-vital-fcp',
  'web-vital-lcp',
  'NAV_CLICK_COMPANY',
  'NAV_CLICK_STUDENT'
];

goals.forEach(goal => {
  ym(109303611, 'reachGoal', goal);
  console.log(`✅ Sent: ${goal}`);
});

console.log(`\n🎯 Total goals sent: ${goals.length}`);
console.log('📊 Check Metrika Real-time in 30 seconds');

// Скопируйте в консоль браузера:
const goals = [
  'cta_click',
  'external_link_click',
  'form_field_focus',
  'web-vital-fcp',
  'web-vital-lcp',
  'NAV_CLICK_COMPANY',
  'NAV_CLICK_STUDENT'
];

goals.forEach(goal => {
  ym(109303611, 'reachGoal', goal);
  console.log(`✅ Sent: ${goal}`);
});

console.log(`\n🎯 Total goals sent: ${goals.length}`);
console.log('📊 Check Metrika Real-time in 30 seconds');

// Автоматический трекинг кликов по CTA
if (analyticsType === 'cta') {
  track('cta_click', { text, path: location.pathname });
}

// Автоматический трекинг внешних ссылок
if (href.startsWith('http')) {
  track('external_link_click', { href, text, path: location.pathname });
}

// Автоматический трекинг фокуса на полях формы
track('form_field_focus', { form, field, path: location.pathname });

Файл: src/components/PerformanceTracker.jsx

// Web Vitals отправляются автоматически
onFCP((metric) => ym(COUNTER_ID, 'reachGoal', 'web-vital-fcp', { value: metric.value }));
onLCP((metric) => ym(COUNTER_ID, 'reachGoal', 'web-vital-lcp', { value: metric.value }));

📈 Полезные ссылки
Официальная документация Яндекс.Метрики
Цели: подробная инструкция
Вебвизор 2.0
Web Vitals в Метрике


© 2026 Точка Сборки | Счётчик: 109303611


---
## 📊 Теперь покажу, как отслеживать посещения (Visits)

### Вариант 1: Стандартный отчёт "Посещаемость"

В Яндекс.Метрике уже есть встроенный отчёт:

1. Откройте [metrika.yandex.ru](https://metrika.yandex.ru)
2. Выберите счётчик **109303611**
3. Перейдите: **Отчёты** → **Посещаемость** → **Посещаемость**

**Что показывает:**
- Количество визитов (посещений)
- Уникальные посетители
- Просмотры страниц
- Глубина просмотра
- Время на сайте

---
### Вариант 2: Создать свою цель "Visit to Max"

Если вы хотите отслеживать **переходы на Max** (внешнюю ссылку):

#### Шаг 1: Добавьте цель в Метрике

1. **Настройки** → **Цели** → **Добавить цель**
2. Заполните:
Тип: JavaScript-событие
Идентификатор: visit_max_channel
Название: Посещение Max

3. Нажмите **"Добавить"**

#### Шаг 2: Добавьте трекинг в код

В файле `src/hooks/useAnalytics.js` уже есть функция:

```javascript
// В компоненте, где есть ссылка на Max:
const { track } = useAnalytics();

// При клике:
track('visit_max_channel', { 
  channel: 'max',
  from: location.pathname 
});
Или используйте существующую цель external_link_click — она уже отслеживает все внешние ссылки!
Вариант 3: Отследить посещение конкретной страницы
Если хотите отслеживать, кто заходит на страницу /problem или /solution:
Создайте цель "Посещение страницы"
Настройки → Цели → Добавить цель
Выберите:

Тип: Посещение страницы
Условие: URL содержит /problem
Название: Посещение страницы Problem

🎯 Быстрая проверка: сколько сейчас визитов

// Откройте сайт → F12 → Console

// Отправьте тестовое событие "визит"
ym(109303611, 'reachGoal', 'test_visit_tracking');
console.log('✅ Visit tracked!');

// Теперь откройте:
// metrika.yandex.ru → Отчёты → Онлайн
// Через 30 сек увидите свой визит



