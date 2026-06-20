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
  getToken
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
const messaging = getMessaging(app);

if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register("/firebase-messaging-sw.js")
    .then(() => console.log("SW registrado"))
    .catch(console.error);

}

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

async function enablePushNotifications() {

  try {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Permissão negada");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(
      messaging,
      {
        vapidKey: "BN80N8qaIWm6NNqJks5P0v1empd94LvsmDtAXmu8HLJhq2V3eoxGKTXxhCa6DeVaM5GXqwCGvUMUJ8z6AFeUzbM",
        serviceWorkerRegistration: registration
      }
    );

    alert("TOKEN:\n" + token);

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

}
window.enablePushNotifications = enablePushNotifications;