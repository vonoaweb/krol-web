# KROL · Estado del proyecto

Apunte de traspaso para quien retome esto sin haber estado antes — otra persona,
otro chat, o yo mismo dentro de un mes.
Última actualización: **3 de septiembre de 2026**.

---

## Para arrancar un chat nuevo

Pega esto y el chat nuevo tiene todo lo que necesita:

> Retomo el proyecto de KROL Edificación Estructural, cliente de VonoaWeb.
> Antes de proponer nada, lee `krol-demo/ESTADO-DEL-PROYECTO.md` completo: ahí
> está dónde vive cada cosa, qué material tiene el cliente y en qué carpetas,
> qué decisiones ya se tomaron y por qué, y qué está pendiente.
> Trabaja en `C:\Users\makin\OneDrive\Documentos\Vonoa web\krol-demo`.

Dos avisos que ahorran horas y están explicados abajo: **el material del cliente
está repartido en cuatro carpetas** (revisarlas todas antes de decir que algo
falta) y **en este equipo no hay forma de tomar capturas del navegador**.

---

## Qué es esto

Sitio web de **KROL Edificación Estructural**, constructora de Guadalajara
(estructuras, concreto aparente, obra industrial). Contacto del cliente:
**Héctor**, por WhatsApp.

Sitio estático de varias páginas: HTML, CSS y JS a mano, **sin compilación**
—se edita y se sube—. Animaciones con GSAP + ScrollTrigger, siempre con
degradación: si GSAP no carga, el contenido se ve igual.

Páginas: `index` · `nosotros` · `servicios` · `proyectos` · `contacto` ·
`obra-vertical`.

---

## Dónde está cada cosa

| | |
|---|---|
| Sitio (código) | `krol-demo/` · repo `github.com/vonoaweb/krol-web` |
| Sitio publicado | **https://vonoaweb.github.io/krol-web/** |
| Página "en construcción" | `krol-construccion/` · repo `vonoaweb/krol-construccion` |
| Publicada en | **https://kroledificacion.com** (el dominio del cliente) |
| Material del cliente | `C:\Users\makin\Documents\Vonoa web\Krol constructions\` |
| Manual de marca | ahí mismo: `Manual de Marca KROL v4.html` y `.pdf` (v4 es la buena) |
| Logo vectorizado | `krol-demo/../KROL-logo/` (SVG y PNG) y `Krol constructions\Vectores\` |
| Cambiar qué se ve en el dominio | `krol-dominio.sh sitio` / `construccion` / `estado` |

**Ojo con los dominios.** `kroledificacion.com` y `vonoaweb.com` están los dos en
el Cloudflare de Vonoa. Hoy el dominio del cliente muestra la página "en
construcción" y el sitio real vive en la URL de GitHub.

**El DNS nunca se toca.** GitHub Pages permite que un dominio lo reclame un solo
repo a la vez, así que para cambiar qué se publica basta con mover esa
reclamación de un repo al otro — eso hace el script, en unos minutos y sin tocar
un registro DNS. Mover DNS no hace falta y complica la vuelta atrás.

---

## Cómo verificar cambios en este equipo (lee esto antes de intentarlo)

**El panel de pruebas ya sirve** — el 15-ago funcionó de principio a fin, así que
lo de "no hay forma de tomar capturas" que decía este apunte quedó atrás. La
receta que funcionó:

1. `preview_start` con el nombre **`krol-web`**, que ya está en
   `Vonoa web/.claude/launch.json` (levanta `python -m http.server 8021` sobre
   `krol-demo`). De ahí salen capturas, consola y red.
2. **Servidor sí, `file://` no.** Abriendo el HTML como archivo suelto, el panel
   lo pinta como recorte estático: sin CSS y sin imágenes. Parece que todo está
   roto y no lo está.
3. Las capturas salen **encogidas** cuando el ancho de ventana es grande. Para
   ver detalle conviene el preajuste de móvil (sale a 750 px de ancho) o una
   ventana de 1000 px.

⚠️ **Con el panel oculto no hay capturas — y tampoco hay video.** El 16-ago el
servidor, la consola, la red y el DOM respondieron perfecto, pero cada captura
murió con *"Screenshot timed out: the Browser pane is not displayed"*. La causa
es que `document.visibilityState` vale **`hidden`**, y de ahí salen tres cosas
que parecen fallos y no lo son:

1. No hay capturas: sin composición no hay cuadro que fotografiar.
2. **Los `<video>` no se reproducen.** El navegador suspende el medio en una
   página oculta: se ve `play()` sin error, luego `waiting`, `suspend` y `pause`
   en el segundo cero, **sin que ningún JS haya llamado a `pause()`**. Se
   comprueba envolviendo `HTMLMediaElement.prototype.pause` y mirando la pila.
   Costó un diagnóstico equivocado; que no vuelva a costar otro.
3. No corre el scroll, ni IntersectionObserver, ni las transiciones CSS, ni
   `scrollTo` con `behavior:'smooth'`.

**Lo que sí se puede medir con el panel oculto**: geometría, `naturalWidth`,
clases, atributos, `scrollLeft` asignado a mano, y red con `fetch`.

Y sí: **medir gana a mirar**. Lo más útil sigue siendo preguntarle al DOM:
`getBoundingClientRect()` sobre las tarjetas dice en qué renglón cae cada una y
si la retícula queda con huecos, y `naturalWidth === 0` delata la imagen que no
cargó. Así se validó el portafolio de 12 obras, y así se validaron los videos de
la ficha de El Salto: abrir la ficha desde el propio JS, picar cada miniatura y
preguntar si el `<video>` quedó visible, con qué `src`, si está corriendo
(`paused === false`) y cuánto mide su caja contra la del panel.

Y antes de tocar el navegador:

- **Comprobar por cálculo**, leyendo el HTML ya escrito: que nada se salga del
  marco, que los puntos no se encimen, que las llaves del CSS cuadren. Un
  descuadre de llaves ya rompió media hoja una vez y no se vio hasta contar.
- **Dibujarlo con PIL**: `scratchpad/ver_radar.py` lee la geometría del propio
  HTML y saca un PNG de escritorio y otro de móvil.
- **El visto bueno visual sigue siendo de Fernando.** Hay que pedírselo
  explícitamente y decirle que abra con `Ctrl + Shift + R`, porque la caché de
  GitHub Pages engaña.

No afirmes que algo "ya se ve bien" sin haberlo visto. En este proyecto pasó y
costó rondas.

---

## Formulario de contacto

Antes sólo decía "gracias" y **tiraba los datos a la basura**. Ahora:

```
navegador → Edge Function de Supabase → guarda en BD → notifica por correo
```

| | |
|---|---|
| Endpoint | `https://ajekywhnuepmqbxflala.supabase.co/functions/v1/krol-contacto` |
| Tabla | `public.krol_leads` (con RLS) |
| Correo del cliente | `krol.presupuestos@outlook.com` (verificado y puesto como destinatario el 3-sep) |
| Envío de correo | Web3Forms (dos claves, una por destinatario) |

**Guarda en la base de datos ANTES de intentar el correo**, a propósito: si falla
el envío, el prospecto no se pierde. Lleva trampa antibots (campo oculto
`website`) y, si todo falla, ofrece salida por WhatsApp.

