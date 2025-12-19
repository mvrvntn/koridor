/**
 * Утилитарные функции для проекта Коридор
 * Содержит вспомогательные функции для оптимизации производительности
 */

'use strict';

/**
 * Утилиты для работы с DOM
 */
const dom = {
  /**
   * Безопасное получение элемента
   * @param {string} selector - CSS селектор
   * @param {Element} context - Контекст поиска
   * @return {Element|null} - Найденный элемент или null
   */
  safeQuery: (selector, context = document) => {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.warn(`Ошибка при поиске элемента ${selector}:`, error);
      return null;
    }
  },

  /**
   * Безопасное получение всех элементов
   * @param {string} selector - CSS селектор
   * @param {Element} context - Контекст поиска
   * @return {NodeList} - Найденные элементы
   */
  safeQueryAll: (selector, context = document) => {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Ошибка при поиске элементов ${selector}:`, error);
      return [];
    }
  },

  /**
   * Создание элемента с атрибутами
   * @param {string} tagName - Тег элемента
   * @param {Object} attributes - Атрибуты элемента
   * @param {string} className - CSS классы
   * @return {Element} - Созданный элемент
   */
  createElement: (tagName, attributes = {}, className = '') => {
    const element = document.createElement(tagName);
    
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
    
    if (className) {
      element.className = className;
    }
    
    return element;
  },

  /**
   * Добавление класса элементу
   * @param {Element} element - Элемент
   * @param {string} className - CSS класс
   */
  addClass: (element, className) => {
    if (element && className) {
      element.classList.add(className);
    }
  },

  /**
   * Удаление класса у элемента
   * @param {Element} element - Элемент
   * @param {string} className - CSS класс
   */
  removeClass: (element, className) => {
    if (element && className) {
      element.classList.remove(className);
    }
  },

  /**
   * Проверка наличия класса у элемента
   * @param {Element} element - Элемент
   * @param {string} className - CSS класс
   * @return {boolean} - Наличие класса
   */
  hasClass: (element, className) => {
    return element && element.classList.contains(className);
  },

  /**
   * Переключение класса у элемента
   * @param {Element} element - Элемент
   * @param {string} className - CSS класс
   */
  toggleClass: (element, className) => {
    if (element && className) {
      element.classList.toggle(className);
    }
  }
};

/**
 * Утилиты для работы с событиями
 */
const events = {
  /**
   * Добавление обработчика события с поддержкой пассивных слушателей
   * @param {Element} element - Элемент
   * @param {string} event - Тип события
   * @param {Function} handler - Обработчик
   * @param {Object} options - Опции
   */
  on: (element, event, handler, options = {}) => {
    if (!element || !handler) return;
    
    const defaultOptions = {
      passive: true,
      capture: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    element.addEventListener(event, handler, finalOptions);
  },

  /**
   * Удаление обработчика события
   * @param {Element} element - Элемент
   * @param {string} event - Тип события
   * @param {Function} handler - Обработчик
   */
  off: (element, event, handler) => {
    if (!element || !handler) return;
    
    element.removeEventListener(event, handler);
  },

  /**
   * Делегирование событий
   * @param {Element} parent - Родительский элемент
   * @param {string} selector - Селектор дочерних элементов
   * @param {string} event - Тип события
   * @param {Function} handler - Обработчик
   */
  delegate: (parent, selector, event, handler) => {
    if (!parent || !selector || !handler) return;
    
    events.on(parent, event, (e) => {
      const target = e.target.closest(selector);
      if (target && parent.contains(target)) {
        handler.call(target, e);
      }
    });
  },

  /**
   * Предотвращение действия по умолчанию
   * @param {Event} event - Событие
   */
  preventDefault: (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
  },

  /**
   * Остановка всплытия события
   * @param {Event} event - Событие
   */
  stopPropagation: (event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
  }
};

/**
 * Утилиты для работы с анимациями
 */
const animation = {
  /**
   * Оптимизированный requestAnimationFrame
   * @param {Function} callback - Функция анимации
   * @return {number} - ID анимации
   */
  requestFrame: (callback) => {
    if (!window.requestAnimationFrame) {
      return setTimeout(callback, 1000 / 60);
    }
    
    return window.requestAnimationFrame(callback);
  },

  /**
   * Отмена анимации
   * @param {number} id - ID анимации
   */
  cancelFrame: (id) => {
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  },

  /**
   * Плавная анимация свойства
   * @param {Element} element - Элемент
   * @param {string} property - CSS свойство
   * @param {number} target - Целевое значение
   * @param {number} duration - Длительность
   * @param {Function} callback - Обратный вызов
   */
  animate: (element, property, target, duration, callback) => {
    if (!element) return;
    
    const start = performance.now();
    const startValue = parseFloat(getComputedStyle(element)[property]) || 0;
    const change = target - startValue;
    
    function update() {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Используем ease-in-out функцию
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      const currentValue = startValue + change * easeProgress;
      element.style[property] = `${currentValue}px`;
      
      if (progress < 1) {
        animation.requestFrame(update);
      } else {
        if (callback) callback();
      }
    }
    
    animation.requestFrame(update);
  },

  /**
   * Создание CSS перехода
   * @param {Element} element - Элемент
   * @param {string} property - CSS свойство
   * @param {string} value - Значение
   * @param {number} duration - Длительность
   */
  transition: (element, property, value, duration = 300) => {
    if (!element) return;
    
    element.style.transition = `${property} ${duration}ms ease-in-out`;
    element.style[property] = value;
    
    setTimeout(() => {
      element.style.transition = '';
    }, duration);
  }
};

/**
 * Утилиты для работы с геометрией
 */
const geometry = {
  /**
   * Получение позиции элемента относительно документа
   * @param {Element} element - Элемент
   * @return {Object} - Позиция и размеры
   */
  getRect: (element) => {
    if (!element) return { top: 0, left: 0, width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * Вычисление расстояния между двумя точками
   * @param {Object} point1 - Первая точка {x, y}
   * @param {Object} point2 - Вторая точка {x, y}
   * @return {number} - Расстояние
   */
  distance: (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Вычисление угла между двумя точками
   * @param {Object} point1 - Первая точка {x, y}
   * @param {Object} point2 - Вторая точка {x, y}
   * @return {number} - Угол в радианах
   */
  angle: (point1, point2) => {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
  },

  /**
   * Проверка пересечения двух прямоугольников
   * @param {Object} rect1 - Первый прямоугольник
   * @param {Object} rect2 - Второй прямоугольник
   * @return {boolean} - Пересечение
   */
  intersects: (rect1, rect2) => {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
};

/**
 * Утилиты для работы с устройством
 */
const device = {
  /**
   * Проверка мобильного устройства
   * @return {boolean} - Мобильное устройство
   */
  isMobile: () => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Проверка планшета
   * @return {boolean} - Планшет
   */
  isTablet: () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  },

  /**
   * Проверка десктопа
   * @return {boolean} - Десктоп
   */
  isDesktop: () => {
    return window.innerWidth > 1024;
  },

  /**
   * Проверка поддержки touch
   * @return {boolean} - Поддержка touch
   */
  isTouch: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Получение информации об устройстве
   * @return {Object} - Информация об устройстве
   */
  getInfo: () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      isMobile: device.isMobile(),
      isTablet: device.isTablet(),
      isDesktop: device.isDesktop(),
      isTouch: device.isTouch(),
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
  }
};

/**
 * Утилиты для работы с локальным хранилищем
 */
const storage = {
  /**
   * Сохранение данных в localStorage
   * @param {string} key - Ключ
   * @param {*} value - Значение
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Ошибка сохранения в localStorage: ${key}`, error);
    }
  },

  /**
   * Получение данных из localStorage
   * @param {string} key - Ключ
   * @param {*} defaultValue - Значение по умолчанию
   * @return {*} - Сохраненное значение
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Ошибка получения из localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  /**
   * Удаление данных из localStorage
   * @param {string} key - Ключ
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Ошибка удаления из localStorage: ${key}`, error);
    }
  },

  /**
   * Очистка localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Ошибка очистки localStorage:', error);
    }
  }
};

/**
 * Утилиты для работы с cookies
 */
