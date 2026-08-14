/* ══════════════════════════════════════════════════════════════
   KROL EDIFICACIÓN ESTRUCTURAL — Demo por Vonoa Web
   "¡Construyendo soluciones!": todo entra como dibujo técnico y se cola.
   GSAP + ScrollTrigger, con degradado limpio si no cargan.
   ══════════════════════════════════════════════════════════════ */

const GS = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
if (GS) gsap.registerPlugin(ScrollTrigger); else document.documentElement.classList.add('no-gsap');
const CALMA = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER = matchMedia('(hover: hover)').matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ─────────────────────────────────────────────
   1 · Medir trazos SVG  →  --len para el dash
   ───────────────────────────────────────────── */
function medir(svg, { stagger = 0, dur = 0.9, base = 0 } = {}) {
  if (!svg) return;   // si el grupo no existe en esta página, no pasa nada
  const trazos = $$('path, line, circle, rect', svg).filter(el => !el.hasAttribute('fill') || el.getAttribute('fill') === 'none');
  trazos.forEach((el, i) => {
    let len = 0;
    try { len = el.getTotalLength(); } catch { len = 0; }
    if (!len && el.tagName === 'circle') len = 2 * Math.PI * (+el.getAttribute('r') || 0);
    if (!len) return;
    len = Math.ceil(len) + 2;
    el.style.setProperty('--len', len);
    el.style.transition = `stroke-dashoffset ${dur}s cubic-bezier(.22,1,.36,1) ${base + i * stagger}s`;
  });
  return trazos;
}

/* ─────────────────────────────────────────────
   2 · Hero — titular
   Sin pantalla de carga: entra de inmediato. La marca de agua de la
   derecha entra sola por CSS cuando el hero recibe .lit
   ───────────────────────────────────────────── */
const hero = $('.hero');

/* Marca de agua: el SVG se inyecta en línea porque el CSS no puede animar los
   paths de un <img>. Se queda como archivo aparte para que el navegador lo
   guarde en caché y no engorde el HTML. */
const marca = $('#heroMarca');
if (marca) {
  fetch(marca.dataset.svg)
    .then(r => r.ok ? r.text() : Promise.reject(r.status))
    .then(txt => {
      marca.innerHTML = txt;
      const svg = $('svg', marca);
      if (!svg) return;
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      // El trazado trae un rectángulo blanco de fondo que taparía la portada
      const fondo = $('path[fill="rgb(255,255,255)"]', svg);
      if (fondo && /^M 0 0 L 2048 0/.test(fondo.getAttribute('d') || '')) fondo.remove();
      // Escalonar los trazos: se dibuja de a poco en vez de todo de golpe
      if (!CALMA) $$('path', svg).forEach((p, i) => { p.style.animationDelay = (i * 6) + 'ms'; });
    })
    .catch(() => {});   // decorativo: si no carga, la portada se ve igual
}

/* ─────────────────────────────────────────────
   2.5 · El plano de la portada se levanta
   Sustituye al video de la casa. La crítica de Rubén en la junta fue que los
   trazos "no dan a ningún lado", que no son ejes rastreables ni esquinas
   ubicables. Aquí cada línea es un elemento real de la obra: los ejes bajan a
   su círculo de registro, las cotas miden algo, y la estructura se dibuja en
   el ORDEN EN QUE SE CONSTRUYE — terreno, zapatas, columnas, trabes, losa.
   De ahí que el titular diga "¡Construyendo soluciones!": se está construyendo.

   Se arma en JS y no en el HTML porque son ~200 trazos y cargarlos a mano
   dejaría el index ilegible.
   ───────────────────────────────────────────── */
