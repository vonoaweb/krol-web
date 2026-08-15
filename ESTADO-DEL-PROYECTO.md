# KROL · Estado del proyecto

Apunte de traspaso para quien retome esto sin haber estado antes.
Última actualización: **14 de agosto de 2026**.

---

## Dónde está cada cosa

| | |
|---|---|
| Sitio (código) | `krol-demo/` · repo `github.com/vonoaweb/krol-web` |
| Página "en construcción" | `krol-construccion/` · repo `vonoaweb/krol-construccion` |
| Material del cliente | `C:\Users\makin\Documents\Vonoa web\Krol constructions\` |
| Cambiar qué se ve en el dominio | `krol-dominio.sh sitio` / `construccion` / `estado` |

**Ojo con los dominios.** `kroledificacion.com` y `vonoaweb.com` están los dos en el
Cloudflare de Vonoa. El DNS **nunca se toca**: para cambiar qué se publica sólo se
cambia cuál repo reclama el dominio, y eso lo hace el script de arriba en unos
minutos. No mover registros DNS: no hace falta y complica la vuelta atrás.

---

## El material del cliente está repartido, revísalo TODO

Éste fue el error más caro de esta ronda: se dio material por inexistente
mirando sólo una carpeta. Está en cuatro sitios distintos:

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

## Herramientas que ya están instaladas (no descargar nada)

ComfyUI trae lo necesario para tratar el material del cliente:

```
Python + torch (CUDA)   C:\Fer_Doc\Comfy\.venv\Scripts\python.exe
ffmpeg 7.1              C:\Fer_Doc\Comfy\.venv\Lib\site-packages\imageio_ffmpeg\binaries\
Escalador 4x            C:\Fer_Doc\Comfy\models\upscale_models\4x_NMKD-Superscale-SP_178000_G.pth
```

- **Fotos chicas** → se escalan con el modelo NMKD vía `spandrel`. Detalle: spandrel
  devuelve un tensor de inferencia, hay que hacer `.detach().clone()` antes de
  cualquier operación en sitio o truena.
- **Videos** → ffmpeg. Dos trampas que ya costaron tiempo:
  1. Varios vienen **verticales metidos en lienzo horizontal** (casi todo negro:
     24 MB para 12 s). Se detecta con `cropdetect`; el área real era
     `crop=608:1080:656:0`.
  2. Otros son de 480 de alto: pedirles más los **amplía** y engordan sin verse
     mejor. Usar siempre `scale=-2:'min(ih,N)'`.

---

## Lo que se hizo en esta ronda (14-ago)

- **Formulario de contacto**: antes sólo decía "gracias" y **tiraba los datos**.
  Ahora va a una Edge Function de Supabase que **guarda en base de datos primero**
  y luego notifica por correo a KROL y a Vonoa. Con trampa antibots y salida por
  WhatsApp si algo falla.
- **Portada**: se cambió la casa generada por obra real (dron sobre losa, sale del
  promocional `ANUNCIO.mp4` del cliente; el único tramo sin texto ni logo viejo
  encimado es el 38.0–41.5 s).
- **Diagrama de la portada quitado** (lo pidió KROL). Era además lo que trababa la
  carga: ~230 trazos animándose sobre un video 1080p.
- **Cobertura**: de 7 a **21 estados**. Radar rehecho con proporciones reales,
  radiales a cada estado, anillos rotulados en km, barrido giratorio, clave de
  colores y **funciona al tacto** (antes sólo con cursor: en celular estaba muerto).
- **Servicios**: 4 imágenes nuevas, en inicio y en servicios.
- **Cómo trabajamos**: título y las 4 etapas renombradas con textos e imágenes nuevas.
- **En obra**: de un video a **seis**.
- **Videos**: los 6 usables recomprimidos, de 48 MB a 7.4 MB.
- **Miniaturas del portafolio**: se salían de pantalla en ventanas bajas; ahora la
  columna de la foto es `sticky` y son más grandes.

---

## Pendientes

### Espera respuesta de Fernando
- **Numeración de subsecciones** (nota 2 de KROL): hoy es inconsistente —
  Servicios repite "02", Proyectos usa 03/04 y Contacto 04/06 para lo mismo.
  Propuesta lista: portada sin número, secciones 01, 02, 03… por página.
- **Nota 4 del feedback está en blanco**: preguntarle a Héctor qué iba ahí.

### Espera material de KROL
- Fotos **timelapse de una misma obra** para los 4 pasos del proceso (lo pidieron
  en la junta del 30-jul: hoy son de obras distintas y ya lo notaron).
- **Video de la escalera helicoidal**: el que mandaron es de 416×416, no sirve.
- Confirmar si las imágenes de `PORTADA/` son obra suya o referencias.

### Por hacer, con material ya disponible
- **Galerías del portafolio**: el documento pide 13 proyectos y hoy hay 9. Faltan
  Pingüinario, Escalera helicoidal, Capilla y Muros de concreto lanzado — **los
  cuatro tienen fotos**, hay que partir el proyecto agrupado "Ejecución
  especializada" en sus partes.
- **Logos de clientes**: siguen como texto en el sitio, teniendo los 6 archivos
  desde julio.
- **Logo nuevo**: el sitio usa el viejo en PNG; en `Vectores/` está el nuevo en SVG.
- Acuerdos de la junta del 30-jul sin aplicar: entra el **azul** como tercer color
  (acento en botones, no en el logo), **logo más grande y orillado**, y quitar el
  **texto duplicado en Nosotros**. Detalle completo en
  `Krol constructions/Junta 30-jul-2026 - pendientes.md`.

---

## Cobro

Contrato del 8-jul: Plan Impulso sin blog + Brandbook, **$8,900 MXN**, mitad de
anticipo. **Faltan $4,450 por liquidar.**

Van **siete rondas de cambios contra tres contratadas**, todas absorbidas sin
cobrar. No conviene facturarlas hacia atrás (nunca se avisó del límite en su
momento), pero sí tratar la actual como la ronda de cierre: lo que salga después
de la revisión final ya entra como cambio adicional.