Las claves de Web3Forms van en el código a la vista: **es así por diseño**, son
claves públicas de destinatario, no secretos. El plan gratuito permite un solo
destinatario por formulario, de ahí las dos claves.

**Resuelto el 3-sep.** Héctor verificó `krol.presupuestos@outlook.com` y el
formulario ya le manda a él. Dos cosas que costaron entenderlo y conviene dejar
escritas:

- **El primer enlace de verificación caducó** sin que nadie lo abriera. El
  reenvío **no se pide desde la página pública** de Web3Forms: se entra a
  `app.web3forms.com` → *Account Settings* → **Linked Emails**, y el correo sin
  verificar trae su botón *Resend Link* al lado. Reenviar **no cambia la clave**
  del formulario; son dos cosas distintas —las claves viven en la pestaña *API
  Keys*—.
- **Verificar no basta.** Verificado, el correo sólo queda *disponible* como
  destinatario; hay que ir además a *Settings → Email Configuration* del
  formulario y elegirlo. El destinatario era `vonoaweb+webforms@gmail.com` y
  hasta el 3-sep habría seguido siéndolo.

⚠️ **El plan gratuito permite UN destinatario** (CC y BCC son de pago). Al
marcar el de KROL, el de Vonoa **se quitó solo**: no se pueden los dos. Fernando
lo decidió así el 3-sep —*"sólo quiero que les llegue a ellos"*—, y no se pierde
nada porque cada solicitud se guarda en la base de datos antes de intentar el
correo.

Ojo con lo que dice más arriba de **"dos claves, una por destinatario"**: en el
panel hay **un solo formulario con una sola clave**. O la segunda vive en otra
cuenta, o nunca se llegó a hacer. No se pudo comprobar porque las claves están
dentro de la función de Supabase.

**Probado de punta a punta el 3-sep.** Se llenó el formulario en el sitio
publicado con una solicitud marcada como prueba y recorrió la cadena entera: el
sitio devolvió *"Solicitud registrada"*, la fila quedó en la base de datos —su
id sale en la columna *ID Base De Datos* del panel— y la solicitud aparece en el
**Inbox** de Web3Forms, no en Spam. Falta que Héctor confirme que le llegó el
correo a Outlook; **que revise también el correo no deseado**, que es lo primero
que recibe ese buzón desde Web3Forms.

⚠️ **Quedan dos filas de prueba** en `krol_leads`: la del 11-ago y la del 3-sep.
Conviene borrarlas antes de entregar, para que el cliente no vea prospectos que
no existen. No se pudo hacer desde aquí: hace falta el acceso a Supabase.

---

## El material del cliente está repartido, revísalo TODO

Éste fue el error más caro del proyecto: se dio material por inexistente mirando
sólo una carpeta. Son **18 carpetas**, no cuatro como decía antes este apunte.
Sácalas todas de un jalón antes de decir que algo falta:

```
find . -type d -exec sh -c 'printf "%4d  %s\n" "$(find "$1" -maxdepth 1 -type f | wc -l)" "$1"' _ {} \; | sort -rn
```

**Nada de `ls -R | head`**: así se listó el 15-ago y cortó la salida justo donde
empezaba lo que faltaba.

- **`Feedback v2/Imagenes y videos/`** — la entrega del 14-ago. Cuidado: varios
  archivos van **sueltos en la raíz**, no dentro de las subcarpetas.
  `AGENCIAS AUTOMOTRICES/` está **vacía de verdad** (0 archivos).
- **`imagenes/imagenes/`** (27 archivos) — la entrega de julio. Aquí están las
  **4 agencias** (Hyundai, Kia, Mercedes, Volvo), **3 fotos de O'Reilly**, los
  **6 logos de clientes** y los de ejecución especializada, donde el propio
  nombre del archivo identifica la **capilla**, la **escalera helicoidal** y el
  **Pingüinario**.
- **`PAGINA WEB/`** — 8 fotos de obra, la carpeta `PORTADA/` y `VIDEOS/`.
- **`La K/`** y **`Vectores/`** — el **logo nuevo ya vectorizado** (PNG y SVG).
- **`logo trazo y mockups/`** (18 archivos) — el **logo nuevo en sus 4 versiones**
  (principal, negativo, una tinta blanca y negra), SVG naranja y mockups de
  casco, lona, libreta y camioneta.
- **`propuestas portada/`** (3) — las tres propuestas de portada: plano técnico,
  obra a sangre y bloque naranja.

### Los textos de las obras salen de dos documentos, no de las fotos

Se cayó en esto el 15-ago y conviene dejarlo escrito: al partir la ficha
agrupada se escribieron los alcances **mirando las fotos**, teniendo el dato
puesto por escrito por el cliente en dos archivos que nadie abrió.

| Documento | Qué trae |
|---|---|
| `PORTAFOLIO DE PROYECTOS KROL.pdf` | 11 páginas. La 8 da el alcance de cada obra especializada; la 5, **doce sucursales O'Reilly** con su alcance; la 6, las **cuatro agencias**; la 10, misión/visión/valores; la 11, los tres directivos |
| `Cuestionario Web.txt` | El portafolio dictado por ellos, con lugar y periodo, y de donde salió el texto original de las fichas |
| `Nuestros Servicios.pdf` | 4 páginas con la redacción larga de cada servicio, incluido concreto lanzado |

Lo que decía el PDF y no se usó: el Pingüinario lleva **cisterna**, la capilla es
**a doble altura**, y la escalera es **diseño y trazo** además de cimbrado. Ya
está corregido, pero la regla queda: **antes de redactar una obra, se leen esos
dos documentos.** Las fotos dicen cómo se ve, no qué se hizo.

**Los PDF sí se pueden leer.** El Python del sistema (el del PATH, no el de
ComfyUI) trae `pypdf`, `fitz`, `pdfplumber` y `pdfminer`, y además hay
`pdftotext` en `/mingw64/bin`. Buscar sólo en el venv de ComfyUI y concluir que
no se puede es el error que ya se cometió.

### ⚠️ Hay material generado con IA mezclado

En `PAGINA WEB/PORTADA/` hay cinco imágenes de casas de concreto impecables
(AYAMONTE, CASA MURO DE DUELA, CASA RESERVA REAL, COCINA, CONCRETO APARENTE CASA
HABITACION) que **casi seguro están generadas**: son PNG de 1254×1254 / 1536×1024,
y en esa misma carpeta hay archivos llamados literalmente `ChatGPT Image` con
dimensiones idénticas. Una foto real de celular sale JPEG a 3024×4032.

La portada del sitio salía de una de ellas y **se cambió por obra real**. Pero
`CONCRETO APARENTE CASA HABITACION.png` **sigue publicada** como imagen del
servicio "Concreto aparente", porque el cliente la pidió expresamente.
**Falta que Héctor confirme si son fotos suyas o referencias.**

---

## Manual de marca

Cuatro versiones; **la buena es la v4**, en HTML y PDF. Pasó por varias rondas
hasta dar con lo que Héctor quería: menos manual genérico y más explicación.

Dos cosas que conviene no deshacer:

- **Cada regla explica su porqué.** Fue petición expresa: *"son personas que no
  saben"*. No es relleno, es el motivo de que aprobaran esta versión.