const plano = $('#planoObra');
if (plano) {
  const VX = 1600, VY = 1000;

  /* ZONA SEGURA. El svg va con `slice`, así que siempre se recorta, y cuánto
     depende del ancho: en 1280 se pierden ~197 px de viewBox por lado, en 1440
     unos 122, y a partir de 1900 ya no se recorta a lo ancho sino a lo alto.
     El caso malo es el de 1280, así que todo el dibujo vive dentro de
     x 200-1400 e y 90-920. Y nada a la izquierda de 800: ahí va el titular. */
  const M = 40;   // módulo de la retícula; ejes y cotas caen en él
  const EJES   = [820, 970, 1120, 1270];           // A, B, C, D
  const LETRAS = ['A', 'B', 'C', 'D'];
  const NPT    = 700;                              // nivel de piso terminado
  const NIVEL  = [700, 560, 420, 280];             // +0.00, +3.20, +6.40, azotea
  const ALTURA = ['+0.00', '+3.20', '+6.40', '+9.60'];
  const COL = 24, ZAP = 92, TRABE = 18;
  const CX = 1340;   // línea de cotas: a la DERECHA de la obra, lejos del texto
  const CY = 792;    // cota horizontal de crujías
  const CEJE = 856;  // círculos de registro, debajo de la cota (no en el menú)

  /* Caja del encuadre: lo que realmente se ve. Tiene que abarcar hasta el texto
     de las cotas (CX + su etiqueta), no sólo hasta el último eje, o las alturas
     se cortan contra el borde derecho. */
  const BX = EJES[0] - 140, BY = 185;
  const BW = CX + 130 - BX, BH = CEJE + 39 - BY;

  const t = [];   // trazos, en el orden en que se dibujan
  /* Cada trazo lleva su propia longitud en `--len`. Sin eso el guion del CSS
     mediría lo mismo para un estribo de 30 px que para una trabe de 750, y los
     cortos aparecerían de golpe al final en vez de dibujarse.
     Se calcula con geometría y no con getTotalLength() porque medir ~250
     elementos en el DOM obliga al navegador a recalcular todo el layout justo
     cuando está pintando la portada.

     `d` es el retraso en ms. Se pasa a mano y no por índice porque el orden de
     construcción manda sobre el orden del array. */
  const linea = (x1, y1, x2, y2, clase, d) =>
    t.push(`<line class="${clase}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ` +
           `style="--d:${d}ms;--len:${Math.ceil(Math.hypot(x2 - x1, y2 - y1)) + 2}"/>`);
  const caja = (x, y, w, h, clase, d) =>
    t.push(`<rect class="${clase}" x="${x}" y="${y}" width="${w}" height="${h}" ` +
           `style="--d:${d}ms;--len:${Math.ceil(2 * (w + h)) + 2}"/>`);
  const circulo = (cx, cy, r, clase, d) =>
    t.push(`<circle class="${clase}" cx="${cx}" cy="${cy}" r="${r}" ` +
           `style="--d:${d}ms;--len:${Math.ceil(2 * Math.PI * r) + 2}"/>`);
  const texto = (x, y, s, clase, d, anchor = 'middle') =>
    t.push(`<text class="${clase}" x="${x}" y="${y}" text-anchor="${anchor}" style="--d:${d}ms">${s}</text>`);

  // ── 1. Papel (0-500 ms) ────────────────────────────────────────────────
  // Sólo dentro de la caja: fuera de ella el `meet` no la enseña nunca y serían
  // más de cien líneas creadas para nada.
  for (let x = Math.ceil(BX / M) * M; x <= BX + BW; x += M)
    linea(x, BY, x, BY + BH, 'pl-malla', ((x - BX) / BW) * 420 | 0);
  for (let y = Math.ceil(BY / M) * M; y <= BY + BH; y += M)
    linea(BX, y, BX + BW, y, 'pl-malla', ((y - BY) / BH) * 420 | 0);

  // ── 2. Ejes y terreno (500-1100 ms) ────────────────────────────────────
  // El eje baja de la azotea a su círculo de registro: ahí está la respuesta a
  // "los trazos no dan a ningún lado". Cada uno sale de un punto y llega a otro.
  EJES.forEach((x, i) => {
    const d = 520 + i * 90;
    linea(x, NIVEL[NIVEL.length - 1] - 60, x, CEJE - 20, 'pl-eje', d);
    circulo(x, CEJE, 18, 'pl-eje', d + 120);
    texto(x, CEJE + 7, LETRAS[i], 'pl-txt pl-txt--eje', d + 260);
  });
  // Terreno: la línea de la que cuelga todo lo demás
  linea(720, NPT, 1400, NPT, 'pl-terreno', 900);
  for (let x = 736; x < 1400; x += 26) linea(x, NPT, x - 14, NPT + 14, 'pl-hatch', 960 + (x - 736) * 1.1 | 0);

  // ── 3. Zapatas (1150-1500 ms) ──────────────────────────────────────────
  EJES.forEach((x, i) => {
    const d = 1150 + i * 90;
    caja(x - ZAP / 2, NPT, ZAP, 46, 'pl-obra', d);
    // Dado de arranque: el escalón entre zapata y columna
    caja(x - COL, NPT - 22, COL * 2, 22, 'pl-obra', d + 90);
  });
  // Contratrabe: liga las zapatas entre sí, como en obra
  linea(EJES[0], NPT + 30, EJES[3], NPT + 30, 'pl-armado', 1560);

  // ── 4. Columnas, nivel por nivel (1550-2400 ms) ────────────────────────
  // Suben de abajo hacia arriba, que es como se cuela.
  for (let p = 0; p < NIVEL.length - 1; p++) {
    const abajo = NIVEL[p], arriba = NIVEL[p + 1];
    EJES.forEach((x, i) => {
      const d = 1550 + p * 280 + i * 70;
      linea(x - COL / 2, abajo, x - COL / 2, arriba, 'pl-obra', d);
      linea(x + COL / 2, abajo, x + COL / 2, arriba, 'pl-obra', d);
      // Estribos: el detalle que hace que se lea "armado" y no "caja"
      for (let y = abajo - 28; y > arriba + 8; y -= 28)
        linea(x - COL / 2, y, x + COL / 2, y, 'pl-armado', d + 200);
    });
    // Trabe del nivel de arriba, ya con las columnas puestas
    const dt = 1550 + p * 280 + 210;
    caja(EJES[0] - COL / 2, arriba - TRABE, EJES[3] - EJES[0] + COL, TRABE, 'pl-obra', dt);
  }

  // ── 5. Losa de azotea y pretil (2450-2700 ms) ──────────────────────────
  const top = NIVEL[NIVEL.length - 1];
  linea(EJES[0] - 60, top - TRABE, EJES[3] + 60, top - TRABE, 'pl-obra', 2450);
  linea(EJES[0] - 60, top - TRABE - 12, EJES[3] + 60, top - TRABE - 12, 'pl-obra', 2520);
  // Pretiles: rematan el volumen para que no termine en una línea suelta
  linea(EJES[0] - 60, top - TRABE - 12, EJES[0] - 60, top - TRABE - 42, 'pl-obra', 2580);
  linea(EJES[3] + 60, top - TRABE - 12, EJES[3] + 60, top - TRABE - 42, 'pl-obra', 2580);
  // Nada de línea de pendiente de azotea: con la caída que le toca a esta
  // escala no se lee como pendiente, se lee como un trazo chueco.

  // ── 6. Cotas (2700-3200 ms) ────────────────────────────────────────────
  // Verticales: entre niveles, a la DERECHA de la obra. Del lado izquierdo
  // caían encima del titular y competían con él.
  linea(CX, top - TRABE, CX, NPT, 'pl-cota', 2700);
  NIVEL.forEach((y, i) => {
    const d = 2760 + i * 70;
    linea(CX - 11, y, CX + 11, y, 'pl-cota', d);
    linea(EJES[3] + COL / 2, y, CX, y, 'pl-cota pl-cota--guia', d);
    texto(CX + 18, y - 7, ALTURA[i], 'pl-txt', d + 120, 'start');
  });
  // Horizontales: la crujía entre ejes, abajo
  EJES.forEach((x, i) => {
    if (i === EJES.length - 1) return;
    const d = 3000 + i * 80;
    linea(x, CY, EJES[i + 1], CY, 'pl-cota', d);
    linea(x, CY - 9, x, CY + 9, 'pl-cota', d);
    linea(EJES[i + 1], CY - 9, EJES[i + 1], CY + 9, 'pl-cota', d);
    texto((x + EJES[i + 1]) / 2, CY - 13, '6.00', 'pl-txt', d + 100);
  });

  // Sello de plano, como en la portada del manual. Va arriba de la azotea y no
  // abajo, donde se encimaba con el "SCROLL" del pie de la portada.
  texto(EJES[0], 205, 'ESC 1:100', 'pl-txt pl-txt--sello', 3200, 'start');

  plano.innerHTML =
    `<svg viewBox="0 0 ${VX} ${VY}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${t.join('')}</svg>`;

  /* Encuadre. El svg se recorta a la caja de la obra y va con `meet`, nunca con
     `slice` sobre el viewBox entero. Con `slice` el dibujo se estira a todo el
     hueco y cuánto se ve depende de la forma de la ventana: en una pantalla
     apaisada la línea de terreno se metía debajo del botón "Ver proyectos".
     Con `meet` sobre la caja el alzado entra completo y se queda dentro de su
     contenedor, que el CSS coloca fuera de la columna de texto.
     De 1100 px para abajo el CSS lo oculta, así que no hay caso angosto. */
  const svgPlano = $('svg', plano);
  svgPlano.setAttribute('viewBox', `${BX} ${BY} ${BW} ${BH}`);
  svgPlano.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Con movimiento reducido el plano ya aparece dibujado, sin animación
  plano.classList.add(CALMA ? 'listo' : 'trazando');
}

