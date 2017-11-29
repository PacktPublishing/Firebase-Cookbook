importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

// [*] Firebase Configurations
var config = {
  apiKey: "AIzaSyB3amU4g4smm77PGOX39meBm71rW2G2vK8",
  authDomain: "fir-cookbook.firebaseapp.com",
  databaseURL: "https://fir-cookbook.firebaseio.com",
  projectId: "fir-cookbook",
  storageBucket: "fir-cookbook.appspot.com",
  messagingSenderId: "329935171550"
};

//[*] Initializing our Firebase Application.
firebase.initializeApp(config);

// [*] Initislaizing the Firebase Messaging Object.
const messaging = firebase.messaging();

// [*] SW Install State Event.
self.addEventListener('install', (event) => {
   //TODO: implement a caching start toastr
  //[*] Let's cache a bit !
  event.waitUntil(
       caches.open('pwa').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/app.js'
            ]).then(() => {
		    self.skipWaiting();
		    //TODO: implement success caching process toastr
	    });
        })
    );
});

// [*] SW Activate State Event.
self.addEventListener('activate',(event) => {
	//TODO : implmenet proper handling
});

// [*] SW Fetch Event.
self.addEventListener('fetch', (event) => {	
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// [*] Special object let us handle our Background Push Notifications
messaging.setBackgroundMessageHandler((payload) => {
    const notificationOptions = {
        body: payload.data.msg,
        icon: "images/icon.jpg"
    }
    self.addEventListener('notificationclick', (event) => {
        var messageId = event.notification.data;

        event.notification.close();

        if (event.action === 'like') {
          //TODO : implmenet proper handling
        } else if (event.action === 'dislike') {
          //TODO : implmenet proper handling
        } else {
          //TODO : implmenet proper handling
        }
    }, false);
    return self.registration.showNotification(payload.data.title,
        notificationOptions);
});
