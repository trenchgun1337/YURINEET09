import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  remove,
  onValue,
  get,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getMessaging,
  getToken,
  isSupported
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js"; 
 
const FB = { 
  apiKey: "AIzaSyBBr6zPaWgGNcGHz9iiNTO8O4EgAzsUMOk", 
  authDomain: "scrapfielddatabase.firebaseapp.com", 
  databaseURL: "https://scrapfielddatabase-default-rtdb.firebaseio.com", 
  projectId: "scrapfielddatabase", 
  storageBucket: "scrapfielddatabase.firebasestorage.app", 
  messagingSenderId: "489751764776", 
  appId: "1:489751764776:web:22255a1e9bf05a538bfa1d" 
}; 
 
const app = initializeApp(FB); 
const db = getDatabase(app); 
let messaging = null;
const messagingSupportedPromise = isSupported()
  .then(supported => {
    if (supported) messaging = getMessaging(app);
    return supported;
  })
  .catch(err => {
    console.warn("Firebase Messaging indisponivel", err);
    return false;
  });

const canRegisterServiceWorker = "serviceWorker" in navigator && (window.isSecureContext || ["localhost", "127.0.0.1"].includes(location.hostname));
const serviceWorkerRegistrationPromise = canRegisterServiceWorker
  ? navigator.serviceWorker.register(new URL("../../../firebase-messaging-sw.js", import.meta.url).href)
    .then(registration => {
      console.log("SW registrado");
      return registration;
    })
    .catch(err => {
      console.error("SW falhou", err);
      return null;
    })
  : Promise.resolve(null);

async function sha256(str) { 
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)); 
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); 
} 
 
window._db = db; 
window._ref = ref; 
window._push = push; 
window._remove = remove; 
window._get = get; 
window._set = set; 
window._sha256 = sha256; 
window._serverTimestamp = serverTimestamp; 
 
function sortNewest(arr) { 
  return [...arr].sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0)); 
} 
 
onValue(ref(db, 'blog/posts'), snap => { 
  const val = snap.val() || {}; 
  window._allPosts = sortNewest(Object.entries(val).map(([id, d]) => ({ ...d, id }))); 
  filterPosts(); 
  if (window.handleBlogPostNotifications) window.handleBlogPostNotifications(window._allPosts); 
}); 

onValue(ref(db, 'blog/adminLastOnline'), snap => { 
  const val = snap.val(); 
  if (window.setAdminLastOnline) window.setAdminLastOnline(val); 
}); 
 
onValue(ref(db, 'gallery/sketches'), snap => { 
  const val = snap.val() || {}; 
  window._fbSketches = sortNewest(Object.entries(val).map(([id, d]) => ({ ...d, _fbId: id }))); 
  renderGalleryTab('sketches'); 
  if (window._isAdmin && window.renderAdminImageList) window.renderAdminImageList(); 
}); 
 
onValue(ref(db, 'gallery/pictures'), snap => { 
  const val = snap.val() || {}; 
  window._fbPictures = sortNewest(Object.entries(val).map(([id, d]) => ({ ...d, _fbId: id }))); 
  renderGalleryTab('pictures'); 
  if (window._isAdmin && window.renderAdminImageList) window.renderAdminImageList(); 
}); 

async function enablePushNotifications(options = {}) {
  const silent = !!options.silent;
  try {
    if (!("Notification" in window)) throw new Error("Notifications are not supported in this browser.");
    if (!canRegisterServiceWorker) throw new Error("Notifications need https or localhost.");

    const supported = await messagingSupportedPromise;
    if (!supported || !messaging) throw new Error("Firebase Messaging is not supported in this browser.");

    const permission = Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

    if (permission !== "granted") {
      if (!silent) alert("Permissao negada");
      return null;
    }

    const registration = await serviceWorkerRegistrationPromise;
    if (!registration) throw new Error("Service worker registration failed.");

    const token = await getToken(
      messaging,
      {
        vapidKey: "BN80N8qaIWm6NNqJks5P0v1empd94LvsmDtAXmu8HLJhq2V3eoxGKTXxhCa6DeVaM5GXqwCGvUMUJ8z6AFeUzbM",
        serviceWorkerRegistration: registration
      }
    );

    if (!token) throw new Error("Firebase did not return a notification token.");

    const tokenKey = await sha256(token);
    await set(ref(db, "tokens/" + tokenKey), token);

    if (!silent) alert("notifications enabled.");
    return token;
  } catch (err) {
    console.error(err);
    if (!silent) alert(err.message);
    throw err;
  }
}
window.enablePushNotifications = enablePushNotifications;
window.registerBlogPushToken = enablePushNotifications;
