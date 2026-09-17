#!/usr/bin/env python3
"""Gera `public/hero/scene.png` (cena ditherizada 1-bit, 850x742) e `public/hero/glow.png` (sprite radial 64x64).

Roda UMA vez, fora do build:  python3 scripts/make-hero-scene.py
Pipeline igual ao do xmcp.dev: a cena é uma imagem estática de pontos brancos em fundo preto; o
`ParticleHero` só lê os pixels brancos e vira cada um numa partícula (cintilação + parallax em GL).

Pra trocar a cena por uma foto ditherizada: gere um PNG preto/branco (ou cinza) com ~4-8% de
cobertura branca, sem áreas brancas sólidas (máx ~45% de densidade local), salve como
`public/hero/scene.png` (qualquer tamanho; o renderer enquadra com letterbox) e pronto.
"""
from __future__ import annotations

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter

W, H = 850, 742
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "hero")
SEED = 7
MAX_DENSITY = 0.32  # nem a face mais clara vira branco sólido — só um núcleo denso de pontos
TARGET_COVERAGE = (0.04, 0.06)

rng = np.random.default_rng(SEED)


def rhombus(cx: float, cy: float, w: float, h: float) -> list[tuple[float, float]]:
    return [(cx, cy - h), (cx + w, cy), (cx, cy + h), (cx - w, cy)]


def layer(draw_fn) -> np.ndarray:
    im = Image.new("F", (W, H), 0.0)
    d = ImageDraw.Draw(im)
    draw_fn(d)
    return np.asarray(im, dtype=np.float32)


def slab(cx: float, cy: float, w: float, h: float, thick: float, top: float, left: float, right: float, edge: float) -> np.ndarray:
    """Um bloco isométrico: face de cima (losango) + duas laterais com `thick` px de espessura + arestas."""
    def faces(d: ImageDraw.ImageDraw) -> None:
        # laterais primeiro (ficam atrás da face de cima)
        d.polygon([(cx - w, cy), (cx, cy + h), (cx, cy + h + thick), (cx - w, cy + thick)], fill=left)
        d.polygon([(cx, cy + h), (cx + w, cy), (cx + w, cy + thick), (cx, cy + h + thick)], fill=right)
        d.polygon(rhombus(cx, cy, w, h), fill=top)

    def edges(d: ImageDraw.ImageDraw) -> None:
        pts = rhombus(cx, cy, w, h)
        d.line(pts + [pts[0]], fill=edge, width=3)
        d.line([(cx - w, cy), (cx - w, cy + thick), (cx, cy + h + thick), (cx + w, cy + thick), (cx + w, cy)], fill=edge, width=3)
        d.line([(cx, cy + h), (cx, cy + h + thick)], fill=edge, width=3)

    return np.maximum(layer(faces), layer(edges))


def blue_noise(shape: tuple[int, int]) -> np.ndarray:
    """Ruído azul aproximado: branco menos sua versão suavizada (tira a energia de baixa frequência),
    reordenado pra distribuição uniforme 0..1 (rank)."""
    n = rng.random(shape).astype(np.float32)
    hp = n - gaussian_filter(n, 1.1)
    hp += rng.random(shape).astype(np.float32) * 0.02
    ranks = np.argsort(np.argsort(hp.ravel())).reshape(shape)
    return (ranks + 0.5) / hp.size