- **Tipografías**: **Black Ops One** confirmada por el cliente. **Bank Gothic
  tiene dudas de licencia** y por eso no se usa: si alguien la ve en material
  viejo del cliente, no es un olvido, es a propósito.

El PDF se arma imprimiendo el HTML. **Trampa conocida**: la primera vez salió con
páginas en blanco porque el `@media (max-width:760px)` se activaba al imprimir.
Se arregla escribiendo `@media screen and (max-width:760px)` — sin el `screen`,
la impresión entra por la regla de móvil.

---

## Herramientas que ya están instaladas (no descargar nada)

ComfyUI trae lo necesario para tratar el material del cliente:

```
Python + torch (CUDA)   C:\Fer_Doc\Comfy\.venv\Scripts\python.exe
ffmpeg 7.1              C:\Fer_Doc\Comfy\.venv\Lib\site-packages\imageio_ffmpeg\binaries\
Escalador 4x            C:\Fer_Doc\Comfy\models\upscale_models\4x_NMKD-Superscale-SP_178000_G.pth
```

- **Fotos chicas** → se escalan con el modelo NMKD vía `spandrel`. Detalle:
  spandrel devuelve un tensor de inferencia, hay que hacer `.detach().clone()`
  antes de cualquier operación en sitio o truena.
- **Videos** → ffmpeg. Dos trampas que ya costaron tiempo:
  1. Varios vienen **verticales metidos en lienzo horizontal** (casi todo negro:
     24 MB para 12 s). Se detecta con `cropdetect`; el área real era
     `crop=608:1080:656:0`.
  2. Otros son de 480 de alto: pedirles más los **amplía** y engordan sin verse
     mejor. Usar siempre `scale=-2:'min(ih,N)'`.

---

## Lo que se hizo

- **Formulario de contacto** conectado de verdad (arriba el detalle).
- **Portada**: primero se cambió la casa generada por obra real (dron sobre losa,
  del promocional `ANUNCIO.mp4` del cliente; el único tramo sin texto ni logo
  viejo encimado es el 38.0–41.5 s). **El 19-ago KROL pidió volver a una foto
  fija**: `CASA RESERVA REAL.png` de `PAGINA WEB/PORTADA/`, que es una de las
  cinco marcadas abajo como probablemente generadas. Se le avisó a Fernando y
  aun así se puso, por petición suya. El video `hero.mp4` sigue en `video/` sin
  usarse, así que volver atrás es cambiar una etiqueta.
  Dos cosas que hubo que ajustar al cambiar: el `filter` de la portada llevaba
  `brightness(1.2)` porque la toma de dron era de atardecer y salía apagada —con
  una foto de mediodía quemaba el concreto, ahora va neutro—, y se comprobó por
  cálculo que el titular blanco sigue teniendo **4.1:1** de contraste sobre la
  foto con el velo puesto.
- **Diagrama de la portada quitado** (lo pidió KROL). Era además lo que trababa la
  carga: ~230 trazos animándose sobre un video 1080p.
- **Cobertura**: de 7 a **21 estados**, con radiales, anillos rotulados en km,
  barrido giratorio, clave de colores y **funciona al tacto** (antes sólo con
  cursor: en celular estaba muerto). Ver abajo por qué **no es un mapa**.
- **Servicios**: 4 imágenes nuevas, en inicio y en servicios.
- **Cómo trabajamos**: título y las 4 etapas renombradas con textos e imágenes nuevas.
- **En obra**: de un video a **seis**.
- **Videos**: los 6 usables recomprimidos, de 48 MB a 7.4 MB.
- **Miniaturas del portafolio**: se salían de pantalla en ventanas bajas; ahora la
  columna de la foto es `sticky` y son más grandes.
- **Portafolio de 9 a 12 obras**: la ficha agrupada "Ejecución especializada" se
  partió en **Pingüinario**, **Escalera helicoidal** y **Capilla**, y entró
  **Muros de concreto lanzado**. Detalle abajo.
- **Las fichas ya pueden llevar video**, no sólo fotos. La primera que lo usa es
  **Cimentación bodega El Salto**, con los dos clips de la bodega. Detalle abajo.
- **Sitio movido** fuera del dominio del cliente, con "en construcción" en su lugar.

---

## Feedback v3 (3-sep): la ronda grande

Llegó en `Krol constructions/Feedback v3/Feedback v3/`, con **CAMBIOS.pdf** y
**54 archivos** de material. A diferencia de las rondas anteriores, **el PDF sí
suelta su texto**: `pypdf` lo extrae limpio. Lo que trajo:

**Servicios: de 8 a 12.** El cliente lo pidió así de literal —"que queden 3 filas
con 4 servicios"— y así queda: `.servs` es `repeat(4,1fr)` en escritorio, o sea
tres filas exactas. Los nuevos son **09 Obra vertical**, **10 Gerencia de obra**,
**11 Terracerías y excavación** y **12 Concreto lanzado**. Además **Obra civil se
separó** de excavaciones y de concreto lanzado, que ahora tienen ficha propia, y
cambiaron los textos de **Habilitado de varilla** y **Ejecución especializada**.
Ojo: **la reja de servicios está duplicada** en `index.html` y en
`servicios.html`, y el cliente pidió los cambios "en la sección inicio y en
servicios". Hay que tocar las dos o quedan distintas.

**Portafolio: de 12 fichas a 14.** Entraron **Torre Perla** y **Torre Jónico**,
con una categoría y un filtro nuevos, `vertical`. Ya no hay ninguna ficha
"pendiente de fotografía": Agencias, Pingüinario, Capilla y Habilitado
recibieron sus fotos. Son **77 piezas** repartidas por obra.

**Ninguna obra se quedó sin su material.** Los 54 archivos del cliente están
usados. La escalera helicoidal **sustituyó** sus fotos por las de la carpeta, en
el orden de la carpeta —lo pidió así—, y conserva su video al final.

### Las listas de O'Reilly y de agencias

El ingeniero pidió "una lista con las obras de O'Reilly y las agencias que hemos
realizado, para hacer énfasis en que han sido varias". Son **23 tiendas en 5
estados** y **24 agencias**, demasiadas para soltarlas en la tarjeta.

Van dentro del panel de la obra, **siempre a la vista**. Primero se pusieron
plegadas en un `<details>`, para que veinticuatro renglones no empujaran el
alcance y el botón fuera de la pantalla; **Fernando lo rechazó el 3-sep**: *"deja
que siempre se vea, que no le den un clic"*. Tiene razón —la gracia de la lista
es que se note cuántas obras son, y eso no se nota si hay que descubrirla—, y el
problema del empujón ya estaba resuelto por otro lado, moviéndola debajo de la
tabla de datos. Se declara en dos atributos de la ficha:

    data-lista-lb="Las 23 tiendas que hemos construido"
    data-lista="Jalisco>Federalismo;Club Atlas|Michoacán>Zacapu"

Los estados se separan con `|`, el estado de sus obras con `>`, y las obras
entre sí con `;`. **Comillas dobles no**, que el atributo va entre comillas.
El guion lo arma en la sección 13 de `main.js` y cuenta los renglones solo: el
número naranja junto a cada estado no está escrito a mano.

