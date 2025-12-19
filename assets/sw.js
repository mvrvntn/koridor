/**
 * Service Worker для проекта Коридор
 * Обеспечивает фоновое кэширование и оффлайн-функциональность
 */

const CACHE_NAME = 'koridor-v1';
const STATIC_CACHE_NAME = 'koridor-static-v1';
const RUNTIME_CACHE_NAME = 'koridor-runtime-v1';

// Ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/css/animations.css',
  '/assets/css/responsive.css',
  '/assets/js/main.js',
  '/assets/js/animations.js',
  '/assets/js/utils.js',
  '/assets/images/',
  '/favicon.ico',
  '/assets/manifest.json'
];

// Ресурсы, которые не кэшируются
const EXCLUDED_CACHE = [
  '/admin',
  '/api',
  '/auth'
];

/**
 * Установка Service Worker
 */
self.addEventListener('install', event => {
  console.log('Service Worker: установка начата');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(asset => new Request(asset)));
    }).then(() => {
      console.log('Service Worker: статические ресурсы закэшированы');
      self.skipWaiting();
    })
  );
  
  // Принудительное активирование нового Service Worker
  self.skipWaiting();
});

/**
 * Активация Service Worker
 */
self.addEventListener('activate', event => {
  console.log('Service Worker: активация');
  
  // Удаляем старые кэши
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== RUNTIME_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: старые кэши удалены');
    })
  );
});

/**
 * Обработка сетевых запросов
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Проверяем, нужно ли обрабатывать запрос
  if (shouldHandleRequest(request)) {
    event.respondWith(
      handleRequest(request)
        .catch(error => {
          console.error('Service Worker: ошибка обработки запроса:', error);
          return fetch(request);
        })
    );
  } else {
    // Пропускаем запрос к сети
    event.respondWith(fetch(request));
  }
});

/**
 * Проверка, нужно ли обрабатывать запрос
 */
function shouldHandleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Не кэшируем запросы к excluded путям
  for (const excludedPath of EXCLUDED_CACHE) {
    if (pathname.startsWith(excludedPath)) {
      return false;
    }
  }
  
  // Обрабатываем только GET запросы для статических ресурсов
  if (request.method !== 'GET') {
    return false;
  }
  
  // Не кэшируем запросы с параметрами
  if (url.search && url.search.length > 0) {
    return false;
  }
  
  return true;
}

/**
 * Обработка запроса с кэшем
 */
function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return caches.match(request).then(response => {
    if (response) {
      // Проверяем актуальность кэша
      const cacheDate = response.headers.get('date');
      const now = new Date();
      
      if (cacheDate && (now - new Date(cacheDate)) < 86400000) {
        // Кэш актуален (менее 24 часов)
        return response;
      }
    }
    
    // Если нет в кэше или устарел, делаем сетевой запрос
    return fetch(request).then(fetchResponse => {
      // Кэшируем ответ
      return caches.open(RUNTIME_CACHE_NAME).then(cache => {
        return cache.put(request, fetchResponse.clone());
      }).then(() => {
        return fetchResponse;
      });
    });
  });
}

/**
 * Обработка сообщений от основного потока
 */
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_UPDATED':
      // Уведомление об обновлении кэша
      notifyClients({
        type: 'CACHE_UPDATED',
        payload: payload
      });
      break;
      
    case 'GET_CACHE_SIZE':
      // Получение размера кэша
      getCacheSize().then(size => {
        notifyClients({
          type: 'CACHE_SIZE',
          payload: { size }
        });
      });
      break;
      
    default:
      console.warn('Service Worker: неизвестный тип сообщения:', type);
  }
});

/**
 * Уведомление всех клиентов
 */
function notifyClients(message) {
  self.clients.forEach(client => {
    if (client.readyState === 'open') {
      client.postMessage(message);
    }
  });
}

/**
 * Получение размера кэша
 */
function getCacheSize() {
  return caches.open(STATIC_CACHE_NAME).then(cache => {
    return cache.keys().then(keys => {
      let size = 0;
      
      return Promise.all(
        keys.map(key => {
          return cache.match(key).then(response => {
            if (response) {
              const responseClone = response.clone();
              return responseClone.blob().then(blob => {
                size += blob.size;
              });
            }
            return Promise.resolve(0);
          });
        })
      ).then(() => {
        return size;
      });
    });
  });
}

