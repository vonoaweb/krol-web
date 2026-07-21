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
   2 · Hero — plano que se dibuja + titular
   Sin pantalla de carga: entra de inmediato.
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
   7 · Isotipo que se traza solo al entrar
   Antes iba amarrado al scroll (scrub) y si te parabas a media sección
   el logo quedaba a medias, como un abanico. Ahora arranca al aparecer
   y siempre termina completo: ejes, copa y torres, ~1.3s.
   ───────────────────────────────────────────── */
const isoNos = $('#isoScrub');
if (isoNos) {
  medir(isoNos.querySelector('.iso__guides'), { stagger: .04, dur: .45 });
  medir(isoNos.querySelector('.iso__cup'),    { stagger: .05, dur: .60, base: .18 });
  medir(isoNos.querySelector('.iso__towers'), { stagger: .05, dur: .50, base: .50 });

  if (CALMA) {
    isoNos.classList.add('drawn');
  } else {
    new IntersectionObserver((es, obs) => es.forEach(e => {
      if (!e.isIntersecting) return;
      isoNos.classList.add('drawn');
      obs.unobserve(e.target);
    }), { threshold: .35 }).observe(isoNos);
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
   9 · Servicios — carrusel deslizable
   Sobre scroll nativo con scroll-snap: así funciona con dedo, trackpad,
   teclado y lector de pantalla sin reimplementar nada.
   ───────────────────────────────────────────── */
const pista = $('#carruPista');
if (pista) {
  const prev = $('#carruPrev'), next = $('#carruNext');
  const riel = $('#carruRiel'), acta = $('#carruAct');
  const tarjetas = $$('.serv', pista);
  const paso = () => (tarjetas[1] ? tarjetas[1].offsetLeft - tarjetas[0].offsetLeft : pista.clientWidth);

  function pintar() {
    const max = pista.scrollWidth - pista.clientWidth;
    const x = pista.scrollLeft;
    // Cuántas caben a la vez, para que el riel represente el tramo visible
    const visibles = Math.max(1, Math.round(pista.clientWidth / paso()));
    const ancho = Math.min(100, (visibles / tarjetas.length) * 100);
    riel.style.width = ancho + '%';
    riel.style.transform = `translateX(${max > 0 ? (x / max) * (100 / ancho) * (100 - ancho) : 0}%)`;

    const i = max > 0 ? Math.round(x / paso()) : 0;
    acta.textContent = String(Math.min(i + 1, tarjetas.length)).padStart(2, '0');
    prev.disabled = x < 4;
    next.disabled = x > max - 4;
  }

  prev.addEventListener('click', () => pista.scrollBy({ left: -paso() }));
  next.addEventListener('click', () => pista.scrollBy({ left:  paso() }));
  pista.addEventListener('scroll', pintar, { passive: true });
  addEventListener('resize', pintar);
  pintar();

  // Arrastrar con el mouse (en táctil ya lo resuelve el scroll nativo)
  if (HOVER) {
    let abajo = false, x0 = 0, s0 = 0, movido = 0;
    pista.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      abajo = true; movido = 0; x0 = e.clientX; s0 = pista.scrollLeft;
      pista.classList.add('arrastrando');
    });
    pista.addEventListener('pointermove', e => {
      if (!abajo) return;
      const d = e.clientX - x0;
      movido = Math.max(movido, Math.abs(d));
      pista.scrollLeft = s0 - d;
    });
    const soltar = () => {
      if (!abajo) return;
      abajo = false;
      pista.classList.remove('arrastrando');
      // Reencaja en la tarjeta más cercana al soltar
      if (movido > 6) pista.scrollTo({ left: Math.round(pista.scrollLeft / paso()) * paso() });
    };
    pista.addEventListener('pointerup', soltar);
    pista.addEventListener('pointerleave', soltar);
    // Un arrastre no debe contar como clic en "Cotizar"
    pista.addEventListener('click', e => { if (movido > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  // El colado en cascada: las tarjetas viven en un carril horizontal, así que
  // entran juntas cuando la sección aparece. El retardo escalonado lo disimula.
  tarjetas.forEach((t, i) => {
    const img = $('.pour img', t);   // la transición vive en la <img>, no en el contenedor
    if (img) img.style.transitionDelay = Math.min(i, 4) * 0.09 + 's';
  });
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
