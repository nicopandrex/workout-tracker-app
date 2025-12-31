// Service Worker for background notifications
let timerEndTime = 0;
let timerCheckInterval = null;

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_TIMER') {
    timerEndTime = event.data.endTime;
    startTimerCheck();
  } else if (event.data.type === 'STOP_TIMER') {
    timerEndTime = 0;
    stopTimerCheck();
  }
});

function startTimerCheck() {
  stopTimerCheck(); // Clear any existing interval
  
  timerCheckInterval = setInterval(() => {
    if (timerEndTime > 0 && Date.now() >= timerEndTime) {
      // Timer has expired, send notification
      self.registration.showNotification('Rest Complete! 💪', {
        body: 'Time to start your next set!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'rest-timer',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: { url: '/' }
      });
      
      // Stop checking
      timerEndTime = 0;
      stopTimerCheck();
    }
  }, 1000);
}

function stopTimerCheck() {
  if (timerCheckInterval) {
    clearInterval(timerCheckInterval);
    timerCheckInterval = null;
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
