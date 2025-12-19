/**
 * Продвинутые анимации для проекта Коридор
 * Содержит оптимизированные анимации с использованием современных API
 */

'use strict';

// Глобальные переменные для анимаций
let animationFrameId = null;
let particles = [];
let scrollProgress = 0;
let isScrolling = false;
let scrollTimeout = null;

/**
 * Инициализация модуля анимаций
 */
function initAnimations() {
  console.log('Инициализация модуля анимаций...');
  
  // Создаем частицы фона
  createBackgroundParticles();
  
  // Инициализируем анимации при скролле
  initScrollAnimations();
  
  // Настраиваем анимации для галереи
  initGalleryAnimations();
  
  // Запускаем основной цикл анимаций
  startAnimationLoop();
  
  console.log('Модуль анимаций успешно инициализирован');
}

/**
 * Создание частиц фона
 */
function createBackgroundParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);
  
  // Создаем частицы
  for (let i = 0; i < 50; i++) {
    createParticle(particlesContainer);
  }
}

/**
 * Создание одной частицы
 */
function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Случайные параметры
  const size = Math.random() * 4 + 2;
  const opacity = Math.random() * 0.5 + 0.3;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  
  // Применяем стили
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.opacity = opacity;
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.animationDelay = `${delay}s`;
  particle.style.animationDuration = `${duration}s`;
  
  // Добавляем в контейнер
  container.appendChild(particle);
  particles.push(particle);
}

/**
 * Инициализация анимаций при скролле
 */
function initScrollAnimations() {
  let lastScrollY = window.pageYOffset;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    const deltaY = currentScrollY - lastScrollY;
    
    // Обновляем прогресс скролла
    updateScrollProgress();
    
    // Анимируем элементы при скролле
    animateScrollElements(deltaY);
    
    // Анимируем параллакс
    animateParallax(currentScrollY);
    
    lastScrollY = currentScrollY;
    
    // Оптимизация: определяем когда скролл завершился
    clearTimeout(scrollTimeout);
    isScrolling = true;
    
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);
  }, { passive: true });
}

/**
 * Обновление прогресса скролла
 */
function updateScrollProgress() {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  scrollProgress = window.pageYOffset / (documentHeight - windowHeight);
}

/**
 * Анимация элементов при скролле
 */
function animateScrollElements(deltaY) {
  const scrollElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right');
  
  scrollElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      const speed = parseFloat(element.dataset.speed) || 0.5;
      const direction = element.dataset.direction || 'up';
      
      let transform = '';
      
      switch (direction) {
        case 'left':
          transform = `translateX(${deltaY * speed}px)`;
          break;
        case 'right':
          transform = `translateX(${-deltaY * speed}px)`;
          break;
        case 'up':
        default:
          transform = `translateY(${-deltaY * speed}px)`;
          break;
      }
      
      element.style.transform = transform;
    }
  });
}

/**
 * Анимация параллакса
 */
function animateParallax(scrollY) {
  const parallaxElements = document.querySelectorAll('.parallax-layer');
  
  parallaxElements.forEach(element => {
    const speed = parseFloat(element.dataset.speed) || 0.5;
    const yPos = -(scrollY * speed);
    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
  });
}

/**
 * Инициализация анимаций галереи
 */
function initGalleryAnimations() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  // Используем Intersection Observer для оптимизации
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateGalleryItem(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    galleryItems.forEach(item => {
      observer.observe(item);
    });
  }
}

/**
 * Анимация элемента галереи
 */
function animateGalleryItem(item) {
  // Добавляем класс для анимации
  item.classList.add('animate-in');
  
  // Анимация изображения
  const image = item.querySelector('img');
  if (image) {
    image.style.transform = 'scale(1.05)';
    setTimeout(() => {
      image.style.transform = 'scale(1)';
    }, 300);
  }
}

/**
 * Основной цикл анимаций
 */
function startAnimationLoop() {
  function animate() {
    // Анимируем частицы
    animateParticles();
    
    // Обновляем время
    updateTimers();
    
    // Продолжаем цикл
    animationFrameId = requestAnimationFrame(animate);
  }
  
  animate();
}

