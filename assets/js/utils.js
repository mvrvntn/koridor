/**
 * Утилитарные функции для проекта Коридор
 * Содержит вспомогательные функции для оптимизации производительности
 */

(function() {
    'use strict';

    /**
     * Объект с утилитами
     */
    const Utils = {
        /**
         * Проверяет, является ли устройство мобильным
         * @returns {boolean} - true если мобильное устройство
         */
        isMobile: () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        /**
         * Проверяет, является ли устройство планшетом
         * @returns {boolean} - true если планшет
         */
        isTablet: () => {
            return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
        },

        /**
         * Проверяет, является ли браузер Safari
         * @returns {boolean} - true если Safari
         */
        isSafari: () => {
            return /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
        },

        /**
         * Проверяет поддержку touch событий
         * @returns {boolean} - true если поддерживаются touch события
         */
        isTouchDevice: () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        /**
         * Получает текущие параметры viewport
         * @returns {Object} - объект с параметрами viewport
         */
        getViewport: () => {
            return {
                width: window.innerWidth || document.documentElement.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight,
                scrollX: window.pageXOffset || document.documentElement.scrollLeft,
                scrollY: window.pageYOffset || document.documentElement.scrollTop
            };
        },

        /**
         * Плавная прокрутка к элементу
         * @param {Element} element - элемент для прокрутки
         * @param {Object} options - дополнительные параметры
         */
        scrollToElement: (element, options = {}) => {
            if (!element) return;

            const duration = options.duration || 800;
            const offset = options.offset || 0;
            const easing = options.easing || 'easeInOutCubic';

            const start = window.pageYOffset;
            const targetY = element.getBoundingClientRect().top + window.pageYOffset - offset;
            const distance = targetY - start;
            const startTime = performance.now();

            function animateScroll(currentTime) {
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const easeProgress = Utils.easing[easing](progress);
                
                window.scrollTo(0, start + distance * easeProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else if (options.callback) {
                    options.callback();
                }
            }

            requestAnimationFrame(animateScroll);
        },

        /**
         * Функции easing для анимаций
         */
        easing: {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 1) + 1
        },

        /**
         * Создаёт debounce функцию
         * @param {Function} func - функция для debounce
         * @param {number} wait - время ожидания в ms
         * @param {boolean} immediate - выполнить ли сразу
         * @returns {Function} - debounce функция
         */
        debounce: (func, wait, immediate = false) => {
            let timeout;
            
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(this, args);
                };
                
                const callNow = immediate && !timeout;
                
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                
                if (callNow) func.apply(this, args);
            };
        },

        /**
         * Создаёт throttle функцию
         * @param {Function} func - функция для throttle
         * @param {number} limit - ограничение в ms
         * @returns {Function} - throttle функция
         */
        throttle: (func, limit) => {
            let inThrottle;
            
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Генерирует случайный ID
         * @param {number} length - длина ID
         * @returns {string} - случайный ID
         */
        generateId: (length = 8) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            return result;
        },

        /**
         * Форматирует байты в человекочитаемый формат
         * @param {number} bytes - количество байт
         * @returns {string} - отформатированный размер
         */
        formatBytes: (bytes) => {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        /**
         * Проверяет, находится ли элемент в области видимости
         * @param {Element} element - элемент для проверки
         * @param {number} threshold - порог видимости (0-1)
         * @returns {boolean} - true если элемент виден
         */
        isElementInViewport: (element, threshold = 0) => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
            const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
            
            return vertInView && horInView;
        },

        /**
         * Создаёт наблюдатель за появлением элемента в области видимости
         * @param {Element} element - элемент для наблюдения
         * @param {Function} callback - функция обратного вызова
         * @param {Object} options - дополнительные параметры
         * @returns {IntersectionObserver} - объект наблюдателя
         */
        createIntersectionObserver: (element, callback, options = {}) => {
            const defaultOptions = {
                threshold: 0.1,
                rootMargin: '0px'
            };
            
            const observerOptions = { ...defaultOptions, ...options };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    callback(entry);
                });
            }, observerOptions);
            
            observer.observe(element);
            return observer;
        },

        /**
         * Загружает изображение с промисом
         * @param {string} src - URL изображения
         * @returns {Promise} - Promise с загруженным изображением
         */
        loadImage: (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        },

        /**
         * Предзагружает изображения
         * @param {Array} urls - массив URL изображений
         * @returns {Promise} - Promise с массивом загруженных изображений
         */
        preloadImages: (urls) => {
            const promises = urls.map(url => Utils.loadImage(url));
            return Promise.all(promises);
        },

        /**
         * Копирует текст в буфер обмена
         * @param {string} text - текст для копирования
         * @returns {Promise} - Promise успешного копирования
         */
        copyToClipboard: (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                // Запасной вариант для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                return new Promise((resolve, reject) => {
                    try {
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        if (successful) {
                            resolve();
                        } else {
                            reject(new Error('Failed to copy text'));
                        }
                    } catch (err) {
                        document.body.removeChild(textArea);
                        reject(err);
                    }
                });
            }
        },

        /**
         * Получает параметры из URL
         * @param {string} url - URL для разбора
         * @returns {Object} - объект с параметрами
         */
        getUrlParams: (url = window.location.href) => {
            const params = {};
            const parser = new URL(url);
            
            for (const [key, value] of parser.searchParams) {
                params[key] = value;
            }
            
            return params;
        },

        /**
         * Устанавливает cookie
         * @param {string} name - имя cookie
         * @param {string} value - значение cookie
         * @param {number} days - срок действия в днях
         */
        setCookie: (name, value, days) => {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        },

        /**
         * Получает значение cookie
         * @param {string} name - имя cookie
         * @returns {string|null} - значение cookie или null
         */
        getCookie: (name) => {
            const nameEQ = name + '=';
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
         * Удаляет cookie
         * @param {string} name - имя cookie
         */
        deleteCookie: (name) => {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        },

        /**
         * Проверяет поддержку localStorage
         * @returns {boolean} - true если поддерживается
         */
        isLocalStorageSupported: () => {
            try {
                const test = '__test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },

        /**
         * Сохраняет данные в localStorage
         * @param {string} key - ключ
         * @param {*} value - значение
         */
        setLocalStorage: (key, value) => {
            if (Utils.isLocalStorageSupported()) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.warn('Failed to save to localStorage:', e);
                }
            }
        },

        /**
         * Получает данные из localStorage
         * @param {string} key - ключ
         * @returns {*} - значение или null
         */
        getLocalStorage: (key) => {
            if (Utils.isLocalStorageSupported()) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    console.warn('Failed to get from localStorage:', e);
                    return null;
                }
            }
            return null;
        },

        /**
         * Удаляет данные из localStorage
         * @param {string} key - ключ
         */
        removeLocalStorage: (key) => {
            if (Utils.isLocalStorageSupported()) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn('Failed to remove from localStorage:', e);
                }
            }
        }
    };

    // Экспортируем утилиты
    window.KoridorUtils = Utils;

})();