function heroIntro() {
  if (!hero) return;              // las páginas interiores llevan .phero, no .hero
  hero.classList.add('lit');
  if (!GS || CALMA) { $$('[data-hero]').forEach(el => gsapless(el)); return; }

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('[data-hero="1"]', { y: 20, autoAlpha: 0, duration: .7 })
    .from('[data-hero="2"]', { yPercent: 118, duration: 1.05, stagger: .09 }, '-=.35')
    .from('[data-hero="3"]', { y: 26, autoAlpha: 0, duration: .8, stagger: .1 }, '-=.55')
    .from('[data-hero="4"]', { y: 20, autoAlpha: 0, duration: .8 }, '-=.5')
    .from('.hero__cue',      { autoAlpha: 0, duration: .6 }, '-=.4');

  // Sólo cuando el fondo es foto fija: el video del inicio ya se acerca solo.
  // Hijo directo: así no toma el <img> de respaldo que va dentro del <video>.
  const fondo = $('.hero__media > img');
  if (fondo) gsap.fromTo(fondo, { scale: 1.18 }, { scale: 1.06, duration: 2.6, ease: 'power2.out' });
}
function gsapless(el) { el.style.opacity = 1; el.style.transform = 'none'; }

// El script va al final del body, así que el DOM ya está listo.
requestAnimationFrame(heroIntro);

