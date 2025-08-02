importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js');

if (workbox) {
  console.log('✅ Workbox loaded');

  // 📄 HTML, JS, CSS files
  workbox.routing.registerRoute(
    ({ request }) => ['document', 'script', 'style'].includes(request.destination),
    new workbox.strategies.NetworkFirst()
  );

  // 🔁 Firebase Realtime DB JSON caching
  workbox.routing.registerRoute(
    /^https:\/\/citypulseapp\.web\.app\/.*\.json$/,
    new workbox.strategies.StaleWhileRevalidate()
  );
} else {
  console.log('❌ Workbox didn’t load');
}
