# Linxie URL Shortener 🚀

![Linxie Logo](https://github.com/SpiritSocks/Linxie-URL-Shortener/images/linxie_logo.png)

**Linxie** — сервис для сокращения ссылок с аналитикой, кастомными доменами и функционалом типа Linktree.

---

## 🌟 Основные возможности

| Фича                    | Описание                                         | Статус         |
| ----------------------- | ------------------------------------------------ | -------------- |
| Сокращение ссылок       | Превращает длинные URL в короткие                | ✅ Реализовано |
| Аналитика кликов        | География, устройства, среднее количество кликов | ✅ Реализовано |
| Био-страница / Linktree | Персональная страница с ссылками и брендингом    | ✅ Реализовано |
| Кастомные домены        | Подключение собственного домена                  | ✅ Реализовано |
| QR-коды                 | Генерация QR-кодов для каждой ссылки             | ✅ Реализовано |
| Панель управления       | Управление ссылками, аналитикой и био-страницей  | ✅ Реализовано |

---

## 🌐 Примеры использования

### Сокращение ссылки

```text
https://example.com/your-very-long-url → https://linxie.ru/r/abc123
```

### Био-страница

```text
https://linxie.ru/u/spiritsocks
```

### Аналитика

- Всего ссылок: 9
- Всего кликов: 28
- Среднее на ссылку: 3.1
- Среднее в день: 5.6

Графики и диаграммы для наглядности.

![Analytics Example](./screenshots/screenshot_analytics.jpg)

---

## 🛠 Технологии

- **Frontend:** HTML5, CSS3, JavaScript, TailwindCSS
- **Backend:** PHP / Laravel
- **База данных:** MySQL / PostgreSQL
- **Графики и аналитика:** Chart.js
- **Дополнительно:** Поддержка кастомных доменов и QR-кодов

---

## ⚡ Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/SpiritSocks/Linxie-URL-Shortener.git
```

2. Установите зависимости:

```bash
composer install
npm install
```

3. Настройте `.env` с параметрами базы данных и домена.
4. Запустите миграции:

```bash
php artisan migrate
```

5. Запустите локальный сервер:

```bash
php artisan serve
```

---

## 📸 Скриншоты

![Главная страница](https://github.com/SpiritSocks/Linxie-URL-Shortener/images/linxie_landing.jpg)  
![Создание ссылки](https://github.com/SpiritSocks/Linxie-URL-Shortener/images/linxie_links-page.jpg)  
![Био-страница](https://github.com/SpiritSocks/Linxie-URL-Shortener/images/linxie_bio-page.jpg)  
![Кастомные домены](https://github.com/SpiritSocks/Linxie-URL-Shortener/images/linxie_domains-page.jpg)  
![Аналитика](https://github.com/SpiritSocks/Linxie-URL-Shortener/images/linxie_analytics-page.jpg)

---

## 🎨 Брендинг и темы

- Цветовая палитра: зелёный (#556B2F), светлые оттенки для фона и карточек
- Темная и светлая темы для био-страницы
- Кастомные цвета и аватары (Unlimited)

---

## 💡 Идеи для улучшения

- Интеграция с соцсетями для автоматической публикации ссылок
- Расширенные аналитические панели с фильтрацией по источникам трафика
- API для автоматического сокращения ссылок через внешние сервисы
- Мобильное приложение для управления и аналитики

---

## 📄 Лицензия

MIT License.  
См. [LICENSE](LICENSE) для подробностей.

---

## 🔗 Контакты

- Вебсайт: [https://linxie.ru](https://linxie.ru)
- Telegram: [@SpiritSocks](https://t.me/SpiritSocks)
- GitHub: [https://github.com/SpiritSocks/Linxie-URL-Shortener](https://github.com/SpiritSocks/Linxie-URL-Shortener)