/* ─────────────────────────────────────────────
   4 · Header, progreso y navegación
   ───────────────────────────────────────────── */
const header = $('#header'), barra = $('#scrollProgress'), nav = $('#nav'), burger = $('#burger');
let prevY = 0;

addEventListener('scroll', () => {
  const y = scrollY;
  header.classList.toggle('solid', y > 40);
  header.classList.toggle('up', y > 560 && y > prevY && !nav.classList.contains('open'));
  prevY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
}, { passive: true });

/* Scrim: fondo oscuro que se inyecta una sola vez y cierra el menú al tocarlo. */
const scrim = document.createElement('div');
scrim.className = 'nav-scrim';
document.body.appendChild(scrim);

function menu(abierto) {
  nav.classList.toggle('open', abierto);
  scrim.classList.toggle('on', abierto);
  burger.classList.toggle('on', abierto);
  // Quita el backdrop-filter del header mientras el menú está abierto (ver CSS)
  header.classList.toggle('nav-open', abierto);
  burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  burger.setAttribute('aria-expanded', abierto);
  document.body.style.overflow = abierto ? 'hidden' : '';
}

burger.addEventListener('click', () => menu(!nav.classList.contains('open')));
scrim.addEventListener('click', () => menu(false));
// `.nav a` y no `.nav__link`: en móvil los enlaces del submenú también cierran.
$$('.nav a').forEach(a => a.addEventListener('click', () => menu(false)));

/* Botones en táctil: sin cursor no hay hover, así que el destello se lanza al
   tocar. Se quita la clase antes de volver a ponerla para reiniciar el barrido
   cuando se toca dos veces seguidas. */
if (!HOVER) {
  $$('.btn').forEach(b => b.addEventListener('touchstart', () => {
    b.classList.remove('tocado');
    void b.offsetWidth;
    b.classList.add('tocado');
    setTimeout(() => b.classList.remove('tocado'), 780);
  }, { passive: true }));
}

/* Botones magnéticos: mientras el cursor está encima, el botón lo sigue. Se le
   suma la elevación para que no se pierda al escribir el transform en línea.
   Sólo con ratón: en táctil no hay puntero al que seguir. */
