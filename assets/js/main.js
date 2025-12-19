/**
 * Основной JavaScript файл для проекта Коридор
 * Содержит основную логику интерактивности и управления состоянием
 */

'use strict';

// Глобальные переменные
let isLoaded = false;
let currentSection = 'hero';
let mascotState = {
  position: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  emotion: 'neutral',
  isTracking: false
};

// DOM элементы
let elements = {};

/**
 * Инициализация приложения
 */
function initApp() {
  console.log('Инициализация приложения Коридор...');
  
  // Получаем DOM элементы
  cacheElements();
  
  // Устанавливаем обработчики событий
  setupEventListeners();
  
  // Инициализируем компоненты
  initNavigation();
  initMascot();
  initScrollAnimations();
  initFormValidation();
  initPreloader();
  
  // Отмечаем приложение как загруженное
  isLoaded = true;
  document.body.classList.add('loaded');
  
  console.log('Приложение успешно инициализировано');
}

/**
 * Кэширование DOM элементов для оптимизации производительности
 */
function cacheElements() {
  elements = {
    // Навигация
    header: document.querySelector('.header'),
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-menu a'),
    
    // Hero секция
    hero: document.querySelector('.hero'),
    heroTitle: document.querySelector('.hero-title'),
    startBtn: document.querySelector('#start-experience'),
    learnMoreBtn: document.querySelector('#learn-more'),
    
    // Персонаж-маскот
    mascot: document.querySelector('.mascot'),
    mascotBody: document.querySelector('.mascot-body'),
    mascotEyes: document.querySelectorAll('.mascot-eye'),
    mascotMouth: document.querySelector('.mascot-mouth'),
    
    // Секции
    sections: document.querySelectorAll('.section'),
    scrollElements: document.querySelectorAll('.scroll-animate'),
    
    // Форма
    contactForm: document.querySelector('#contact-form'),
    formInputs: document.querySelectorAll('.form-group input, .form-group textarea'),
    
    // Прелоадер
    preloader: document.querySelector('.preloader'),
    
    // Кнопки
    buttons: document.querySelectorAll('.btn'),
    
    // Галерея
    galleryItems: document.querySelectorAll('.gallery-item')
  };
}

/**
 * Установка обработчиков событий
 */
function setupEventListeners() {
  // Навигация
  if (elements.navToggle) {
    elements.navToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Навигационные ссылки
  elements.navLinks.forEach(link => {
    link.addEventListener('click', handleNavigationClick);
  });
  
  // Кнопки
  elements.buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
    button.addEventListener('mouseenter', handleButtonHover);
    button.addEventListener('mouseleave', handleButtonLeave);
  });
  
  // Персонаж-маскот
  if (elements.mascot) {
    elements.mascot.addEventListener('click', handleMascotClick);
    document.addEventListener('mousemove', handleMouseMove);
  }
  
  // Скролл
  window.addEventListener('scroll', handleScroll);
  
  // Изменение размера окна
  window.addEventListener('resize', handleResize);
  
  // Форма контактов
  if (elements.contactForm) {
    elements.contactForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Валидация полей формы
  elements.formInputs.forEach(input => {
    input.addEventListener('input', handleInputChange);
    input.addEventListener('blur', handleInputBlur);
    input.addEventListener('focus', handleInputFocus);
  });
  
  // Клавиатура
  document.addEventListener('keydown', handleKeyDown);
  
  // Загрузка страницы
  window.addEventListener('load', handlePageLoad);
  
  // Выход со страницы
  window.addEventListener('beforeunload', handlePageUnload);
}

/**
 * Инициализация навигации
 */
function initNavigation() {
  // Активируем текущую секцию в навигации
  updateActiveNavLink();
  
  // Обновляем состояние навигации при скролле
  updateNavigationState();
}

/**
 * Инициализация персонажа-маскота
 */
