/* ══════════════════════════════════════════════════════════════
   KROL EDIFICACIÓN ESTRUCTURAL — Demo por Vonoa Web
   "Del trazo a la obra": todo entra como dibujo técnico y se cola.
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
   2 · Preloader — el isotipo se traza solo
   ───────────────────────────────────────────── */
const pre = $('#preloader');
const preFill = $('#preFill');
const prePct = $('#prePct');
const isoPre = $('.iso--pre');

if (isoPre) {
  medir(isoPre.querySelector('.iso__guides'), { stagger: 0.05, dur: 0.5 });
  medir(isoPre.querySelector('.iso__cup'),    { stagger: 0.06, dur: 0.8, base: 0.25 });
  medir(isoPre.querySelector('.iso__towers'), { stagger: 0.07, dur: 0.7, base: 0.75 });
  requestAnimationFrame(() => isoPre.classList.add('drawn'));
}

let pct = 0;
const tick = setInterval(() => {
  pct = Math.min(pct + Math.random() * 19, 93);
  preFill.style.width = pct + '%';
  prePct.textContent = Math.round(pct);
}, 170);
setTimeout(() => pre.classList.add('lit'), 700);

// El trazado del isotipo dura ~2.1s: no salimos antes de que termine.
const T0 = performance.now();
const MIN_MS = 2300;
let arrancado = false;

function arrancar() {
  if (arrancado) return;
  const falta = MIN_MS - (performance.now() - T0);
  if (falta > 0) { setTimeout(arrancar, falta); return; }
  arrancado = true;
  clearInterval(tick);
  preFill.style.width = '100%';
  prePct.textContent = '100';

  setTimeout(() => pre.classList.add('out'), 380);
  setTimeout(() => {
    pre.classList.add('gone');
    document.body.style.overflow = '';
    heroIntro();
  }, 1050);
  setTimeout(() => { pre.style.display = 'none'; if (GS) ScrollTrigger.refresh(); }, 1900);
}
document.body.style.overflow = 'hidden';
addEventListener('load', arrancar);
setTimeout(arrancar, 4200);          // seguro por si tarda una imagen

/* ─────────────────────────────────────────────
   3 · Hero — plano que se dibuja + titular
   ───────────────────────────────────────────── */
const hero = $('.hero');
const plan = $('#heroPlan');
if (plan) {
  medir(plan.querySelector('.plan-draw'), { stagger: 0.09, dur: 1.1, base: 0.5 });
  medir(plan.querySelector('.plan-tick'), { stagger: 0.08, dur: 0.5, base: 1.3 });
}

function heroIntro() {
  hero.classList.add('lit');
  if (!GS || CALMA) { $$('[data-hero]').forEach(el => gsapless(el)); return; }

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('[data-hero="1"]', { y: 20, autoAlpha: 0, duration: .7 })
    .from('[data-hero="2"]', { yPercent: 118, duration: 1.05, stagger: .09 }, '-=.35')
    .from('[data-hero="3"]', { y: 26, autoAlpha: 0, duration: .8, stagger: .1 }, '-=.55')
    .from('[data-hero="4"]', { y: 20, autoAlpha: 0, duration: .8 }, '-=.5')
    .from('.hero__cue',      { autoAlpha: 0, duration: .6 }, '-=.4');

  gsap.fromTo('.hero__media img', { scale: 1.18 }, { scale: 1.06, duration: 2.6, ease: 'power2.out' });
}
function gsapless(el) { el.style.opacity = 1; el.style.transform = 'none'; }

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

burger.addEventListener('click', () => {
  const abierto = nav.classList.toggle('open');
  burger.classList.toggle('on', abierto);
  burger.setAttribute('aria-expanded', abierto);
  document.body.style.overflow = abierto ? 'hidden' : '';
});
$$('.nav__link').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open'); burger.classList.remove('on');
  burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
}));

const enlaces = $$('.nav__link');
const ioNav = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  enlaces.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => ioNav.observe(s));

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
   7 · Isotipo que se traza con el scroll
   ───────────────────────────────────────────── */