if (HOVER) {
  // Con topes: en los botones anchos el desplazamiento libre se iba a casi
  // 30px y el botón daba tirones al mover el cursor.
  const tope = (v, m) => v < -m ? -m : v > m ? m : v;
  $$('.btn').forEach(b => {
    b.addEventListener('mouseenter', () => b.classList.add('iman'));
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      const x = tope((e.clientX - r.left - r.width / 2) * .12, 9);
      const y = tope((e.clientY - r.top - r.height / 2) * .18, 5) - 3;
      b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    b.addEventListener('mouseleave', () => {
      b.classList.remove('iman');
      b.style.transform = '';
    });
  });
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && nav.classList.contains('open')) menu(false);
});

/* El sitio es de varias páginas: el enlace activo del menú ya viene marcado en
   el HTML de cada página (class="nav__link on" + aria-current). Aquí no se toca. */

/* ─────────────────────────────────────────────
   4.4 · El panal del cierre se construye
   La retícula del fondo es una imagen repetida y no se puede animar trazo a
   trazo, así que se cambia por una malla de hexágonos en SVG. Se arma aquí
   para no cargar el HTML con casi trescientos paths.
   ───────────────────────────────────────────── */
const panal = $('.cta__panal');
if (panal && !CALMA) {
  const lado = 48;
  const ancho = Math.sqrt(3) * lado;   // ancho del hexágono de punta arriba
  const paso = 1.5 * lado;             // separación entre filas
  const vbX = 1600, vbY = 900;
  const cols = Math.ceil(vbX / ancho) + 1;
  const filas = Math.ceil(vbY / paso) + 1;

  const hexágono = (cx, cy) => {
    const m = ancho / 2, r = lado / 2;
    return `M${cx} ${cy - lado}L${cx + m} ${cy - r}L${cx + m} ${cy + r}` +
           `L${cx} ${cy + lado}L${cx - m} ${cy + r}L${cx - m} ${cy - r}Z`;
  };

  const trazos = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      const cx = (c * ancho + (f % 2 ? ancho / 2 : 0)).toFixed(1);
      const cy = (f * paso).toFixed(1);
      // Se levanta de abajo hacia arriba y de izquierda a derecha
      const espera = (filas - 1 - f) * 70 + c * 22;
      trazos.push(`<path d="${hexágono(+cx, +cy)}" style="animation-delay:${espera}ms"/>`);
    }
  }
  panal.innerHTML =
    `<svg viewBox="0 0 ${vbX} ${vbY}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${trazos.join('')}</svg>`;
  panal.classList.add('con-svg');

  // Se dibuja cuando la sección aparece, no antes
  new IntersectionObserver((es, io) => es.forEach(e => {
    if (!e.isIntersecting) return;
    panal.classList.add('construido');
    io.disconnect();
  }), { threshold: .15 }).observe(panal.closest('.cta') || panal);
}

/* ─────────────────────────────────────────────
   4.5 · Parallax de fondos
   Las capas marcadas se mueven más despacio que la página. Van un poco más
   altas que su hueco, así el desplazamiento nunca descubre el borde.
   ───────────────────────────────────────────── */
if (!CALMA) {
  const capas = $$('[data-parallax]');
  if (capas.length) {
    let pedido = false;
    const pintar = () => {
      pedido = false;
      capas.forEach(c => {
        const zona = c.closest('.hero, .phero, .cta') || c.parentElement;
        const r = zona.getBoundingClientRect();
        // -1 cuando la zona viene subiendo, +1 cuando ya se fue. Se acota y se
        // calcula siempre, también fuera de pantalla: así al entrar ya viene
        // colocada y no pega un salto.
        const bruto = (r.top + r.height / 2 - innerHeight / 2) / ((innerHeight + r.height) / 2);
        const p = Math.max(-1, Math.min(1, bruto));
        c.style.transform = `translate3d(0,${(-p * 8).toFixed(2)}%,0)`;
      });
    };
    const alPasar = () => { if (!pedido) { pedido = true; requestAnimationFrame(pintar); } };
    addEventListener('scroll', alPasar, { passive: true });
    addEventListener('resize', alPasar, { passive: true });
    pintar();
  }
}

/* ─────────────────────────────────────────────
   5 · Reveals genéricos
   ───────────────────────────────────────────── */
/* Disparamos con IntersectionObserver, no con ScrollTrigger: así también entra
   bien si se llega con #ancla, con el scroll restaurado o de un salto. */