### La descripción del panel lleva párrafos y remate

Antes `data-desc` se volcaba con `textContent` y salía un ladrillo de doce
renglones. Los textos que dicta KROL traen párrafos, y varios cierran con un
remate corto —"Ingeniería que se contempla. Concreto que trasciende."—.

- Los párrafos se separan **dentro del atributo con ` // `**. El guion parte por
  ahí y pinta un `<p>` por trozo.
- El remate va en su propio atributo, **`data-lema`**, y se pinta con
  `.lb__lema`: mayúsculas condensadas y una regla naranja a la izquierda.
- Por eso `#lbDesc` **ya no es un `<p>`, es un `<div>`**: un `<p>` no puede
  contener otros `<p>`.

Al copiar un texto del cliente conviene pegarlo **entero**: en la primera pasada
se perdieron el último párrafo de la Capilla, dos de Torre Perla y tres remates,
y sólo se notaron al comparar palabra por palabra contra el PDF. Vale la pena
hacer esa comparación siempre, normalizando acentos y signos.

### Dos fotos recortadas por su lado bueno

`OBRA CIVIL.jpeg` guarda la rampa de concreto **abajo** —en el centro sólo se ve
el anuncio de una agencia Renault, con teléfonos de terceros incluidos— y
`TERRACERIAS.jpeg` tiene la máquina y el corte del terreno **arriba**, con la
sombra del fotógrafo abajo. Como la tarjeta recorta al centro, las dos salían
con lo que no toca. Se corrigió con `object-position` por selector de atributo
en `styles.css`, sin tocar el HTML —que está duplicado en dos páginas—.

### Las miniaturas tiran de `img/mini/`, no del archivo bueno

La tira de la galería pintaba **la foto completa** en un recuadro de 104 px. Con
la Capilla eso eran trece imágenes de hasta 645 KB para nada: **la tira entera
pesaba 14 MB y ahora pesa 611 KB**.

`img/mini/` tiene una copia de 220 px de cada pieza, con **el mismo nombre**, y
el guion arma la ruta por regla. Si a una pieza le falta su mini, la etiqueta se
queda con la foto grande y se ve igual, sólo que pesada.

⚠️ **Al agregar una foto a `data-fotos` hay que generarle su mini**, o esa
miniatura se baja a tamaño completo. El guion que las hace recorre los
`data-fotos` de `proyectos.html` y usa el **póster** cuando la pieza es video.

### Teclado y foco

Las fichas son `<article>`, así que ni recibían foco ni respondían a Intro: todo
el portafolio existía sólo para quien usa ratón. Ahora el guion les pone
`tabindex` y `role="button"` y atiende Intro y espacio, con su contorno naranja
en `:focus-visible`. Y el panel, que se anuncia como diálogo, **encierra el
foco**: tabulando ya no se sale a las fichas de atrás.

⚠️ **En este equipo no se puede comprobar**: con el panel del navegador oculto,
`document.hasFocus()` es `false` y `.focus()` no mueve nada. Se verificó que la
lista de elementos enfocables del panel sale bien (11, en orden); tabular de
verdad hay que probarlo en un navegador normal.

### Se puede llegar al portafolio ya filtrado

`proyectos.html#vertical` abre la reja con el filtro puesto. Lo usa el botón
"Ver las dos torres" de la nota de obra vertical, que antes soltaba al visitante
en las catorce fichas sin decirle cuáles eran. Sirve con cualquier `data-f`.

⚠️ El navegador de pruebas del panel **se come el `#` al navegar**, así que
parece que no funciona. Para comprobarlo hay que cargar la página dentro de un
`<iframe>` con el hash puesto, o abrirla en un navegador de verdad.

### La numeración de secciones y el titular que salía dos veces

Era la **nota 2 de KROL** y llevaba pendiente desde agosto. Fernando lo vio el
3-sep en Servicios: el "02" salía dos veces seguidas. Pero el número era lo de
menos: **la portada de la página y la sección de abajo decían exactamente lo
mismo**, titular y párrafo palabra por palabra, uno debajo del otro. Pasaba en
Servicios, en Proyectos y en Contacto.

Los números venían de cuando esto era una sola página larga: Servicios era la
02 del recorrido completo, y al partirlo en hojas cada una se quedó con el
número que tenía en aquella lista. Por eso Proyectos usaba 03 y 04 para lo mismo
y Contacto, 04 y 06.

La regla, que es la que `obra-vertical.html` ya seguía bien sin que nadie lo
notara:

- **La portada de página lleva etiqueta, no número.** Es el encabezado de la
  hoja, no una sección: "Servicios", "Portafolio", "Contacto", "Especialidad".
- **Las secciones van 01, 02, 03…**, empezando de nuevo en cada página.
- **El bloque de cierre "Contacto" va sin número**: es un remate y se repite
  igual en las cinco páginas.

Y para que la sección deje de repetir la portada, se le puso encabezado propio:
*Lo que ejecutamos* en Servicios, *Proyecto por proyecto* en Proyectos y *Dónde
encontrarnos* en Contacto —esa columna es la de WhatsApp, correo y dirección, y
nunca fue "Hablemos de tu obra"—. En Servicios además se quitó la bajada, que
era el mismo párrafo de la portada. **Son tres títulos escritos por nosotros, no
por KROL**: si Héctor prefiere otros, se cambian y ya.

### Las fichas anchas dejan de serlo cuando hay filtro puesto

Las dos fichas `obra--wide` están colocadas para que la reja completa cierre
justa: con las catorce a la vista, los seis renglones van al 96-98%. Pero al
filtrar cambia el reparto y quedaban huecos **a media reja**, no al final: en
*Especializados*, dos celdas vacías arriba y una ficha ancha sola en su renglón.

Se probó `grid-auto-flow:dense`, que es lo primero que se le ocurre a cualquiera,
y **no arregla: mueve el hueco**. Medido: pasa de 64/66/98 a 96/66/66, dos celdas
vacías en los dos casos, y encima el orden visual deja de coincidir con el de
tabulación.

Lo que sí arregla es `.obras.filtrado .obra--wide{grid-column:span 1}`: con
filtro puesto todas valen lo mismo y sólo queda el renglón incompleto del final.
Comprobado: los cinco filtros cierran limpios y con "Todos" no cambia nada.

### La lista va debajo de los datos de la obra

Estaba entre la descripción y la tabla de *Ubicación / Periodo / Alcance*. Al
desplegarla, veinticuatro renglones empujaban esos datos —y el botón— fuera de
la vista, y son justo los que sirven para decidir. Ahora el orden del panel es:
categoría, título, descripción, remate, **datos, lista** y botón. El guion no se
enteró: todo se busca por `id`, no por posición.

### Dos trampas que costaron encontrar

**`display` pisa el atributo `hidden`.** Ya estaba escrito para el marco del
visor, y volvió a pasar con la tira de miniaturas: `.lb__tiras` lleva
`display:flex`, y una regla del autor siempre gana a la hoja del navegador. En
la única obra de una sola foto —Residencia Ayamonte— la tira se ocultaba con
`hidden` y aun así dejaba una franja oscura de 25 px con su línea de separación
colgando bajo la imagen. **Cualquier elemento del visor que se apague con
`hidden` necesita su propia regla `[hidden]{display:none}`.**

