# KROL Edificación Estructural — demo web

Demo de sitio (5 páginas) para **KROL Edificación Estructural S.A. de C.V.** (Guadalajara, Jal.)
Preparado por **Vonoa Web** · julio 2026.

---

## Concepto: “Del trazo a la obra”

El isotipo de KROL ya es un dibujo técnico, así que ese es el hilo de todo el sitio:
**cada cosa entra como trazo y termina como obra colada.**

**No hay pantalla de carga**: el sitio entra directo al hero. Se probó una y se descartó
(hacía esperar sin dar nada a cambio, sobre todo abriendo desde el celular).

| Momento | Qué pasa |
|---|---|
| Hero | **Video de fondo** con acercamiento lento a una casa de concreto aparente, en ciclo de ida y vuelta para que no dé el salto seco al repetir. Encima aparece un plano: retícula, ejes y **cotas acotadas con datos reales** (13 años, 7 estados). El titular entra por palabras enmascaradas. |
| Nosotros | El isotipo **se dibuja solo** al entrar en pantalla, como plóter: ejes, copa y torres en ~1.3s. (Antes iba amarrado al scroll y quedaba a medias si te parabas ahí.) |
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

Cinco páginas, no un one-page:

```
krol-demo/
├── index.html          # Inicio: hero, resumen + cifras, servicios, obra destacada
├── nosotros.html       # historia, misión/visión, capacidad, flota, cobertura
├── servicios.html      # los 8 servicios + el proceso de obra
├── proyectos.html      # portafolio con filtros y ficha ampliada + video de obra
├── contacto.html       # datos y formulario
├── css/styles.css      # variables de marca arriba del todo
├── js/main.js          # bloques numerados y comentados
├── img/                # fotos de obra + logo + posters de video
└── video/              # dobladora, flota, pickup, camión, escalera
```

**El encabezado y el pie están repetidos en las cinco páginas** (no hay build ni
includes: es HTML plano para que GitHub Pages lo sirva tal cual y se pueda editar
a mano). Si cambia el teléfono, el correo o un enlace del menú, hay que tocarlo en
los cinco archivos. El enlace activo del menú va marcado en el HTML de cada página
con `class="nav__link on"` y `aria-current="page"`; el JS no lo toca.

### Videos

Todos salen del material del cliente, recortados y recomprimidos para web:

| Archivo | Dónde | Qué es |
|---|---|---|
| `dobladora.mp4` | nosotros | dobladora de varilla en el taller propio |
| `flota.mp4` | nosotros | las unidades KROL formadas |
| `pickup.mp4` | nosotros | pickup rotulada en carretera |
| `camion.mp4` | nosotros + CTA | camión de material |
| `escalera.mp4` | proyectos | escalera de concreto terminada en una agencia |
| `hero.mp4` | inicio | fondo del hero: acercamiento a la casa de concreto |

Todos van `muted loop playsinline` con `preload="none"`: no descargan nada hasta
que la sección entra en pantalla, y se pausan al salir.

Peso total ≈ 12 MB repartido entre cinco páginas — ninguna carga más de ~4 MB.

---

## Pendientes antes de publicar

- [ ] Conectar el formulario (hoy sólo muestra confirmación; no envía)
- [ ] Definir dominio: `kroledificacion.com` o `krolconstrucciones.com`
- [ ] Logo vectorizado (hoy se usa PNG) — sigue pendiente del brandbook
- [ ] Fotos del Pingüinario, la escalera helicoidal y la capilla de Tesistán
      (están mencionados en el portafolio pero no tenemos imagen)
- [ ] Logos reales de clientes (hoy van como texto)
- [ ] Google Analytics / Search Console