const ioRev = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  el.classList.add('in');
  ioRev.unobserve(el);
  // Sin clearProps: el estado inicial vive en el CSS y volvería a esconder el elemento.
  if (GS && !CALMA) gsap.to(el, { y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out' });
}), { rootMargin: '0px 0px -8% 0px', threshold: .01 });
$$('[data-reveal]').forEach(el => ioRev.observe(el));

/* ─────────────────────────────────────────────
   6 · Colado — las fotos se llenan como concreto
   ───────────────────────────────────────────── */
const ioPour = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); ioPour.unobserve(e.target); }
}), { threshold: .22 });
$$('.pour').forEach(el => ioPour.observe(el));

/* ─────────────────────────────────────────────
   7 · Volumetría 3D de Nosotros
   El parallax ASIGNA el ángulo, no lo suma: mover el mouse inclina el conjunto
   y regresa al soltarlo. (Sumarlo, como venía en el original, cambia la
   velocidad de giro de forma permanente.)
   ───────────────────────────────────────────── */
const ciudad = $('#ciudad');
if (ciudad) {
  if (HOVER && !CALMA) {
    ciudad.addEventListener('pointermove', e => {
      const r = ciudad.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      ciudad.style.setProperty('--ty', ( x * 18).toFixed(1) + 'deg');
      ciudad.style.setProperty('--tx', (-y * 11).toFixed(1) + 'deg');
    });
    ciudad.addEventListener('pointerleave', () => {
      ciudad.style.setProperty('--ty', '0deg');
      ciudad.style.setProperty('--tx', '0deg');
    });
  }
  // Fuera de pantalla no tiene caso seguir girando
  new IntersectionObserver(es => es.forEach(e => {
    ciudad.classList.toggle('quieta', !e.isIntersecting);
  }), { threshold: .05 }).observe(ciudad);
}

/* ─────────────────────────────────────────────
   7b · El plano que enmarca la volumetría
   `planoMarca` y no `marca`: ese nombre ya lo usa la marca de agua del hero.
   ───────────────────────────────────────────── */
const planoMarca = $('#marca');
if (planoMarca) {
  new IntersectionObserver((es, obs) => es.forEach(e => {
    if (!e.isIntersecting) return;
    planoMarca.classList.add('in');
    obs.unobserve(e.target);
  }), { threshold: .25 }).observe(planoMarca);
}

/* ─────────────────────────────────────────────
   8 · Proceso — scroll horizontal fijado
   ───────────────────────────────────────────── */
const pin = $('#procesoPin'), track = $('#procesoTrack'), fill = $('#procesoFill');
if (GS && !CALMA && track && innerWidth > 860) {
  const recorrido = () => track.scrollWidth - innerWidth + innerWidth * 0.06;
  gsap.to(track, {
    x: () => -recorrido(), ease: 'none',
    scrollTrigger: {
      trigger: pin, start: 'top top', end: () => '+=' + recorrido(),
      pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: self => { if (fill) fill.style.width = (self.progress * 100).toFixed(1) + '%'; }
    }
  });
} else if (track) {
  // Sin pin: el proceso se recorre con el dedo. El carril es su propio viewport,
  // así que el colado de esas fotos se observa dentro de él y no contra la página.
  track.classList.add('libre');
  if (fill) fill.style.width = '100%';
  const ioTrack = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); ioTrack.unobserve(e.target); }
  }), { root: track, threshold: .2 });
  $$('.pour', track).forEach(el => { ioPour.unobserve(el); ioTrack.observe(el); });
}

/* ─────────────────────────────────────────────
   9 · Servicios — colado escalonado de la cuadrícula
   Antes iban en un carril horizontal; ahora en cuadrícula, así que el
   retardo se reinicia en cada fila.
   ───────────────────────────────────────────── */
$$('.servs .serv').forEach((t, i) => {
  const img = $('.pour img', t);   // la transición vive en la <img>
  if (img) img.style.transitionDelay = (i % 4) * 0.09 + 's';
});

/* ─────────────────────────────────────────────
   10 · Contadores
   ───────────────────────────────────────────── */
const ioCount = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, meta = +el.dataset.to, t0 = performance.now(), dur = 1600;
  (function paso(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * meta);
    if (p < 1) requestAnimationFrame(paso);
  })(t0);
  ioCount.unobserve(el);
}), { threshold: .6 });
$$('.count').forEach(el => ioCount.observe(el));

