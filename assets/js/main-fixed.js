/**
 * Основной JavaScript модуль для проекта Коридор (исправленная версия)
 * Управляет интерактивностью, анимациями и взаимодействием с пользователем
 */

(function() {
    'use strict';

    // --- Конфигурация ---
    const botName = 'mavrtunbot';
    const fullLink = `https://t.me/${botName}`;

    // --- Селекторы элементов ---
    const mainButton = document.getElementById('mainButton');
    const follower = document.getElementById('cursor-follower');
    const pupil = document.getElementById('left-pupil');
    const eyes = document.getElementById('eyes');
    const transitionOverlay = document.getElementById('transition-overlay');
    const rings = transitionOverlay.querySelectorAll('.ring');
    const container = document.querySelector('.container');

    // --- Состояние приложения ---
    let isFollowerVisible = false;
    let isTransitioning = false;

    // --- Проверка поддержки браузера ---
    function checkBrowserSupport() {
        const features = {
            gsap: typeof gsap !== 'undefined',
            matchMedia: typeof window.matchMedia !== 'undefined',
            addEventListener: typeof window.addEventListener !== 'undefined',
            requestAnimationFrame: typeof window.requestAnimationFrame !== 'undefined'
        };
        
        const unsupported = Object.keys(features).filter(key => !features[key]);
        if (unsupported.length > 0) {
            console.warn('Browser does not support the following features:', unsupported);
        }
        
        return unsupported.length === 0;
    }

    // --- Обработка ошибок ---
    function setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }

    // --- Предзагрузка ресурсов ---
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
        link.href = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VCRTRENyIvPjxwYXRoIGQ9Ik0yNSAzMCBMNzAgNTAgTDI1IDcwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+'; 
        document.head.appendChild(link);
    }

    // --- Инициализация системы частиц ---
    function setupParticles() {
        // Проверяем поддержку Canvas
        if (!window.ParticleSystem) {
            console.warn('Particle system not available');
            return;
        }
        
        // Инициализируем систему частиц
        window.particleSystem = window.ParticleSystem.init();
        
        // Интегрируем с маскотом-курсором
        if (window.particleSystem && window.follower) {
            setupCursorParticleInteraction();
        }
    }

    // --- Настройка взаимодействия курсора с частицами ---
    function setupCursorParticleInteraction() {
        if (!follower) return;
        
        // Обновляем реакции маскота при взаимодействии с частицами
        const originalMouseEnter = follower.onmouseenter;
        follower.onmouseenter = function() {
            // Маскот реагирует на частицы
            gsap.to(follower, { 
                scale: 1.2, 
                duration: 0.2, 
                ease: "power2.out",
                filter: "brightness(1.2) drop-shadow(0 0 10px rgba(139, 115, 85, 0.5))"
            });
            
            // Добавляем пульсацию при наведении на частицы
            if (window.particleSystem) {
                follower.classList.add('particle-active');
            }
            
            if (originalMouseEnter) originalMouseEnter();
        };
        
        const originalMouseLeave = follower.onmouseleave;
        follower.onmouseleave = function() {
            gsap.to(follower, { 
                scale: 1, 
                duration: 0.3, 
                ease: "power2.inOut"
            });
            
            // Убираем пульсацию при уходе курсора
            if (window.particleSystem) {
                follower.classList.remove('particle-active');
            }
            
            if (originalMouseLeave) originalMouseLeave();
        };
        
        // Обработчики движения мыши
        follower.addEventListener('mousemove', (e) => {
            if (isTransitioning) return;
            
            const { clientX, clientY } = e;
            
            // Применяем физику частиц при движении курсора
            if (window.particleSystem) {
                window.particleSystem.applyMouseForces(clientX, clientY);
            }
        });
        
        // Обработчики для мобильных устройств
        document.body.addEventListener('mouseleave', onMouseLeave);
        document.body.addEventListener('mouseenter', onMouseEnter);
    }

    // --- Настраивает взаимодействие с главной кнопкой ---
    function setupMainButtonInteraction() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        // Анимация при наведении
        const hoverTween = gsap.to(follower, { 
            scale: 1.3, 
            duration: 0.3, 
            paused: true, 
            ease: "power2.out"
        });
        
        mainButton.addEventListener('mouseenter', () => {
            if (isTransitioning) return;
            hoverTween.play();
            
            // Добавляем свечение вокруг частиц при наведении
            if (window.particleSystem) {
                follower.classList.add('particle-glow');
            }
        });
        
        mainButton.addEventListener('mouseleave', () => {
            if (isTransitioning) return;
            hoverTween.reverse();
            
            // Убираем свечение вокруг частиц
            if (window.particleSystem) {
                follower.classList.remove('particle-glow');
            }
        });
        
        // Анимация при нажатии
        mainButton.addEventListener('mousedown', () => {
            if (isTransitioning) return;
            gsap.to(follower, { 
                scale: 0.9, 
                duration: 0.15, 
                ease: "power2.out"
            });
            
            // Сжимаем глаза маскота
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
            
            // Возвращаем глаза в нормальное состояние
            gsap.to(eyes, { 
                scaleY: 1, 
                y: 0, 
                duration: 0.3, 
                transformOrigin: "center"
            });
        });
        
        // Обработчик клика с эффектом взрыва частиц
        mainButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (isTransitioning) return;
            
            // Создаем эффект взрыва частиц при клике
            if (window.particleSystem) {
                const rect = mainButton.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                window.particleSystem.createExplosion(centerX, centerY);
            }
            
            // Перезапускаем анимацию перехода
            isTransitioning = true;
            mainButton.classList.add('processing');
        });
    }

    // --- Настраивает анимацию перехода "туннель" ---
    function setupTransition() {
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
                    
                    if (follower) {
                        gsap.set(follower, { opacity: 0, scale: 1, scaleX: 1, scaleY: 1 });
                    }
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
    }

    // --- Инициализация приложения ---
    function init() {
        try {
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
})();