**`decodeURIComponent` lanza con un porcentaje suelto.** El filtro por hash
decodifica `location.hash`, y `proyectos.html#%` tira `URIError`. Como eso corre
en el cuerpo del guion **antes** de armar el visor, la excepción se llevaba por
delante todo lo que venía después: ninguna ficha volvía a abrirse, ni con ratón
ni con teclado, y en la consola sólo quedaba un error suelto. Va dentro de un
`try`, y si no se puede decodificar se usa el texto tal cual.

### Un grupo largo se lleva todo el ancho

Las 24 agencias van todas bajo "Jalisco", y el reparto en dos columnas del cajón
**no puede partir un grupo por la mitad**: quedaba una tira de 24 renglones. Los
grupos de más de 8 llevan `lb__grupo--largo`, que ocupa el ancho completo y
reparte sus propios renglones en dos columnas.

### La nota de transparencia de obra vertical cambió de sentido

Decía "aquí no vas a ver fotos de edificios ajenos". **Ya no es cierto**: el
ingeniero consiguió permiso para publicar Torre Perla y Torre Jónico. La nota
ahora dice que sólo se publica la obra vertical autorizada, nombra las dos y
enlaza al portafolio; el resto sigue bajo confidencialidad. Si entra una tercera
torre, hay que actualizar esa nota también.

---

## El radar de cobertura NO es un mapa (y por qué)

Costó tres intentos, así que conviene dejarlo escrito antes de que alguien
"lo arregle" volviendo atrás.

Las dos primeras versiones ponían cada estado en su **posición geográfica real**
respecto a Guadalajara. Suena correcto y se ve mal, por un motivo sin arreglo
dentro de esa idea: desde Guadalajara, México se reparte al noroeste (Baja,
Sonora, Sinaloa) y al sureste (Yucatán, Tabasco), y al norte, al sur y al oeste
**no hay nada porque es el Pacífico**. Los puntos salen en franja diagonal
dentro de unos anillos redondos y media figura queda vacía. Sin costa dibujada
detrás, ese vacío no se lee como océano: se lee como un diagrama roto.

La versión actual es un **diagrama**, no un mapa:

- **Radio** = distancia real, comprimida con `(d/DMAX)**0.60`. La compresión hace
  falta porque 12 de los 21 estados están a menos de 500 km y sólo Baja
  California llega a 1 670: en escala lineal se amontonaban todos en el centro.
- **Ángulo** = reparto parejo en los 360°, **ordenado por el rumbo real**. Los
  vecinos siguen siendo vecinos, pero se llena el disco entero.
- Los **anillos siguen rotulados en km reales**, así que el dato no miente.

Se genera con `scratchpad/gen_radar2.py` (lleva el razonamiento en la cabecera).

**Ojo con el móvil**: los puntos son elementos HTML medidos en píxeles y **no
encogen con el SVG**, mientras que trazos y rótulos de dentro del SVG sí. Por eso
hay un bloque `@media (max-width:760px)` que compensa los dos sentidos. El bloque
anterior apuntaba a clases del radar viejo (`.radar__states`, `.st`) que ya no
existían: escondía el SVG y dejaba los puntos flotando en un contenedor sin
altura. Eso era el "en móvil se ve mal".

---

## De qué carpeta sale cada obra (y cómo se comprueba)

KROL pidió, obra por obra, "imágenes de la carpeta con el mismo nombre". El
**19-ago** se auditó comparando **contenido**, no nombres de archivo: huella
perceptual contra las 133 imágenes del cliente, más comparación píxel a píxel
para los empates.

**La trampa del rastreo.** Los PNG de la entrega de julio (`imagenes/imagenes/`)
traen **marco blanco**. El marco descuadra la huella entera, así que seis fotos
de agencias y O'Reilly salían como "sin origen" siendo idénticas a su archivo.
Hay que **recortar el marco antes de comparar**; si no, se persiguen fantasmas.

Lo que encontró la auditoría:

- **`CIMENTACION BODEGA EL SALTO/` no tiene ni una foto**, sólo dos videos. La
  ficha abría con `acatlan.jpg`, que es en realidad
  `MURO DE CONCRETO CENTRO LOGISTICO DE ACATLAN` —el muro de otra obra— y
  encima estaba repetido en la misma galería con otro nombre. Ahora la ficha
  lleva sus dos videos y la portada sale de un cuadro del propio video.
- **Fotos repetidas** bajo distinto nombre: `acatlan`/`centro-logistico` y
  `patio-concreto`/`concreto-aparente-casa`. Vale la pena volver a correr la
  comprobación de duplicados al agregar material.
- El muro de Acatlán se fue a **Muros de concreto aparente**, que es la carpeta
  donde el cliente lo tiene guardado.
- **`LOSA ANTES.jpeg`** venía inclinada 33° y con un dedo en la esquina. Se
  enderezó y se recortó al **rectángulo máximo inscrito** —la fórmula, no un
  recorte a ojo, que se comió la imagen en el primer intento—.

**Las carpetas del cliente mezclan obras.** `MUROS DE CONCRETO APARENTE/`
guarda también AYAMONTE, CASA MURO DE DUELA y CASA RESERVA REAL, que son de
otras fichas. "De su carpeta" no quiere decir "todo lo que hay dentro".

**Criterio, corregido el 19-ago por Fernando**: "imágenes de la carpeta con el
mismo nombre" se lee **literal**. La ficha de **Muros de concreto aparente**
lleva **exactamente los 11 archivos de su carpeta y ninguno más**, aunque cinco
de ellos sean casas y no muros: si el cliente los guardó ahí, ahí van. Se le
quitaron 7 fotos buenas que venían de `PAGINA WEB/` y `Feedback v1/`.

Cuatro de esas 7 siguen usándose en otras páginas (`muro-contencion` es el
fondo de la portada de Proyectos, `muro-armado` en Nosotros, `cimbra-muro` en
Contacto, `cimbrado-colado` en Servicios). Las otras tres —`muro-aparente`,
`muro-alto`, `muro-interior`— quedaron **sin usar en ninguna página**; siguen en
`img/` por si hacen falta.

Las 11 se regeneraron desde la carpeta **sin ampliar ninguna**: se publican a su
tamaño real, que va de 1536×1024 a 432×372. Antes tres estaban ampliadas y por
eso se veían pastosas —`duela-textura` pesaba 543 KB para mostrar una imagen de
432 px; ahora pesa 38—.

## Obras "pendientes de fotografía"

⚠️ **Hoy no queda ninguna.** El **Feedback v3** trajo fotos de las cuatro que
lo estaban —Agencias, Pingüinario, Capilla y Habilitado— y todas tienen ya su
galería. Lo que sigue vale igual: el mecanismo está montado y es lo que hay que
usar si entra otra obra sin material.

El criterio de Fernando: **antes de rellenar con material que no es de la obra o
que no da la talla, se dice que falta la foto.** Así estaban esas cuatro y por
qué:

- *Agencias*: las tres que le quedaban eran de 2023, tomas genéricas de armado,
  y la ficha dice 2024 — 2026.
- *Capilla*: su única imagen salía de un recorte de lámina de 844×423 estirado
  a 1600, y encima iba en tarjeta ancha, que es donde más se nota.