function initMascot() {
  if (!elements.mascot) return;
  
  // Устанавливаем начальную позицию
  const rect = elements.mascot.getBoundingClientRect();
  mascotState.position = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  
  // Запускаем анимацию персонажа
  animateMascot();
  
  // Добавляем начальные эмоции
  setTimeout(() => {
    setMascotEmotion('curious');
  }, 2000);
}

/**
 * Инициализация анимаций при скролле
 */
function initScrollAnimations() {
  // Проверяем видимость элементов при загрузке
  checkScrollAnimations();
  
  // Создаем Intersection Observer для оптимизации
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    elements.scrollElements.forEach(element => {
      observer.observe(element);
    });
  }
}

/**
 * Инициализация валидации формы
 */
function initFormValidation() {
  if (!elements.contactForm) return;
  
  // Добавляем пользовательские правила валидации
  elements.formInputs.forEach(input => {
    // Устанавливаем атрибуты доступности
    if (input.hasAttribute('required')) {
      input.setAttribute('aria-required', 'true');
    }
    
    // Добавляем подсказки
    addInputValidation(input);
  });
}

/**
 * Инициализация прелоадера
 */
function initPreloader() {
  if (!elements.preloader) return;
  
  // Скрываем прелоадер после загрузки ресурсов
  window.addEventListener('load', () => {
    setTimeout(() => {
      elements.preloader.classList.add('hidden');
      setTimeout(() => {
        elements.preloader.style.display = 'none';
      }, 500);
    }, 1000);
  });
}

/**
 * Переключение мобильного меню
 */
function toggleMobileMenu() {
  if (!elements.navMenu || !elements.navToggle) return;
  
  const isActive = elements.navMenu.classList.contains('active');
  
  if (isActive) {
    elements.navMenu.classList.remove('active');
    elements.navToggle.classList.remove('active');
    elements.navToggle.setAttribute('aria-expanded', 'false');
  } else {
    elements.navMenu.classList.add('active');
    elements.navToggle.classList.add('active');
    elements.navToggle.setAttribute('aria-expanded', 'true');
  }
}

/**
 * Обработка клика по навигационной ссылке
 */
function handleNavigationClick(event) {
  event.preventDefault();
  
  const link = event.currentTarget;
  const targetId = link.getAttribute('href');
  
  if (targetId.startsWith('#')) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      smoothScrollTo(targetElement);
      updateActiveNavLink(link);
    }
  }
  
  // Закрываем мобильное меню
  if (elements.navMenu.classList.contains('active')) {
    toggleMobileMenu();
  }
}

/**
 * Плавная прокрутка к элементу
 */
