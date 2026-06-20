const EMOTES = { 
  'quiet': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-quietL.png', 
  'smirk': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-smirkL.png', 
  'yawn': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-yawnL.png', 
  'sleeping': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-sleepingL.png', 
  'sick': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-sickL.png', 
  'pirate': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-pirateL.png', 
  'worried': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-worriedL.png', 
  'laughing': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-laughingL.png', 
  'in-love': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-inloveL.png', 
  'glasses': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-glassesL.png', 
  'crying': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-cryingL.png', 
  'grin': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-grinL.png', 
  'confused': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-confusedL.png', 
  'cool': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-coolL.png', 
  'brokenheart': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-heartbrokenL.png', 
  'heart': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-heartL.png', 
  'martini': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-martiniL.png', 
  'star': 'https://emoticons.neocities.org/emo/oxygen/unscaled/oxygen-starL.png' 
}; 
const EMOTE_CATEGORIES = { 
  quiet: 'mood', 
  smirk: 'mood', 
  yawn: 'mood', 
  sleeping: 'mood', 
  sick: 'mood', 
  pirate: 'mood', 
  worried: 'mood', 
  laughing: 'mood', 
  'in-love': 'mood', 
  glasses: 'mood', 
  crying: 'mood', 
  grin: 'mood', 
  confused: 'mood', 
  cool: 'mood', 
  brokenheart: 'emoji', 
  heart: 'emoji', 
  martini: 'emoji', 
  star: 'emoji' 
}; 
const BUNNY_EMOTE_FILES = [
  'bunny.gif',
  ...Array.from({ length: 72 }, (_, i) => `bunny${i + 2}.gif`),
  'bunny75.gif',
  'bunny76.png',
  'bunny77.gif',
  'bunny78.gif',
  'bunny79.gif',
  'bunny80.gif'
];
BUNNY_EMOTE_FILES.forEach(file => {
  const name = file.replace(/\.(gif|png)$/i, '');
  EMOTES[name] = `https://pixelsafari.neocities.org/favicon/animals/bunny/${file}`;
});
const EMOTE_FALLBACK = 'https://img1.picmix.com/output/stamp/normal/3/0/1/6/286103_31d67.gif'; 
const EMOTE_FALLBACK_TITLE = "this post is older than the emotes upgrade...OR...no such emojis were choose"; 
const BLOG_LAST_SEEN_POST_KEY = 'yurineetBlogLastSeenPostTs'; 
const BLOG_NOTIFY_CHOICE_KEY = 'yurineetBlogNotifyChoice'; 
const BLOG_LAST_ONLINE_KEY = 'yurineetAdminLastOnline'; 
const BLOG_POSTS_PER_PAGE = 9;
const BLOG_PUSH_READY_TIMEOUT = 8000;
 
window.YURINEET_GALLERY = window.YURINEET_GALLERY || { sketches: [], pictures: [] }; 
window._allPosts = []; 
window._fbSketches = null; 
window._fbPictures = null; 
window._isAdmin = false; 
window._blogSort = 'newest'; 
window._blogVisiblePosts = BLOG_POSTS_PER_PAGE;
 
/* ── PAGE TITLE ── */ 
function setPageTitle(section) { document.title = 'DEATH ARCHIVE | ' + section; } 
 
function esc(v) { 
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); 
} 

function emoteCategory(name) { 
  return EMOTE_CATEGORIES[name] || 'emoji'; 
} 

function emoteImgHTML(name, size = 20) { 
  const src = EMOTES[name]; 
  if (!src) return ''; 
  return `<a href="${esc(src)}" target="_blank" rel="noopener" title="${esc(emoteCategory(name))}" onclick="event.stopPropagation()"><img src="${esc(src)}" alt="${esc(name)}" title="${esc(emoteCategory(name))}" style="vertical-align:middle;height:${Number(size) || 20}px;"></a>`; 
} 
 