const cookie = {
  /**
   * Установка cookie
   * @param {string} name - Имя
   * @param {string} value - Значение
   * @param {number} days - Срок действия в днях
   */
  set: (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },

  /**
   * Получение cookie
   * @param {string} name - Имя
   * @return {string|null} - Значение cookie
   */
  get: (name) => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    
    return null;
  },

  /**
   * Удаление cookie
   * @param {string} name - Имя
   */
  remove: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 UTC;path=/`;
  }
};

/**
 * Утилиты для работы со строками
 */
const string = {
  /**
   * Обрезка строки до указанной длины
   * @param {string} str - Строка
   * @param {number} length - Максимальная длина
   * @param {string} suffix - Суффикс
   * @return {string} - Обрезанная строка
   */
  truncate: (str, length, suffix = '...') => {
    if (str.length <= length) return str;
    
    return str.substring(0, length - suffix.length) + suffix;
  },

  /**
   * Преобразование первой буквы в заглавную
   * @param {string} str - Строка
   * @return {string} - Строка с заглавной первой буквой
   */
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Генерация случайной строки
   * @param {number} length - Длина
   * @param {string} chars - Символы для генерации
   * @return {string} - Случайная строка
   */
  random: (length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Экранирование HTML
   * @param {string} str - Строка
   * @return {string} - Экранированная строка
   */
  escape: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

/**
 * Утилиты для работы с числами
 */
const number = {
  /**
   * Форматирование числа с разделителями
   * @param {number} num - Число
   * @param {string} locale - Локаль
   * @return {string} - Отформатированное число
   */
  format: (num, locale = 'ru-RU') => {
    return new Intl.NumberFormat(locale).format(num);
  },

  /**
   * Генерация случайного числа в диапазоне
   * @param {number} min - Минимум
   * @param {number} max - Максимум
   * @return {number} - Случайное число
   */
  random: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Округление до указанного количества знаков
   * @param {number} num - Число
   * @param {number} precision - Точность
   * @return {number} - Округленное число
   */
  round: (num, precision = 0) => {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  }
};

/**
 * Утилиты для работы с датами
 */
const date = {
  /**
   * Форматирование даты
   * @param {Date} date - Дата
   * @param {string} format - Формат
   * @param {string} locale - Локаль
   * @return {string} - Отформатированная дата
   */
  format: (date, format = 'short', locale = 'ru-RU') => {
    const options = {
      short: { dateStyle: 'short' },
      medium: { dateStyle: 'medium' },
      long: { dateStyle: 'long' },
      full: { dateStyle: 'full' }
    };
    
    return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(date);
  },

  /**
   * Получение относительного времени
   * @param {Date} date - Дата
   * @return {string} - Относительное время
   */
  timeAgo: (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return `${interval} ${interval === 1 ? 'год' : 'года'} назад`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return `${interval} ${interval === 1 ? 'месяц' : 'месяцев'} назад`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return `${interval} ${interval === 1 ? 'день' : 'дней'} назад`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return `${interval} ${interval === 1 ? 'час' : 'часов'} назад`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return `${interval} ${interval === 1 ? 'минуту' : 'минут'} назад`;
    }
    
    return 'только что';
  }
};

/**
 * Утилиты для работы с URL
 */
const url = {
  /**
   * Получение параметров из URL
   * @param {string} name - Имя параметра
   * @return {string|null} - Значение параметра
   */
  getParam: (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * Добавление параметра в URL
   * @param {string} name - Имя параметра
   * @param {string} value - Значение параметра
   */
  setParam: (name, value) => {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
  },

  /**
   * Удаление параметра из URL
   * @param {string} name - Имя параметра
   */
  removeParam: (name) => {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  }
};

/**
 * Утилиты для валидации
 */
const validation = {
  /**
   * Валидация email
   * @param {string} email - Email
   * @return {boolean} - Корректность email
   */
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Валидация телефона
   * @param {string} phone - Телефон
   * @return {boolean} - Корректность телефона
   */
  phone: (phone) => {
    const regex = /^\+?[\d\s\-\(\)]{10,}$/;
    return regex.test(phone);
  },

  /**
   * Валидация URL
   * @param {string} url - URL
   * @return {boolean} - Корректность URL
   */
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Утилиты для дебаггинга
 */
const debug = {
  /**
   * Логирование с уровнем
   * @param {string} level - Уровень лога
   * @param {string} message - Сообщение
   * @param {*} data - Дополнительные данные
   */
  log: (level, message, data = null) => {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    const currentLevel = levels[localStorage.getItem('debug-level')] || levels.info;
    
    if (levels[level] <= currentLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      if (data) {
        console.log(logMessage, data);
      } else {
        console.log(logMessage);
      }
    }
  },

  /**
   * Измерение производительности
   * @param {string} name - Название операции
   * @param {Function} fn - Функция для измерения
   * @return {*} - Результат функции
   */
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    debug.log('debug', `${name}: ${end - start}ms`);
    return result;
  }
};

/**
 * Утилиты для оптимизации производительности
 */
const performance = {
  /**
   * Debounce функция
   * @param {Function} func - Функция
   * @param {number} wait - Задержка
   * @return {Function} - Debounce функция
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle функция
   * @param {Function} func - Функция
   * @param {number} limit - Ограничение
   * @return {Function} - Throttle функция
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Ленивая загрузка изображений
   * @param {string} selector - Селектор изображений
   */
  lazyLoadImages: (selector = 'img[data-src]') => {
    const images = document.querySelectorAll(selector);
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      
      images.forEach(img => observer.observe(img));
    } else {
      // Fallback для старых браузеров
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }
};

/**
 * Экспортируем все утилиты
 */
window.Utils = {
  dom,
  events,
  animation,
  geometry,
  device,
  storage,
  cookie,
  string,
  number,
  date,
  url,
  validation,
  debug,
  performance
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Устанавливаем уровень дебага
  const debugLevel = url.getParam('debug') || 'info';
  storage.set('debug-level', debugLevel);
  
  debug.log('info', 'Utils модуль загружен');
});