/**
 * Очистка кэша
 */
function clearCache() {
  return Promise.all([
    caches.delete(STATIC_CACHE_NAME),
    caches.delete(RUNTIME_CACHE_NAME)
  ]).then(() => {
    console.log('Service Worker: кэш очищен');
    notifyClients({
      type: 'CACHE_CLEARED'
    });
  });
}

/**
 * Обновление кэша
 */
function updateCache() {
  return clearCache().then(() => {
    return self.skipWaiting();
  });
}

/**
 * Проверка соединения
 */
self.addEventListener('online', () => {
  console.log('Service Worker: соединение восстановлено');
  notifyClients({
    type: 'CONNECTION_STATUS',
    payload: { online: true }
  });
});

self.addEventListener('offline', () => {
  console.log('Service Worker: соединение потеряно');
  notifyClients({
    type: 'CONNECTION_STATUS',
    payload: { online: false }
  });
});

/**
 * Синхронизация кэша при фокусе окна
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SYNC_CACHE') {
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.keys().then(keys => {
        const updatePromises = keys.map(key => {
          return cache.add(new Request(key));
        });
        
        return Promise.all(updatePromises);
      });
    });
  }
});

/**
 * Обработка фоновых синхронизаций
 */
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      handleBackgroundSync()
    );
  }
});

/**
 * Обработка фоновой синхронизации
 */
function handleBackgroundSync() {
  return self.registration.showNotification('Коридор обновлен', {
    body: 'Доступны новые функции и улучшения',
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/badge-72x72.png',
    tag: 'app-update'
  });
}

/**
 * Регистрация для фоновых синхронизаций
 */
self.addEventListener('notificationclick', event => {
  if (event.notification.tag === 'app-update') {
    event.notification.close();
    clients.openWindow('/');
  }
});

/**
 * Стратегии кэширования
 */
const cacheStrategies = {
  /**
   * Стратегия "Cache First"
   */
  cacheFirst: (request) => {
    return caches.match(request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request).then(fetchResponse => {
        caches.open(RUNTIME_CACHE_NAME).then(cache => {
          cache.put(request, fetchResponse.clone());
        });
        
        return fetchResponse;
      });
    });
  },
  
  /**
   * Стратегия "Network First"
   */
  networkFirst: (request) => {
    return fetch(request).then(fetchResponse => {
      caches.open(RUNTIME_CACHE_NAME).then(cache => {
        cache.put(request, fetchResponse.clone());
      });
      
      return fetchResponse;
    }).catch(() => {
      return caches.match(request);
    });
  },
  
  /**
   * Стратегия "Stale While Revalidate"
   */
  staleWhileRevalidate: (request) => {
    return Promise.all([
      caches.match(request),
      fetch(request)
    ]).then(([cached, fetched]) => {
      if (cached && !fetched) {
        return cached;
      }
      
      if (fetched) {
        caches.open(RUNTIME_CACHE_NAME).then(cache => {
          cache.put(request, fetched.clone());
        });
        
        return fetched;
      }
      
      return cached;
    });
  }
};

/**
 * Обработка ошибок
 */
self.addEventListener('error', event => {
  console.error('Service Worker ошибка:', event.error);
  
  // Отправляем ошибку в аналитику
  if (self.registration && self.registration.scope) {
    self.registration.update().then(() => {
      console.log('Service Worker: обновлен после ошибки');
    });
  }
});

/**
 * Логирование действий Service Worker
 */
const logger = {
  log: (message, data = null) => {
    console.log(`[SW] ${message}`, data);
  },
  
  warn: (message, data = null) => {
    console.warn(`[SW] ${message}`, data);
  },
  
  error: (message, data = null) => {
    console.error(`[SW] ${message}`, data);
  }
};

// Экспортируем функции для использования в основном потоке
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'EXPORT_FUNCTIONS') {
    self.postMessage({
      type: 'FUNCTIONS_EXPORTED',
      payload: {
        getCacheSize,
        clearCache,
        updateCache
      }
    });
  }
});