function fmtDate(ts) { 
  const d = new Date(Number(ts)); 
  if (!Number.isFinite(d.getTime())) return 'unknown'; 
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
  const p = n => String(n).padStart(2, '0'); 
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${String(d.getFullYear()).slice(-2)}(${DAY[d.getDay()]})${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; 
} 

function setAdminLastOnline(ts) { 
  const n = Number(ts); 
  if (Number.isFinite(n) && n > 0) { 
    localStorage.setItem(BLOG_LAST_ONLINE_KEY, String(n)); 
  } 
  const saved = Number(localStorage.getItem(BLOG_LAST_ONLINE_KEY)); 
  const el = document.getElementById('adminLastOnline'); 
  if (el) el.textContent = 'last online: ' + (Number.isFinite(n) && n > 0 ? fmtDate(n) : (saved ? fmtDate(saved) : 'unknown')); 
} 
window.setAdminLastOnline = setAdminLastOnline; 

async function touchAdminLastOnline() { 
  const ts = Date.now(); 
  setAdminLastOnline(ts); 
  if (!window._set || !window._ref || !window._db) return; 
  try { 
    await window._set(window._ref(window._db, 'blog/adminLastOnline'), ts); 
  } catch (e) { 
    console.warn('last online update failed', e); 
  } 
} 
window.touchAdminLastOnline = touchAdminLastOnline; 
 
function showSection(name) { 
  ['home', 'blog', 'gallery', 'links', 'contact'].forEach(s => { 
    document.getElementById('sec-' + s).style.display = s === name ? '' : 'none'; 
    const n = document.getElementById('nav-' + s); 
    if (n) n.className = s === name ? 'active' : ''; 
  }); 
  if (name === 'gallery') renderGalleryTab(window._curGalTab || 'sketches'); 
  setPageTitle(name); 
} 
 
function lbOpen(src) { document.getElementById('lb-img').src = src; document.getElementById('lb').className = 'on'; } 
function lbClose() { document.getElementById('lb').className = ''; document.getElementById('lb-img').src = ''; } 
window.lbClose = lbClose; 
document.addEventListener('keydown', e => { if (e.key === 'Escape') lbClose(); }); 
 
function parse4chan(raw) { 
  if (!raw) return { html: '', embedUrls: [] }; 
 
  const embedUrls = [], linkUrls = []; 
  let s = raw; 
  s = s.replace(/\/url\s+(https?:\/\/[^\s]+)/gi, (m, url) => { embedUrls.push(url); return '\x00EMB' + (embedUrls.length - 1) + '\x00'; }); 
  s = s.replace(/\/(url|emoji|emote|mood|spoiler)\s?/gi, ''); 
 
  // Handle explicit //url or /url 
  s = s.replace(/\/\/(https?:\/\/[^\s]+)/g, (m, url) => { embedUrls.push(url); return '\x00EMB' + (embedUrls.length - 1) + '\x00'; }); 
  s = s.replace(/(?<![:/])\/(?!\/)(https?:\/\/[^\s]+)/g, (m, url) => { linkUrls.push(url); return '\x00LNK' + (linkUrls.length - 1) + '\x00'; }); 
   
  // Auto-detect links that are not already handled 
  const urlRegex = /(?<!["'>])(https?:\/\/[^\s<]+)/g; 
  s = s.replace(urlRegex, (url) => { 
    if (url.includes('\x00')) return url; 
    linkUrls.push(url); 
    return '\x00LNK' + (linkUrls.length - 1) + '\x00'; 
  }); 
 
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
  s = s.split('\n').map(line => { const t = line.trimStart(); if (t.startsWith('&gt;')) return '<span class="redtext">' + line + '</span>'; return line; }).join('\n'); 
  s = s.replace(/\|([^|\n]+)\|/g, '<span class="spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>'); 
   
  // Emotes 
  Object.keys(EMOTES).forEach(name => { 
    const re = new RegExp(`:${name}:`, 'g'); 
    s = s.replace(re, emoteImgHTML(name)); 
  }); 
 
  s = s.replace(/\x00EMB(\d+)\x00/g, (_, i) => { const url = embedUrls[parseInt(i)]; return '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>'; }); 
  s = s.replace(/\x00LNK(\d+)\x00/g, (_, i) => { const url = linkUrls[parseInt(i)]; return '<a href="' + url + '" target="_blank" rel="noopener">' + url + '</a>'; }); 
  s = s.replace(/\n/g, '<br>'); 
  return { html: s, embedUrls }; 
} 
 
const EPATS = [ 
  { name: 'youtube', re: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?[^\s"<]*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g, build: m => ({ src: 'https://www.youtube.com/embed/' + m[1] + '?rel=0', url: m[0] }) }, 
  { name: 'spotify', re: /https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)(?:[?&][^\s"<]*)?/g, build: m => ({ src: 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator&theme=0', url: m[0] }) }, 
  { name: 'soundcloud', re: /https?:\/\/(?:www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(?:[?&][^\s"<]*)?/g, build: m => ({ src: 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(m[0]) + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false', url: m[0] }) } 
]; 
 
function detectEmbeds(text) { 
  const found = []; 
  for (const p of EPATS) { 
    p.re.lastIndex = 0; 
    let m; 
    while ((m = p.re.exec(text)) !== null) { 
      const b = p.build(m); 
      b.name = p.name; 
      if (!found.some(e => e.url === b.url)) found.push(b); 
    } 
  } 
  return found; 
} 
 
function buildPostCard(p, num, isNew = false) { 
  const raw = p.contentRaw || ''; 
  let htmlContent = ''; 
  if (raw) { 
    const { html } = parse4chan(raw); 
    const embeds = detectEmbeds(raw); 
    let embedsHTML = ''; 
    for (const e of embeds) { 
embedsHTML += `<iframe src="${esc(e.src)}" width="100%" height="220" style="border:0;display:block;margin-top:4px;" allowfullscreen loading="lazy"></iframe>`;    } 
    htmlContent = `<div class="post-content">${html}</div>${embedsHTML}`; 
  } 
   
  let mediaHTML = ''; 
  // Backward compatibility with single imageSrc 
  const mediaItems = p.media || (p.imageSrc ? [{ url: p.imageSrc, info: p.imageInfo, type: 'image' }] : []); 
   
  for (const item of mediaItems) { 
    const info = item.info; 
const fi = info ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(info.name || '')} (${esc(String(info.sizeKB || ''))} KB${info.w ? `, ${info.w}x${info.h}` : ''})</a>` : `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.url)}</a>`;     

if (p.spoilerImg) { 
  mediaHTML += `<div class="post-img-wrap"><span class="post-img-info" style="display:none;">${fi}</span><img src="${esc(item.url)}" alt="" loading="lazy" style="display:none;"><div class="spoiler-cover" onclick="this.previousElementSibling.style.display='block';this.previousElementSibling.previousElementSibling.style.display='';this.style.display='none';"> IM A SPOILER!!! CLICK HERE TO REVEAL THE FULL POST</div></div>`;
    } else { 
      if (item.type?.startsWith('video')) { 
        mediaHTML += `<div class="post-img-wrap"><span class="post-img-info">${fi}</span><video src="${esc(item.url)}" controls style="max-width:300px; display:block; border:1px solid #aaaaaa;"></video></div>`; 
      } else if (item.type?.startsWith('audio')) { 
        mediaHTML += `<div class="post-img-wrap"><span class="post-img-info">${fi}</span><audio src="${esc(item.url)}" controls style="display:block;"></audio></div>`; 
      } else { 
        mediaHTML += `<div class="post-img-wrap"><span class="post-img-info">${fi}</span><img src="${esc(item.url)}" alt="" loading="lazy" onclick="lbOpen(this.src)" style="max-width:200px;max-height:200px;cursor:pointer;object-fit:contain;border:1px solid #aaaaaa;"></div>`; 
      } 
    } 
  } 
 
  const titleHTML = p.title ? `<div class="post-title" style="color:rgb(0, 0, 102); font-size: 24px; font-weight: bold; margin-bottom: 5px;">${esc(p.title)}</div>` : ''; 
   
  let moodIcon = EMOTE_FALLBACK; 
  let moodTitle = EMOTE_FALLBACK_TITLE; 
  if (p.moodEmote && EMOTES[p.moodEmote]) { 
    moodIcon = EMOTES[p.moodEmote]; 
    moodTitle = p.moodText || p.moodEmote; 
  } else if (p.moodText) { 
    moodTitle = p.moodText; 
  } 
   
const moodLabel = (p.moodEmote && EMOTES[p.moodEmote]) || p.moodText ? ` ${esc(moodTitle)}` : '';
const moodHTML = `<span style="margin-left:5px;">mood: <img src="${moodIcon}" title="${esc(moodTitle)}" alt="mood" style="height:14px; vertical-align:middle;">${moodLabel}</span>`; 
  const newHTML = isNew ? '<span class="post-new">new!*</span>' : ''; 
  const delBtn = window._isAdmin ? `<button class="post-del-btn" onclick="deletePost('${esc(p.id || '')}')">delete</button>` : ''; 
  return ` 
    <div class="post" id="post-${esc(p.id || '')}"> 
      <div class="post-head"> 
        <div class="post-head-left"> 
          <span class="post-author">yuri.neet</span> 
          ${moodHTML} 
<span class="post-date">date: ${fmtDate(p.ts)}</span>       </div> 
        <div style="display:flex;align-items:baseline;gap:6px;"> 
          ${newHTML} 
          <span class="post-no">No.${num}</span> 
          ${delBtn} 
        </div> 
      </div> 
      <div class="post-body-inner"> 
        ${titleHTML} 
        ${mediaHTML} 
        ${htmlContent} 
      </div> 
    </div>`; 
} 
 

function setSortBlog(order) { 
  window._blogSort = order; 
  window._blogVisiblePosts = BLOG_POSTS_PER_PAGE;
  document.getElementById('sortBtnNewest').className = order === 'newest' ? 'sort-btn active-sort' : 'sort-btn'; 
  document.getElementById('sortBtnOldest').className = order === 'oldest' ? 'sort-btn active-sort' : 'sort-btn'; 
  filterPosts(); 
} 
window.setSortBlog = setSortBlog; 
 
function gettotheend() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
}

window.gettotheend = gettotheend;

function canUseBrowserNotifications() {
  return 'Notification' in window && (window.isSecureContext || ['localhost', '127.0.0.1'].includes(location.hostname));
}

async function waitForBlogPushRegistration(timeout = BLOG_PUSH_READY_TIMEOUT) {
  let waited = 0;
  while (!window.registerBlogPushToken && !window.enablePushNotifications && waited < timeout) {
    await new Promise(r => setTimeout(r, 120));
    waited += 120;
  }
  return window.registerBlogPushToken || window.enablePushNotifications || null;
}

async function saveBlogPushToken(box, quiet = false) {
  const registerPush = await waitForBlogPushRegistration();
  if (!registerPush) {
    if (box && !quiet) {
      box.innerHTML = 'notifications are enabled in this tab. reload if push token saving does not appear.';
      box.style.display = 'block';
    }
    return null;
  }
  try {
    const token = await registerPush({ silent: true });
    if (box && !quiet) {
      box.innerHTML = token ? 'notifications enabled.' : 'notifications enabled in this tab.';
      box.style.display = 'block';
      setTimeout(() => { box.style.display = 'none'; }, 1600);
    }
    return token;
  } catch (e) {
    console.warn('push token registration failed', e);
    if (box && !quiet) {
      box.innerHTML = 'notifications are allowed, but push token saving failed: ' + esc(e.message || e);
      box.style.display = 'block';
    }
    return null;
  }
}

function initBlogNotifications() { 
  const box = document.getElementById('blogNotifier'); 
  if (!box) return;
  if (!('Notification' in window)) {
    box.innerHTML = 'notifications are not supported in this browser.';
    box.style.display = 'block';
    return;
  }
  if (!canUseBrowserNotifications()) {
    box.innerHTML = 'notifications need https or localhost.';
    box.style.display = 'block';
    return;
  }
  if (Notification.permission === 'granted') { 
    localStorage.setItem(BLOG_NOTIFY_CHOICE_KEY, 'yes'); 
    saveBlogPushToken(box, true);
    return; 
  } 
  if (Notification.permission === 'denied' || localStorage.getItem(BLOG_NOTIFY_CHOICE_KEY) === 'no') return; 
  box.innerHTML = 'notify me when a new post appears? <button class="form-btn" onclick="enableBlogNotifications()">yes</button><button class="form-btn" onclick="declineBlogNotifications()">no</button>'; 
  box.style.display = 'block'; 
} 
window.initBlogNotifications = initBlogNotifications; 

async function enableBlogNotifications() { 
  const box = document.getElementById('blogNotifier'); 
  if (!('Notification' in window)) return;
  if (!canUseBrowserNotifications()) {
    if (box) {
      box.innerHTML = 'notifications need https or localhost.';
      box.style.display = 'block';
    }
    return;
  }
  const permission = await Notification.requestPermission(); 
  if (permission === 'granted') { 
    localStorage.setItem(BLOG_NOTIFY_CHOICE_KEY, 'yes'); 
    if (box) {
      box.innerHTML = 'saving notification token...';
      box.style.display = 'block';
    }
    await saveBlogPushToken(box);
  } else { 
    localStorage.setItem(BLOG_NOTIFY_CHOICE_KEY, 'no'); 
    if (box) box.style.display = 'none'; 
  } 
} 
window.enableBlogNotifications = enableBlogNotifications; 

function declineBlogNotifications() { 
  localStorage.setItem(BLOG_NOTIFY_CHOICE_KEY, 'no'); 
  const box = document.getElementById('blogNotifier'); 
  if (box) box.style.display = 'none'; 
} 
window.declineBlogNotifications = declineBlogNotifications; 

function handleBlogPostNotifications(posts) { 
  if (!Array.isArray(posts) || !posts.length) return; 
  const newestTs = Math.max(...posts.map(p => Number(p.ts) || 0)); 
  if (!Number.isFinite(newestTs) || newestTs <= 0) return; 
  const seenTs = Number(localStorage.getItem(BLOG_LAST_SEEN_POST_KEY)) || 0; 
  localStorage.setItem(BLOG_LAST_SEEN_POST_KEY, String(newestTs)); 
  if (!seenTs) return; 
 
  const newPosts = posts 
    .filter(p => (Number(p.ts) || 0) > seenTs) 
    .sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0)); 
  if (!newPosts.length || !('Notification' in window) || Notification.permission !== 'granted') return; 
 
  const latest = newPosts[0]; 
  const text = (latest.title || latest.contentRaw || 'new blog post').replace(/\s+/g, ' ').trim().slice(0, 90); 
  const icon = latest.moodEmote && EMOTES[latest.moodEmote] ? EMOTES[latest.moodEmote] : EMOTE_FALLBACK; 
  try { 
    new Notification(newPosts.length > 1 ? `${newPosts.length} new blog posts` : 'new blog post', { 
      body: text, 
      icon 
    }); 
  } catch (e) { 
    console.warn('notification failed', e); 
  } 
} 
window.handleBlogPostNotifications = handleBlogPostNotifications; 

function initBlogChrome() { 
  setAdminLastOnline(Number(localStorage.getItem(BLOG_LAST_ONLINE_KEY)) || null); 
  initBlogNotifications(); 
} 

if (document.readyState === 'loading') { 
  document.addEventListener('DOMContentLoaded', initBlogChrome); 
} else { 
  initBlogChrome(); 
} 


function filterPosts() { 
  const container = document.getElementById('postsContainer'); 
  if (!container) return; 
  const sort = window._blogSort || 'newest'; 
  let posts = [...window._allPosts].sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0)); 
  if (sort === 'oldest') posts.reverse(); 
  if (!posts.length) { container.innerHTML = '<div class="no-posts">no posts yet.</div>'; return; } 
  const total = window._allPosts.length; 
  const newest = [...window._allPosts].sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0)); 
  const visible = Math.max(BLOG_POSTS_PER_PAGE, Number(window._blogVisiblePosts) || BLOG_POSTS_PER_PAGE);
  const visiblePosts = posts.slice(0, visible);
  let html = visiblePosts.map(p => { 
    const idx = newest.findIndex(x => x.id === p.id); 
    return buildPostCard(p, idx >= 0 ? total - idx : total, idx >= 0 && idx < 3); 
  }).join('');
  if (visible < posts.length) {
    html += `<div class="show-more-wrap"><button class="form-btn show-more-btn" onclick="showMorePosts()">show more</button></div>`;
  }
  container.innerHTML = html; 
} 
window.filterPosts = filterPosts; 

function showMorePosts() {
  window._blogVisiblePosts = (Number(window._blogVisiblePosts) || BLOG_POSTS_PER_PAGE) + BLOG_POSTS_PER_PAGE;
  filterPosts();
}
window.showMorePosts = showMorePosts;
 
async function deletePost(id) { 
  if (!window._isAdmin || !id) return; 
  if (!confirm('delete?')) return; 
  try { await window._remove(window._ref(window._db, 'blog/posts/' + id)); } 
  catch (e) { alert('error: ' + e.message); } 
} 
window.deletePost = deletePost; 
 
async function tryLogin() { 
  const pw = document.getElementById('pwInput')?.value || ''; 
  const errEl = document.getElementById('loginErr'); 
  if (!pw) { if (errEl) errEl.textContent = 'enter password.'; return; } 
  if (errEl) errEl.textContent = 'checking...'; 
  let waited = 0; 
  while ((!window._sha256 || !window._get || !window._ref || !window._db) && waited < 8000) { 
    await new Promise(r => setTimeout(r, 120)); 
    waited += 120; 
  } 
  if (!window._sha256 || !window._get || !window._ref || !window._db) { if (errEl) errEl.textContent = 'firebase not ready.'; return; } 
  try { 
    const hash = await window._sha256(pw); 
    const snap = await window._get(window._ref(window._db, 'admin/passHash')); 
    if (snap.val() === hash) { 
      window._isAdmin = true; 
      await touchAdminLastOnline(); 
      document.getElementById('adminLogin').style.display = 'none'; 
      document.getElementById('adminPanel').style.display = 'block'; 
      if (errEl) errEl.textContent = ''; 
      filterPosts(); 
    } else { if (errEl) errEl.textContent = 'wrong password.'; } 
  } catch (e) { if (errEl) errEl.textContent = 'error: ' + e.message; } 
} 
window.tryLogin = tryLogin; 
 
function logout() { 
  window._isAdmin = false; 
  document.getElementById('adminLogin').style.display = 'block'; 
  document.getElementById('adminPanel').style.display = 'none'; 
  document.getElementById('pwInput').value = ''; 
  filterPosts(); 
} 
window.logout = logout; 
 
let _blogMedia = []; 
 
function removeBlogEditorImg() { 
  _blogMedia = []; 
  const fn = document.getElementById('edFileName'); 
  const rb = document.getElementById('edRemoveImg'); 
  const pv = document.getElementById('edImgPreview'); 
  if (fn) fn.textContent = 'none'; 
  if (rb) rb.style.display = 'none'; 
  if (pv) { pv.style.display = 'none'; pv.innerHTML = ''; } 
} 
window.removeBlogEditorImg = removeBlogEditorImg; 
 
async function handleBlogFileSelect(event) { 
  const files = Array.from(event.target.files); event.target.value = ''; 
  if (!files.length) return; 
   
  const statusEl = document.getElementById('edStatus'), fnameEl = document.getElementById('edFileName'), rmBtn = document.getElementById('edRemoveImg'), preview = document.getElementById('edImgPreview'); 
  if (statusEl) statusEl.textContent = 'uploading...'; 
 
  for (const file of files) { 
    if (file.size > 2000 * 1024) { alert(`File ${file.name} exceeds 2MB limit.`); continue; } 
     
    let w = null, h = null; 
    if (file.type.startsWith('image')) { 
      const tmpUrl = URL.createObjectURL(file); const tmpImg = new Image(); tmpImg.src = tmpUrl; 
      await new Promise(res => { tmpImg.onload = tmpImg.onerror = res; }); 
      w = tmpImg.naturalWidth; h = tmpImg.naturalHeight; URL.revokeObjectURL(tmpUrl); 
    } 
 
    const sizeKB = (file.size / 1024).toFixed(1); 
    try { 
      const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', 'unsigned_upload'); 
      // Use auto/upload to support images, videos, and audio 
      const res = await fetch('https://api.cloudinary.com/v1_1/dagsxkazw/auto/upload', { method: 'POST', body: fd }); 
      const data = await res.json(); 
      if (!data.secure_url) throw new Error('upload failed'); 
       
      _blogMedia.push({ url: data.secure_url, info: { name: file.name, sizeKB, w, h }, type: file.type }); 
       
      if (fnameEl) fnameEl.textContent = _blogMedia.length + ' files'; 
      if (rmBtn) rmBtn.style.display = 'inline-block'; 
      if (statusEl) statusEl.textContent = 'media ready.'; 
       
      if (preview) { 
        preview.style.display = 'flex'; 
        let mediaTag = ''; 
        if (file.type.startsWith('video')) { 
          mediaTag = `<video src="${data.secure_url}" style="max-width:110px; max-height:90px; border:1px solid #aaaaaa;"></video>`; 
        } else if (file.type.startsWith('audio')) { 
          mediaTag = `<div style="width:110px; height:90px; border:1px solid #aaaaaa; display:flex; align-items:center; justify-content:center; font-size:10px;">Audio</div>`; 
        } else { 
          mediaTag = `<img src="${data.secure_url}" alt="" style="max-width:110px;max-height:90px;border:1px solid #aaaaaa;">`; 
        } 
        preview.innerHTML += mediaTag; 
      } 
    } catch (err) { if (statusEl) statusEl.textContent = 'upload error: ' + err.message; } 
  } 
} 
window.handleBlogFileSelect = handleBlogFileSelect; 
 
async function submitPost() { 
  if (!window._isAdmin) return; 
  const btn = document.getElementById('submitBtn'), status = document.getElementById('edStatus'); 
  const raw = (document.getElementById('postTextarea')?.value || '').trim(); 
  const title = (document.getElementById('postTitle')?.value || '').trim(); 
  const moodText = (document.getElementById('postMoodText')?.value || '').trim(); 
  const moodEmote = document.getElementById('postMoodEmote')?.value || null; 
   
  if (!raw && !title && _blogMedia.length === 0) { if (status) status.textContent = 'write something first.'; return; } 
  btn.disabled = true; if (status) status.textContent = 'posting...'; 
  try { 
    await window._push(window._ref(window._db, 'blog/posts'), { 
      secret: 'cdaeb22a5cd77d36df622f09873fc4ff5cf81b44ff3b90595df12b7de767059a', 
      title: title || null, 
      moodText: moodText || null, 
      moodEmote: moodEmote || null, 
      media: _blogMedia.length ? _blogMedia : null, 
      spoilerImg: document.getElementById('edSpoilerImg')?.checked || false, 
      contentRaw: raw || ' ', 
      ts: (typeof window._serverTimestamp === 'function' ? window._serverTimestamp() : Date.now()) 
    }); 
    await touchAdminLastOnline(); 
    document.getElementById('postTextarea').value = ''; 
    if (document.getElementById('postTitle')) document.getElementById('postTitle').value = ''; 
    if (document.getElementById('postMoodText')) document.getElementById('postMoodText').value = ''; 
    removeBlogEditorImg(); 
    const si = document.getElementById('edSpoilerImg'); if (si) si.checked = false; 
    if (status) { status.textContent = 'posted!'; setTimeout(() => { status.textContent = ''; }, 3000); } 
  } catch (e) { if (status) status.textContent = 'error: ' + e.message; btn.disabled = false; return; } 
  btn.disabled = false; 
} 
window.submitPost = submitPost; 
 
let _slashSelectedIdx = 0; 
let _slashItems = []; 
let _slashMode = 'commands'; 
const SLASH_COMMANDS = [ 
  { cmd: '/url', desc: 'Embed a link' }, 
  { cmd: '/emoji', desc: 'Insert an emoji' }, 
  { cmd: '/mood', desc: 'Set post mood' }, 
  { cmd: '/spoiler', desc: 'Spoiler text' } 
]; 

function getPostTextarea() { 
  return document.getElementById('postTextarea'); 
} 

function getActiveSlash(ta = getPostTextarea()) { 
  if (!ta) return null; 
  const caret = ta.selectionStart; 
  const before = ta.value.slice(0, caret); 
  const lineStart = before.lastIndexOf('\n') + 1; 
  const segment = before.slice(lineStart); 
  const slashPos = segment.lastIndexOf('/'); 
  if (slashPos < 0) return null; 
  const text = segment.slice(slashPos); 
  const match = text.match(/^\/([a-zA-Z]*)(?:\s+([^\n]*))?$/); 
  if (!match) return null; 
  return { 
    absStart: lineStart + slashPos, 
    command: '/' + (match[1] || ''), 
    query: (match[2] || '').trim().toLowerCase(), 
    caret 
  }; 
} 

function getActiveEmojiName(ta = getPostTextarea()) {
  if (!ta) return null;
  const caret = ta.selectionStart;
  const before = ta.value.slice(0, caret);
  const match = before.match(/(^|[\s([{])(:[a-zA-Z0-9_-]*)$/);
  if (!match) return null;
  const token = match[2];
  return {
    absStart: before.length - token.length,
    query: token.slice(1).toLowerCase(),
    caret
  };
}

function renderSlashItem(item, i) { 
  const active = i === _slashSelectedIdx ? ' active' : ''; 
  if (item.type === 'command') { 
    return `<div class="slash-item${active}" onclick="selectSlashSuggestion(${i})"><b>${esc(item.cmd)}</b> - ${esc(item.desc)}</div>`; 
  } 
  const src = EMOTES[item.name]; 
  const label = item.type === 'mood' ? 'mood' : 'emoji'; 
  return `<div class="slash-item${active}" onclick="selectSlashSuggestion(${i})"><img src="${esc(src)}" alt="" title="${esc(emoteCategory(item.name))}"><b>${esc(item.name)}</b><span style="margin-left:auto;color:inherit;">${label}</span></div>`; 
} 
 
function updateSlashHelp() { 
  const help = document.getElementById('slashHelp'); 
  const ta = getPostTextarea(); 
  if (!help) return; 
  const active = getActiveSlash(ta); 
  const activeEmoji = active ? null : getActiveEmojiName(ta);
  if (!active && !activeEmoji) { help.style.display = 'none'; return; } 
 
  if (activeEmoji) {
    _slashMode = 'emoji-name';
    _slashItems = Object.keys(EMOTES)
      .filter(name => !activeEmoji.query || name.includes(activeEmoji.query) || emoteCategory(name).includes(activeEmoji.query))
      .map(name => ({ type: 'emoji', name }));
  } else if (active.command === '/emoji') { 
    _slashMode = 'emoji'; 
    _slashItems = Object.keys(EMOTES) 
      .filter(name => !active.query || name.includes(active.query) || emoteCategory(name).includes(active.query)) 
      .map(name => ({ type: 'emoji', name })); 
  } else if (active.command === '/mood') { 
    _slashMode = 'mood'; 
    _slashItems = Object.keys(EMOTES) 
      .filter(name => emoteCategory(name) === 'mood') 
      .filter(name => !active.query || name.includes(active.query)) 
      .map(name => ({ type: 'mood', name })); 
  } else if (active.query && SLASH_COMMANDS.some(c => c.cmd === active.command)) { 
    help.style.display = 'none'; 
    return; 
  } else { 
    _slashMode = 'commands'; 
    const prefix = active.command.toLowerCase(); 
    _slashItems = SLASH_COMMANDS 
      .filter(c => c.cmd.startsWith(prefix)) 
      .map(c => ({ type: 'command', ...c })); 
  } 
 
  if (!_slashItems.length) { help.style.display = 'none'; return; } 
  _slashSelectedIdx = Math.min(_slashSelectedIdx, _slashItems.length - 1); 
  help.innerHTML = _slashItems.map(renderSlashItem).join(''); 
  help.style.display = 'block'; 
} 
 
function insertTextAtCaret(text) { 
  const ta = getPostTextarea(); 
  if (!ta) return; 
  const start = ta.selectionStart; 
  const end = ta.selectionEnd; 
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end); 
  const pos = start + text.length; 
  ta.focus(); 
  ta.setSelectionRange(pos, pos); 
} 

function replaceActiveSlash(text) { 
  const ta = getPostTextarea(); 
  if (!ta) return false; 
  const active = getActiveSlash(ta); 
  if (!active) return false; 
  const end = ta.selectionStart; 
  ta.value = ta.value.slice(0, active.absStart) + text + ta.value.slice(end); 
  const pos = active.absStart + text.length; 
  ta.focus(); 
  ta.setSelectionRange(pos, pos); 
  return true; 
} 

function replaceActiveEmojiName(text) {
  const ta = getPostTextarea();
  if (!ta) return false;
  const active = getActiveEmojiName(ta);
  if (!active) return false;
  const end = ta.selectionStart;
  ta.value = ta.value.slice(0, active.absStart) + text + ta.value.slice(end);
  const pos = active.absStart + text.length;
  ta.focus();
  ta.setSelectionRange(pos, pos);
  return true;
}

function insertSlashCommand(cmd) { 
  if (!replaceActiveSlash(cmd + ' ')) insertTextAtCaret(cmd + ' '); 
  _slashSelectedIdx = 0; 
  if (cmd === '/emoji' || cmd === '/mood') updateSlashHelp(); 
  else document.getElementById('slashHelp').style.display = 'none'; 
} 
window.insertSlashCommand = insertSlashCommand; 

function insertEmoteToken(name) { 
  const token = ':' + name + ': '; 
  if (!replaceActiveSlash(token) && !replaceActiveEmojiName(token)) insertTextAtCaret(token); 
  closeEmojiPicker(); 
  const help = document.getElementById('slashHelp'); 
  if (help) help.style.display = 'none'; 
} 
window.insertEmoteToken = insertEmoteToken; 

function setMoodFromEmote(name) { 
  const txt = document.getElementById('postMoodText'); 
  const sel = document.getElementById('postMoodEmote'); 
  if (txt) txt.value = name; 
  if (sel) sel.value = name; 
  syncMoodIcon(); 
  const active = getActiveSlash(); 
  if (active && active.command === '/mood') replaceActiveSlash(''); 
  const help = document.getElementById('slashHelp'); 
  if (help) help.style.display = 'none'; 
  closeEmojiPicker(); 
} 
window.setMoodFromEmote = setMoodFromEmote; 

function selectSlashSuggestion(i) { 
  const item = _slashItems[i]; 
  if (!item) return; 
  if (item.type === 'command') insertSlashCommand(item.cmd); 
  if (item.type === 'emoji') insertEmoteToken(item.name); 
  if (item.type === 'mood') setMoodFromEmote(item.name); 
} 
window.selectSlashSuggestion = selectSlashSuggestion; 

function buildEmojiPickerHTML() { 
  return `<div class="emoji-grid">${Object.keys(EMOTES).map(name => { 
    const src = EMOTES[name]; 
    return `<div class="emoji-item" onclick="insertEmoteToken('${esc(name)}')"><a href="${esc(src)}" target="_blank" rel="noopener" title="${esc(emoteCategory(name))}" onclick="event.stopPropagation()"><img src="${esc(src)}" alt="${esc(name)}" title="${esc(emoteCategory(name))}"></a><span>${esc(name)}</span><span class="emoji-insert">use</span></div>`; 
  }).join('')}</div>`; 
} 

function toggleEmojiPicker() { 
  const panel = document.getElementById('emojiPickerPanel'); 
  if (!panel) return; 
  if (!panel.innerHTML) panel.innerHTML = buildEmojiPickerHTML(); 
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; 
} 
window.toggleEmojiPicker = toggleEmojiPicker; 

function closeEmojiPicker() { 
  const panel = document.getElementById('emojiPickerPanel'); 
  if (panel) panel.style.display = 'none'; 
} 
window.closeEmojiPicker = closeEmojiPicker; 

function syncMoodIcon() { 
  const sel = document.getElementById('postMoodEmote'); 
  const icon = document.getElementById('postMoodIcon'); 
  if (!sel || !icon) return; 
  const name = sel.value; 
  if (name && EMOTES[name]) { 
    icon.src = EMOTES[name]; 
    icon.title = emoteCategory(name); 
    icon.style.display = 'inline-block'; 
  } else { 
    icon.removeAttribute('src'); 
    icon.title = ''; 
    icon.style.display = 'none'; 
  } 
} 
window.syncMoodIcon = syncMoodIcon; 

function bindBlogEditorControls() { 
  const ta = getPostTextarea(); 
  if (ta && !ta.dataset.slashBound) { 
    ta.dataset.slashBound = 'true'; 
    ta.addEventListener('input', handleSlashInput); 
    ta.addEventListener('keydown', handleSlashKeydown); 
  } 
  const sel = document.getElementById('postMoodEmote'); 
  if (sel && !sel.dataset.moodBound) { 
    sel.dataset.moodBound = 'true'; 
    sel.addEventListener('change', syncMoodIcon); 
  } 
  syncMoodIcon(); 
  if (!window._blogEmojiDocBound) { 
    window._blogEmojiDocBound = true; 
    document.addEventListener('click', e => { 
      const panel = document.getElementById('emojiPickerPanel'); 
      const btn = document.getElementById('emojiPickerBtn'); 
      if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) closeEmojiPicker(); 
    }); 
  } 
} 
 
function handleSlashInput(e) { 
  _slashSelectedIdx = 0; 
  updateSlashHelp(); 
} 
 
function handleSlashKeydown(e) { 
  const help = document.getElementById('slashHelp'); 
  if (help && help.style.display === 'block') { 
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      _slashSelectedIdx = (_slashSelectedIdx + 1) % _slashItems.length; 
      updateSlashHelp(); 
    } else if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      _slashSelectedIdx = (_slashSelectedIdx - 1 + _slashItems.length) % _slashItems.length; 
      updateSlashHelp(); 
    } else if (e.key === 'Enter' || e.key === 'Tab') { 
      e.preventDefault(); 
      selectSlashSuggestion(_slashSelectedIdx); 
    } else if (e.key === 'Escape') { 
      help.style.display = 'none'; 
    } 
  } 
} 
 
function injectAdminUI() { 
  const c = document.getElementById('adminContainer'); if (!c) return; 
  const moodOptions = '<option value="" selected>none</option>' + Object.keys(EMOTES).filter(m => emoteCategory(m) === 'mood').map(m => `<option value="${m}">${m}</option>`).join(''); 
  c.innerHTML = ` 
    <div class="content-box" style="text-align:center;margin-top:4px;"> 
      <div class="content-box-head">admin panel</div> 
      <div class="content-box-body"> 
        <div id="adminLogin" style="font-size:11px;"> 
          password: <input type="password" id="pwInput" style="width:120px;font:11px Verdana,sans-serif;border:1px solid #aaaaaa;padding:2px 4px;background:#ffffff;color:#000000;"> 
          <button class="form-btn" onclick="tryLogin()">enter</button> 
          <div id="loginErr" style="color:#cc0000;font-size:10px;margin-top:3px;"></div> 
        </div> 
        <div id="adminPanel" style="display:none;"> 
          <div style="font-size:10px;color:#888888;margin-bottom:5px;">logged in as yuri.neet &mdash; <button class="form-btn" onclick="logout()">logout</button></div> 
          <div class="admin-section">new post</div> 
          <table class="form-table"> 
            <tr> 
              <td class="form-label">Title</td> 
              <td><input type="text" id="postTitle" style="width:100%;box-sizing:border-box;"></td> 
            </tr> 
            <tr> 
              <td class="form-label">Mood</td> 
              <td> 
                <input type="text" id="postMoodText" placeholder="mood name..." style="width:50%;"> 
                <select id="postMoodEmote" style="width:35%;">${moodOptions}</select> 
                <img id="postMoodIcon" alt="" title="" style="display:none;height:18px;vertical-align:middle;margin-left:4px;"> 
              </td> 
            </tr> 
            <tr> 
              <td class="form-label">Content</td> 
              <td style="position:relative;"> 
                <div class="editor-tools"> 
                  <button type="button" id="emojiPickerBtn" class="emoji-picker-btn" title="emoji" onclick="event.stopPropagation(); toggleEmojiPicker();"><img src="${esc(EMOTES.heart)}" alt=""></button> 
                  <span style="font-size:10px;color:#888888;">/url link, /emoji, /mood</span> 
                </div> 
                <div id="emojiPickerPanel" class="emoji-picker-panel"></div> 
                <textarea id="postTextarea" rows="5" style="width:100%;font:11px Verdana,sans-serif;border:1px solid #aaaaaa;padding:2px 4px;box-sizing:border-box;resize:vertical;background:#ffffff;color:#000000;"></textarea> 
                <div id="slashHelp" class="slash-suggest"></div> 
              </td> 
            </tr> 
            <tr> 
              <td class="form-label">Files</td> 
              <td> 
                <button class="form-btn" onclick="document.getElementById('edFileInput').click()">choose</button> 
                <span id="edFileName" style="font-size:10px;margin:0 5px;color:#888888;">none</span> 
                <button class="form-btn" id="edRemoveImg" style="display:none;" onclick="removeBlogEditorImg()">remove</button> 
                <label style="font-size:10px;margin-left:5px;"><input type="checkbox" id="edSpoilerImg"> spoiler</label> 
                <input type="file" id="edFileInput" accept="image/*,video/*,audio/*" multiple onchange="handleBlogFileSelect(event)" style="display:none;"> 
                <div id="edImgPreview" style="display:flex; flex-wrap:wrap; gap:5px; margin-top:4px;"></div> 
              </td> 
            </tr> 
            <tr> 
              <td class="form-label"></td> 
              <td><button class="form-btn" id="submitBtn" onclick="submitPost()">Post</button> <span id="edStatus" style="margin-left:5px;font-size:10px;"></span></td> 
            </tr> 
          </table> 
        </div> 
      </div> 
    </div>`; 
  bindBlogEditorControls(); 
} 
window.injectAdminUI = injectAdminUI; 
 
window._curGalTab = 'sketches'; 
const GAL_PER_PAGE = 8; 
const galPage = { sketches: 0, pictures: 0 }; 
let galSort = 'newest'; 
 
function galData(tab) { 
  const staticItems = (window.YURINEET_GALLERY && window.YURINEET_GALLERY[tab]) || []; 
  if (tab === 'sketches') { if (window._fbSketches !== null) return [...window._fbSketches, ...staticItems]; return staticItems; } 
  if (window._fbPictures !== null) return window._fbPictures; 
  return (window.YURINEET_GALLERY && window.YURINEET_GALLERY.pictures) || []; 
} 
 
function galSorted(tab) { 
  const base = galData(tab).map((item, i) => ({ ...item, _i: i })); 
  return galSort === 'oldest' ? [...base].reverse() : base; 
} 
 
function renderGalleryTab(tab) { 
  const gridId = tab === 'pictures' ? 'picGrid' : 'sketchGrid', pagerId = tab === 'pictures' ? 'picPager' : 'sketchPager'; 
  const grid = document.getElementById(gridId), pager = document.getElementById(pagerId); 
  if (!grid || !pager) return; 
  const all = galSorted(tab), total = all.length, start = galPage[tab] * GAL_PER_PAGE, page = all.slice(start, start + GAL_PER_PAGE), totalPages = Math.max(1, Math.ceil(total / GAL_PER_PAGE)); 
  if (!total) { grid.innerHTML = '<li style="font-size:11px;color:#888888;padding:5px 0;font-style:italic;">nothing here yet.</li>'; pager.innerHTML = ''; return; } 
  const chanDate = item => { 
    if (item.ts) { 
      const d = new Date(Number(item.ts)); 
      const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
      const p = n => String(n).padStart(2, '0'); 
      return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${String(d.getFullYear()).slice(-2)}(${DAY[d.getDay()]})${p(d.getHours())}:${p(d.getMinutes())}`; 
    } 
    return item.date || ''; 
  }; 
  grid.innerHTML = ''; 
  page.forEach((item, pi) => { 
    const num = total - (start + pi); 
    const src = item.imageSrc || (tab === 'pictures' ? '../images/pictures/' : '../images/sketches/') + item.file; 
    const delBtn = window._isAdmin ? `<button class="gallery-del" onclick="deleteGalItem('${tab}','${esc(item._fbId || '')}')">delete</button>` : ''; 
    const li = document.createElement('li'); 
    li.className = 'gallery-item'; 
    li.innerHTML = `<a href="${esc(src)}" target="_blank" rel="noopener" style="display:block;flex-shrink:0;"><img class="gallery-thumb" src="${esc(src)}" alt="${esc(item.title || '')}" loading="lazy"></a><div class="gallery-info"><div class="gallery-title">${esc(item.title || 'untitled')}</div><div class="gallery-desc">${esc(item.description || '')}</div><div class="gallery-meta">${esc(chanDate(item))} &nbsp; No.${num}</div>${delBtn}</div>`; 
    grid.appendChild(li); 
  }); 
  pager.innerHTML = 'page: '; 
  for (let i = 0; i < totalPages; i++) { 
    const a = document.createElement('a'); 
    a.href = '#'; a.textContent = i + 1; 
    if (i === galPage[tab]) a.className = 'active'; 
    a.onclick = (e => { e.preventDefault(); galPage[tab] = i; renderGalleryTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }); 
    pager.appendChild(a); 
  } 
} 
window.renderGalleryTab = renderGalleryTab; 
 
function switchGalleryTab(tab) { 
  window._curGalTab = tab; 
  document.getElementById('gal-sketches').style.display = tab === 'sketches' ? '' : 'none'; 
  document.getElementById('gal-pictures').style.display = tab === 'pictures' ? '' : 'none'; 
  document.getElementById('gtab-sketches').className = tab === 'sketches' ? 'active' : ''; 
  document.getElementById('gtab-pictures').className = tab === 'pictures' ? 'active' : ''; 
  renderGalleryTab(tab); 
} 
window.switchGalleryTab = switchGalleryTab; 
 
function galFilterSort() { 
  galSort = document.getElementById('galSortSelect')?.value || 'newest'; 
  galPage.sketches = 0; galPage.pictures = 0; 
  renderGalleryTab(window._curGalTab || 'sketches'); 
} 
window.galFilterSort = galFilterSort; 
 
async function deleteGalItem(section, fbId) { 
  if (!window._isAdmin || !fbId) return; 
  if (!confirm('delete?')) return; 
  try { await window._remove(window._ref(window._db, 'gallery/' + section + '/' + fbId)); } 
  catch (e) { alert('error: ' + e.message); } 
} 
window.deleteGalItem = deleteGalItem; 
 
function injectGalAdminUI() { 
  const c = document.getElementById('galAdminContainer'); if (!c) return; 
  c.innerHTML = `<div class="content-box" style="margin-top:4px;"><div class="content-box-head">Gallery Admin</div><div class="content-box-body"><div id="galAdminLogin" style="font-size:11px;">password: <input type="password" id="galPwInput" style="width:120px;font:11px Verdana,sans-serif;border:1px solid #aaaaaa;padding:2px 4px;background:#ffffff;color:#000000;"> <button class="form-btn" onclick="galTryLogin()">enter</button><div id="galLoginErr" style="color:#cc0000;font-size:10px;margin-top:3px;"></div></div><div id="galAdminPanel" style="display:none;"><div style="font-size:10px;color:#888888;margin-bottom:5px;">logged in &mdash; <button class="form-btn" onclick="galLogout()">logout</button></div><div class="admin-section">add image</div><table class="form-table"><tr><td class="form-label">Section</td><td><select id="galSection" style="font:11px Verdana,sans-serif;border:1px solid #aaaaaa;"><option value="sketches">sketches</option><option value="pictures">pictures</option></select></td></tr><tr><td class="form-label">Title</td><td><input type="text" id="galTitle"></td></tr><tr><td class="form-label">Desc</td><td><input type="text" id="galDesc"></td></tr><tr><td class="form-label">File</td><td><button class="form-btn" onclick="document.getElementById('galFileInput').click()">choose</button> <span id="galFileName" style="font-size:10px;margin:0 5px;color:#888888;">none</span><input type="file" id="galFileInput" accept="image/jpeg,image/png,image/gif,image/webp" onchange="galHandleFile(event)" style="display:none;"><div id="galImgPreview" style="display:none;margin-top:4px;"></div></td></tr><tr><td class="form-label"></td><td><button class="form-btn" id="galSubmitBtn" onclick="galSubmit()">Add</button> <span id="galStatus" style="margin-left:5px;font-size:10px;"></span></td></tr></table></div></div></div>`; 
} 
window.injectGalAdminUI = injectGalAdminUI; 
 
async function galTryLogin() { 
  const pw = document.getElementById('galPwInput')?.value || ''; 
  const errEl = document.getElementById('galLoginErr'); 
  if (!pw) { if (errEl) errEl.textContent = 'enter password.'; return; } 
  if (errEl) errEl.textContent = 'checking...'; 
  let waited = 0; 
  while ((!window._sha256 || !window._get || !window._ref || !window._db) && waited < 8000) { 
    await new Promise(r => setTimeout(r, 120)); waited += 120; 
  } 
  if (!window._sha256 || !window._get || !window._ref || !window._db) { if (errEl) errEl.textContent = 'firebase not ready.'; return; } 
  try { 
    const hash = await window._sha256(pw); 
    const snap = await window._get(window._ref(window._db, 'admin/passHash')); 
    if (snap.val() === hash) { 
      window._isAdmin = true; 
      await touchAdminLastOnline(); 
      document.getElementById('galAdminLogin').style.display = 'none'; 
      document.getElementById('galAdminPanel').style.display = 'block'; 
      if (errEl) errEl.textContent = ''; 
      renderGalleryTab(window._curGalTab || 'sketches'); 
    } else { if (errEl) errEl.textContent = 'wrong password.'; } 
  } catch (e) { if (errEl) errEl.textContent = 'error: ' + e.message; } 
} 
window.galTryLogin = galTryLogin; 
 
function galLogout() { 
  window._isAdmin = false; 
  document.getElementById('galAdminLogin').style.display = 'block'; 
  document.getElementById('galAdminPanel').style.display = 'none'; 
  renderGalleryTab(window._curGalTab || 'sketches'); 
} 
window.galLogout = galLogout; 
 
let _galImgUrl = null, _galImgInfo = null; 
 
async function galHandleFile(event) { 
  const file = event.target.files[0]; event.target.value = ''; 
  if (!file) return; 
  if (file.size > 600 * 1024) { alert('max 600 KB'); return; } 
  const statusEl = document.getElementById('galStatus'); 
  if (statusEl) statusEl.textContent = 'uploading...'; 
  const tmpUrl = URL.createObjectURL(file); const tmpImg = new Image(); tmpImg.src = tmpUrl; 
  await new Promise(res => { tmpImg.onload = tmpImg.onerror = res; }); 
  const w = tmpImg.naturalWidth, h = tmpImg.naturalHeight; URL.revokeObjectURL(tmpUrl); 
  const sizeKB = (file.size / 1024).toFixed(1); 
  try { 
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', 'unsigned_upload'); 
    const res = await fetch('https://api.cloudinary.com/v1_1/dagsxkazw/image/upload', { method: 'POST', body: fd }); 
    const data = await res.json(); 
    if (!data.secure_url) throw new Error('upload failed'); 
    _galImgUrl = data.secure_url; _galImgInfo = { name: file.name, sizeKB, w, h }; 
    document.getElementById('galFileName').textContent = file.name; 
    const pv = document.getElementById('galImgPreview'); 
    pv.style.display = 'block'; 
    pv.innerHTML = `<img src="${esc(data.secure_url)}" alt="" style="max-width:90px;max-height:75px;border:1px solid #aaaaaa;">`; 
    if (statusEl) statusEl.textContent = 'image ready.'; 
  } catch (err) { if (statusEl) statusEl.textContent = 'upload error: ' + err.message; } 
} 
window.galHandleFile = galHandleFile; 
 
async function galSubmit() { 
  if (!window._isAdmin) return; 
  const btn = document.getElementById('galSubmitBtn'), status = document.getElementById('galStatus'), 
    section = document.getElementById('galSection')?.value || 'sketches', 
    title = (document.getElementById('galTitle')?.value || '').trim(); 
  if (!_galImgUrl) { if (status) status.textContent = 'choose an image first.'; return; } 
  btn.disabled = true; if (status) status.textContent = 'saving...'; 
  try { 
    await window._push(window._ref(window._db, 'gallery/' + section), { 
      imageSrc: _galImgUrl, imageInfo: _galImgInfo || null, 
      title: title || (section === 'pictures' ? 'photo' : 'sketch'), 
      description: (document.getElementById('galDesc')?.value || '').trim(), 
      author: 'yuri.neet', 
      ts: (typeof window._serverTimestamp === 'function' ? window._serverTimestamp() : Date.now()) 
    }); 
    document.getElementById('galTitle').value = ''; 
    document.getElementById('galDesc').value = ''; 
    _galImgUrl = null; _galImgInfo = null; 
    document.getElementById('galFileName').textContent = 'none'; 
    const pv = document.getElementById('galImgPreview'); pv.style.display = 'none'; pv.innerHTML = ''; 
    if (status) { status.textContent = 'added!'; setTimeout(() => { status.textContent = ''; }, 3000); } 
  } catch (e) { if (status) status.textContent = 'error: ' + e.message; btn.disabled = false; return; } 
  btn.disabled = false; 
} 
window.galSubmit = galSubmit; 
 
if (new URLSearchParams(window.location.search).has('admin')) { 
  if (document.readyState === 'loading') { 
    document.addEventListener('DOMContentLoaded', () => { injectAdminUI(); injectGalAdminUI(); }); 
  } else { 
    injectAdminUI(); injectGalAdminUI(); 
  } 
} 
 
// ── CONTACT ── 
const CT_SERVICE_ID = 'service_ina2cb8', CT_TEMPLATE_ID = 'template_g7owumb', 
  CLOUD_NAME = 'dagsxkazw', UPLOAD_PRESET = 'unsigned_upload'; 
const ctEditor = document.getElementById('msgEditor'); 
let ctSuppressedEmbeds = new Set(); 
 
function ctGetTime() { 
  const d = new Date(); 
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
  const p = n => String(n).padStart(2, '0'); 
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${String(d.getFullYear()).slice(-2)}(${DAY[d.getDay()]})${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; 
} 
 
const CT_EPATS = [ 
  { name: 'youtube', re: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?[^\s"<]*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g, build: m => ({ src: 'https://www.youtube.com/embed/' + m[1] + '?rel=0', url: m[0], id: m[1] }) }, 
  { name: 'spotify', re: /https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)(?:[?&][^\s"<]*)?/g, build: m => ({ src: 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator&theme=0', url: m[0] }) }, 
  { name: 'soundcloud', re: /https?:\/\/(?:www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(?:[?&][^\s"<]*)?/g, build: m => ({ src: 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(m[0]) + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false', url: m[0] }) } 
]; 
 
function ctDetectEmbeds(text) { 
  const found = []; 
  for (const p of CT_EPATS) { 
    p.re.lastIndex = 0; let m; 
    while ((m = p.re.exec(text)) !== null) { 
      const b = p.build(m); b.name = p.name; 
      if (!found.some(e => e.url === b.url)) found.push(b); 
    } 
  } 
  return found; 
} 
 
function ctUpdatePreview() { 
  const pm = document.getElementById('ctPreviewMsg'), pt = document.getElementById('ctPreviewTime'); 
  if (pt) pt.textContent = ctGetTime(); 
  if (!pm) return; 
  const rawText = (ctEditor?.innerText || '').replace(/\u200B/g, '').trim(); 
  const hasImg = !!ctEditor?.querySelector('img'); 
  if (!rawText && !hasImg) { pm.innerHTML = '<span style="color:#aaaaaa;">your message will appear here...</span>'; return; } 
  const clone = ctEditor.cloneNode(true); 
  clone.querySelectorAll('img').forEach(img => { 
    img.style.cssText = 'max-width:100%;max-height:180px;object-fit:contain;display:block;margin:3px 0;border:1px solid #aaaaaa;float:none;'; 
  }); 
  clone.querySelectorAll('[contenteditable=false]').forEach(el => { 
    el.style.cssText = 'font:10px monospace;color:#888888;margin:0 0 2px;display:block;'; 
  }); 
  pm.innerHTML = clone.innerHTML; 
} 
 
if (ctEditor) { 
  ctEditor.addEventListener('input', () => { ctHighlightLinks(); ctUpdatePreview(); }); 
  ctEditor.addEventListener('paste', e => { e.preventDefault(); const text = e.clipboardData.getData('text/plain'); document.execCommand('insertText', false, text); }); 
} 
 
function ctHighlightLinks() { 
  const linkInput = document.getElementById('linkInput'), dd = document.getElementById('linkDropdown'); 
  if (!linkInput || !dd) return; 
  const rawText = (ctEditor?.innerText || '').replace(/\u200B/g, '').trim(); 
  const allText = rawText + '\n' + (linkInput.value || ''); 
  const embeds = ctDetectEmbeds(allText).filter(e => !ctSuppressedEmbeds.has(e.url)); 
  if (embeds.length) { 
    dd.style.display = 'block'; 
    dd.innerHTML = embeds.map(e => `<div>${esc(e.url)}</div>`).join(''); 
    document.getElementById('ctRemoveEmbedBtn').style.display = 'inline-block'; 
  } else { 
    dd.style.display = 'none'; dd.innerHTML = ''; 
    document.getElementById('ctRemoveEmbedBtn').style.display = 'none'; 
  } 
} 
 
document.getElementById('linkInput')?.addEventListener('input', () => { ctHighlightLinks(); ctUpdatePreview(); }); 
 
async function ctUploadCloudinary(file) { 
  const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', UPLOAD_PRESET); 
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd }); 
  const data = await res.json(); 
  if (!data.secure_url) throw new Error('upload failed'); 
  return data.secure_url; 
} 
 
async function ctInsertImage(event) { 
  const file = event.target.files[0]; event.target.value = ''; 
  if (!file) return; 
  if (file.size > 400 * 1024) { document.getElementById('ctStatus').textContent = 'max 400 KB'; return; } 
  const status = document.getElementById('ctStatus'); 
  status.textContent = 'uploading...'; status.className = ''; 
  const tmpURL = URL.createObjectURL(file); const tmpImg = new Image(); tmpImg.src = tmpURL; 
  await new Promise(r => { tmpImg.onload = r; tmpImg.onerror = r; }); 
  const w = tmpImg.naturalWidth, h = tmpImg.naturalHeight; URL.revokeObjectURL(tmpURL); 
  const sizeKB = (file.size / 1024).toFixed(1); 
  const existingText = (ctEditor?.innerText || '').replace(/\u200B/g, '').trim(); 
  try { 
    const imgUrl = await ctUploadCloudinary(file); 
    const specs = document.createElement('div'); 
    specs.contentEditable = 'false'; 
    specs.style.cssText = 'font:10px monospace;color:#888888;margin:0 0 2px;display:block;'; 
    specs.textContent = `File: ${file.name} (${sizeKB} KB, ${w}x${h})`; 
    const img = document.createElement('img'); 
    img.src = imgUrl; 
    img.style.cssText = 'display:block;max-width:100%;max-height:180px;object-fit:contain;margin:0 0 4px 0;border:1px solid #aaaaaa;'; 
    const textNode = document.createTextNode(existingText || '\u200B'); 
    ctEditor.innerHTML = ''; 
    ctEditor.appendChild(specs); 
    ctEditor.appendChild(img); 
    ctEditor.appendChild(textNode); 
    ctEditor.focus(); 
    const range = document.createRange(); 
    range.setStart(textNode, textNode.length); range.collapse(true); 
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); 
    document.getElementById('ctFileName').textContent = file.name; 
    document.getElementById('ctRemoveBtn').style.display = 'inline-block'; 
    status.textContent = 'uploaded!'; status.className = 'status-ok'; 
  } catch (err) { status.textContent = 'upload failed.'; status.className = 'status-err'; } 
  ctHighlightLinks(); ctUpdatePreview(); 
} 
window.ctInsertImage = ctInsertImage; 
 
function ctRemoveAttachment() { 
  ctEditor?.querySelectorAll('img').forEach(el => el.remove()); 
  ctEditor?.querySelectorAll('[contenteditable=false]').forEach(el => el.remove()); 
  document.getElementById('ctFileName').textContent = 'no file'; 
  document.getElementById('ctRemoveBtn').style.display = 'none'; 
  const s = document.getElementById('ctStatus'); if (s) { s.textContent = ''; s.className = ''; } 
  ctHighlightLinks(); ctUpdatePreview(); ctEditor?.focus(); 
} 
window.ctRemoveAttachment = ctRemoveAttachment; 
 
function ctRemoveEmbeds() { 
  const text = (ctEditor?.innerText || '').replace(/\u200B/g, '').trim(); 
  ctDetectEmbeds(text).forEach(e => ctSuppressedEmbeds.add(e.url)); 
  document.getElementById('ctRemoveEmbedBtn').style.display = 'none'; 
  ctUpdatePreview(); ctEditor?.focus(); 
} 
window.ctRemoveEmbeds = ctRemoveEmbeds; 
 
async function ctSendMsg() { 
  const rawText = (ctEditor?.innerText || '').replace(/\u200B/g, '').trim(); 
  const hasImg = !!ctEditor?.querySelector('img'); 
  const status = document.getElementById('ctStatus'), btn = document.getElementById('ctSendBtn'); 
  if (!rawText && !hasImg) { status.textContent = 'write something first.'; status.className = 'status-err'; return; } 
  if (btn.disabled) return; btn.disabled = true; status.className = ''; status.textContent = 'sending...'; 
  const timeStr = ctGetTime(); 
  const tmp = document.createElement('div'); tmp.innerHTML = ctEditor.innerHTML.replace(/\u200B/g, ''); 
  const img = tmp.querySelector('img'); const specs = tmp.querySelector('[contenteditable=false]'); 
  const rawTextClean = tmp.innerText || ''; 
  const embeds = ctDetectEmbeds(rawTextClean + '\n' + (document.getElementById('linkInput')?.value || '')); 
  const embedsHTML = embeds.map(e => { 
    if (e.name === 'youtube') return `<div style="margin:8px 0;"><a href="${e.url}" target="_blank"><img src="https://img.youtube.com/vi/${e.id}/hqdefault.jpg" style="max-width:300px;display:block;border:1px solid #000;"></a></div>`; 
    if (e.name === 'spotify') return `<div style="margin:8px 0;"><a href="${e.url}" target="_blank">▶ Open on Spotify</a></div>`; 
    if (e.name === 'soundcloud') return `<div style="margin:8px 0;"><a href="${e.url}" target="_blank">▶ Open on SoundCloud</a></div>`; 
    return ''; 
  }).join(''); 
  const specsHTML = specs ? `<div style="font:10px monospace;color:#111;margin:0 0 3px;">${esc(specs.textContent)}</div>` : ''; 
  if (specs) specs.remove(); if (img) img.remove(); 
  const textHTML = tmp.innerHTML.trim(); 
  let bodyHTML; 
  if (img) { 
    bodyHTML = `${specsHTML}<img src="${esc(img.src)}" style="max-width:300px;display:block;border:1px solid #000;margin-bottom:6px;"><div style="font-size:12px;line-height:1.5;">${textHTML || ''}</div>`; 
  } else { bodyHTML = tmp.innerHTML; } 
  const finalHTML = bodyHTML + embedsHTML; 
  try { 
    await emailjs.send(CT_SERVICE_ID, CT_TEMPLATE_ID, { 
      name: 'Anonymous', from_email: 'anonymous@noreply.com', 
      subject: 'anonymous message - watanagashi archive', 
      message: rawText, message_html: finalHTML, time: timeStr 
    }); 
    status.textContent = 'sent!'; status.className = 'status-ok'; 
    ctEditor.innerHTML = ''; 
    document.getElementById('ctPreviewMsg').innerHTML = '<span style="color:#aaaaaa;">your message will appear here...</span>'; 
    document.getElementById('ctFileName').textContent = 'no file'; 
    document.getElementById('ctRemoveBtn').style.display = 'none'; 
    document.getElementById('ctRemoveEmbedBtn').style.display = 'none'; 
    ctSuppressedEmbeds.clear(); 
  } catch (err) { status.textContent = 'failed - trenchgun1337@gmail.com'; status.className = 'status-err'; } 
  btn.disabled = false; 
} 
window.ctSendMsg = ctSendMsg; 
 
ctUpdatePreview();
