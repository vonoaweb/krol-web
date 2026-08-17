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

/* El plano de obra que iba encima del video de la portada se quitó a
   petición de KROL (nota 3 de su feedback: "quitar diagrama de inicio de
   página"). Eran ~230 trazos animándose sobre un video 1080p, que además
   era lo que trababa la carga. */

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
  const apagar    = [];   // para dejar sólo un estado encendido a la vez
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
    apagar.push(() => marcar(false));

    if (HOVER) {
      item.addEventListener('mouseenter', () => marcar(true));
      item.addEventListener('mouseleave', () => marcar(false));
      punto.addEventListener('mouseenter', () => marcar(true));
      punto.addEventListener('mouseleave', () => marcar(false));
    }
    // En táctil no hay cursor: sin esto la sección quedaba muerta en celular.
    // Se apaga lo demás para que sólo quede encendido el estado tocado.
    const tocar = e => {
      e.stopPropagation();
      const yaEstaba = item.classList.contains('on');
      apagar.forEach(f => f());
      if (!yaEstaba) marcar(true);
    };
    item.addEventListener('click', tocar);
    punto.addEventListener('click', tocar);
  });
  // Tocar fuera apaga la selección
  document.addEventListener('click', () => apagar.forEach(f => f()));
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
const lbImg = $('#lbImg'), lbVid = $('#lbVid');

/* El video se suelta al salir de él, no sólo se pausa: si se queda cargado
   sigue corriendo detrás de la foto siguiente y mantiene el archivo en memoria
   aunque la ficha ya se haya cerrado. */
function soltarVideo() {
  if (lbVid.hidden) return;
  lbVid.pause();
  lbVid.removeAttribute('src');
  lbVid.load();
  lbVid.hidden = true;
}

/* Pone en el hueco grande la pieza que toca, sea foto o video. */
function verPieza([src, alt, poster]) {
  if (/\.mp4$/i.test(src)) {
    lbVid.poster = poster || '';
    lbVid.src = src;
    lbVid.hidden = false;
    lbImg.hidden = true;
    // Con movimiento reducido no arranca solo: se queda el póster.
    if (!CALMA) lbVid.play().catch(() => {});
  } else {
    soltarVideo();
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbImg.hidden = false;
  }
}

obras.forEach(o => o.addEventListener('click', () => {
  ultimoFoco = o;
  const img = $('img', o);
  verPieza([img.src, img.alt]);

  /* Galería: las obras con varias piezas las declaran en data-fotos, separadas
     por coma, y cada una lleva su texto alternativo después de una barra. Si la
     pieza es un .mp4, el tercer campo es el póster —y es lo que se ve en la
     miniatura, porque un video no sirve de miniatura—. Las obras de una sola
     pieza no muestran miniaturas. */
  const tiras = $('#lbTiras');
  const piezas = (o.dataset.fotos || '').split(',').filter(Boolean).map(f => f.split('|'));
  tiras.innerHTML = '';
  tiras.hidden = piezas.length < 2;
  if (!tiras.hidden) {
    verPieza(piezas[0]);
    piezas.forEach((pieza, i) => {
      const [src, , poster] = pieza;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lb__tira' + (i ? '' : ' on');
      b.setAttribute('aria-label', `Ver ${i + 1} de ${piezas.length}`);
      b.innerHTML = `<img src="${poster || src}" alt="" loading="lazy" />`;
      b.addEventListener('click', () => {
        verPieza(pieza);
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
  soltarVideo();
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
