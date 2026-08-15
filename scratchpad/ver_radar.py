# -*- coding: utf-8 -*-
"""Dibuja el radar leyendo la geometria real del HTML publicado.

No es el render del navegador (no hay motor disponible), pero las posiciones,
radios y tamanos salen del mismo HTML/CSS que ve el cliente, asi que sirve
para juzgar la composicion: si algo se sale del marco o si los puntos se
amontonan, aqui se ve igual.
"""
import io, os, re
from PIL import Image, ImageDraw

os.chdir(r"C:\Users\makin\OneDrive\Documentos\Vonoa web\krol-demo")
h = io.open("nosotros.html", encoding="utf-8").read()

VB_W, VB_H = 900.0, 700.0
anillos = [int(r) for r in re.findall(r'<circle cx="450" cy="350" r="(\d+)"', h)]
spokes = [tuple(map(float, m)) for m in
          re.findall(r'<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" data-st=', h)]
pts = [(float(x), float(y), blk) for x, y, blk in
       ((m[1], m[2], m[0]) for m in
        re.findall(r'<li class="pt([^"]*)"[^>]*--x:([\d.]+)%; --y:([\d.]+)%', h))]

NAR, ACE, FON = (249, 115, 22), (138, 145, 152), (12, 12, 13)


def dibuja(ancho, alto, nombre, movil):
    """ancho/alto = tamano en px del hueco del radar en la pagina."""
    S = 3  # supermuestreo, para que los trazos finos no desaparezcan
    im = Image.new("RGB", (ancho * S, alto * S), FON)
    d = ImageDraw.Draw(im, "RGBA")
    sx, sy = ancho * S / VB_W, alto * S / VB_H
    cx, cy = 450 * sx, 350 * sy

    # el SVG conserva proporcion (preserveAspectRatio por defecto): escala unica
    k = min(sx, sy)
    ox, oy = (ancho * S - VB_W * k) / 2, (alto * S - VB_H * k) / 2
    P = lambda x, y: (ox + x * k, oy + y * k)
    cx, cy = P(450, 350)

    gw = (2 if movil else 1) * k       # grosor de trazo del CSS, escalado
    for r in sorted(set(anillos)):
        rr = r * k
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr],
                  outline=(255, 255, 255, 33), width=max(1, int(round(gw))))
    for x1, y1, x2, y2 in spokes:
        d.line([P(x1, y1), P(x2, y2)], fill=NAR + (102,),
               width=max(1, int(round((2 if movil else 1.1) * k))))
    for r in (7, 22):
        rr = r * k
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=NAR,
                  fill=NAR if r == 7 else None,
                  width=max(1, int(round((4 if movil else 2) * k))))

    # los puntos son HTML: su tamano va en px de pantalla, NO escala con el SVG
    for cls, xp, yp in [(p[2], p[0], p[1]) for p in pts]:
        base, obra = "--base" in cls, "--obra" in cls
        px, py = xp / 100 * ancho * S, yp / 100 * alto * S
        if movil:
            dia = 15 if base else 10
        else:
            dia = 22 if base else 14
        rr = dia * S / 2.0
        col = NAR if (base or obra) else ACE
        if base or obra:
            halo = rr + (5 if movil else 7 if base else 4) * S
            d.ellipse([px - halo, py - halo, px + halo, py + halo], fill=NAR + (56,))
        d.ellipse([px - rr, py - rr, px + rr, py + rr], fill=col,
                  outline=FON, width=max(1, int(round((1.5 if movil else 2) * S))))

    im = im.resize((ancho, alto), Image.LANCZOS)
    im.save(nombre)
    return nombre


T = os.environ["TEMP"]
# escritorio: la columna del radar mide ~1.05fr de 1180 con gap -> ~590 px
a = dibuja(590, 459, os.path.join(T, "radar_escritorio.png"), False)
# movil 390 px de ancho menos 2x20 de margen -> 350
b = dibuja(350, 272, os.path.join(T, "radar_movil.png"), True)
print(a)
print(b)
print("%d anillos, %d radiales, %d puntos" % (len(set(anillos)), len(spokes), len(pts)))
