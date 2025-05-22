// service-worker.js
// Usando Workbox para gerenciar cache e funcionamento offline

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Configuração do Workbox
workbox.setConfig({
  debug: false
});

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute } = workbox.precaching;

// Pré-cache de recursos essenciais
precacheAndRoute([
  { url: '/', revision: '1.0.0' },
  { url: '/index.html', revision: '1.0.0' },
  { url: '/manifest.json', revision: '1.0.0' },
  { url: '/favicon.ico', revision: '1.0.0' },
  { url: '/logo192.png', revision: '1.0.0' },
  { url: '/logo512.png', revision: '1.0.0' }
]);

// Cache para recursos estáticos (CSS, JS, imagens)
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Cache para imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Cache para fontes do Google
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || 
               url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
      }),
    ],
  })
);

// Cache para dados da API (se houver)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 dia
      }),
    ],
  })
);

// Estratégia offline-first para páginas HTML
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 dia
      }),
    ],
  })
);

// Gerenciamento de sincronização em segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-ideas') {
    event.waitUntil(syncNewIdeas());
  } else if (event.tag === 'sync-video-publish') {
    event.waitUntil(syncVideoPublish());
  }
});

// Função para sincronizar novas ideias quando online
async function syncNewIdeas() {
  try {
    // Aqui seria implementada a lógica para sincronizar ideias
    // armazenadas localmente quando o dispositivo estiver online
    console.log('Sincronizando novas ideias...');
  } catch (error) {
    console.error('Erro ao sincronizar ideias:', error);
  }
}

// Função para sincronizar publicação de vídeos quando online
async function syncVideoPublish() {
  try {
    // Aqui seria implementada a lógica para sincronizar publicações
    // pendentes quando o dispositivo estiver online
    console.log('Sincronizando publicações de vídeos...');
  } catch (error) {
    console.error('Erro ao sincronizar publicações:', error);
  }
}

// Gerenciamento de notificações push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Mensagem para o console quando o service worker é instalado
console.log('Faceless Shorts Service Worker instalado com sucesso!');