- *Pingüinario*: sus dos imágenes salían de recortes de lámina de 493×493 y
  481×722 ampliados hasta 1600 — la misma familia de material que ya se había
  retirado de O'Reilly y Agencias. Además la segunda nunca se confirmó que fuera
  de esa obra: se dedujo por el nombre del archivo.

Cómo está resuelto, por si hay que aplicarlo a otra ficha:

- La tarjeta **no lleva `<img>`**: lleva
  `<div class="obra__img obra__img--pend pour" role="img" aria-label="Pendiente de fotografía">`
  con el aviso dentro. Mantiene el 4/3 y la misma altura que las vecinas.
- El panel tiene su propio aviso, `#lbPend`, y se abre con él en lugar del hueco
  negro. La descripción, la ubicación y el alcance **se siguen viendo**: la ficha
  no pierde su información por no tener foto.
- ⚠️ **El JS necesitó una guardia.** El manejador hacía `img.src` sin comprobar
  que la obra tuviera imagen, así que una ficha sin foto **tiraba el panel
  entero**. Si alguien crea otra obra sin fotografía, esa guardia ya está; si la
  quita, vuelve el fallo.

## El CSS y el JS van versionados

`styles.css?v=20260902g` y `main.js?v=20260902g` en las seis páginas. **Al tocar
CSS o JS hay que subir ese número**, o los navegadores se quedan con el archivo
viejo.

Se puso porque pasó de verdad: tras editar `main.js` el navegador siguió
ejecutando el anterior aun recargando a la fuerza, y el diagnóstico se fue por
donde no era. Es el mismo problema que obligaba a pedirle a Héctor que abriera
con `Ctrl + Shift + R`. Con la versión puesta, **eso ya no hace falta para CSS y
JS** — para el HTML y las imágenes sí puede seguir haciendo falta.

## Las láminas de presentación no son fotos

En `imagenes/imagenes/` hay archivos que **parecen fotos y son recortes de una
presentación**: `Oreilly.png`, `Oreilly 2.png`, `Oreilly 3.png` y las cuatro de
`Agencias …`. Miden **entre 419 y 537 px de ancho** y varias traen los gráficos
de la lámina pegados dentro del propio archivo del cliente: barras naranjas en
los bordes de las de O'Reilly, y un recuadro blanco con restos de texto en
`Oreilly 2.png`.

Se habían publicado ampliadas 3.2× hasta 1600 px. El resultado se nota: los
cristales de la agencia Volvo ondulan, las letras se deshacen y las ramas de los
árboles quedan como pintadas. **Fernando las sacó del sitio el 19-ago**: no se
publican imágenes que no sean foto de verdad.

Hoy quedan así:

- **O'Reilly**: sólo la toma de dron al anochecer, que sí es foto real y viene de
  `Feedback v2/…/O'reilly/AGENCIA OREILLY.jpeg`. Sin galería.
- **Agencias automotrices**: las tres fotos de obra reales. Sin las cuatro
  fachadas.

Los siete archivos siguen en `img/` (`oreilly-1/2/3`, `agencia-hyundai/kia/
mercedes/volvo`) **sin que ninguna página los use**, por si llegan los
originales y sirven de referencia. No los borres pensando que sobran, y no los
vuelvas a enlazar sin material mejor.

⚠️ **Lo que hay que pedirle a Héctor**: los archivos originales de esas fotos —
si armó la presentación, los tiene sueltos y en tamaño bueno. Es distinto de las
fotos nuevas que el ingeniero no ha tomado; esas ya las tenía anotadas el
cliente en su propio feedback.

⚠️ **Detalle a revisar**: las tres fotos que quedan en Agencias son de 2023
(`PAGINA WEB/WhatsApp Image 2023-05-07…`) y la ficha dice 2024 — 2026. Son
tomas genéricas de armado, no de una agencia. Conviene sustituirlas cuando
lleguen las buenas.

**Ojo con lo que se pierde al marcar una ficha.** *Habilitado y armado de losa*
llevaba además el video de la **dobladora del taller propio**. Se movió a
**En obra** para no perderlo, pero Fernando prefirió esa sección como estaba
—un solo video con su bloque de texto al lado— así que **la dobladora quedó
fuera del sitio**. El archivo sigue en `video/dobladora.mp4` y su póster en
`img/dobladora-poster.jpg`. Aun así, **antes de vaciar una ficha revisa si
tiene video**, y avisa: no es lo mismo que quitar fotos.

## La sección "En obra"

Desapareció al mover los videos dentro de cada ficha, y por eso KROL apuntó que
el video de la escalera "no está". Volvió el 19-ago con **el video de la escalera de
concreto**, el único que no pertenece a ninguna de las 13 obras del portafolio;
repetir los demás sería duplicar lo que ya está en las fichas.

Va **a dos columnas** —texto a la izquierda con descripción, datos de la obra y
botón, y el clip a la derecha— y no en la cuadrícula de tres que tenía antes:
con un solo video quedaba un recuadro suelto en medio de una franja vacía. Esta
forma es la que Fernando aprobó; se probó también con dos videos en cuadrícula
y pidió volver a ésta. Ojo si alguien la retoca: la regla `.obravid__grid` se reescribe en una
media query posterior, así que una regla de una sola clase puesta antes **no
gana**; por eso el bloque nuevo usa su propia clase.

## El portafolio: doce fichas del v2, catorce desde el v3

`Feedback v2/CAMBIOS IMAGENES Y TEXTOS.txt` numera el portafolio **hasta el 13**,
y de ahí salió el "faltan proyectos" de antes. Pero **la entrada 3 de esa lista
está en blanco** —igual que la nota 4 del otro archivo—, así que los proyectos
reales son doce y **doce hay**. No hace falta inventar el que falta.

El orden de las fichas es **el de ese documento**, a propósito: cuando Héctor
revise con su lista en la mano, va a ir bajando en el mismo orden.

**Cómo se repartieron las fotos.** Ninguna ficha lleva dato que no se pueda
sostener: `data-lugar` y `data-anio` van vacíos cuando no se sabe y el JS
esconde el renglón en vez de dejarlo en blanco.

**Cada obra lleva TODO su material, videos incluidos.** Lo pidió Fernando el
16-ago: *"no pusiste todas las imágenes y los que son video los pusiste aparte"*.
Eran **62 piezas** entonces; con el Feedback v3 son **77 en 14 fichas**, y la
tabla de abajo es la del v2 —sirve para entender el criterio, no como inventario
al día—. Un rato **la sección "En obra" no existió**
—sus seis videos están ahora en la ficha de su obra, que es donde se entiende de
qué obra son—. Su CSS (`.obravid`, `.ovid`) se dejó intacto por si se quiere
volver atrás: basta con reponer el bloque HTML.

| Ficha | Piezas |
|---|---|
| O'Reilly | 4: la aérea nocturna y tres sucursales |
| Agencias automotrices | 8: tres de armado, **video** de la escalera, y las cuatro agencias |
| Cimentación bodega El Salto | 4: la foto, **dos videos** y el muro del centro logístico |
| Muros de concreto aparente | 10: terminados, armado, cimbra, descimbrado y accesos |
| Casa habitación | 6: patio, fachada, cocina, muro de duela y su textura |
| Habilitado y armado de losa | 4: tres de armado y el **video** de la dobladora |
| Muros de concreto lanzado | 7: tres fotos y **cuatro videos**, alternados en orden de obra |