/* ─────────────────────────────────────────────
   11 · Radar de cobertura
   ───────────────────────────────────────────── */
const radar = $('#radar');
if (radar) {
  medir(radar.querySelector('.radar__rings'),  { stagger: .12, dur: 1.1 });
  medir(radar.querySelector('.radar__cross'),  { stagger: .12, dur: 1.0, base: .2 });
  medir(radar.querySelector('.radar__spokes'), { stagger: .05, dur: .7,  base: .5 });
  medir(radar.querySelector('.radar__core'),   { stagger: .1,  dur: .6,  base: .4 });

  // Los puntos van apareciendo uno tras otro cuando el radar entra en pantalla
  const puntos = $$('.pt', radar);
  puntos.forEach((p, i) => { p.style.transitionDelay = (0.7 + i * 0.05) + 's'; });

  new IntersectionObserver((es, obs) => es.forEach(e => {
    if (!e.isIntersecting) return;
    radar.classList.add('in');
    obs.unobserve(e.target);
  }), { threshold: .3 }).observe(radar);

  /* La lista y el radar se señalan entre sí: al posar el cursor sobre un
     estado de la lista se resalta su punto, y al revés. Es la única forma de
     poner nombre a 21 puntos sin que las etiquetas se encimen. */
  const porEstado = new Map(puntos.map(p => [p.dataset.st, p]));
  const radiales  = new Map($$('.radar__spokes line', radar).map(l => [l.dataset.st, l]));
  $$('.es').forEach(item => {
    const punto = porEstado.get(item.dataset.st);
    if (!punto) return;
    const linea = radiales.get(item.dataset.st);
    const marcar = on => {
      punto.classList.toggle('on', on);
      item.classList.toggle('on', on);
      linea?.classList.toggle('on', on);   // se enciende también su radial
      // el delay de entrada estorbaría al resaltar; se quita al primer uso
      punto.style.transitionDelay = '0s';
    };
    item.addEventListener('mouseenter', () => marcar(true));
    item.addEventListener('mouseleave', () => marcar(false));
    punto.addEventListener('mouseenter', () => marcar(true));
    punto.addEventListener('mouseleave', () => marcar(false));
  });
}

/* ─────────────────────────────────────────────
   12 · Filtros de portafolio
   ───────────────────────────────────────────── */
const obras = $$('.obra');
$$('.filtro').forEach(btn => btn.addEventListener('click', () => {
  $$('.filtro').forEach(b => b.classList.remove('is-on'));
  btn.classList.add('is-on');
  const f = btn.dataset.f;
  obras.forEach(o => {
    const ver = f === 'todos' || o.dataset.cat === f;
    o.classList.toggle('hide', !ver);
    if (ver) {
      o.style.opacity = 0; o.style.transform = 'translateY(18px)';
      requestAnimationFrame(() => {
        o.style.transition = 'opacity .5s var(--ease), transform .5s var(--ease)';
        o.style.opacity = 1; o.style.transform = 'none';
      });
    }
  });
  if (GS) ScrollTrigger.refresh();
}));

/* ─────────────────────────────────────────────
   13 · Lightbox de obra
   ───────────────────────────────────────────── */
const lb = $('#lb');
let ultimoFoco = null;