function smoothScrollTo(target) {
  const headerHeight = elements.header ? elements.header.offsetHeight : 0;
  const targetPosition = target.offsetTop - headerHeight - 20;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Обработка движения мыши для персонажа-маскота
 */
function handleMouseMove(event) {
  if (!elements.mascot || mascotState.isTracking) return;
  
  const { clientX, clientY } = event;
  mascotState.target = { x: clientX, y: clientY };
}

/**
 * Анимация персонажа-маскота
 */
function animateMascot() {
  if (!elements.mascot) return;
  
  // Плавное движение к цели
  const speed = 0.1;
  mascotState.position.x += (mascotState.target.x - mascotState.position.x) * speed;
  mascotState.position.y += (mascotState.target.y - mascotState.position.y) * speed;
  
  // Вычисляем угол взгляда
  const angle = Math.atan2(
    mascotState.target.y - mascotState.position.y,
    mascotState.target.x - mascotState.position.x
  );
  
  // Применяем трансформацию
  const distance = Math.sqrt(
    Math.pow(mascotState.target.x - mascotState.position.x, 2) +
    Math.pow(mascotState.target.y - mascotState.position.y, 2)
  );
  
  // Обновляем глаза персонажа
  updateMascotEyes(angle, distance);
  
  // Продолжаем анимацию
  requestAnimationFrame(animateMascot);
}

/**
 * Обновление глаз персонажа
 */
function updateMascotEyes(angle, distance) {
  if (!elements.mascotEyes.length) return;
  
  const maxDistance = 200;
  const intensity = Math.min(distance / maxDistance, 1);
  
  elements.mascotEyes.forEach(eye => {
    const pupil = eye.querySelector('::after');
    if (pupil) {
      const offsetX = Math.cos(angle) * intensity * 3;
      const offsetY = Math.sin(angle) * intensity * 3;
      
      eye.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
  });
}

/**
 * Установка эмоции персонажа
 */
function setMascotEmotion(emotion) {
  if (!elements.mascot || mascotState.emotion === emotion) return;
  
  // Удаляем предыдущие классы эмоций
  elements.mascot.classList.remove('happy', 'sad', 'surprised', 'excited', 'sleeping', 'winking');
  
  // Добавляем новую эмоцию
  elements.mascot.classList.add(emotion);
  mascotState.emotion = emotion;
  
  // Анимация перехода
  elements.mascotBody.style.transform = 'scale(1.1)';
  setTimeout(() => {
    elements.mascotBody.style.transform = 'scale(1)';
  }, 200);
}

/**
 * Обработка клика по персонажу
 */
function handleMascotClick() {
  const emotions = ['happy', 'surprised', 'excited'];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  setMascotEmotion(randomEmotion);
  
  // Возвращаем к нейтральному состоянию
  setTimeout(() => {
    setMascotEmotion('neutral');
  }, 2000);
}

/**
 * Обработка скролла страницы
 */
function handleScroll() {
  updateNavigationState();
  checkScrollAnimations();
  updateMascotOnScroll();
}

/**
 * Обновление состояния навигации при скролле
 */
function updateNavigationState() {
  const scrollY = window.pageYOffset;
  const headerHeight = elements.header ? elements.header.offsetHeight : 0;
  
  // Добавляем/удаляем класс для фона навигации
  if (scrollY > 100) {
    elements.header.classList.add('scrolled');
  } else {
    elements.header.classList.remove('scrolled');
  }
  
  // Определяем текущую секцию
  let currentSectionId = '';
  elements.sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerHeight + 100 && rect.bottom > headerHeight + 100) {
      currentSectionId = section.id;
    }
  });
  
  if (currentSectionId && currentSectionId !== currentSection) {
    currentSection = currentSectionId;
    updateActiveNavLink();
    updateMascotEmotionBySection(currentSectionId);
  }
}

/**
 * Обновление активной ссылки в навигации
 */
function updateActiveNavLink(activeLink = null) {
  elements.navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  if (activeLink) {
    activeLink.classList.add('active');
  } else {
    // Находим ссылку для текущей секции
    elements.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
}

/**
 * Обновление эмоции персонажа в зависимости от секции
 */
function updateMascotEmotionBySection(sectionId) {
  const emotions = {
    hero: 'excited',
    about: 'curious',
    gallery: 'happy',
    experience: 'surprised',
    contact: 'neutral'
  };
  
  const emotion = emotions[sectionId] || 'neutral';
  setMascotEmotion(emotion);
}

/**
 * Обновление персонажа при скролле
 */
function updateMascotOnScroll() {
  if (!elements.mascot) return;
  
  const scrollY = window.pageYOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = scrollY / maxScroll;
  
  // Анимация в зависимости от прогресса скролла
  if (scrollProgress > 0.8) {
    elements.mascot.classList.add('sleeping');
  } else {
    elements.mascot.classList.remove('sleeping');
  }
}

/**
 * Проверка анимаций при скролле
 */
function checkScrollAnimations() {
  const scrollY = window.pageYOffset;
  const windowHeight = window.innerHeight;
  
  elements.scrollElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < windowHeight && rect.bottom > 0;
    
    if (isVisible && !element.classList.contains('visible')) {
      element.classList.add('visible');
    }
  });
}

/**
 * Обработка изменения размера окна
 */
