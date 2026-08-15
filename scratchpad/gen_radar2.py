# -*- coding: utf-8 -*-
"""Genera el bloque del radar de cobertura.

POR QUE NO ES UN MAPA
---------------------
Las dos versiones anteriores colocaban cada estado en su posicion geografica
real respecto a Guadalajara. Suena bien y se veia mal, por un motivo que no
tiene arreglo dentro de esa idea: desde Guadalajara, Mexico se reparte al
noroeste (Baja, Sonora, Sinaloa) y al sureste (Yucatan, Tabasco), y al norte,
al sur y al oeste no hay nada porque es el Pacifico. La nube de puntos sale
en franja diagonal dentro de unos anillos redondos, con la mitad del dibujo
vacia. Es geograficamente correcto y visualmente ilegible: sin costa dibujada
detras, ese vacio no se lee como oceano, se lee como un diagrama roto.

Asi que esto ya no pretende ser un mapa, es un diagrama:

  RADIO  = distancia real a Guadalajara, comprimida con (d/DMAX)**0.60.
           La compresion hace falta porque casi todos los estados caen entre
           400 y 800 km y solo Baja California llega a 1670: en escala lineal
           se amontonaban todos junto al centro. Los anillos van rotulados en
           km de verdad, asi que el dato se sigue leyendo bien.
  ANGULO = reparto parejo en los 360 grados, ORDENADO por el rumbo real.
           Los vecinos siguen siendo vecinos y el orden alrededor del circulo
           es el orden geografico, pero se llena el disco entero.

Los nombres van en la lista de al lado, no encima de los puntos: 21 etiquetas
sobre el dibujo se encimarian.
"""
import io, math, unicodedata

GDL_LAT, GDL_LON = 20.67, -103.35

ESTADOS = [
    ("Jalisco", 20.67, -103.35, "base"), ("Nayarit", 21.75, -104.85, "cob"),
    ("Colima", 19.24, -103.73, "cob"), ("Michoacan", 19.57, -101.71, "obra"),
    ("Guanajuato", 20.92, -101.09, "obra"), ("Aguascalientes", 22.00, -102.30, "cob"),
    ("Zacatecas", 23.17, -102.88, "cob"), ("Durango", 24.55, -104.66, "cob"),
    ("Sinaloa", 25.00, -107.50, "obra"), ("Queretaro", 20.72, -100.14, "cob"),
    ("San Luis Potosi", 22.65, -100.45, "cob"), ("Sonora", 29.60, -110.60, "cob"),
    ("Chihuahua", 28.60, -106.20, "cob"), ("Baja California", 30.50, -115.50, "cob"),
    ("Baja California Sur", 25.50, -111.80, "obra"), ("Oaxaca", 17.00, -96.50, "cob"),
    ("Guerrero", 17.60, -99.80, "cob"), ("Mexico", 19.35, -99.70, "cob"),
    ("Yucatan", 20.80, -89.00, "cob"), ("Nuevo Leon", 25.60, -99.90, "cob"),
    ("Tabasco", 18.00, -92.80, "cob"),
]
BONITO = {"Michoacan": u"Michoacán", "Queretaro": u"Querétaro",
          "San Luis Potosi": u"San Luis Potosí", "Mexico": u"México",
          "Yucatan": u"Yucatán", "Nuevo Leon": u"Nuevo León",
          "Baja California Sur": u"Baja California Sur"}

W, H, CX, CY, R = 900.0, 700.0, 450.0, 350.0, 300.0
KM_LAT, KM_LON = 111.0, 104.0          # km por grado a esta latitud
COMPRESION = 0.60


def slug(s):
    return (unicodedata.normalize("NFKD", s).encode("ascii", "ignore")
            .decode().lower().replace(" ", "-"))


# --- rumbo y distancia reales ------------------------------------------------
datos = []
for nombre, lat, lon, tipo in ESTADOS:
    dx = (lon - GDL_LON) * KM_LON
    dy = (lat - GDL_LAT) * KM_LAT
    km = math.hypot(dx, dy)
    rumbo = (math.degrees(math.atan2(dx, dy)) + 360) % 360   # 0=norte, horario
    datos.append([nombre, tipo, km, rumbo])

DMAX = max(d[2] for d in datos)

