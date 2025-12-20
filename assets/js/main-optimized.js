/**
 * Основной JavaScript модуль для проекта Коридор (исправленная и оптимизированная версия)
 * Управляет интерактивностью, анимациями и взаимодействием с пользователем
 */

(function() {
    'use strict';

    // --- Конфигурация ---
    const CONFIG = {
        botName: 'mavrtunbot',
        animationDuration: 300,
        reducedMotionDuration: 0.01,
        particleGlowDuration: 200,
        cursorScaleFactor: 1.2,
        cursorBrightness: 1.2,
        particleGlowShadow: '0 0 10px rgba(139, 115, 85, 0.5)'
    };

    // --- Селекторы элементов ---
    let mainButton, follower, pupil, eyes, transitionOverlay, rings, container;

    // --- Состояние приложения ---
    let isFollowerVisible = false;
    let isTransitioning = false;
    let particleSystem = null;

    /**
     * Инициализация DOM элементов
     */
    function initElements() {
        mainButton = document.getElementById('mainButton');
        follower = document.getElementById('cursor-follower');
        pupil = document.getElementById('left-pupil');
        eyes = document.getElementById('eyes');
        transitionOverlay = document.getElementById('transition-overlay');
        container = document.querySelector('.container');
        
        if (transitionOverlay) {
            rings = transitionOverlay.querySelectorAll('.ring');
        }
        
        // Проверяем наличие всех необходимых элементов
        if (!mainButton || !follower || !pupil || !eyes || !transitionOverlay || !container) {
            console.error('Essential elements for animation are missing.');
            return false;
        }
        
        return true;
    }

    /**
     * Проверяет поддержку браузером необходимых функций
     * @returns {boolean} - поддерживает ли браузер все необходимые функции
     */
    function checkBrowserSupport() {
        const features = {
            gsap: typeof gsap !== 'undefined',
            matchMedia: typeof window.matchMedia !== 'undefined',
            addEventListener: typeof window.addEventListener !== 'undefined',
            requestAnimationFrame: typeof window.requestAnimationFrame !== 'undefined',
            particleSystem: typeof window.ParticleSystem !== 'undefined'
        };
        
        const unsupported = Object.keys(features).filter(key => !features[key]);
        if (unsupported.length > 0) {
            console.warn('Browser does not support the following features:', unsupported);
        }
        
        return unsupported.length === 0;
    }

    /**
     * Настраивает обработку ошибок
     */
    function setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }

    /**
     * Предзагрузка ресурсов для оптимизации производительности
     */
    function preloadResources() {
        // Предзагрузка шрифтов, если необходимо
        if ('fonts' in document) {
            document.fonts.load('16px Inter');
            document.fonts.load('600 18px Inter');
        }
        
        // Предзагрузка иконки
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VCRTRENyIi8+PHBhdGggZD0iTTI1IDMwIEw3MCA1MCBMMjUgNzAiIHN0cm9rZT0iIzNEM0QzRDQiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';
        document.head.appendChild(link);
    }

    /**
     * Настраивает интерактивный маскот-курсор
     */
    function setupCursorFollower() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        document.body.style.cursor = 'none';

        const xTo = gsap.quickTo(follower, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(follower, "y", { duration: 0.5, ease: "power3" });
        
        let lastX = 0, lastY = 0;

        const onMouseMove = (e) => {
            if (isTransitioning) return;
            
            const { clientX, clientY } = e;
            
            if (!isFollowerVisible) {
                isFollowerVisible = true;
                gsap.to(follower, { opacity: 1, duration: 0.3 });
            }

            const dx = clientX - lastX;
            const dy = clientY - lastY;
            const speed = Math.sqrt(dx * dx + dy * dy);
            lastX = clientX;
            lastY = clientY;

            xTo(clientX);
            yTo(clientY);

            const scaleFactor = gsap.utils.clamp(0, 1, speed / 100);
            gsap.to(follower, {
                scaleX: 1 + scaleFactor * 1.5,
                scaleY: 1 - scaleFactor * 0.5,
                duration: 0.8,
                ease: "power3.out"
            });
            
            const rect = eyes.getBoundingClientRect();
            if (rect.width > 0) {
                const eyeX = rect.left + rect.width / 2;
                const eyeY = rect.top + rect.height / 2;
                const angle = Math.atan2(clientY - eyeY, clientX - eyeX);
                const pupilDist = 4;

                gsap.to(pupil, {
                    x: Math.cos(angle) * pupilDist,
                    y: Math.sin(angle) * pupilDist,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
            
            // Применяем физику частиц при движении курсора
            if (particleSystem) {
                particleSystem.applyMouseForces(clientX, clientY);
            }
        };

        const onMouseLeave = () => {
            if (isTransitioning) return;
            isFollowerVisible = false;
            gsap.to(follower, { opacity: 0, duration: 0.3 });
        };
        
        const onMouseEnter = () => {
            if (isTransitioning) return;
            if (!isFollowerVisible) {
                isFollowerVisible = true;
                gsap.to(follower, { opacity: 1, duration: 0.3 });
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        document.body.addEventListener('mouseleave', onMouseLeave);
        document.body.addEventListener('mouseenter', onMouseEnter);
    }

    /**
     * Настройка взаимодействия курсора с частицами
     */
    function setupCursorParticleInteraction() {
        if (!follower) return;
        
        // Обновляем реакции маскота при взаимодействии с частицами
        const originalMouseEnter = follower.onmouseenter;
        follower.onmouseenter = function() {
            // Маскот реагирует на частицы
            gsap.to(follower, {
                scale: CONFIG.cursorScaleFactor,
                duration: CONFIG.particleGlowDuration / 1000,
                ease: "power2.out",
                filter: `brightness(${CONFIG.cursorBrightness}) drop-shadow(${CONFIG.particleGlowShadow})`
            });
            
            // Добавляем пульсацию при наведении на частицы
            if (particleSystem) {
                follower.classList.add('particle-active');
            }
            
            if (originalMouseEnter) originalMouseEnter();
        };
        
        const originalMouseLeave = follower.onmouseleave;
        follower.onmouseleave = function() {
            gsap.to(follower, {
                scale: 1,
                duration: 0.3,
                ease: "power2.inOut",
                filter: 'none'
            });
            
            // Убираем пульсацию при уходе курсора
            if (particleSystem) {
                follower.classList.remove('particle-active');
            }
            
            if (originalMouseLeave) originalMouseLeave();
        };
    }

    /**
     * Настраивает взаимодействие с главной кнопкой
     */
    function setupMainButtonInteraction() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const hoverTween = gsap.to(follower, { 
            scale: 1.3, 
            duration: 0.3, 
            paused: true, 
            ease: "power2.out" 
        });
        
        mainButton.addEventListener('mouseenter', () => {
            if (isTransitioning) return;
            hoverTween.play();
            gsap.to(eyes, { y: -8, duration: 0.3, ease: 'power2.out' });
            
            // Добавляем свечение вокруг частиц при наведении
            if (particleSystem) {
                follower.classList.add('particle-glow');
            }
        });

        mainButton.addEventListener('mouseleave', () => {
            if (isTransitioning) return;
            hoverTween.reverse();
            gsap.to(eyes, { y: 0, duration: 0.3, ease: 'power2.inOut' });
            
            // Убираем свечение вокруг частиц
            if (particleSystem) {
                follower.classList.remove('particle-glow');
            }
        });

        mainButton.addEventListener('mousedown', () => {
            if (isTransitioning) return;
            gsap.to(follower, { 
                scale: 0.9, 
                duration: 0.15, 
                ease: "power2.out" 
            });
            gsap.to(eyes, { 
                scaleY: 0.2, 
                y: 12, 
                duration: 0.1, 
                transformOrigin: "center" 
            });
        });

        mainButton.addEventListener('mouseup', () => {
            if (isTransitioning) return;
            gsap.to(follower, { 
                scale: 1, 
                duration: 0.3, 
                ease: "power2.out" 
            });
            gsap.to(eyes, { 
                scaleY: 1, 
                y: 0, 
                duration: 0.3, 
                ease: 'power2.inOut' 
            });
        });
    }

    /**
     * Настраивает анимацию перехода "туннель"
     */
    function setupTransition() {
        const fullLink = `https://t.me/${CONFIG.botName}`;
        
        const tl = gsap.timeline({
            paused: true,
            onStart: () => {
                isTransitioning = true;
            },
            onComplete: () => {
                try {
                    window.open(fullLink, '_blank', 'noopener,noreferrer');
                } catch (error) {
                    console.error('Failed to open link:', error);
                    // Запасной вариант
                    window.location.href = fullLink;
                }
                
                setTimeout(() => {
                    mainButton.classList.remove('processing');
                    gsap.set(transitionOverlay, { opacity: 0, pointerEvents: 'none' });
                    gsap.to(container, { opacity: 1, duration: 0.5 });
                    // Восстановление состояния маскота
                    isFollowerVisible = false;
                    isTransitioning = false;
                    gsap.set(follower, { opacity: 0, scale: 1, scaleX: 1, scaleY: 1 });
                }, 500);
            }
        });

        tl.to([container, follower], { duration: 0.3, opacity: 0, ease: 'power2.in' })
          .set(transitionOverlay, { opacity: 1, pointerEvents: 'auto' })
          .fromTo(rings, {
              scale: 0.01,
              opacity: 1
          }, {
              duration: 1.2,
              scale: 250,
              opacity: 0,
              stagger: {
                  each: 0.04,
                  from: 'center'
              },
              ease: 'power3.in'
          }, "-=0.2");

        mainButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (tl.isActive() || isTransitioning) return;
            mainButton.classList.add('processing');
            
            // Создаем эффект взрыва частиц при клике
            if (particleSystem) {
                const rect = mainButton.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                particleSystem.createExplosion(centerX, centerY);
            }
            
            tl.restart();
        });
    }

    /**
     * Инициализация системы частиц
     */
    function setupParticles() {
        // Проверяем поддержку системы частиц
        if (!window.ParticleSystem) {
            console.warn('Particle system not available');
            return;
        }
        
        try {
            // Инициализируем систему частиц
            particleSystem = window.ParticleSystem.init();
            
            // Интегрируем с маскотом-курсором
            if (particleSystem && follower) {
                setupCursorParticleInteraction();
            }
        } catch (error) {
            console.error('Failed to initialize particle system:', error);
        }
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
                duration: CONFIG.reducedMotionDuration,
                easing: 'linear'
            };
        }
        return options;
    }

    /**
     * Инициализация приложения
     */
    function init() {
        try {
            // Инициализация DOM элементов
            if (!initElements()) {
                console.error('Failed to initialize DOM elements');
                return;
            }
            
            if (!checkBrowserSupport()) {
                console.error('Browser does not support required features');
                return;
            }
            
            setupErrorHandling();
            preloadResources();
            setupCursorFollower();
            setupMainButtonInteraction();
            setupTransition();
            setupParticles();
            
            // Устанавливаем начальное состояние для маскота
            gsap.set(follower, { opacity: 0, scale: 1 });
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }

    // Запускаем инициализацию после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Экспортируем основные функции для возможного использования извне
    window.KoridorMain = {
        init,
        setupParticles,
        setupCursorFollower,
        setupMainButtonInteraction,
        setupTransition,
        adaptForReducedMotion,
        CONFIG
    };

})();