| Ficha | Fotos |
|---|---|
| Pingüinario · Zoológico Guadalajara | acceso terminado + estructura en obra |
| Escalera helicoidal | **13**: la resanada de portada y luego toda la obra en orden — cimbra, armado, descimbrada, terminada y el vestíbulo |
| Capilla para casa de retiros | 1 (es la única que mandaron) |
| Muros de concreto lanzado | 3: el muro terminado de portada y luego firme colado y malla armada |

**Dos reglas que se ven pequeñas y no lo son:**

1. **`data-fotos` se parte por comas**, y cada foto separa ruta y texto
   alternativo con `|`. Una coma dentro de un texto alternativo parte la lista
   mal y tira la galería. No lleven comas.
2. **La primera foto de `data-fotos` tiene que ser la misma de la portada de la
   ficha**: al abrir, el JS reemplaza la imagen grande con `fotos[0]`, y si no
   coinciden el usuario pica una foto y se abre otra. Por eso las galerías abren
   con su portada y la secuencia de obra va después, no al revés.

### El visor tiene marco fijo, y es a propósito

KROL se quejó el 16-ago de que al cambiar de miniatura **"cambia radicalmente la
imagen y confunde al usuario"**. Tenía razón y la causa era el recorte: las
galerías mezclan fotos apaisadas de 1.78 con verticales de celular de 0.75 y
videos de 0.56, y al recortarlas todas al alto de la columna, cada pieza se
reencuadraba distinto. Parecían obras diferentes.

Ahora el marco es **fijo y cuadrado**, con la pieza entera dentro
(`object-fit:contain`). Lo único que cambia al pasar de una a otra es la foto.
El cuadrado no es capricho: con ese rango de proporciones es el reparto parejo,
apaisadas y verticales ceden la misma banda y ninguna se recorta.

**Las miniaturas van debajo de la foto, no encima**, y enseñan la foto entera
igual que el marco grande — recortadas prometían un encuadre y al picarlas salía
otro, que era justo la queja. Miden 104×76 (84×62 en celular) y la tira corre de
lado con `overflow-x:auto`, la barra escondida.

**Cómo se avanza.** Con trece fotos y la barra escondida, la primera versión no
daba ninguna pista: sólo servían las teclas, que nadie adivina. Hay cuatro vías,
y conviene no quitar ninguna:

- **Flechas ‹ › sobre la foto**, centradas dentro del marco. Dan la vuelta en los
  topes. Es la única pista visible, así que es la que no se toca.
- **Teclas ← →**, para quien ya sabe.
- **Rueda del ratón sobre la tira**: un ratón normal no tiene gesto horizontal,
  así que el `deltaY` se traduce a `scrollLeft`.
- **Contador `n / 13`** arriba a la izquierda, para saber cuánto falta.

Mientras quede tira por recorrer, el final se **desvanece** (clase `hay-mas`):
cinco miniaturas alineadas y cortadas a ras parecían ser todas las que había.

⚠️ **La miniatura activa se centra moviendo `scrollLeft` a mano, no con
`scrollIntoView` suave.** El desplazamiento suave depende de que el navegador
esté animando; cuando no lo está —pestaña de fondo, o el panel de pruebas de
este equipo— se queda sin hacer nada y la miniatura marcada acaba fuera de la
vista sin que nadie lo note. Así se comprobó que sí funciona.

Foto y video viven dentro de `.lb__marco`, no sueltos en `.lb__img`: las flechas
tienen que colocarse contra la imagen, y contra la columna quedaban centradas
sobre las miniaturas.

⚠️ **Trampa que ya mordió una vez**: la regla que da `display:block` a la foto y
al video **pisa el atributo `hidden`**, así que la pieza que no se está viendo
sigue apartando su hueco y abre un vacío del alto del marco entre la foto y las
miniaturas. Por eso existe `.lb__img > [hidden]{display:none}`. No quitarla.

**La escalera helicoidal es el único trabajo del que hay secuencia completa de
una misma obra** — justo lo que KROL pidió en la junta del 30-jul para la
sección de proceso. Vale la pena enseñársela cuando se retome ese tema.

### Una ficha también puede llevar video

Lo estrenó **Cimentación bodega El Salto**, que abre con la foto y luego dos
clips de la obra. En `data-fotos`, la pieza que **termina en `.mp4`** se muestra
en `<video>` y usa un **tercer campo** para el póster:

```
video/bodega-salto.mp4|Colado del piso de concreto bajo la nave|img/bodega-salto-poster.jpg
```

Ese póster no es adorno: **es lo que se ve en la miniatura**, porque un video no
sirve de miniatura. Si se agrega un video sin póster, la tira queda con un hueco.

Dos decisiones que conviene no deshacer:

- **Al salir de un video se suelta, no se pausa** (`removeAttribute('src')` +
  `load()`). Pausarlo nada más lo deja cargado: sigue corriendo detrás de la foto
  siguiente y guarda el archivo aunque ya se haya cerrado la ficha.
- **Los videos van con `object-fit:contain`, las fotos siguen en `cover`.** Los
  clips del cliente están grabados en vertical; recortarlos al ancho de la
  columna se comía un tercio de la toma. Las bandas de los lados van del color
  del panel para que se lean como marco.

**El clip que ya estaba no se volvió a comprimir.** `BODEGA EL SALTO.mp4` del
cliente es el mismo que ya vivía en `video/bodega-salto.mp4` — se comprueba con
`cropdetect`, da el mismo `crop=608:1080:656:0` de siempre. El nuevo es
`Bodega el salto video.mp4`, que venía con **giro de -90° en los metadatos**
dentro de un lienzo de 1280×720: ffmpeg lo endereza solo al recodificar, y sale
a 540×960 sin audio como sus hermanos (2.2 MB → 818 KB).

---

## Pendientes

### Espera respuesta de Fernando
- ~~Numeración de subsecciones~~ **resuelto el 3-sep**, ver abajo.
- **Nota 4 del feedback está en blanco**: preguntarle a Héctor qué iba ahí.
- **Muros de concreto lanzado quedó filtrado como "Especializados"**, por técnica,
  igual que los muros aparentes. Con eso el filtro Especializados junta 5 de las
  12 fichas. Si se prefiere, cabe en Industrial.
- ~~Residencia Ayamonte y el rótulo *Periodo*~~ **resuelto el 19-ago**: "En
  ejecución" salía bajo *Periodo*, y un estado no es un periodo. Ahora hay un
  atributo propio, `data-estado`, con su renglón **Estado** en el panel, y
  además se ve en la tarjeta como distintivo naranja sobre la foto sin tener
  que abrirla. Sirve para cualquier otra obra: basta con ponerle
  `data-estado="…"`.
- **El clip de El Salto sale dos veces en la misma página**: en la ficha del
  proyecto y suelto en "En obra". No estorba —son dos contextos distintos y la
  sección de videos es una muestra general—, pero si molesta, lo que se quita es
  el mosaico de "En obra": ahí el video no dice de qué obra es y en la ficha sí.
  Ojo: esa cuadrícula está pensada para seis, con cinco queda hueco.