# --- reparto angular parejo, conservando el orden por rumbo ------------------
resto = sorted([d for d in datos if d[1] != "base"], key=lambda d: d[3])
paso = 360.0 / len(resto)
for i, d in enumerate(resto):
    d.append(i * paso)                                        # angulo final

base = [d for d in datos if d[1] == "base"][0]
base.append(0.0)

puntos, lista, radiales = [], [], []
for nombre, tipo, km, rumbo, ang in [base] + resto:
    rf = 0.0 if tipo == "base" else (km / DMAX) ** COMPRESION
    a = math.radians(ang)
    x = CX + R * rf * math.sin(a)
    y = CY - R * rf * math.cos(a)
    etq = BONITO.get(nombre, nombre)
    s = slug(nombre)
    if tipo != "base":
        radiales.append('<line x1="%.0f" y1="%.0f" x2="%.1f" y2="%.1f" data-st="%s" />'
                        % (CX, CY, x, y, s))
    cls = {"base": " pt--base", "obra": " pt--obra"}.get(tipo, "")
    puntos.append(
        '        <li class="pt%s" style="--x:%.2f%%; --y:%.2f%%; --ang:%.0f" data-st="%s">'
        '<span class="pt__tip">%s</span></li>'
        % (cls, x / W * 100, y / H * 100, ang, s, etq))
    sub = {"base": u"Base · Guadalajara", "obra": "Obra ejecutada"}.get(tipo, "Cobertura")
    lcls = {"base": " es--base", "obra": " es--obra"}.get(tipo, "")
    lista.append('      <li class="es%s" data-st="%s">%s<i>%s</i></li>' % (lcls, s, etq, sub))

# --- anillos: radio comprimido, rotulo en km reales -------------------------
ANILLOS = [300, 700, 1200, 1700]
circulos = "".join('<circle cx="450" cy="350" r="%.0f" />' % (R * (km / DMAX) ** COMPRESION)
                   for km in ANILLOS)
rotulos = "".join(
    '<text x="456" y="%.0f" class="radar__km">%s km</text>'
    % (CY - R * (km / DMAX) ** COMPRESION + 16, "{:,}".format(km).replace(",", " "))
    for km in ANILLOS)

html = u"""    <div class="cobertura__grid">
      <div class="radar" id="radar">
        <svg class="radar__svg" viewBox="0 0 900 700" aria-hidden="true">
          <g class="radar__rings">
            %(circulos)s
          </g>
          <g class="radar__kms">%(rotulos)s</g>
          <g class="radar__cross">
            <line x1="60" y1="350" x2="840" y2="350" /><line x1="450" y1="20" x2="450" y2="680" />
          </g>
          <!-- Una linea de Guadalajara a cada estado: la cuadrilla que se mueve -->
          <g class="radar__spokes">
            %(radiales)s
          </g>
          <g class="radar__core"><circle cx="450" cy="350" r="7" /><circle cx="450" cy="350" r="22" /></g>
        </svg>

        <!-- Barrido: gira sobre el centro, como el de un radar de verdad -->
        <span class="radar__barrido" aria-hidden="true"></span>

        <ul class="radar__puntos">
%(puntos)s
        </ul>
      </div>

      <div class="cobertura__col">
        <p class="radar__clave">
          <span class="clave clave--obra">Obra ejecutada</span>
          <span class="clave clave--cob">Cobertura</span>
        </p>
        <ul class="radar__lista">
%(lista)s
        </ul>
        <p class="radar__pie">Cada anillo es una distancia real desde Guadalajara. Toca o se&ntilde;ala un estado para ubicarlo.</p>
      </div>
    </div>""" % {"circulos": circulos, "rotulos": rotulos,
                 "radiales": "\n            ".join(radiales),
                 "puntos": "\n".join(puntos), "lista": "\n".join(lista)}

io.open("radar_nuevo.html", "w", encoding="utf-8").write(html)

rr = sorted(round((d[2] / DMAX) ** COMPRESION * 100) for d in resto)
print("%d estados - mas lejano %.0f km" % (len(datos), DMAX))
print("radio (%% del maximo): min %d, mediana %d, max %d" % (rr[0], rr[len(rr) // 2], rr[-1]))
print("separacion angular: %.1f grados entre vecinos" % paso)
print("anillos en px: " + ", ".join("%d km->%.0f" % (k, R * (k / DMAX) ** COMPRESION) for k in ANILLOS))
