/**
 * Система частиц для проекта Коридор
 * Создает интерактивные световые частицы, реагирующие на движение курсора и клики
 */

(function() {
    'use strict';

    // --- Конфигурация системы частиц ---
    const PARTICLE_CONFIG = {
        // Количество частиц
        particleCount: 50,
        
        // Максимальное расстояние для соединения линий
        connectionDistance: 150,
        
        // Размеры частиц
        particleSize: {
            min: 1,
            max: 4
        },
        
        // Цветовая палитра в соответствии с дизайном
        colors: [
            '#2B2B2B',  // Основной цвет текста
            '#8B7355',  // Акцентный цвет
            '#D0C9BC',  // Светло-коричневый
            '#707070'   // Мутный текстовый
        ],
        
        // Физические параметры
        physics: {
            gravity: 0.05,
            friction: 0.99,
            bounce: 0.8
        },
        
        // Параметры взаимодействия с курсором
        mouse: {
            attractionRadius: 100,
            repulsionRadius: 50,
            attractionForce: 0.02,
            repulsionForce: 0.1
        },
        
        // Параметры эффекта взрыва
        explosion: {
            particleCount: 20,
            speed: 5,
            lifetime: 1000 // мс
        }
    };

    /**
     * Класс для представления отдельной частицы
     */
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = PARTICLE_CONFIG.particleSize.min + 
                       Math.random() * (PARTICLE_CONFIG.particleSize.max - PARTICLE_CONFIG.particleSize.min);
            this.color = PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)];
            this.alpha = 1;
            this.life = 1;
            this.decay = 0.005 + Math.random() * 0.005;
            this.connections = [];
        }

        /**
         * Обновление физики частицы
         */
        update() {
            // Применение гравитации
            this.vy += PARTICLE_CONFIG.physics.gravity;
            
            // Применение трения
            this.vx *= PARTICLE_CONFIG.physics.friction;
            this.vy *= PARTICLE_CONFIG.physics.friction;
            
            // Обновление позиции
            this.x += this.vx;
            this.y += this.vy;
            
            // Затухание
            this.life -= this.decay;
            this.alpha = Math.max(0, this.life);
            
            // Отскок от границ экрана
            if (this.x < 0 || this.x > window.innerWidth) {
                this.vx *= -PARTICLE_CONFIG.physics.bounce;
                this.x = Math.max(0, Math.min(window.innerWidth, this.x));
            }
            if (this.y < 0 || this.y > window.innerHeight) {
                this.vy *= -PARTICLE_CONFIG.physics.bounce;
                this.y = Math.max(0, Math.min(window.innerHeight, this.y));
            }
        }

        /**
         * Отрисовка частицы
         * @param {CanvasRenderingContext2D} ctx - контекст для отрисовки
         */
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        /**
         * Проверка, находится ли частица в радиусе от точки
         * @param {number} x - координата X
         * @param {number} y - координата Y
         * @param {number} radius - радиус проверки
         * @returns {boolean} - true если в радиусе
         */
        isWithinRadius(x, y, radius) {
            const dx = this.x - x;
            const dy = this.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        }

        /**
         * Применение силы к частице
         * @param {number} fx - сила по X
         * @param {number} fy - сила по Y
         */
        applyForce(fx, fy) {
            this.vx += fx;
            this.vy += fy;
        }

        /**
         * Проверка на "смерть" частицы
         * @returns {boolean} - true если частица должна быть удалена
         */
        isDead() {
            return this.alpha <= 0;
        }
    }

    /**
     * Класс для управления системой частиц
     */
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.mouseX = 0;
            this.mouseY = 0;
            this.isMouseOver = false;
            this.lastMouseX = 0;
            this.lastMouseY = 0;
            
            // Инициализация частиц
            this.initParticles();
            
            // Установка обработчиков событий
            this.setupEventListeners();
        }

        /**
         * Инициализация частиц в случайных позициях
         */
        initParticles() {
            for (let i = 0; i < PARTICLE_CONFIG.particleCount; i++) {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                this.particles.push(new Particle(x, y));
            }
        }

        /**
         * Установка обработчиков событий
         */
        setupEventListeners() {
            // Отслеживание движения мыши
            document.addEventListener('mousemove', (e) => {
                this.lastMouseX = this.mouseX;
                this.lastMouseY = this.mouseY;
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.isMouseOver = true;
            });

            document.addEventListener('mouseleave', () => {
                this.isMouseOver = false;
            });

            document.addEventListener('mouseenter', () => {
                this.isMouseOver = true;
            });

            // Обработка клика для создания эффекта взрыва
            document.addEventListener('click', (e) => {
                this.createExplosion(e.clientX, e.clientY);
            });

            // Обработка изменения размера окна
            window.addEventListener('resize', () => {
                this.handleResize();
            });
        }

        /**
         * Создание эффекта взрыва частиц
         * @param {number} x - координата X взрыва
         * @param {number} y - координата Y взрыва
         */
        createExplosion(x, y) {
            const explosionParticles = [];
            for (let i = 0; i < PARTICLE_CONFIG.explosion.particleCount; i++) {
                const angle = (Math.PI * 2 * i) / PARTICLE_CONFIG.explosion.particleCount;
                const speed = PARTICLE_CONFIG.explosion.speed * (0.5 + Math.random() * 0.5);
                const particle = new Particle(x, y);
                particle.vx = Math.cos(angle) * speed;
                particle.vy = Math.sin(angle) * speed;
                particle.life = 1;
                particle.decay = 1 / PARTICLE_CONFIG.explosion.lifetime;
                explosionParticles.push(particle);
            }
            
            // Добавление взрывных частиц в общую систему
            this.particles.push(...explosionParticles);
            
            // Ограничение общего количества частиц
            if (this.particles.length > PARTICLE_CONFIG.particleCount * 2) {
                this.particles = this.particles.slice(-PARTICLE_CONFIG.particleCount * 2);
            }
        }

        /**
         * Обработка изменения размера окна
         */
        handleResize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        /**
         * Применение сил взаимодействия с курсором
         */
        applyMouseForces() {
            if (!this.isMouseOver) return;

            this.particles.forEach(particle => {
                const dx = this.mouseX - particle.x;
                const dy = this.mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < PARTICLE_CONFIG.mouse.repulsionRadius) {
                    // Сила отталкивания
                    const force = PARTICLE_CONFIG.mouse.repulsionForce * (1 - distance / PARTICLE_CONFIG.mouse.repulsionRadius);
                    const angle = Math.atan2(dy, dx);
                    particle.applyForce(
                        Math.cos(angle) * force,
                        Math.sin(angle) * force
                    );
                } else if (distance < PARTICLE_CONFIG.mouse.attractionRadius) {
                    // Сила притяжения
                    const force = PARTICLE_CONFIG.mouse.attractionForce * (distance / PARTICLE_CONFIG.mouse.attractionRadius);
                    const angle = Math.atan2(dy, dx);
                    particle.applyForce(
                        Math.cos(angle) * force,
                        Math.sin(angle) * force
                    );
                }
            });
        }

        /**
         * Обновление соединительных линий между частицами
         */
        updateConnections() {
            // Очистка соединений
            this.particles.forEach(particle => {
                particle.connections = [];
            });

            // Поиск близлежащих частиц и создание соединений
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < PARTICLE_CONFIG.connectionDistance) {
                        p1.connections.push({
                            particle: p2,
                            distance: distance
                        });
                    }
                }
            }
        }

        /**
         * Основной цикл анимации
         */
        animate() {
            // Очистка canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Применение сил от курсора
            this.applyMouseForces();

            // Обновление всех частиц
            this.particles = this.particles.filter(particle => {
                particle.update();
                return !particle.isDead();
            });

            // Обновление соединений
            this.updateConnections();

            // Отрисовка соединительных линий
            this.drawConnections();

            // Отрисовка частиц
            this.particles.forEach(particle => {
                particle.draw(this.ctx);
            });

            requestAnimationFrame(() => this.animate());
        }

        /**
         * Отрисовка соединительных линий
         */
        drawConnections() {
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(139, 115, 85, 0.1)'; // #8B7355 с прозрачностью
            this.ctx.lineWidth = 0.5;

            this.particles.forEach(particle => {
                particle.connections.forEach(connection => {
                    const opacity = 1 - (connection.distance / PARTICLE_CONFIG.connectionDistance);
                    this.ctx.globalAlpha = opacity * 0.3 * particle.alpha;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(connection.particle.x, connection.particle.y);
                    this.ctx.stroke();
                });
            });

            this.ctx.restore();
        }

        /**
         * Запуск системы частиц
         */
        start() {
            this.handleResize();
            this.animate();
        }

        /**
         * Остановка системы частиц
         */
        stop() {
            // Метод для остановки анимации, если потребуется
        }
    }

    /**
     * Инициализация системы частиц при загрузке страницы
     */
    function initParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        
        document.body.appendChild(canvas);
        
        const particleSystem = new ParticleSystem(canvas);
        particleSystem.start();
        
        // Возврат объекта для возможного взаимодействия извне
        return particleSystem;
    }

    // Экспорт системы частиц
    window.ParticleSystem = {
        init: initParticleSystem,
        Particle,
        ParticleSystem,
        PARTICLE_CONFIG
    };

})();