function handleResize() {
  // Обновляем позицию персонажа
  if (elements.mascot) {
    const rect = elements.mascot.getBoundingClientRect();
    mascotState.position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }
  
  // Проверяем видимость элементов
  checkScrollAnimations();
}

/**
 * Обработка клика по кнопке
 */
function handleButtonClick(event) {
  const button = event.currentTarget;
  
  // Добавляем эффект волны
  createRippleEffect(button, event);
  
  // Анимация персонажа
  if (elements.mascot) {
    setMascotEmotion('excited');
    setTimeout(() => {
      setMascotEmotion('neutral');
    }, 1000);
  }
}

/**
 * Обработка наведения на кнопку
 */
function handleButtonHover(event) {
  const button = event.currentTarget;
  
  // Анимация персонажа
  if (elements.mascot) {
    setMascotEmotion('curious');
  }
  
  // Добавляем магнитный эффект
  button.classList.add('magnetic');
}

/**
 * Об ухода курсора с кнопки
 */
function handleButtonLeave(event) {
  const button = event.currentTarget;
  
  // Возвращаем персонажа в нормальное состояние
  if (elements.mascot) {
    setMascotEmotion('neutral');
  }
  
  // Убираем магнитный эффект
  button.classList.remove('magnetic');
}

/**
 * Создание эффекта волны на кнопке
 */
function createRippleEffect(button, event) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  
  button.appendChild(ripple);
  
  // Удаляем элемент после анимации
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Обработка отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(elements.contactForm);
  const data = Object.fromEntries(formData);
  
  // Валидация формы
  if (!validateForm(data)) {
    showFormError('Пожалуйста, заполните все поля правильно');
    return;
  }
  
  // Показываем индикатор загрузки
  showFormLoading();
  
  // Имитация отправки формы
  setTimeout(() => {
    hideFormLoading();
    showFormSuccess('Сообщение успешно отправлено!');
    elements.contactForm.reset();
    
    // Анимация персонажа
    if (elements.mascot) {
      setMascotEmotion('happy');
      setTimeout(() => {
        setMascotEmotion('neutral');
      }, 3000);
    }
  }, 2000);
}

/**
 * Валидация формы
 */
function validateForm(data) {
  const requiredFields = ['name', 'email', 'message'];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      return false;
    }
  }
  
  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return false;
  }
  
  return true;
}

/**
 * Показ ошибки формы
 */
function showFormError(message) {
  // Создаем или обновляем элемент ошибки
  let errorElement = document.querySelector('.form-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    elements.contactForm.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Анимация появления
  setTimeout(() => {
    errorElement.classList.add('visible');
  }, 10);
}

/**
 * Показ успешной отправки формы
 */
function showFormSuccess(message) {
  // Создаем или обновляем элемент успеха
  let successElement = document.querySelector('.form-success');
  
  if (!successElement) {
    successElement = document.createElement('div');
    successElement.className = 'form-success';
    elements.contactForm.appendChild(successElement);
  }
  
  successElement.textContent = message;
  successElement.style.display = 'block';
  
  // Анимация появления
  setTimeout(() => {
    successElement.classList.add('visible');
  }, 10);
}

/**
 * Показ индикатора загрузки формы
 */
function showFormLoading() {
  const submitButton = elements.contactForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<span class="loading-spinner"></span> Отправка...';
  }
}

/**
 * Скрытие индикатора загрузки формы
 */
function hideFormLoading() {
  const submitButton = elements.contactForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    submitButton.textContent = 'Отправить';
  }
}

/**
 * Обработка изменения поля ввода
 */
function handleInputChange(event) {
  const input = event.currentTarget;
  
  // Удаляем класс ошибки при вводе
  input.classList.remove('error');
  
  // Валидация в реальном времени
  validateInput(input);
}

/**
 * Обработка фокуса на поле ввода
 */
function handleInputFocus(event) {
  const input = event.currentTarget;
  input.classList.add('focused');
  
  // Анимация персонажа
  if (elements.mascot) {
    setMascotEmotion('curious');
  }
}