const isoScrub = $('#isoScrub');
if (isoScrub) {
  const trazos = medir(isoScrub, { dur: 0 });
  trazos.forEach(el => el.style.transition = 'none');
  if (GS && !CALMA) {
    gsap.to(trazos, {
      strokeDashoffset: 0, ease: 'none', stagger: { each: .12, from: 'start' },
      scrollTrigger: { trigger: '.nosotros', start: 'top 62%', end: 'center 45%', scrub: .8 }
    });
  } else {
    isoScrub.classList.add('drawn');
    trazos.forEach(el => el.style.strokeDashoffset = 0);
  }
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
   9 · Servicios — miniatura que sigue al cursor
   ───────────────────────────────────────────── */
const idx = $('#idx'), peek = $('#idxPeek'), peekImg = $('#idxPeekImg');
if (idx && peek && HOVER) {
  let px = 0, py = 0, cx = 0, cy = 0, activo = false;

  // El alta va por fila; la baja, al salir de la lista completa: así no parpadea
  // al pasar de un renglón a otro.
  $$('.idx__row', idx).forEach(row => {
    row.addEventListener('mouseenter', () => {
      const src = row.dataset.img;
      if (peekImg.getAttribute('src') !== src) peekImg.src = src;
      peek.classList.add('on'); activo = true;
    });
  });
  idx.addEventListener('mouseleave', () => { peek.classList.remove('on'); activo = false; });

  idx.addEventListener('mousemove', e => {
    const r = idx.getBoundingClientRect();
    px = e.clientX - r.left; py = e.clientY - r.top;
  });

  (function seguir() {
    cx += (px - cx) * .12; cy += (py - cy) * .12;
    if (activo) peek.style.translate = `${cx}px ${cy}px`;
    requestAnimationFrame(seguir);
  })();
}

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
  medir(radar.querySelector('.radar__spokes'), { stagger: .09, dur: .7,  base: .6 });
  medir(radar.querySelector('.radar__core'),   { stagger: .1,  dur: .6,  base: .5 });

  $$('.st', radar).forEach((st, i) => {
    st.style.transitionDelay = (0.9 + i * 0.11) + 's';
    st.style.transform = 'translate(-50%,-50%) scale(.86)';
  });

  new IntersectionObserver((es, obs) => es.forEach(e => {
    if (!e.isIntersecting) return;
    radar.classList.add('in');
    $$('.st', radar).forEach(st => st.style.transform = 'translate(-50%,-50%) scale(1)');
    obs.unobserve(e.target);
  }), { threshold: .3 }).observe(radar);
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

obras.forEach(o => o.addEventListener('click', () => {
  ultimoFoco = o;
  const img = $('img', o);
  $('#lbImg').src = img.src;
  $('#lbImg').alt = img.alt;
  $('#lbCat').textContent   = $('.obra__cat', o).textContent;
  $('#lbTitle').textContent = $('h3', o).textContent;
  $('#lbDesc').textContent  = o.dataset.desc;
  $('#lbLugar').textContent = o.dataset.lugar;
  $('#lbAnio').textContent  = o.dataset.anio;
  $('#lbAlcance').textContent = o.dataset.alcance;
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

/* ─────────────────────────────────────────────
   14 · Video sólo cuando se ve
   ───────────────────────────────────────────── */
const ioVid = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target;
  if (e.isIntersecting) { v.preload = 'auto'; v.play?.().catch(() => {}); }
  else v.pause?.();
}), { threshold: .25 });
$$('video').forEach(v => ioVid.observe(v));

/* ─────────────────────────────────────────────
   15 · Formulario (demo)
   ───────────────────────────────────────────── */
const form = $('#form');
form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  $('#formOk').classList.add('show');
  form.reset();
  setTimeout(() => $('#formOk').classList.remove('show'), 6000);
});

/* ─────────────────────────────────────────────
   16 · Recalcular al terminar de cargar todo
   ───────────────────────────────────────────── */
addEventListener('load', () => { if (GS) ScrollTrigger.refresh(); });