/**
 * Анимация частиц
 */
function animateParticles() {
  particles.forEach(particle => {
    // Дополнительная логика анимации частиц при необходимости
    if (particle.dataset.animated === 'true') {
      const rect = particle.getBoundingClientRect();
      const speed = parseFloat(particle.dataset.speed) || 1;
      const angle = parseFloat(particle.dataset.angle) || 0;
      
      const newX = rect.left + Math.cos(angle) * speed;
      const newY = rect.top + Math.sin(angle) * speed;
      
      particle.style.left = `${newX}px`;
      particle.style.top = `${newY}px`;
    }
  });
}

/**
 * Обновление таймеров
 */
function updateTimers() {
  // Логика обновления времени/таймеров
  const timers = document.querySelectorAll('.timer');
  
  timers.forEach(timer => {
    const endTime = new Date(timer.dataset.endTime).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, endTime - now);
    
    if (remaining > 0) {
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timer.textContent = '00:00:00';
      timer.classList.add('expired');
    }
  });
}

/**
 * Создание эффекта печатной машинки
 */
function typewriterEffect(element, text, speed = 50) {
  element.textContent = '';
  let index = 0;
  
  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

/**
 * Создание эффекта волны
 */
function createWaveEffect(x, y, container = document.body) {
  const wave = document.createElement('div');
  wave.className = 'wave';
  wave.style.left = `${x}px`;
  wave.style.top = `${y}px`;
  
  container.appendChild(wave);
  
  // Активируем анимацию
  setTimeout(() => {
    wave.classList.add('active');
  }, 10);
  
  // Удаляем элемент после анимации
  setTimeout(() => {
    wave.remove();
  }, 1000);
}

/**
 * Анимация счетчика
 */
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  function updateCounter() {
    current += increment;
    
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  }
  
  updateCounter();
}

/**
 * Анимация появления текста
 */
function revealText(element, delay = 100) {
  const text = element.textContent;
  element.textContent = '';
  element.style.opacity = '0';
  
  text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.opacity = '0';
    span.style.transform = 'translateY(20px)';
    span.style.transition = `all 0.5s ease ${index * delay}ms`;
    
    element.appendChild(span);
    
    setTimeout(() => {
      span.style.opacity = '1';
      span.style.transform = 'translateY(0)';
    }, 50 + index * delay);
  });
  
  // Показываем весь элемент
  setTimeout(() => {
    element.style.opacity = '1';
  }, text.length * delay + 500);
}

/**
 * Создание магнитного эффекта для кнопки
 */
function createMagneticEffect(button) {
  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translate(0, 0)';
  });
}

/**
 * Анимация 3D переворота карточки
 */
function createFlipCard(card) {
  let isFlipped = false;
  
  card.addEventListener('click', () => {
    isFlipped = !isFlipped;
    card.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  });
}

/**
 * Оптимизированная анимация с использованием Web Animations API
 */
function animateWithWebAnimations(element, keyframes, options = {}) {
  if ('animate' in element) {
    const defaultOptions = {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards'
    };
    
    const animationOptions = { ...defaultOptions, ...options };
    
    return element.animate(keyframes, animationOptions);
  }
  
  // Fallback для старых браузеров
  return null;
}

/**
 * Создание анимации свечения
 */
function createGlowEffect(element, color = '#ff4757') {
  const glowKeyframes = [
    { 
      boxShadow: `0 0 5px ${color}`,
      offset: 0
    },
    { 
      boxShadow: `0 0 20px ${color}, 0 0 30px ${color}`,
      offset: 0.5
    },
    { 
      boxShadow: `0 0 5px ${color}`,
      offset: 1
    }
  ];
  
  return animateWithWebAnimations(element, glowKeyframes, {
    duration: 2000,
    iterations: Infinity
  });
}

/**
 * Анимация пульсации
 */
function createPulseEffect(element, scale = 1.05) {
  const pulseKeyframes = [
    { transform: 'scale(1)' },
    { transform: `scale(${scale})` },
    { transform: 'scale(1)' }
  ];
  
  return animateWithWebAnimations(element, pulseKeyframes, {
    duration: 2000,
    iterations: Infinity
  });
}