if (lb) {
obras.forEach(o => o.addEventListener('click', () => {
  ultimoFoco = o;
  const img = $('img', o);
  $('#lbImg').src = img.src;
  $('#lbImg').alt = img.alt;

  /* Galería: las obras con varias fotos las declaran en data-fotos, separadas
     por coma, y cada una lleva su texto alternativo después de una barra. Las
     que traen una sola foto no muestran miniaturas. */
  const tiras = $('#lbTiras');
  const fotos = (o.dataset.fotos || '').split(',').filter(Boolean).map(f => f.split('|'));
  tiras.innerHTML = '';
  tiras.hidden = fotos.length < 2;
  if (!tiras.hidden) {
    $('#lbImg').src = fotos[0][0];
    $('#lbImg').alt = fotos[0][1] || '';
    fotos.forEach(([src, alt], i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lb__tira' + (i ? '' : ' on');
      b.setAttribute('aria-label', `Ver foto ${i + 1} de ${fotos.length}`);
      b.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
      b.addEventListener('click', () => {
        $('#lbImg').src = src;
        $('#lbImg').alt = alt || '';
        $$('.lb__tira', tiras).forEach(x => x.classList.remove('on'));
        b.classList.add('on');
      });
      tiras.appendChild(b);
    });
  }
  $('#lbCat').textContent   = $('.obra__cat', o).textContent;
  $('#lbTitle').textContent = $('h3', o).textContent;
  $('#lbDesc').textContent  = o.dataset.desc;
  // Sólo mostramos los datos que el cliente confirmó: si viene vacío, se oculta
  // la ficha completa en vez de dejar un renglón en blanco.
  [['#lbLugar', o.dataset.lugar], ['#lbAnio', o.dataset.anio], ['#lbAlcance', o.dataset.alcance]]
    .forEach(([sel, val]) => {
      const dd = $(sel);
      dd.textContent = val || '';
      dd.closest('div').hidden = !val;
    });
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('.lb__x', lb).focus();
}));

function cerrarLb() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (ultimoFoco) ultimoFoco.focus?.();
}
$$('[data-close]', lb).forEach(el => el.addEventListener('click', cerrarLb));
addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) cerrarLb(); });
}   // fin: sólo la página de proyectos trae lightbox

/* ─────────────────────────────────────────────
   14 · Video sólo cuando se ve
   ───────────────────────────────────────────── */
// Con movimiento reducido no se reproduce nada: se queda el póster.
// El video del inicio pesa más de un mega y antes se bajaba de inmediato, lo
// que retrasaba la carga de toda la página. Ahora se espera a que la página
// termine y se salta con el ahorro de datos activado: queda el póster, que se
// precarga con prioridad y se ve igual.
if (!CALMA && !(navigator.connection && navigator.connection.saveData)) {
  const verVideos = () => {
    const ioVid = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; v.play?.().catch(() => {}); }
      else v.pause?.();
    }), { threshold: .25 });
    $$('video').forEach(v => ioVid.observe(v));
  };
  if (document.readyState === 'complete') verVideos();
  else addEventListener('load', verVideos, { once: true });
}

/* ─────────────────────────────────────────────
   15 · Formulario de contacto

   Manda a una Edge Function de Supabase que GUARDA EN BASE DE DATOS
   primero y notifica por correo despues. Asi, si el correo falla, el
   prospecto no se pierde: queda registrado de todos modos.
   ───────────────────────────────────────────── */
const ENDPOINT = 'https://ajekywhnuepmqbxflala.supabase.co/functions/v1/krol-contacto';
const WHATSAPP = 'https://wa.me/523324093470';

const form = $('#form');
if (form) {
  const ok  = $('#formOk');
  const err = $('#formErr');
  const btn = $('button[type="submit"]', form);
  const textoBtn = btn ? btn.textContent : '';
  let enviando = false;

  const avisar = (el, msg) => {
    if (!el) return;
    if (msg) el.innerHTML = msg;
    el.classList.add('show');
  };
  const limpiarAvisos = () => {
    ok?.classList.remove('show');
    err?.classList.remove('show');
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (enviando) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    limpiarAvisos();
    enviando = true;
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    const d = new FormData(form);
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:   d.get('nombre'),
          telefono: d.get('telefono'),
          correo:   d.get('correo'),
          tipo:     d.get('tipo'),
          zona:     d.get('zona'),
          mensaje:  d.get('mensaje'),
          website:  d.get('website'),   // trampa antibots: debe ir vacia
          origen:   location.href,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || ('HTTP ' + r.status));

      avisar(ok);
      form.reset();
      setTimeout(() => ok?.classList.remove('show'), 8000);
    } catch (e2) {
      console.error('Error al enviar el formulario:', e2);
      // Nunca dejamos al prospecto sin salida: se le ofrece WhatsApp.
      avisar(err,
        'No se pudo enviar la solicitud. Escríbenos por ' +
        '<a href="' + WHATSAPP + '" target="_blank" rel="noopener">WhatsApp</a> ' +
        'o al <a href="tel:+523324093470">33 2409 3470</a>.');
    } finally {
      enviando = false;
      if (btn) { btn.disabled = false; btn.textContent = textoBtn; }
    }
  });
}

/* ─────────────────────────────────────────────
   16 · Recalcular al terminar de cargar todo
   ───────────────────────────────────────────── */
addEventListener('load', () => { if (GS) ScrollTrigger.refresh(); });
