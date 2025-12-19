/**
 * Модуль анимаций для проекта Коридор
 * Содержит продвинутые анимации с использованием Web Animations API
 */

(function() {
    'use strict';

    // --- Конфигурация ---
    const ANIMATION_CONFIG = {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        reducedMotionDuration: 0.01
    };

    /**
     * Создаёт плавную анимацию появления элемента
     * @param {Element} element - DOM элемент для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Promise} - Promise, который разрешается после завершения анимации
     */
    function fadeIn(element, options = {}) {
        if (!element) return Promise.resolve();
        
        const duration = options.duration || ANIMATION_CONFIG.duration;
        const easing = options.easing || ANIMATION_CONFIG.easing;
        
        return element.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: duration,
            easing: easing,
            fill: 'forwards'
        }).finished;
    }

    /**
     * Создаёт анимацию появления элемента снизу вверх
     * @param {Element} element - DOM элемент для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Promise} - Promise, который разрешается после завершения анимации
     */
    function slideInUp(element, options = {}) {
        if (!element) return Promise.resolve();
        
        const duration = options.duration || ANIMATION_CONFIG.duration;
        const easing = options.easing || ANIMATION_CONFIG.easing;
        const distance = options.distance || 30;
        
        return element.animate([
            { 
                opacity: 0,
                transform: `translateY(${distance}px)`
            },
            { 
                opacity: 1,
                transform: 'translateY(0)'
            }
        ], {
            duration: duration,
            easing: easing,
            fill: 'forwards'
        }).finished;
    }

    /**
     * Создаёт анимацию появления элемента с масштабированием
     * @param {Element} element - DOM элемент для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Promise} - Promise, который разрешается после завершения анимации
     */
    function scaleIn(element, options = {}) {
        if (!element) return Promise.resolve();
        
        const duration = options.duration || ANIMATION_CONFIG.duration;
        const easing = options.easing || ANIMATION_CONFIG.easing;
        const scale = options.scale || 0.8;
        
        return element.animate([
            { 
                opacity: 0,
                transform: `scale(${scale})`
            },
            { 
                opacity: 1,
                transform: 'scale(1)'
            }
        ], {
            duration: duration,
            easing: easing,
            fill: 'forwards'
        }).finished;
    }

    /**
     * Создаёт пульсирующую анимацию
     * @param {Element} element - DOM элемент для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Animation} - Объект анимации для управления
     */
    function pulse(element, options = {}) {
        if (!element) return null;
        
        const duration = options.duration || 2000;
        const scale = options.scale || 1.05;
        
        return element.animate([
            { transform: 'scale(1)' },
            { transform: `scale(${scale})` },
            { transform: 'scale(1)' }
        ], {
            duration: duration,
            easing: 'ease-in-out',
            iterations: Infinity
        });
    }

    /**
     * Создаёт анимацию тряски
     * @param {Element} element - DOM элемент для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Promise} - Promise, который разрешается после завершения анимации
     */
    function shake(element, options = {}) {
        if (!element) return Promise.resolve();
        
        const duration = options.duration || 500;
        const intensity = options.intensity || 10;
        
        return element.animate([
            { transform: 'translateX(0)' },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: 'translateX(0)' }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        }).finished;
    }

    /**
     * Создаёт анимацию вращения
     * @param {Element} element - DOM элемент для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Animation} - Объект анимации для управления
     */
    function rotate(element, options = {}) {
        if (!element) return null;
        
        const duration = options.duration || 1000;
        const direction = options.direction || 'normal';
        const degrees = direction === 'reverse' ? -360 : 360;
        
        return element.animate([
            { transform: 'rotate(0deg)' },
            { transform: `rotate(${degrees}deg)` }
        ], {
            duration: duration,
            easing: 'linear',
            iterations: Infinity
        });
    }

    /**
     * Создаёт анимацию появления элементов при скролле
     * @param {NodeList|Array} elements - DOM элементы для анимации
     * @param {Object} options - дополнительные параметры анимации
     */
    function animateOnScroll(elements, options = {}) {
        if (!elements || elements.length === 0) return;
        
        const threshold = options.threshold || 0.1;
        const rootMargin = options.rootMargin || '0px';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Добавляем класс для CSS анимаций
                    element.classList.add('scroll-reveal');
                    
                    // Используем Web Animations API для дополнительной анимации
                    if (options.useWebAnimations) {
                        const animationType = options.animationType || 'slideInUp';
                        
                        switch (animationType) {
                            case 'fadeIn':
                                fadeIn(element, options);
                                break;
                            case 'slideInUp':
                                slideInUp(element, options);
                                break;
                            case 'scaleIn':
                                scaleIn(element, options);
                                break;
                            default:
                                slideInUp(element, options);
                        }
                    }
                    
                    // Помечаем элемент как обработанный
                    element.classList.add('revealed');
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: threshold,
            rootMargin: rootMargin
        });
        
        // Начинаем наблюдение за всеми элементами
        Array.from(elements).forEach(element => {
            if (!element.classList.contains('revealed')) {
                observer.observe(element);
            }
        });
        
        return observer;
    }

    /**
     * Создаёт анимацию печатания текста
     * @param {Element} element - DOM элемент с текстом
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Promise} - Promise, который разрешается после завершения анимации
     */
    function typewriter(element, options = {}) {
        if (!element) return Promise.resolve();
        
        const text = element.textContent;
        const speed = options.speed || 50; // символов в секунду
        const duration = (text.length / speed) * 1000;
        
        element.textContent = '';
        element.style.width = '0';
        element.style.whiteSpace = 'nowrap';
        element.style.overflow = 'hidden';
        
        return element.animate([
            { width: '0' },
            { width: '100%' }
        ], {
            duration: duration,
            easing: 'steps(' + text.length + ', end)',
            fill: 'forwards'
        }).finished.then(() => {
            element.style.width = '';
            element.style.whiteSpace = '';
            element.style.overflow = '';
        });
    }

    /**
     * Создаёт анимацию загрузки с точками
     * @param {Element} container - контейнер для анимации
     * @param {Object} options - дополнительные параметры анимации
     * @returns {Object} - Объект для управления анимацией
     */
    function createLoadingDots(container, options = {}) {
        if (!container) return null;
        
        const dotCount = options.dotCount || 3;
        const duration = options.duration || 1400;
        
        // Создаём точки
        const dots = [];
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('span');
            dot.style.display = 'inline-block';
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.background = 'currentColor';
            dot.style.margin = '0 2px';
            
            container.appendChild(dot);
            dots.push(dot);
        }
        
        // Анимируем точки
        dots.forEach((dot, index) => {
            const delay = (index * duration) / dotCount;
            
            dot.animate([
                { transform: 'scale(0)', opacity: 0.5 },
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(0)', opacity: 0.5 }
            ], {
                duration: duration,
                delay: delay,
                easing: 'ease-in-out',
                iterations: Infinity
            });
        });
        
        return {
            container,
            dots,
            destroy: () => {
                container.innerHTML = '';
            }
        };
    }

    /**
     * Проверяет поддержку Web Animations API
     * @returns {boolean} - поддерживает ли браузер Web Animations API
     */
    function supportsWebAnimations() {
        return typeof Element !== 'undefined' && 
               typeof Element.prototype.animate === 'function';
    }

    /**
     * Адаптирует параметры анимации для пользователей с чувствительностью к движению
     * @param {Object} options - параметры анимации
     * @returns {Object} - адаптированные параметры
     */
    function adaptForReducedMotion(options = {}) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return {
                ...options,
                duration: ANIMATION_CONFIG.reducedMotionDuration,
                easing: 'linear'
            };
        }
        return options;
    }

    /**
     * Создаёт последовательную анимацию для нескольких элементов
     * @param {Array} elements - массив DOM элементов
     * @param {Function} animationFunction - функция анимации
     * @param {Object} options - дополнительные параметры
     * @returns {Promise} - Promise, который разрешается после завершения всех анимаций
     */
    function staggerAnimation(elements, animationFunction, options = {}) {
        if (!elements || elements.length === 0 || !animationFunction) {
            return Promise.resolve();
        }
        
        const staggerDelay = options.staggerDelay || 100;
        const adaptedOptions = adaptForReducedMotion(options);
        
        const animations = elements.map((element, index) => {
            const elementOptions = {
                ...adaptedOptions,
                delay: (adaptedOptions.delay || 0) + (index * staggerDelay)
            };
            
            return animationFunction(element, elementOptions);
        });
        
        return Promise.all(animations);
    }

    // Экспортируем функции для использования в других модулях
    window.KoridorAnimations = {
        fadeIn,
        slideInUp,
        scaleIn,
        pulse,
        shake,
        rotate,
        animateOnScroll,
        typewriter,
        createLoadingDots,
        supportsWebAnimations,
        adaptForReducedMotion,
        staggerAnimation
    };

    // Автоматическая инициализация анимаций при скролле
    document.addEventListener('DOMContentLoaded', () => {
        const scrollElements = document.querySelectorAll('.scroll-animate');
        if (scrollElements.length > 0) {
            animateOnScroll(scrollElements, {
                threshold: 0.1,
                useWebAnimations: true,
                animationType: 'slideInUp'
            });
        }
    });

})();