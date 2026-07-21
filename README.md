# KROL Edificación Estructural — demo web

Demo de sitio para **KROL Edificación Estructural S.A. de C.V.** (Guadalajara, Jal.)
Preparado por **Vonoa Web** · julio 2026.

---

## Concepto: “Del trazo a la obra”

El isotipo de KROL ya es un dibujo técnico, así que ese es el hilo de todo el sitio:
**cada cosa entra como trazo y termina como obra colada.**

**No hay pantalla de carga**: el sitio entra directo al hero. Se probó una y se descartó
(hacía esperar sin dar nada a cambio, sobre todo abriendo desde el celular).

| Momento | Qué pasa |
|---|---|
| Hero | Sobre la foto real aparece un plano: retícula, ejes y **cotas acotadas con datos reales** (13 años, 7 estados). El titular entra por palabras enmascaradas. |
| Nosotros | El isotipo se **traza con el scroll** (scrub): avanzas y el dibujo se completa. |
| Servicios | **Carrusel deslizable** con foto real de obra por servicio: 3 tarjetas en escritorio, 2 en tablet, 1 con asomo en celular. Flechas, contador, riel de avance, arrastre con mouse y deslizado con el dedo. |
| Proceso | **Scroll horizontal fijado (pin)**: las 4 etapas se recorren en horizontal mientras la sección queda clavada. En móvil pasa a carrusel con el dedo. |
| Fotos | Reveal **“colado”**: la imagen se llena de abajo hacia arriba, como concreto, con una línea naranja de remate. |
| Cobertura | Radar técnico centrado en Guadalajara. Cada estado está en su **posición geográfica real** respecto a GDL. En móvil se convierte en listado. |

El carrusel va montado sobre **scroll nativo con `scroll-snap`**, no sobre un slider de
`transform`: así funciona de gratis con dedo, trackpad, teclado y lector de pantalla.

Nada de adornos genéricos: sin cursor personalizado, sin partículas, sin degradados de moda.
Todo el movimiento sale del lenguaje de la marca (plano, cimbra, colado, franja de obra).

---

## Marca

Colores y tipografías tomados **tal cual del Manual de Marca KROL v3** ya entregado al cliente:

```
--naranja  #FF751F     --tinta    #171512     --concreto #E5E1DA
--nar-osc  #D45C0F     --fondo    #14100C     --papel    #F7F5F2
--acero    #55524E     --cimbra   #A8A39B     --linea    #D9D4CD
```

- **Michroma** — etiquetas técnicas
- **Barlow Condensed** — titulares
- **Black Ops One** — números e índices
- **Barlow** — texto corrido

---

## Contenido

Todo el texto sale del **cuestionario contestado el 15 de julio de 2026** y del portafolio
del cliente: historia, misión, visión, zonas de cobertura, proyectos (O'Reilly, agencias
automotrices, muros de concreto, ejecución especializada) y clientes reales
(Amazon, Mercado Libre, SERSAC, Hemisferia Optimus, Creacción, Berkana).

Las fotos y los videos son material propio de KROL, optimizados para web.

---

## Correr el proyecto

```bash
python -m http.server 8021 --directory krol-demo
```

Y abrir <http://localhost:8021>. También está dado de alta como `krol-web` en
`.claude/launch.json` de la carpeta padre.

Es HTML/CSS/JS plano, sin build. GSAP + ScrollTrigger entran por CDN y **el sitio
degrada bien si no cargan** (los reveals caen a IntersectionObserver).

---

## Estructura

```
krol-demo/
├── index.html          # una sola página, secciones con id
├── css/styles.css      # variables de marca arriba del todo
├── js/main.js          # 16 bloques numerados y comentados
├── img/                # fotos de obra + logo + posters de video
└── video/              # dobladora (taller propio) y camión (flota)
```

Peso total ≈ 6.9 MB, casi todo imagen. El video carga con `preload="none"`
y sólo se reproduce cuando entra en pantalla.

---

## Pendientes antes de publicar

- [ ] Conectar el formulario (hoy sólo muestra confirmación; no envía)
- [ ] Definir dominio: `kroledificacion.com` o `krolconstrucciones.com`
- [ ] Logo vectorizado (hoy se usa PNG) — sigue pendiente del brandbook
- [ ] Fotos del Pingüinario, la escalera helicoidal y la capilla de Tesistán
      (están mencionados en el portafolio pero no tenemos imagen)
- [ ] Logos reales de clientes (hoy van como texto)
- [ ] Google Analytics / Search Console