- **¿La foto de portada de El Salto es de esa obra?** La ficha se titula
  *Cimentación bodega El Salto*, pero su foto (`img/acatlan.jpg`) enseña una
  fachada terminada de tableros de concreto con el rótulo **CENTRO LOGÍSTICO**, y
  el archivo del cliente del que salió se llama `MURO DE CONCRETO CENTRO
  LOGISTICO DE ACATLAN.jpeg`. Los dos videos que ahora cuelgan de esa ficha son
  de una nave de estructura metálica en obra: puede ser el mismo desarrollo en
  otra etapa, o pueden ser dos obras distintas. **No se tocó nada**, porque
  cambiar la portada sin saber es peor. Preguntárselo a Héctor.

### Espera material o acción de KROL
- **Héctor tiene que verificar el correo de Web3Forms** o los avisos no llegan.
- Fotos **timelapse de una misma obra** para los 4 pasos del proceso (lo pidieron
  en la junta del 30-jul: hoy son de obras distintas y ya lo notaron).
- **Video de la escalera helicoidal: quitarle la marca de InShot.** Ya está
  publicado —Fernando lo pidió el 16-ago— pero conviene mirarlo antes de
  enseñárselo a nadie: es un reel que armaron con la app **InShot y trae su marca
  de agua abajo a la derecha los 80 segundos**, lo cual en el sitio de un cliente
  se ve mal. Además cierra con **tarjeta del logo viejo**, el que se está
  cambiando. Lo ideal es que Héctor exporte el mismo reel desde InShot de pago,
  sin marca; si no, se puede recortar el cierre, pero la marca corre todo el
  video y no hay recorte que la quite sin comerse la imagen. Lo de los 416×416 no
  tiene arreglo: se deja así porque escalar video no inventa detalle, y como el
  marco del visor es cuadrado lo llena exacto.
- Confirmar si las imágenes de `PORTADA/` son obra suya o referencias.
- **Confirmar la segunda foto del Pingüinario**. Es
  `imagenes/imagenes/Proyectos de ejecucion especializada 3.png`, la única de esa
  serie sin nombre: la 2 dice capilla y la 4 y 5 dicen escalera, así que por
  descarte la 1 y la 3 son el Pingüinario, y las dos pegan (recinto con árbol,
  cubierta metálica blanca). Es deducción, no dato. Obra de KROL es, seguro; lo
  que falta confirmar es a qué proyecto pertenece.
- **Fotos de la capilla**: sólo mandaron una y es de interior. Con una de fachada
  la ficha se sostiene sola.
- **Dos de las cuatro fotos de "Cómo trabajamos" son verticales de celular** y por
  eso esa sección nunca se va a ver como ellos quieren. KROL pidió el 16-ago que
  las imágenes se vieran más grandes y señaló `PLANEACION.jpeg` (1536×1024, 3:2)
  como la referencia. El marco ya se llevó a 1.56:1, así que de PLANEACION se ve
  el 96% y de `CIMBRADO Y COLADO` el 88% — pero `Armado 2.jpeg` (960×1280) y
  `MURO DE CONCRETO CENTRO LOGISTICO DE ACATLAN.jpeg` (1086×1448) se quedan en el
  **48%**, porque son verticales metidas en un marco apaisado. No hay CSS que lo
  arregle: **hay que pedir esas dos en horizontal**, o cambiarlas por otras. Vale
  la pena enseñarle la comparación, porque la referencia que él mismo eligió es
  justo la única de las cuatro que ya venía en 3:2.
- **`CIMBRADO Y COLADO.jpeg` llegó en 507×371** y está publicada escalada con IA.
  Si tienen el original a tamaño real, mejor.
- **Partir el periodo 2014 — 2026**. El cuestionario da ese rango al grupo entero
  de ejecución especializada, no a cada obra. Ponerlo en las tres fichas diría
  que cada una duró doce años, así que van sin año hasta que Héctor diga el de
  cada una.

### Por hacer, con material ya disponible
- **Fotos de las 4 agencias**: la ficha "Agencias automotrices" usa una foto
  genérica de armado teniendo desde julio las de **Hyundai Galerías, Kia Santa
  Anita, Mercedes Bugambilias y Volvo Acueducto**, y el PDF del portafolio da el
  alcance de cada una. Lo de "pendientes de foto" del feedback v2 se refiere a
  fotos *nuevas*, no a que no haya.
- **Las 12 sucursales de O'Reilly** están nombradas una por una en el PDF, con su
  alcance (Federalismo, La Barca, Tepatitlán, Club Atlas, Guadalupe, Silao, Díaz
  Ordaz, Zacapu, Mazatlán, México 68, Col Militar y La Paz). Hoy la ficha dice
  sólo "5 estados": hay material para una galería o un listado que se vería serio.
- **Misión y visión** están redactadas en el cuestionario *y* en el PDF, y no
  aparecen en ninguna página.
- **Los tres directivos** (Ing. Rubén Alfonso Acevedo Correa, dirección general;
  Ing. Karla Minerva Acevedo Correa, gerencia administrativa; Ing. Claudia Fausto
  Ramírez, control presupuestal). Poner nombres es justo el ángulo que se acordó
  para **Obra vertical**, que se vende con la experiencia del equipo.
- **Servicios que el sitio no menciona** y sí están en `Nuestros Servicios.pdf`:
  proyectos llave en mano, obras urgentes y de ejecución rápida, gestión y
  coordinación de obra, obras de infraestructura, y cálculo y diseño estructural.
- ⚠️ **Dos correos distintos**: el PDF firma `KROL.Constructions@outlook.com` y el
  sitio usa `krol.presupuestos@outlook.com`. Preguntar cuál queda.
- **Logos de clientes**: siguen como texto en el sitio, teniendo los 6 archivos
  desde julio.
- **Logo nuevo**: el sitio usa el viejo en PNG; hay SVG en `KROL-logo/`.
- Acuerdos de la junta del 30-jul sin aplicar: entra el **azul** como tercer color
  (acento en botones, no en el logo), **logo más grande y orillado**, y quitar el
  **texto duplicado en Nosotros**. Detalle completo en
  `Krol constructions/Junta 30-jul-2026 - pendientes.md`.

---

## Cobro y trato con el cliente

Contrato del 8-jul: Plan Impulso sin blog + Brandbook, **$8,900 MXN**, mitad de
anticipo. **Faltan $4,450 por liquidar.**

Van **siete rondas de cambios contra tres contratadas**, todas absorbidas sin
cobrar. No conviene facturarlas hacia atrás —nunca se avisó del límite en su
momento—, pero sí tratar la ronda actual como la de cierre: lo que salga después
de la revisión final ya entra como cambio adicional.

Fernando sospechó en su momento que el cliente alargaba los cambios para no
liquidar. Se revisó y **no hay evidencia de eso**: las peticiones son concretas y
razonables, y varias eran fallos reales nuestros (el formulario que no enviaba,
material del cliente sin usar). El sitio está mucho más cerca del cierre por
haberlas atendido. Dicho eso, el límite de rondas sí conviene ponerlo por escrito
de aquí en adelante.
