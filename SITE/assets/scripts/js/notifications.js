(function () {
  'use strict';

  const APP_ID = '730c35c5-8ffc-4463-a37c-7849d3b0478d';
  let initialized = false;
  let initStarted = false;

  function isLocalhost() {
    return ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
  }

  function hasSecureOrigin() {
    return location.protocol === 'https:' || isLocalhost();
  }

  function widgets() {
    return {
      buttons: Array.from(document.querySelectorAll('[data-notification-button]')),
      statuses: Array.from(document.querySelectorAll('[data-notification-status]'))
    };
  }

  function setWidgets(text, disabled, buttonText) {
    const found = widgets();
    found.statuses.forEach(el => { el.textContent = text; });
    found.buttons.forEach(btn => {
      btn.disabled = !!disabled;
      if (buttonText) btn.textContent = buttonText;
    });
  }

  function bindButtons() {
    widgets().buttons.forEach(btn => {
      if (btn.dataset.notificationBound) return;
      btn.dataset.notificationBound = '1';
      btn.addEventListener('click', requestBlogNotifications);
    });
  }

  function supportProblem(OneSignal) {
    if (!('Notification' in window)) return 'this browser has no notification API.';
    if (!hasSecureOrigin()) return 'open through https or localhost.';
    if (Notification.permission === 'denied') return 'notifications are blocked in browser settings.';
    if (OneSignal?.Notifications?.isPushSupported && !OneSignal.Notifications.isPushSupported()) {
      return 'push is not supported here.';
    }
    return '';
  }

  async function refreshNotificationWidgets() {
    bindButtons();
    const OneSignal = window._yurineetOneSignal;
    const problem = supportProblem(OneSignal);
    if (problem) {
      setWidgets(problem, true, 'notifications off');
      return;
    }
    if (!initialized || !OneSignal) {
      setWidgets('notification button loading...', true, 'loading...');
      return;
    }
    const permission = !!OneSignal.Notifications.permission;
    const optedIn = OneSignal.User?.PushSubscription?.optedIn;
    if (permission && optedIn !== false) {
      setWidgets('notifications are on.', false, 'notifications on');
    } else if (permission && optedIn === false) {
      setWidgets('permission allowed, click to turn them on.', false, 'turn on');
    } else {
      setWidgets('click to allow blog notifications.', false, 'notify me');
    }
  }

  async function requestBlogNotifications() {
    const OneSignal = window._yurineetOneSignal;
    const problem = supportProblem(OneSignal);
    if (problem) {
      setWidgets(problem, true, 'notifications off');
      return;
    }
    if (!OneSignal || !initialized) {
      setWidgets('wait a second, still loading...', true, 'loading...');
      return;
    }

    setWidgets('asking browser...', true, 'asking...');
    try {
      if (!OneSignal.Notifications.permission) {
        await OneSignal.Notifications.requestPermission();
      }
      if (OneSignal.Notifications.permission && OneSignal.User?.PushSubscription?.optIn) {
        await OneSignal.User.PushSubscription.optIn();
      }
    } catch (err) {
      console.warn('notification setup failed', err);
      setWidgets('notification setup failed: ' + (err?.message || 'check console.'), false, 'try again');
      return;
    }
    await refreshNotificationWidgets();
  }

  function attachOneSignalListeners(OneSignal) {
    try {
      OneSignal.Notifications.addEventListener('permissionChange', refreshNotificationWidgets);
      OneSignal.User?.PushSubscription?.addEventListener?.('change', refreshNotificationWidgets);
    } catch (err) {
      console.warn('notification listeners failed', err);
    }
  }

  function initOneSignal() {
    if (initStarted) return;
    initStarted = true;
    bindButtons();

    if (!window.OneSignalDeferred) {
      setWidgets('OneSignal SDK did not load.', true, 'notifications off');
      return;
    }

    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId: APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: 'OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: '/' },
          notifyButton: { enable: false },
          promptOptions: {
            slidedown: {
              prompts: [{
                type: 'push',
                autoPrompt: false,
                text: {
                  actionMessage: 'new blog posts and tiny site updates.',
                  acceptButton: 'allow',
                  cancelButton: 'later'
                }
              }]
            }
          }
        });
        window._yurineetOneSignal = OneSignal;
        initialized = true;
        attachOneSignalListeners(OneSignal);
        await refreshNotificationWidgets();
      } catch (err) {
        console.warn('OneSignal init failed', err);
        setWidgets('notification init failed: ' + (err?.message || 'check origin and service worker.'), true, 'notifications off');
      }
    });
  }

  window.requestBlogNotifications = requestBlogNotifications;
  window.refreshNotificationWidgets = refreshNotificationWidgets;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindButtons();
      refreshNotificationWidgets();
    });
  } else {
    bindButtons();
    refreshNotificationWidgets();
  }

  initOneSignal();
})();
