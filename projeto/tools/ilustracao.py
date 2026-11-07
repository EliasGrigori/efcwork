# EFCwork · ilustração padrão da tela de entrar (v0.4.3). Uso: python3 tools/ilustracao.py [estilo]  → imprime o data URL (base64).
# O app usa o estilo 'flat' (escolhido em 07/11/2026) em src/entrar.js (EN_ILUSTRA).
# Ilustração original: técnica de qualidade com prancheta (sem pessoa real). viewBox 600x920, cortada na coxa.
P = {
 'rabo':  'M352 168 C 400 200 418 270 410 340 C 404 400 420 450 404 520 C 396 556 380 580 366 600 C 372 548 368 500 356 452 C 344 404 352 352 344 300 C 340 260 336 220 330 196 Z',
 'calca': 'M196 628 C 260 642 344 642 404 628 L 420 760 L 432 920 L 168 920 L 180 760 Z',
 'tronco':'M232 312 C 262 300 338 300 368 312 C 400 322 414 336 418 372 C 420 440 410 520 408 600 C 408 622 404 636 404 640 C 340 654 260 654 196 640 C 194 620 192 600 192 580 C 190 510 182 440 182 372 C 186 336 200 322 232 312 Z',
 'bracoD':'M402 336 C 428 352 436 400 438 450 C 440 500 446 540 440 572 C 432 604 392 624 338 640 C 322 644 312 628 320 614 C 358 592 392 572 398 556 C 400 520 392 470 386 430 Z',
 'prancha':'M150 470 L 330 392 L 404 568 L 222 646 Z',
 'papel':'M168 476 L 324 408 L 388 560 L 232 628 Z',
 'presil':'M222 434 L 270 414 L 280 436 L 232 456 Z',
 'bracoE':'M198 336 C 172 352 160 400 156 450 C 152 498 156 528 176 538 C 204 550 240 528 268 508 C 280 498 276 480 262 482 C 238 494 214 506 204 500 C 200 470 206 430 212 404 Z',
 'maoE':'M256 486 C 270 474 292 476 296 490 C 300 504 286 516 270 516 C 258 516 250 500 256 486 Z',
 'maoD':'M318 606 C 330 594 352 596 356 610 C 360 626 344 640 328 638 C 314 636 308 618 318 606 Z',
 'caneta':'M268 494 L 236 420 L 242 416 L 276 490 Z',
 'pesc':'M276 244 L 324 244 L 326 300 L 274 300 Z',
 'gola':'M262 270 C 280 262 320 262 338 270 L 342 318 C 320 328 280 328 258 318 Z',
 'rosto':'M300 112 C 338 112 360 146 360 190 C 360 236 334 272 300 272 C 266 272 240 236 240 190 C 240 146 262 112 300 112 Z',
 'orelha':'M354 186 C 366 182 372 196 368 210 C 364 222 354 222 352 214 Z',
 'cabeloT':'M228 204 C 214 130 254 82 304 82 C 358 82 394 128 380 206 C 376 236 366 258 354 272 L 246 272 C 236 254 230 230 228 204 Z',
 'perna':'M300 660 C 302 740 300 840 298 920',
 'cabelo':'M238 196 C 230 136 262 98 306 98 C 350 98 374 132 366 186 C 356 160 336 144 312 140 C 286 152 258 166 238 196 Z',
 'cordao':'M292 640 C 290 660 286 680 282 700 M 308 640 C 310 660 314 680 318 700',
}
ORDEM = ['rabo','cabeloT','calca','tronco','bracoD','prancha','papel','presil','bracoE','maoE','maoD','caneta','pesc','gola','rosto','orelha','cabelo','perna']

