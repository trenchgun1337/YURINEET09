importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBBr6zPaWgGNcGHz9iiNTO8O4EgAzsUMOk",
  authDomain: "scrapfielddatabase.firebaseapp.com",
  databaseURL: "https://scrapfielddatabase-default-rtdb.firebaseio.com",
  projectId: "scrapfielddatabase",
storageBucket: "scrapfielddatabase.appspot.com",
  messagingSenderId: "489751764776",
  appId: "1:489751764776:web:22255a1e9bf05a538bfa1d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log("Mensagem recebida em background:", payload);

  self.registration.showNotification(
    payload.notification?.title || "New post!",
    {
      body: payload.notification?.body || "",
      icon: payload.notification?.icon || "/FAVICON.jpg"
    }
  );

});