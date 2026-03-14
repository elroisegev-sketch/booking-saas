self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'תור חדש 💅', {
      body: data.body || 'קבעה לקוחה תור חדש!',
      icon: '/favicon.png',
      badge: '/favicon.png',
      dir: 'rtl',
      lang: 'he'
    })
  );
});
