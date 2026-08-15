# KROL · Estado del proyecto

Apunte de traspaso para quien retome esto sin haber estado antes — otra persona,
otro chat, o yo mismo dentro de un mes.
Última actualización: **15 de agosto de 2026**.

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

**No hay forma de tomar capturas del navegador.** Se probaron todas:

- El panel de pruebas del entorno falla toda la sesión ("Screenshot timed out",
  y a veces carga la página vacía).
- Edge sin ventana (`--headless=new --screenshot`) **no genera el archivo**,
  ni con un perfil aparte.
- No hay Chrome instalado, ni `playwright`, ni `cairosvg`.

Lo que **sí** funciona, y es con lo que se validó el radar:

1. **Comprobar la geometría por cálculo**, leyendo el HTML ya escrito: que nada
   se salga del marco, que los puntos no se encimen, que las llaves del CSS
   cuadren. Un descuadre de llaves ya rompió media hoja una vez y no se vio hasta
   contar.
2. **Dibujarlo con PIL**: `scratchpad/ver_radar.py` lee la geometría del propio
   HTML y saca un PNG de escritorio y otro de móvil. No es el render exacto del
   navegador, pero para juzgar composición sirve.
3. **El visto bueno visual es de Fernando.** Hay que pedírselo explícitamente y
   decirle que abra con `Ctrl + Shift + R`, porque la caché de GitHub Pages
   engaña.

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
| Correo del cliente | `krol.presupuestos@outlook.com` |
| Envío de correo | Web3Forms (dos claves, una por destinatario) |

**Guarda en la base de datos ANTES de intentar el correo**, a propósito: si falla
el envío, el prospecto no se pierde. Lleva trampa antibots (campo oculto
`website`) y, si todo falla, ofrece salida por WhatsApp.

Las claves de Web3Forms van en el código a la vista: **es así por diseño**, son
claves públicas de destinatario, no secretos. El plan gratuito permite un solo
destinatario por formulario, de ahí las dos claves.

⚠️ **Pendiente**: falta que Héctor haga clic en el correo de verificación de
Web3Forms. Hasta que lo haga, ese destinatario no recibe nada.

---

## El material del cliente está repartido, revísalo TODO

Éste fue el error más caro del proyecto: se dio material por inexistente mirando
sólo una carpeta. Está en cuatro sitios distintos:

- **`Feedback v2/Imagenes y videos/`** — la entrega del 14-ago. Cuidado: varios
  archivos van **sueltos en la raíz**, no dentro de las subcarpetas.
- **`imagenes/imagenes/`** — la entrega de julio. Aquí están las **4 agencias**
  (Hyundai, Kia, Mercedes, Volvo), **3 fotos de O'Reilly**, los **6 logos de
  clientes** y los de ejecución especializada, donde el propio nombre del archivo
  identifica la **capilla**, la **escalera helicoidal** y el **Pingüinario**.
- **`PAGINA WEB/`** — 8 fotos de obra, la carpeta `PORTADA/` y `VIDEOS/`.
- **`La K/`** y **`Vectores/`** — el **logo nuevo ya vectorizado** (PNG y SVG).

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
- **Portada**: se cambió la casa generada por obra real (dron sobre losa, sale del
  promocional `ANUNCIO.mp4` del cliente; el único tramo sin texto ni logo viejo
  encimado es el 38.0–41.5 s).
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
- **Sitio movido** fuera del dominio del cliente, con "en construcción" en su lugar.

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

## Pendientes

### Espera respuesta de Fernando
- **Numeración de subsecciones** (nota 2 de KROL): hoy es inconsistente —
  Servicios repite "02", Proyectos usa 03/04 y Contacto 04/06 para lo mismo.
  Propuesta lista: portada sin número, secciones 01, 02, 03… por página.
- **Nota 4 del feedback está en blanco**: preguntarle a Héctor qué iba ahí.

### Espera material o acción de KROL
- **Héctor tiene que verificar el correo de Web3Forms** o los avisos no llegan.
- Fotos **timelapse de una misma obra** para los 4 pasos del proceso (lo pidieron
  en la junta del 30-jul: hoy son de obras distintas y ya lo notaron).
- **Video de la escalera helicoidal**: el que mandaron es de 416×416, no sirve.
- Confirmar si las imágenes de `PORTADA/` son obra suya o referencias.

### Por hacer, con material ya disponible
- **Galerías del portafolio**: el documento pide 13 proyectos y hoy hay 9. Faltan
  Pingüinario, Escalera helicoidal, Capilla y Muros de concreto lanzado — **los
  cuatro tienen fotos**, hay que partir el proyecto agrupado "Ejecución
  especializada" en sus partes. *(Es lo siguiente en la fila.)*
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
