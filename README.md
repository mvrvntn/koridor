# Коридор

Интерактивный веб-сайт с современными анимациями и микро-взаимодействиями, созданный с использованием передовых веб-технологий.

## 🌟 Особенности

- **Интерактивный персонаж-маскот**, реагирующий на действия пользователя
- **Современные анимации** с оптимизацией под 60fps
- **Адаптивный дизайн** для всех устройств
- **Полная доступность** (WCAG 2.1 AA)
- **SEO-оптимизация** с микроразметкой JSON-LD
- **Высокая производительность** с ленивой загрузкой ресурсов

## 🚀 Демонстрация

Посетите сайт: [https://yourusername.github.io/koridor](https://yourusername.github.io/koridor)

## 🛠️ Технологии

- **HTML5** с семантической разметкой
- **CSS3** с современными возможностями (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript** (ES6+)
- **Web Animations API** для производительных анимаций
- **Intersection Observer** для ленивой загрузки
- **Service Worker** для оффлайн-функциональности

## 📁 Структура проекта

```
koridor/
├── index.html              # Главная страница
├── 404.html                # Страница ошибки
├── Коридор.html           # Оригинальный файл
├── assets/                 # Ресурсы
│   ├── css/               # Стили
│   │   ├── main.css       # Основные стили
│   │   ├── animations.css # Анимации
│   │   └── responsive.css # Адаптивность
│   ├── js/                # JavaScript
│   │   ├── main.js        # Основной скрипт
│   │   ├── animations.js  # Анимации
│   │   └── utils.js       # Утилиты
│   ├── images/            # Изображения
│   └── fonts/             # Шрифты
├── docs/                  # Документация
│   ├── technical-specs.md # Технические спецификации
│   └── deployment.md      # Инструкции по развертыванию
├── .nojekyll              # Отключение Jekyll
├── .gitignore             # Игнорируемые файлы
├── LICENSE                # Лицензия MIT
└── README.md              # Этот файл
```

## 🚀 Развертывание на GitHub Pages

### Способ 1: Через интерфейс GitHub

1. Форкните этот репозиторий
2. Перейдите в настройки репозитория (`Settings`)
3. В разделе "Pages" выберите:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
4. Нажмите `Save`

### Способ 2: Через GitHub CLI

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/koridor.git
cd koridor

# Внесите изменения
git add .
git commit -m "Initial commit"
git push origin main

# Разверните на GitHub Pages
gh pages
```

### Способ 3: Автоматическое развертывание

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 🔧 Локальная разработка

### Запуск локального сервера

```bash
# С помощью Python
python -m http.server 8000

# С помощью Node.js
npx http-server

# С помощью PHP
php -S localhost:8000
```

### Разработка с Live Reload

```bash
# Установите live-server
npm install -g live-server

# Запустите
live-server
```

## 🎨 Кастомизация

### Изменение цветовой схемы

Откройте `assets/css/main.css` и измените CSS-переменные:

```css
:root {
  --primary-color: #ff4757;
  --secondary-color: #2f3542;
  --accent-color: #5352ed;
  --text-color: #ffffff;
  --background-color: #0f0f0f;
}
```

### Настройка персонажа-маскота

Отредактируйте `assets/js/animations.js`:

```javascript
const mascotConfig = {
  size: 60,
  color: '#ff4757',
  speed: 0.1,
  reactions: {
    hover: 'excited',
    click: 'surprised',
    scroll: 'curious'
  }
};
```

## 📊 Оптимизация производительности

### Аудит с Lighthouse

```bash
# Установите Lighthouse CLI
npm install -g lighthouse

# Запустите аудит
lighthouse http://localhost:8000 --view --preset=desktop
```

### Оптимизация изображений

```bash
# Установите imagemin-cli
npm install -g imagemin-cli

# Оптимизируйте изображения
imagemin assets/images/* --out-dir=assets/images/optimized
```

## 🔍 SEO-оптимизация

### Метаданные

Измените метаданные в `index.html`:

```html
<meta name="description" content="Описание вашего сайта">
<meta property="og:title" content="Коридор - Интерактивный опыт">
<meta property="og:description" content="Уникальный интерактивный веб-сайт">
<meta property="og:image" content="https://yourdomain.com/assets/images/og-image.jpg">
```

### Структурированные данные

Отредактируйте `assets/js/seo.js` для настройки JSON-LD:

```javascript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Коридор",
  "url": "https://yourdomain.com",
  "description": "Интерактивный веб-сайт"
};
```

## 🔒 Безопасность

### Content Security Policy

Добавьте в `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;">
```

## 🧪 Тестирование

### Кроссбраузерное тестирование

Используйте [BrowserStack](https://www.browserstack.com/) или [Sauce Labs](https://saucelabs.com/) для тестирования в разных браузерах.

### Тестирование доступности

```bash
# Установите axe-core
npm install -g axe-cli

# Запустите тест
axe http://localhost:8000
```

## 📈 Мониторинг

### Google Analytics

Добавьте в `index.html`:

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Производительность

Используйте [Web Vitals](https://web.dev/vitals/) для мониторинга производительности:

```javascript
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку (`git checkout -b feature/AmazingFeature`)
3. Внесите изменения (`git commit -m 'Add some AmazingFeature'`)
4. Отправьте в репозиторий (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 🙏 Благодарности

- [Google Web Fundamentals](https://developers.google.com/web/fundamentals) за лучшие практики
- [MDN Web Docs](https://developer.mozilla.org/) за документацию
- [CSS-Tricks](https://css-tricks.com/) за вдохновение

## 📞 Контакты

Если у вас есть вопросы или предложения, свяжитесь со мной:

- Email: your.email@example.com
- Twitter: [@yourusername](https://twitter.com/yourusername)
- GitHub: [@yourusername](https://github.com/yourusername)

---

⭐ Если этот проект был вам полезен, поставьте звезду!