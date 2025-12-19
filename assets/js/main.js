/**
 * Основной JavaScript модуль для проекта Коридор
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

    /**
     * Проверяет поддержку браузером необходимых функций
     * @returns {boolean} - поддерживает ли браузер все необходимые функции
     */
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
        
        // Предзагрузка изображения иконки
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VCRTRENyIi8+PHBhdGggZD0iTTI1IDMwIEw3MCA1MCBMMjUgNzAiIHN0cm9rZT0iIzNEM0QzQ0Igc3Ryb2tlLXdpZHRoPSI2IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
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
            const follower = document.getElementById('cursor-follower');
            if (!follower) return;
            
            // Обновляем реакции маскота при взаимодействии с частицами
            const originalMouseEnter = follower.onmouseenter;
            follower.onmouseenter = function() {
                // Маскот реагирует на частицы
                gsap.to(follower, {
                    scale: 1.2,
                    duration: 0.2,
                    ease: "power2.out"
                });
                
                if (originalMouseEnter) originalMouseEnter();
            };
            
            const originalMouseLeave = follower.onmouseleave;
            follower.onmouseleave = function() {
                gsap.to(follower, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
                
                if (originalMouseLeave) originalMouseLeave();
            };
        }

    /**
     * Настраивает взаимодействие с главной кнопкой
     */
    function setupMainButtonInteraction() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        const hoverTween = gsap.to(follower, { scale: 1.3, duration: 0.3, paused: true, ease: "power2.out" });
        
        mainButton.addEventListener('mouseenter', () => {
            if (isTransitioning) return;
            hoverTween.play();
            gsap.to(eyes, { y: -8, duration: 0.3, ease: 'power2.out' });
        });

        mainButton.addEventListener('mouseleave', () => {
            if (isTransitioning) return;
            hoverTween.reverse();
            gsap.to(eyes, { y: 0, duration: 0.3, ease: 'power2.inOut' });
        });

        mainButton.addEventListener('mousedown', () => {
            if (isTransitioning) return;
            gsap.to(follower, { scale: 0.9, duration: 0.15, ease: "power2.out" });
            gsap.to(eyes, { scaleY: 0.2, y: 12, duration: 0.1, transformOrigin: "center" });
        });

        mainButton.addEventListener('mouseup', () => {
            if (isTransitioning) return;
            gsap.to(follower, { scale: 1, duration: 0.3, ease: "power2.out" });
            gsap.to(eyes, { scaleY: 1, y: 0, duration: 0.3, ease: 'power2.inOut' });
        });
    }

    /**
     * Настраивает анимацию перехода "туннель"
     */
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
            if (window.particleSystem) {
                const rect = mainButton.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                window.particleSystem.createExplosion(centerX, centerY);
            }
            
            tl.restart();
        });
    }

    // Запускаем инициализацию после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();