def svg(estilo):
    defs=''; g=[]
    if estilo=='traco':   # 1 · traço fino dourado
        c='#c99a45'
        for k in ORDEM: g.append(f'<path d="{P[k]}" fill="{'none' if k=='perna' else '#16131f'}" stroke="{c}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>')
        for y in (500,530,560,590): g.append(f'<path d="M{200+(y-470)*0.3:.0f} {y} l {110:.0f} -46" stroke="{c}" stroke-width="2" opacity=".6"/>')
        g.append(f'<path d="{P["cordao"]}" stroke="{c}" stroke-width="2.4" fill="none"/>')
    elif estilo=='papel':  # 2 · recorte de papel
        defs='<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity=".28"/></filter>'
        cor={'rabo':'#3a2a26','calca':'#cdb08c','tronco':'#a993d6','bracoD':'#9c85cc','prancha':'#b07a3e','papel':'#fbf7ee','cabeloT':'#3a2a26','perna':'#0000','presil':'#d8b46a','bracoE':'#b5a1e0','maoE':'#d9a27c','maoD':'#d9a27c','caneta':'#2f2f3a','pesc':'#cf966f','gola':'#b9a6e4','rosto':'#e0ad86','orelha':'#d39c76','cabelo':'#3a2a26'}
        for k in ORDEM:
            if k!='perna': g.append(f'<path d="{P[k]}" fill="{cor[k]}" filter="url(#s)"/>')
        g.append(f'<path d="{P["perna"]}" stroke="#b39672" stroke-width="3" fill="none"/>')
        g.append(f'<path d="{P["cordao"]}" stroke="#f3e6d0" stroke-width="3" fill="none"/>')
    elif estilo=='silhueta':  # 3 · silhueta dourada com luz
        defs='<linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7df9e"/><stop offset=".5" stop-color="#d9b46a"/><stop offset="1" stop-color="#9c6f26"/></linearGradient>'
        for k in ORDEM:
            if k!='perna': g.append(f'<path d="{P[k]}" fill="url(#o)"/>')
        g.append(f'<path d="{P["perna"]}" stroke="#fff3cf" stroke-opacity=".5" stroke-width="2" fill="none"/>')
        for k in ['bracoD','prancha','bracoE','gola','cabelo','calca']: g.append(f'<path d="{P[k]}" fill="none" stroke="#fff3cf" stroke-opacity=".55" stroke-width="2"/>')
    elif estilo=='flat':  # 4 · flat editorial (cores da foto, sem rosto)
        cor={'rabo':'#2b201d','calca':'#d8bf9c','tronco':'#b39ee0','bracoD':'#a28bd2','prancha':'#b8823f','papel':'#fffaf0','cabeloT':'#2b201d','perna':'#0000','presil':'#8d8f98','bracoE':'#bda9e8','maoE':'#e2b08d','maoD':'#d9a27f','caneta':'#2b2b33','pesc':'#d69c78','gola':'#c2b0ea','rosto':'#e8b892','orelha':'#dba582','cabelo':'#2b201d'}
        for k in ORDEM:
            if k!='perna': g.append(f'<path d="{P[k]}" fill="{cor[k]}"/>')
        g.append(f'<path d="{P["perna"]}" stroke="#bfa47e" stroke-width="4" fill="none" stroke-linecap="round"/>')
        for y in (480,505,530,555): g.append(f'<path d="M{196+(y-470)*0.42:.0f} {y+16} l 118 -51" stroke="#c9c2b2" stroke-width="5" stroke-linecap="round"/>')
        g.append('<path d="M196 628 C 260 642 344 642 404 628 L 404 650 C 344 664 260 664 196 650 Z" fill="#c9ad86"/>')
        g.append(f'<path d="{P["cordao"]}" stroke="#f6ead7" stroke-width="4" stroke-linecap="round" fill="none"/>')
        g.append('<path d="M262 300 C 290 310 312 310 338 300" stroke="#9a86c8" stroke-width="3" fill="none"/>')
        # v0.4.3: sombras suaves e brilho no cabelo
        g.append('<path d="M368 330 C 400 340 414 360 416 400 C 418 470 410 540 408 600 C 396 560 392 470 386 420 C 380 380 376 350 368 330 Z" fill="#9c86cc" opacity=".55"/>')
        g.append('<path d="M262 150 C 284 132 318 128 344 140" stroke="#5a4640" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>')

    elif estilo=='gravura':  # 5 · gravura (hachuras)
        defs=('<pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="7" height="7" fill="#f6ecd6"/><line x1="0" y1="0" x2="0" y2="7" stroke="#8a6326" stroke-width="2.4"/></pattern>'
              '<pattern id="h2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="6" height="6" fill="#f6ecd6"/><line x1="0" y1="0" x2="0" y2="6" stroke="#8a6326" stroke-width="1.2"/></pattern>')
        esc={'rabo','cabelo','cabeloT','calca','prancha','caneta'}
        for k in ORDEM: g.append(f'<path d="{P[k]}" fill="{"none" if k=="perna" else "url(#h)" if k in esc else ("#fbf5e8" if k=="papel" else "url(#h2)" if k in ("tronco","bracoD","bracoE","gola") else "#f6ecd6")}" stroke="#6e4c1a" stroke-width="2.6" stroke-linejoin="round"/>')
        g.append(f'<path d="{P["cordao"]}" stroke="#6e4c1a" stroke-width="2.4" fill="none"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 920" width="600" height="920"><defs>{defs}</defs>{"".join(g)}</svg>'

if __name__=='__main__':
    import sys, base64
    e = sys.argv[1] if len(sys.argv) > 1 else 'flat'
    print('data:image/svg+xml;base64,' + base64.b64encode(svg(e).encode()).decode())
