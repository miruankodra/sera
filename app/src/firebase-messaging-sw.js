importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDFxzoZTWx5dYA7GhRIe71oc5aEL48udR0',
  authDomain: 'sera-app-25bf5.firebaseapp.com',
  projectId: 'sera-app-25bf5',
  storageBucket: 'sera-app-25bf5.firebasestorage.app',
  messagingSenderId: '1087432820238',
  appId: '1:1087432820238:web:8a34b40289f0efe0e31e5f',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/assets/icons/icon-192x192.png',
  });
});