/**
 * Обработка потери фокуса полем ввода
 */
function handleInputBlur(event) {
  const input = event.currentTarget;
  input.classList.remove('focused');
  
  // Валидация при потере фокуса
  validateInput(input);
  
  // Возвращаем персонажа в нормальное состояние
  if (elements.mascot) {
    setMascotEmotion('neutral');
  }
}

/**
 * Валидация поля ввода
 */
function validateInput(input) {
  const value = input.value.trim();
  const type = input.type;
  const isRequired = input.hasAttribute('required');
  
  let isValid = true;
  let errorMessage = '';
  
  // Проверка обязательных полей
  if (isRequired && !value) {
    isValid = false;
    errorMessage = 'Это поле обязательно для заполнения';
  }
  
  // Валидация email
  if (type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Введите корректный email адрес';
    }
  }
  
  // Валидация минимальной длины
  const minLength = input.getAttribute('minlength');
  if (minLength && value.length < parseInt(minLength)) {
    isValid = false;
    errorMessage = `Минимальная длина: ${minLength} символов`;
  }
  
  // Обновляем состояние поля
  if (isValid) {
    input.classList.remove('error');
    input.classList.add('valid');
    removeInputError(input);
  } else {
    input.classList.add('error');
    input.classList.remove('valid');
    showInputError(input, errorMessage);
  }
  
  return isValid;
}

/**
 * Показ ошибки поля ввода
 */
function showInputError(input, message) {
  removeInputError(input);
  
  const errorElement = document.createElement('div');
  errorElement.className = 'input-error';
  errorElement.textContent = message;
  
  input.parentNode.appendChild(errorElement);
}

/**
 * Удаление ошибки поля ввода
 */
function removeInputError(input) {
  const errorElement = input.parentNode.querySelector('.input-error');
  if (errorElement) {
    errorElement.remove();
  }
}

/**
 * Добавление валидации для поля ввода
 */
function addInputValidation(input) {
  // Добавляем атрибуты доступности
  input.setAttribute('aria-invalid', 'false');
  
  // Добавляем подсказки
  if (input.type === 'email') {
    input.setAttribute('pattern', '[^\\s@]+@[^\\s@]+\\.[^\\s@]+');
    input.setAttribute('title', 'Введите корректный email адрес (например: user@example.com)');
  }
}

/**
 * Обработка нажатия клавиш
 */
function handleKeyDown(event) {
  // ESC - закрытие мобильного меню
  if (event.key === 'Escape' && elements.navMenu.classList.contains('active')) {
    toggleMobileMenu();
  }
  
  // Tab - улучшение доступности
  if (event.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
}

/**
 * Обработка загрузки страницы
 */
function handlePageLoad() {
  // Устанавливаем фокус на первый элемент
  const firstFocusableElement = document.querySelector('h1, button, a, input, textarea');
  if (firstFocusableElement) {
    firstFocusableElement.focus();
  }
  
  // Анимация появления элементов
  setTimeout(() => {
    document.querySelectorAll('.fade-in-up').forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('visible');
      }, index * 100);
    });
  }, 500);
}

/**
 * Обработка выхода со страницы
 */
function handlePageUnload() {
  // Сохраняем состояние приложения
  localStorage.setItem('koridor-last-visit', new Date().toISOString());
}

/**
 * Утилиты
 */
const utils = {
  // Плавная прокрутка
  smoothScrollTo,
  
  // Генерация случайного числа
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // Проверка мобильного устройства
  isMobile: () => window.innerWidth <= 768,
  
  // Проверка поддержки touch
  isTouch: () => 'ontouchstart' in window,
  
  // Форматирование даты
  formatDate: (date) => new Intl.DateTimeFormat('ru-RU').format(date),
  
  // Debounce функция
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
  }
};

// Инициализация приложения при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Экспортируем функции для использования в других модулях
window.Koridor = {
  utils,
  setMascotEmotion,
  smoothScrollTo,
  validateForm
};