/**
 * Анимация встряхивания
 */
function createShakeEffect(element, intensity = 10) {
  const shakeKeyframes = [
    { transform: 'translateX(0)' },
    { transform: `translateX(-${intensity}px)` },
    { transform: `translateX(${intensity}px)` },
    { transform: `translateX(-${intensity}px)` },
    { transform: `translateX(${intensity}px)` },
    { transform: 'translateX(0)' }
  ];
  
  return animateWithWebAnimations(element, shakeKeyframes, {
    duration: 500
  });
}

/**
 * Анимация появления снизу
 */
function createSlideInUpEffect(element) {
  const slideInKeyframes = [
    { 
      transform: 'translateY(100%)',
      opacity: 0
    },
    { 
      transform: 'translateY(0)',
      opacity: 1
    }
  ];
  
  return animateWithWebAnimations(element, slideInKeyframes, {
    duration: 600,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  });
}

/**
 * Анимация затухания
 */
function createFadeOutEffect(element) {
  const fadeOutKeyframes = [
    { opacity: 1 },
    { opacity: 0 }
  ];
  
  return animateWithWebAnimations(element, fadeOutKeyframes, {
    duration: 300
  }).onfinish = () => {
    element.style.display = 'none';
  };
}

/**
 * Адаптивная частота кадров
 */
function getAdaptiveFrameRate() {
  // Определяем частоту кадров устройства
  let fps = 60;
  
  if ('matchMedia' in window) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fps = 30;
    }
  }
  
  return fps;
}

/**
 * Оптимизация производительности анимаций
 */
function optimizeAnimations() {
  const fps = getAdaptiveFrameRate();
  const frameInterval = 1000 / fps;
  let then = Date.now();
  
  function animateOptimized() {
    requestAnimationFrame(animateOptimized);
    
    const now = Date.now();
    const elapsed = now - then;
    
    if (elapsed > frameInterval) {
      then = now - (elapsed % frameInterval);
      
      // Выполняем анимации только с нужной частотой
      updateAnimations();
    }
  }
  
  animateOptimized();
}

/**
 * Обновление анимаций
 */
function updateAnimations() {
  // Обновляем все активные анимации
  // Эта функция вызывается с оптимизированной частотой
}

/**
 * Пауза анимаций
 */
function pauseAnimations() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Возобновление анимаций
 */
function resumeAnimations() {
  if (!animationFrameId) {
    startAnimationLoop();
  }
}

/**
 * Очистка анимаций
 */
function cleanupAnimations() {
  // Останавливаем цикл анимаций
  pauseAnimations();
  
  // Удаляем частицы
  particles.forEach(particle => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  });
  particles = [];
  
  // Удаляем контейнер частиц
  const particlesContainer = document.querySelector('.particles');
  if (particlesContainer) {
    particlesContainer.remove();
  }
}

/**
 * Обработка изменения ориентации устройства
 */
function handleOrientationChange() {
  if ('screen' in window && 'orientation' in window.screen) {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        // Пересчитываем позиции элементов при изменении ориентации
        recalculateElementPositions();
      }, 100);
    });
  }
}

/**
 * Пересчет позиций элементов
 */
function recalculateElementPositions() {
  // Обновляем позиции всех анимируемых элементов
  const animatedElements = document.querySelectorAll('[data-animated="true"]');
  
  animatedElements.forEach(element => {
    // Сохраняем текущую позицию
    const rect = element.getBoundingClientRect();
    element.dataset.x = rect.left;
    element.dataset.y = rect.top;
  });
}

/**
 * Экспортируем функции
 */
window.Animations = {
  init: initAnimations,
  typewriterEffect,
  createWaveEffect,
  animateCounter,
  revealText,
  createMagneticEffect,
  createFlipCard,
  createGlowEffect,
  createPulseEffect,
  createShakeEffect,
  createSlideInUpEffect,
  createFadeOutEffect,
  pause: pauseAnimations,
  resume: resumeAnimations,
  cleanup: cleanupAnimations,
  handleOrientationChange,
  recalculateElementPositions
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  if (window.Animations && typeof window.Animations.init === 'function') {
    window.Animations.init();
  }
});