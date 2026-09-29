"""Logo nuevo de KROL en negativo, para el fondo oscuro del sitio (ronda 4, 28-sep).

El logo que mandó KROL (`LOGO KROL TRANSPARENTE.png`) es un render 3D con las
letras en gris oscuro: sobre el #0D1117 del sitio quedaban a ~1.6:1 y casi no se
leían. Aquí se hace la versión para fondo oscuro:

- El edificio se queda tal cual: sus caras grises y el naranja sí se leen.
- Las letras se aclaran CONSERVANDO el sombreado: a cada gris se le aplica
  178 + L·0.42 (un mapeo que no invierte luces y sombras; invertir deja las
  letras como grabadas). El naranja no se toca.
- Se arma en horizontal —edificio a la izquierda, KROL a la derecha— como el
  logo anterior. La razón social apilada no entra: a alto de cabecera sale de
  5 px.

Uso:  python logo_negativo.py
Deja img/logo-krol-nuevo.{png,webp,avif} a 144 px de alto (2x de la cabecera).
"""
import os
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
SRC = r'C:/Users/makin/Documents/Vonoa web/Krol constructions/Ronda de cambios 4/IMAGENES/LOGO KROL TRANSPARENTE.png'
DEST = os.path.join(AQUI, '..', 'img', 'logo-krol-nuevo')
ALTO = 144

# Bandas del PNG original (filas con píxeles opacos), medidas sobre el alfa:
# edificio 15–838, KROL 860–1020, razón social y lema de 1039 en adelante.
EDIFICIO, KROL = (15, 839), (860, 1021)


def aclarar(img):
    img = img.copy()
    px = img.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            r, g, b, a = px[x, y]
            if a == 0 or r - max(g, b) > 45:      # transparente o naranja: igual
                continue
            v = int(min(255, 178 + (r * 299 + g * 587 + b * 114) / 1000 * 0.42))
            px[x, y] = (v, v, min(255, v + 3), a)
    return img


def recorte(img, y0, y1):
    banda = img.crop((0, y0, img.size[0], y1))
    return banda.crop(banda.getbbox())


im = Image.open(SRC).convert('RGBA')
icono = recorte(im, *EDIFICIO)
krol = aclarar(recorte(im, *KROL))

H = icono.size[1]
kh = int(H * 0.40)                                  # KROL mide 40 % del edificio
krol = krol.resize((int(krol.size[0] * kh / krol.size[1]), kh), Image.LANCZOS)
hueco = int(H * 0.08)
lienzo = Image.new('RGBA', (icono.size[0] + hueco + krol.size[0], H), (0, 0, 0, 0))
lienzo.alpha_composite(icono, (0, 0))
lienzo.alpha_composite(krol, (icono.size[0] + hueco, int(H * 0.62 - kh / 2)))   # a la altura del cuenco
lienzo = lienzo.crop(lienzo.getbbox())

final = lienzo.resize((round(lienzo.size[0] * ALTO / lienzo.size[1]), ALTO), Image.LANCZOS)
final.save(DEST + '.png', optimize=True)
final.save(DEST + '.webp', quality=90, method=6)
final.save(DEST + '.avif', quality=80)
print('listo', final.size)
