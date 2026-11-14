// Service Worker de la aplicación de jueces.
//
// El anterior era red directa siempre, con un 503 «Sin conexión» si fallaba, y
// además **borraba todas las cachés al activarse**. El motivo estaba escrito y
// es bueno: «en carrera nunca queremos servir una versión antigua». El
// problema es lo que costaba.
//
// La app está hecha para trabajar sin cobertura: guarda la carrera en el móvil
// (`judge_race_cache`) y tiene cola para las puntuaciones que no salen. Todo
// eso no sirve de nada si el juez recarga —o el sistema descarta la app— en
// una zona sin señal, porque entonces **no carga ni la app**. Se queda con un
// texto plano y sin poder puntuar, con los pilotos esperando.
//
// Se mantiene la intención: red primero, siempre. Lo que cambia es qué pasa
// cuando la red no está. Con 3 s de paciencia: si contesta, se sirve y se
// guarda; si no, se sirve lo guardado y el juez puede seguir puntuando.
const CACHE = 'tr-jueces-armazon-1';
// El SDK se guarda AL INSTALAR, no cuando pase por delante.
//
// Y esto importa: en la PRIMERA carga el service worker todavía se está
// instalando, así que los imports del módulo no pasan por él y no se
// guardarían. La primera carga es justo la que se hace en la mesa, con
// cobertura — o sea que si se dejara para «la próxima vez», la próxima vez
// podría ser ya en la zona y sin señal. Al instalar se pide expresamente.
const SDK = [
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
];
const ARMAZON = ['./', './index.html', './manifest.json'].concat(SDK);
const ESPERA_RED_MS = 3000;   // más corto que en la web pública: aquí se puntúa

// Guardar index.html NO BASTA, y esto es lo que de verdad decide.
//
// La app es un <script type="module"> que importa el SDK de Firebase desde
// gstatic **en el nivel superior**. Y un módulo que no consigue uno de sus
// imports **no ejecuta ni una sola línea**. Así que sin el SDK a mano, el juez
// que recarga sin cobertura tendría el HTML y nada más: ni lista, ni botones,
// ni la copia local de la carrera, ni la cola.
//
// Los imports de módulos viajan con CORS, así que la respuesta de gstatic se
// puede guardar (no es opaca). Es la excepción a «nada de fuera pasa por la
// caché»: el SDK es código, no datos, y está clavado en la versión 10.12.0.
function _esSdkFirebase(url) {
  return url.pathname.indexOf('/firebasejs/') !== -1;
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ARMAZON.map(u => c.add(u).catch(() => {}))))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Se borran las cachés VIEJAS, no todas: borrar la de ahora era quedarse
    // sin red de seguridad justo al estrenar una versión.
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .catch(() => {})
      .then(() => self.clients.claim())
  );
});

function _guarda(req, res) {
  if (!res || !res.ok || res.type === 'opaque') return;
  const copia = res.clone();
  caches.open(CACHE).then(c => c.put(req, copia)).catch(function () {});
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  // De fuera sólo se guarda el SDK. Los datos de Firebase (la base de datos)
  // van siempre a la red, sin tocar: un dato viejo servido como nuevo aquí
  // sería una puntuación equivocada.
  if (url.origin !== self.location.origin && !_esSdkFirebase(url)) return;

  const esNavegacion = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  e.respondWith((async () => {
    try {
      const red = fetch(req).then(function (r) { _guarda(req, r); return r; });
      const reloj = new Promise(function (ok) { setTimeout(function () { ok(null); }, ESPERA_RED_MS); });
      const porRed = await Promise.race([red.catch(function () { return null; }), reloj]);
      if (porRed) return porRed;
      const guardado = await caches.match(esNavegacion ? './index.html' : req, { ignoreSearch: true });
      if (guardado) return guardado;
      return await red;
    } catch (err) {
      const guardado = await caches.match(esNavegacion ? './index.html' : req, { ignoreSearch: true });
      if (guardado) return guardado;
      return new Response(
        '<!doctype html><meta charset="utf-8"><title>Sin conexión</title>' +
        '<body style="font:16px/1.5 system-ui;padding:28px;text-align:center">' +
        '<h1 style="font-size:19px">Sin conexión</h1>' +
        '<p>No hay cobertura y esta es la primera vez que abres la app en este ' +
        'teléfono, así que no hay nada guardado.</p>' +
        '<p><b>Apunta las puntuaciones en el estadillo de zona</b> y avisa a la mesa.</p>' +
        '<p><button onclick="location.reload()" style="padding:10px 18px;font-size:15px">' +
        'Reintentar</button></p></body>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