def build_scene() -> np.ndarray:
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = W / 2, H / 2 - 10

    # --- fundo: glow radial suave + dois feixes diagonais (o "X" do xmcp) com textura de estrias
    r = np.hypot(xx - cx, (yy - cy) * 1.15)
    glow = np.exp(-(r / 300) ** 2) * 0.11

    u = (xx - cx) / W
    v = (yy - cy) / H
    d1 = np.abs(u - v) / np.sqrt(2)  # diagonal ↘
    d2 = np.abs(u + v) / np.sqrt(2)  # diagonal ↙
    band = lambda d: np.exp(-(d / 0.075) ** 2)  # noqa: E731
    dist = np.hypot(u, v)
    streaks = (band(d1) + band(d2)) * np.clip((dist - 0.14) / 0.12, 0, 1) * np.exp(-((dist - 0.42) / 0.25) ** 2)
    # estrias horizontais + nuvens (o feixe do xmcp é rasgado, não liso)
    stripes = gaussian_filter(rng.random((H, W)).astype(np.float32), sigma=(1.2, 18))
    stripes = (stripes - stripes.mean()) / (stripes.std() + 1e-6)
    clouds = gaussian_filter(rng.random((H, W)).astype(np.float32), sigma=22)
    clouds = (clouds - clouds.mean()) / (clouds.std() + 1e-6)
    texture = np.clip(0.55 + 0.45 * stripes + 0.35 * clouds, 0, 1.6)
    bg = glow + streaks * texture * 0.55

    # --- pilha isométrica (marca): 3 lajes, a de cima sólida e clara, as de baixo em contorno com miolo escuro
    w, h, thick, gap = 245.0, 122.0, 20.0, 108.0
    top_cy = cy - gap + 6
    stack = np.zeros((H, W), np.float32)
    stack = np.maximum(stack, slab(cx, top_cy + 2 * gap, w, h, thick, top=0.22, left=0.30, right=0.16, edge=0.85))
    stack = np.maximum(stack, slab(cx, top_cy + gap, w, h, thick, top=0.26, left=0.34, right=0.18, edge=0.9))
    stack = np.maximum(stack, slab(cx, top_cy, w, h, thick, top=1.0, left=0.58, right=0.30, edge=1.0))
    # iluminação: chave vindo de cima-esquerda → gradiente na face de cima
    light = np.clip(1.15 - 0.45 * ((xx - (cx - w)) / (2 * w)) - 0.25 * ((yy - (top_cy - h)) / (2 * h)), 0.35, 1.2)
    stack_lit = stack * np.where(stack > 0.95, light, 1.0)
    # halo: pontos esparsos em volta das lajes (o "sangramento" do sprite do xmcp)
    halo = gaussian_filter((stack > 0).astype(np.float32), 14) * 0.16
    halo = np.where(stack > 0, 0, halo)

    img = np.maximum(bg, stack_lit + halo)
    # grão fino pra quebrar bordas (o dither fica orgânico, não vetorial)
    grain = gaussian_filter(rng.random((H, W)).astype(np.float32), 0.8)
    img *= 0.85 + 0.3 * grain
    # vinheta forte: as bordas do quadro somem em preto (letterbox natural)
    vig = np.clip(1 - ((np.abs(u) / 0.5) ** 6 + (np.abs(v) / 0.5) ** 6), 0, 1)
    return np.clip(img * vig, 0, 1)


def dither(img: np.ndarray) -> np.ndarray:
    p = np.clip(img, 0, 1) ** 1.7 * MAX_DENSITY
    lo, hi = TARGET_COVERAGE
    noise = blue_noise(img.shape)
    scale = 1.0
    for _ in range(12):
        bits = (p * scale) > noise
        cov = bits.mean()
        if lo <= cov <= hi:
            break
        scale *= (lo + hi) / 2 / max(cov, 1e-6)
    print(f"cobertura branca: {bits.mean() * 100:.2f}% (escala {scale:.2f})")
    return bits


def make_glow(size: int = 64) -> Image.Image:
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    r = np.hypot(xx - (size - 1) / 2, yy - (size - 1) / 2) / (size / 2)
    a = np.clip(np.exp(-(r / 0.42) ** 2) * 1.0 + np.exp(-(r / 0.9) ** 2) * 0.12, 0, 1)
    a = (a * 255).astype(np.uint8)
    rgba = np.dstack([np.full_like(a, 255)] * 3 + [a])
    return Image.fromarray(rgba, "RGBA")


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    bits = dither(build_scene())
    im = Image.fromarray((bits * 255).astype(np.uint8), "L").convert("1")
    path = os.path.join(OUT, "scene.png")
    im.save(path, optimize=True)
    make_glow().save(os.path.join(OUT, "glow.png"), optimize=True)
    print(f"{path}: {os.path.getsize(path) / 1024:.1f} KB, {W}x{H}, {int(bits.sum())} pontos")
    # checagem: nenhuma corrida branca > 3 px (linha) — evita blobs sólidos
    runs = 0
    b = bits.astype(np.int8)
    for row in b:
        run = 0
        for v in row:
            run = run + 1 if v else 0
            runs = max(runs, run)
    print(f"maior corrida branca horizontal: {runs}px")


if __name__ == "__main__":
    main()
