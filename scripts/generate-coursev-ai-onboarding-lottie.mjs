import { writeFileSync } from 'node:fs'

const FPS = 60
const W = 1920
const H = 1080
const OP = 1080
const OUT = 'public/animations/coursev-ai-onboarding.json'

let ind = 1
const visual = []

const fonts = {
  list: [
    { fName: 'Inter-Regular', fFamily: 'Arial', fStyle: 'Regular', ascent: 78 },
    { fName: 'Inter-SemiBold', fFamily: 'Arial', fStyle: 'Semi Bold', ascent: 78 },
    { fName: 'Inter-Bold', fFamily: 'Arial', fStyle: 'Bold', ascent: 78 },
  ],
}

function c(hex, alpha = 1) {
  const n = hex.replace('#', '')
  return [
    parseInt(n.slice(0, 2), 16) / 255,
    parseInt(n.slice(2, 4), 16) / 255,
    parseInt(n.slice(4, 6), 16) / 255,
    alpha,
  ]
}

function ease(inX = 0.42, inY = 1, outX = 0.16, outY = 0) {
  return { i: { x: [inX], y: [inY] }, o: { x: [outX], y: [outY] } }
}

function k(t, s, e = ease()) {
  return { t, s: Array.isArray(s) ? s : [s], ...e }
}

function hold(t, s) {
  return { t, s: Array.isArray(s) ? s : [s], h: 1 }
}

function prop(value) {
  if (Array.isArray(value) && value[0] && typeof value[0] === 'object' && 't' in value[0]) {
    return { a: 1, k: value }
  }
  return { a: 0, k: value }
}

function tr() {
  return {
    ty: 'tr',
    p: { a: 0, k: [0, 0] },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
  }
}

function rc(x, y, w, h, r) {
  return { ty: 'rc', p: { a: 0, k: [x, y] }, s: { a: 0, k: [w, h] }, r: { a: 0, k: r } }
}

function el(x, y, w, h) {
  return { ty: 'el', p: { a: 0, k: [x, y] }, s: { a: 0, k: [w, h] } }
}

function path(points, closed = false) {
  return {
    ty: 'sh',
    ks: {
      a: 0,
      k: {
        c: closed,
        v: points,
        i: points.map(() => [0, 0]),
        o: points.map(() => [0, 0]),
      },
    },
  }
}

function fill(hex, opacity = 100) {
  return { ty: 'fl', c: { a: 0, k: c(hex) }, o: { a: 0, k: opacity } }
}

function stroke(hex, width = 1, opacity = 100) {
  return {
    ty: 'st',
    c: { a: 0, k: c(hex) },
    w: { a: 0, k: width },
    o: { a: 0, k: opacity },
    lc: 2,
    lj: 2,
  }
}

function trim(startFrame, endFrame) {
  return {
    ty: 'tm',
    s: { a: 0, k: 0 },
    e: { a: 1, k: [k(startFrame, 0), k(endFrame, 100), k(OP, 100)] },
    o: { a: 0, k: 0 },
    m: 1,
  }
}

function group(name, items) {
  return { ty: 'gr', nm: name, it: [...items, tr()] }
}

function shapeLayer(name, shapes, opts = {}) {
  visual.push({
    ty: 4,
    nm: name,
    ind: ind++,
    ip: opts.ip ?? 0,
    op: opts.op ?? OP,
    st: 0,
    bm: 0,
    ks: {
      o: prop(opts.o ?? 100),
      r: prop(opts.r ?? 0),
      p: prop(opts.p ?? [0, 0, 0]),
      a: prop(opts.a ?? [0, 0, 0]),
      s: prop(opts.s ?? [100, 100, 100]),
    },
    shapes,
  })
}

function doc(text, size, color, opts = {}) {
  return {
    sz: [opts.w ?? 520, opts.h ?? 120],
    ps: [0, 0],
    s: size,
    f: opts.weight === 'bold' ? 'Inter-Bold' : opts.weight === 'semibold' ? 'Inter-SemiBold' : 'Inter-Regular',
    t: text,
    j: opts.align ?? 0,
    tr: 0,
    lh: opts.lh ?? Math.round(size * 1.22),
    ls: 0,
    fc: c(color).slice(0, 3),
  }
}

function textLayer(name, text, x, y, size, color, opts = {}) {
  const documents = opts.docs
    ? opts.docs.map(d => ({ t: d.frame, s: doc(d.text, size, color, opts) }))
    : [{ s: doc(text, size, color, opts), t: 0 }]

  visual.push({
    ty: 5,
    nm: name,
    ind: ind++,
    ip: opts.ip ?? 0,
    op: opts.op ?? OP,
    st: 0,
    bm: 0,
    ks: {
      o: prop(opts.o ?? 100),
      r: prop(opts.r ?? 0),
      p: prop(opts.p ?? [x, y, 0]),
      a: prop(opts.a ?? [0, 0, 0]),
      s: prop(opts.s ?? [100, 100, 100]),
    },
    t: {
      a: [],
      d: { k: documents },
      p: {},
      m: { g: 1, a: { a: 0, k: [0, 0] } },
    },
  })
}

function wrapText(text, max = 36) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.join('\n')
}

function typingDocs(text, startFrame, stepFrames) {
  const docs = []
  for (let i = 0; i <= text.length; i += 1) {
    docs.push({ frame: startFrame + i * stepFrames, text: text.slice(0, i) })
  }
  docs.push({ frame: startFrame + text.length * stepFrames + 24, text })
  return docs
}

function fadeIn(start, end, peak = 100, outStart = null, outEnd = null) {
  const keys = [k(0, 0), k(start, 0), k(end, peak)]
  if (outStart != null && outEnd != null) keys.push(k(outStart, peak), k(outEnd, 0), k(OP, 0))
  else keys.push(k(OP, peak))
  return keys
}

function fly(fromX, fromY, toX, toY, start, end) {
  return [k(0, [fromX, fromY, 0]), k(start, [fromX, fromY, 0]), k(end, [toX, toY, 0]), k(OP, [toX, toY, 0])]
}

function card(name, x, y, w, h, title, subtitle, accent, start, from = [1520, y + 80]) {
  const p = fly(from[0], from[1], x, y, start, start + 28)
  shapeLayer(`${name}-shadow`, [group('shadow', [rc(10, 14, w, h, 22), fill('#000000', 24)])], {
    p,
    o: fadeIn(start, start + 20, 100),
  })
  shapeLayer(`${name}-panel`, [
    group('panel', [
      rc(0, 0, w, h, 22),
      fill('#101725', 96),
      stroke('#30384d', 1.2, 100),
    ]),
    group('accent', [rc(-w / 2 + 8, 0, 6, h - 28, 5), fill(accent, 100)]),
    group('status', [el(w / 2 - 32, -h / 2 + 32, 16, 16), fill('#34d399', 100)]),
  ], { p, o: fadeIn(start, start + 20, 100) })
  textLayer(`${name}-title`, title, x - w / 2 + 26, y - h / 2 + 28, 24, '#f8fafc', {
    w: w - 76,
    h: 34,
    weight: 'semibold',
    p: fly(from[0] - w / 2 + 26, from[1] - h / 2 + 28, x - w / 2 + 26, y - h / 2 + 28, start, start + 28),
    o: fadeIn(start + 8, start + 24, 100),
  })
  textLayer(`${name}-sub`, subtitle, x - w / 2 + 26, y - h / 2 + 62, 18, '#9ca3af', {
    w: w - 52,
    h: 52,
    lh: 24,
    p: fly(from[0] - w / 2 + 26, from[1] - h / 2 + 62, x - w / 2 + 26, y - h / 2 + 62, start, start + 28),
    o: fadeIn(start + 12, start + 28, 100),
  })
}

function fileCard(name, x, y, label, accent, start, from = [1240, 690]) {
  const p = fly(from[0], from[1], x, y, start, start + 24)
  shapeLayer(`${name}-file`, [
    group('paper', [rc(0, 0, 118, 150, 16), fill('#f8fafc', 100), stroke('#ffffff', 1, 40)]),
    group('fold', [path([[31, -75], [59, -47], [31, -47]], true), fill('#dbeafe', 100)]),
    group('accent', [rc(0, 44, 88, 24, 12), fill(accent, 100)]),
    group('line1', [rc(-8, -26, 64, 6, 3), fill('#334155', 65)]),
    group('line2', [rc(-3, -10, 76, 6, 3), fill('#64748b', 60)]),
    group('line3', [rc(-12, 6, 58, 6, 3), fill('#94a3b8', 70)]),
  ], { p, o: fadeIn(start, start + 18, 100) })
  textLayer(`${name}-label`, label, x - 39, y + 39, 18, '#0f172a', {
    w: 78,
    h: 24,
    align: 1,
    weight: 'bold',
    p: fly(from[0] - 39, from[1] + 39, x - 39, y + 39, start, start + 24),
    o: fadeIn(start + 8, start + 20, 100),
  })
}

function dotPulse(name, x, y, size, color, offset = 0) {
  shapeLayer(name, [group('dot', [el(0, 0, size, size), fill(color, 78)])], {
    p: [
      k(0, [x, y, 0]),
      k(540, [x + 16, y - 12, 0]),
      k(OP, [x - 8, y + 10, 0]),
    ],
    s: [
      k(0, [80, 80, 100]),
      k(120 + offset, [80, 80, 100]),
      k(160 + offset, [132, 132, 100]),
      k(210 + offset, [80, 80, 100]),
      k(OP, [80, 80, 100]),
    ],
    o: [
      k(0, 20),
      k(130 + offset, 65),
      k(220 + offset, 24),
      k(720 + offset, 70),
      k(OP, 24),
    ],
  })
}

function connection(name, a, b, color, start, opacity = 65) {
  shapeLayer(name, [group('connection', [path([a, b], false), stroke(color, 2, opacity), trim(start, start + 34)])], {
    o: fadeIn(start, start + 18, 100, 1010, 1060),
  })
}

function addBackground() {
  shapeLayer('background-base', [group('bg', [rc(W / 2, H / 2, W, H, 0), fill('#03050b', 100)])])
  shapeLayer('background-vignette', [
    group('purple-halo', [el(360, 150, 860, 430), fill('#7c3aed', 10)]),
    group('cyan-halo', [el(1510, 600, 680, 460), fill('#22d3ee', 8)]),
    group('green-halo', [el(1090, 930, 540, 260), fill('#34d399', 6)]),
  ])
  for (let i = 0; i < 10; i += 1) {
    const y = 130 + i * 84
    shapeLayer(`grid-line-h-${i}`, [group('line', [path([[130, y], [1790, y]], false), stroke('#1f2937', 1, i % 3 === 0 ? 28 : 16)])])
  }
  for (let i = 0; i < 12; i += 1) {
    const x = 160 + i * 145
    shapeLayer(`grid-line-v-${i}`, [group('line', [path([[x, 92], [x, 1006]], false), stroke('#111827', 1, 20)])])
  }
  dotPulse('ambient-dot-1', 220, 168, 9, '#a855f7', 0)
  dotPulse('ambient-dot-2', 1710, 206, 11, '#22d3ee', 40)
  dotPulse('ambient-dot-3', 1538, 890, 8, '#34d399', 80)
  dotPulse('ambient-dot-4', 860, 130, 7, '#f472b6', 110)
  dotPulse('ambient-dot-5', 125, 770, 10, '#fbbf24', 140)
}

function addChatInterface() {
  const cx = 520
  const cy = 540
  const w = 660
  const h = 850
  const baseP = [
    k(0, [cx - 18, cy + 22, 0]),
    k(120, [cx, cy, 0]),
    k(540, [cx + 6, cy - 4, 0]),
    k(OP, [cx - 2, cy + 4, 0]),
  ]

  shapeLayer('chat-screen-shadow', [group('shadow', [rc(20, 26, w + 8, h + 8, 36), fill('#000000', 36)])], {
    p: baseP,
    s: [k(0, [94, 94, 100]), k(120, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(0, 45, 100),
  })
  shapeLayer('chat-screen-body', [
    group('body', [rc(0, 0, w, h, 34), fill('#071016', 100), stroke('#26323f', 1.4, 100)]),
    group('messages-bg', [rc(0, 36, w - 42, h - 180, 24), fill('#0b141a', 100)]),
    group('header', [rc(0, -h / 2 + 52, w - 42, 78, 24), fill('#1f2c34', 100)]),
    group('input-bar', [rc(0, h / 2 - 52, w - 42, 74, 24), fill('#1f2c34', 100)]),
    group('input-wrap', [rc(-42, h / 2 - 52, w - 150, 46, 23), fill('#2a3942', 100)]),
    group('send-btn', [el(w / 2 - 74, h / 2 - 52, 44, 44), fill('#2a3942', 100)]),
  ], { p: baseP, s: [k(0, [94, 94, 100]), k(120, [100, 100, 100]), k(OP, [100, 100, 100])], o: fadeIn(0, 45, 100) })

  shapeLayer('chat-avatar', [
    group('avatar', [el(0, 0, 42, 42), fill('#2a3942', 100), stroke('#e5e7eb', 1.5, 32)]),
    group('status', [el(14, 14, 10, 10), fill('#25d366', 100)]),
    group('person-a', [el(0, -6, 12, 12), stroke('#ffffff', 1.7, 90)]),
    group('person-b', [path([[-12, 12], [-6, 4], [6, 4], [12, 12]], false), stroke('#ffffff', 1.7, 90)]),
  ], { p: [k(0, [248, 166, 0]), k(120, [262, 152, 0]), k(OP, [260, 156, 0])], o: fadeIn(0, 60, 100) })
  textLayer('chat-title', 'Asistente LLM', 298, 138, 24, '#e9edef', {
    w: 230,
    h: 34,
    weight: 'semibold',
    p: [k(0, [284, 152, 0]), k(120, [298, 138, 0]), k(OP, [296, 142, 0])],
    o: fadeIn(0, 60, 100),
  })
  textLayer('chat-subtitle', 'DeepSeek · en línea', 298, 170, 16, '#8696a0', {
    w: 260,
    h: 28,
    p: [k(0, [284, 184, 0]), k(120, [298, 170, 0]), k(OP, [296, 174, 0])],
    o: fadeIn(0, 60, 100),
  })
  textLayer('empty-state-title', '¿En qué puedo ayudarte?', 365, 468, 24, '#e9edef', {
    w: 340,
    h: 40,
    align: 1,
    weight: 'semibold',
    o: [k(0, 0), k(50, 88), k(128, 88), k(162, 0), k(OP, 0)],
  })
  for (let i = 0; i < 4; i += 1) {
    const x = 309 + (i % 2) * 170
    const y = 526 + Math.floor(i / 2) * 42
    shapeLayer(`quick-chip-${i}`, [group('chip', [rc(x, y, 142, 30, 15), fill('#ffffff', 6), stroke('#ffffff', 1, 9)])], {
      o: [k(0, 0), k(70 + i * 6, 100), k(128, 100), k(162, 0), k(OP, 0)],
    })
  }
  textLayer('input-placeholder', 'Escribe un mensaje o # para tareas...', 245, 884, 19, '#8696a0', {
    w: 430,
    h: 28,
    o: [k(0, 0), k(60, 100), k(128, 100), k(146, 0), k(OP, 0)],
  })
  shapeLayer('input-focus-glow', [
    group('glow', [rc(477, 884, 492, 56, 28), fill('#00a884', 8)]),
    group('border', [rc(477, 884, 492, 56, 28), fill('#000000', 0), stroke('#00d68f', 2, 76)]),
  ], { o: fadeIn(118, 142, 100, 304, 332) })

  const prompt = 'Crear un curso avanzado de Machine Learning usando Python de 32 semanas'
  textLayer('typing-prompt', '', 245, 861, 19, '#e9edef', {
    w: 440,
    h: 62,
    lh: 25,
    docs: typingDocs(prompt, 142, 2),
    o: [k(0, 0), k(132, 0), k(146, 100), k(304, 100), k(320, 0), k(OP, 0)],
  })

  shapeLayer('send-button-active', [
    group('halo', [el(0, 0, 72, 72), fill('#00a884', 16)]),
    group('button', [el(0, 0, 46, 46), fill('#00a884', 100)]),
    group('plane', [path([[-10, -10], [14, 0], [-10, 10], [-4, 0]], true), fill('#ffffff', 96)]),
  ], {
    p: [k(0, [776, 884, 0]), k(OP, [776, 884, 0])],
    s: [k(0, [86, 86, 100]), k(270, [86, 86, 100]), k(290, [112, 112, 100]), k(310, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(266, 284, 100, 318, 340),
  })

  shapeLayer('cursor', [
    group('pointer', [path([[0, 0], [26, 11], [13, 18], [8, 33]], true), fill('#ffffff', 100), stroke('#0b1220', 1.4, 75)]),
  ], {
    p: [
      k(0, [720, 820, 0]),
      k(88, [720, 820, 0]),
      k(126, [476, 884, 0]),
      k(278, [476, 884, 0]),
      k(304, [776, 884, 0]),
      k(330, [776, 884, 0]),
      k(370, [830, 820, 0]),
      k(420, [880, 760, 0]),
      k(OP, [880, 760, 0]),
    ],
    o: fadeIn(84, 96, 100, 360, 390),
  })
  shapeLayer('click-ring-input', [group('ring', [el(0, 0, 42, 42), fill('#000000', 0), stroke('#00d68f', 2, 86)])], {
    p: [476, 884, 0],
    s: [k(0, [40, 40, 100]), k(124, [40, 40, 100]), k(146, [135, 135, 100]), k(164, [155, 155, 100]), k(OP, [155, 155, 100])],
    o: [k(0, 0), k(124, 100), k(164, 0), k(OP, 0)],
  })
  shapeLayer('click-ring-send', [group('ring', [el(0, 0, 46, 46), fill('#000000', 0), stroke('#00d68f', 2, 92)])], {
    p: [776, 884, 0],
    s: [k(0, [40, 40, 100]), k(302, [40, 40, 100]), k(326, [150, 150, 100]), k(350, [170, 170, 100]), k(OP, [170, 170, 100])],
    o: [k(0, 0), k(302, 100), k(350, 0), k(OP, 0)],
  })

  shapeLayer('user-message-bubble', [
    group('bubble', [rc(0, 0, 432, 96, 18), fill('#005c4b', 100), stroke('#0ca678', 1, 42)]),
  ], {
    p: [k(0, [630, 282, 0]), k(315, [630, 282, 0]), k(344, [548, 314, 0]), k(OP, [548, 314, 0])],
    o: fadeIn(315, 344, 100),
  })
  textLayer('user-message-text', prompt, 358, 284, 18, '#e9edef', {
    w: 380,
    h: 72,
    lh: 24,
    p: [k(0, [440, 252, 0]), k(315, [440, 252, 0]), k(344, [358, 284, 0]), k(OP, [358, 284, 0])],
    o: fadeIn(322, 350, 100),
  })
  shapeLayer('assistant-avatar-small', [
    group('avatar', [el(0, 0, 30, 30), fill('#2a3942', 100), stroke('#ffffff', 1, 28)]),
  ], { p: [216, 404, 0], o: fadeIn(334, 354, 100) })
  shapeLayer('typing-bubble', [group('bubble', [rc(0, 0, 92, 44, 18), fill('#1f2c34', 100)])], {
    p: [286, 404, 0],
    o: fadeIn(334, 354, 100, 430, 448),
  })
  for (let i = 0; i < 3; i += 1) {
    shapeLayer(`typing-dot-${i}`, [group('dot', [el(0, 0, 9, 9), fill(['#8696a0', '#a855f7', '#22d3ee'][i], 100)])], {
      p: [260 + i * 26, 404, 0],
      s: [
        k(0, [70, 70, 100]),
        k(348 + i * 8, [70, 70, 100]),
        k(362 + i * 8, [120, 120, 100]),
        k(388 + i * 8, [70, 70, 100]),
        k(OP, [70, 70, 100]),
      ],
      o: fadeIn(334, 354, 100, 430, 448),
    })
  }
  shapeLayer('thinking-veil', [group('veil', [rc(520, 540, 600, 682, 24), fill('#03050b', 28)])], {
    o: fadeIn(344, 378, 100, 456, 490),
  })
  shapeLayer('assistant-reply-bubble', [group('bubble', [rc(0, 0, 332, 60, 18), fill('#1f2c34', 100), stroke('#334155', 1, 80)])], {
    p: [k(0, [296, 434, 0]), k(432, [296, 434, 0]), k(458, [366, 468, 0]), k(OP, [366, 468, 0])],
    o: fadeIn(432, 458, 100),
  })
  textLayer('assistant-reply-text', 'Aquí está tu plan de curso', 228, 456, 20, '#e9edef', {
    w: 296,
    h: 34,
    weight: 'semibold',
    p: [k(0, [158, 422, 0]), k(432, [158, 422, 0]), k(458, [228, 456, 0]), k(OP, [228, 456, 0])],
    o: fadeIn(438, 462, 100),
  })

  const autoText = 'Curso creado. Estoy generando miniaturas, documentos Word/PDF y guardando archivos en Cloudflare R2.'
  shapeLayer('automation-bubble-glow', [group('glow', [rc(0, 0, 488, 126, 24), fill('#34d399', 12)])], {
    p: [k(0, [376, 606, 0]), k(610, [376, 606, 0]), k(650, [430, 608, 0]), k(OP, [430, 608, 0])],
    s: [k(0, [88, 88, 100]), k(650, [106, 106, 100]), k(706, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(610, 646, 100, 1016, 1060),
  })
  shapeLayer('automation-bubble', [group('bubble', [rc(0, 0, 470, 112, 22), fill('#14211d', 100), stroke('#34d399', 1.6, 75)])], {
    p: [k(0, [344, 606, 0]), k(610, [344, 606, 0]), k(650, [430, 608, 0]), k(OP, [430, 608, 0])],
    o: fadeIn(610, 646, 100, 1016, 1060),
  })
  textLayer('automation-text', autoText, 222, 568, 18, '#d1fae5', {
    w: 418,
    h: 92,
    lh: 24,
    weight: 'semibold',
    p: [k(0, [136, 566, 0]), k(610, [136, 566, 0]), k(650, [222, 568, 0]), k(OP, [222, 568, 0])],
    o: fadeIn(622, 654, 100, 1016, 1060),
  })
}

function addThinkingNetwork() {
  const nodes = [
    [960, 330], [1048, 388], [922, 446], [1112, 492], [1008, 548], [1165, 370],
  ]
  connection('neural-line-1', nodes[0], nodes[1], '#a855f7', 354)
  connection('neural-line-2', nodes[1], nodes[3], '#22d3ee', 365)
  connection('neural-line-3', nodes[2], nodes[4], '#34d399', 374)
  connection('neural-line-4', nodes[0], nodes[2], '#a855f7', 382)
  connection('neural-line-5', nodes[1], nodes[5], '#f472b6', 390)
  connection('neural-line-6', nodes[3], nodes[4], '#22d3ee', 402)
  nodes.forEach(([x, y], i) => {
    shapeLayer(`neural-node-${i}`, [
      group('halo', [el(0, 0, 54, 54), fill(['#a855f7', '#22d3ee', '#34d399', '#f472b6'][i % 4], 12)]),
      group('dot', [el(0, 0, 15, 15), fill(['#a855f7', '#22d3ee', '#34d399', '#f472b6'][i % 4], 95)]),
    ], {
      p: [x, y, 0],
      s: [k(0, [60, 60, 100]), k(360 + i * 8, [60, 60, 100]), k(386 + i * 8, [120, 120, 100]), k(430 + i * 8, [90, 90, 100]), k(OP, [90, 90, 100])],
      o: fadeIn(342 + i * 8, 362 + i * 8, 100, 520, 560),
    })
  })
  for (let i = 0; i < 12; i += 1) {
    const x = 830 + (i % 4) * 116
    const y = 300 + Math.floor(i / 4) * 82
    shapeLayer(`reasoning-particle-${i}`, [group('particle', [el(0, 0, 6, 6), fill(i % 2 ? '#22d3ee' : '#a855f7', 80)])], {
      p: [k(0, [x, y, 0]), k(352 + i * 5, [x, y, 0]), k(450 + i * 4, [x + 42, y - 46, 0]), k(OP, [x + 42, y - 46, 0])],
      o: fadeIn(350 + i * 4, 366 + i * 4, 100, 492, 535),
    })
  }
}

function addCourseGeneration() {
  shapeLayer('course-board-shadow', [group('shadow', [rc(18, 22, 780, 740, 32), fill('#000000', 28)])], {
    p: [1284, 556, 0],
    o: fadeIn(420, 470, 100),
  })
  shapeLayer('course-board', [
    group('panel', [rc(0, 0, 780, 740, 32), fill('#080d18', 96), stroke('#334155', 1.3, 80)]),
    group('topbar', [rc(0, -338, 708, 58, 20), fill('#101725', 100)]),
    group('top-dot-a', [el(-326, -338, 12, 12), fill('#f472b6', 100)]),
    group('top-dot-b', [el(-302, -338, 12, 12), fill('#fbbf24', 100)]),
    group('top-dot-c', [el(-278, -338, 12, 12), fill('#34d399', 100)]),
  ], { p: [1284, 556, 0], o: fadeIn(420, 470, 100) })
  textLayer('course-board-title', 'Machine Learning con Python', 1000, 200, 30, '#f8fafc', {
    w: 520,
    h: 44,
    weight: 'bold',
    o: fadeIn(442, 476, 100),
  })
  textLayer('course-board-meta', '32 semanas · módulos, evidencias y materiales', 1000, 244, 19, '#9ca3af', {
    w: 560,
    h: 30,
    o: fadeIn(452, 484, 100),
  })

  card('module-card-1', 1110, 360, 360, 116, 'Módulo 01', 'Fundamentos de Python, datos y álgebra aplicada', '#a855f7', 462)
  card('module-card-2', 1474, 360, 360, 116, 'Módulo 02', 'Modelos supervisados, métricas y validación', '#22d3ee', 492)
  card('module-card-3', 1110, 510, 360, 116, 'Bloques semanales', 'Semana 1-8 · Semana 9-16 · Semana 17-24', '#34d399', 522)
  card('module-card-4', 1474, 510, 360, 116, 'Evidencias', 'Proyectos, notebooks, rúbricas y entregables', '#fbbf24', 552)
  card('module-card-5', 1292, 666, 724, 118, 'Plan inteligente', 'Competencias, resultados de aprendizaje y estructura por tareas', '#f472b6', 582, [1292, 870])

  connection('course-link-1', [1110, 420], [1110, 452], '#a855f7', 612, 55)
  connection('course-link-2', [1474, 420], [1474, 452], '#22d3ee', 626, 55)
  connection('course-link-3', [1160, 570], [1240, 620], '#34d399', 638, 55)
  connection('course-link-4', [1440, 570], [1360, 620], '#fbbf24', 650, 55)
}

function addAutomationScene() {
  fileCard('docx-card', 1006, 820, 'DOCX', '#2563eb', 674)
  fileCard('pdf-card', 1160, 820, 'PDF', '#ef4444', 696)
  fileCard('rubric-card', 1316, 820, 'RUB', '#a855f7', 718)

  shapeLayer('thumbnail-grid', [
    group('thumb-a', [rc(-132, -54, 150, 92, 18), fill('#111827', 100), stroke('#a855f7', 1, 70)]),
    group('thumb-a-glow', [rc(-132, -54, 112, 48, 14), fill('#a855f7', 18)]),
    group('thumb-b', [rc(48, -54, 150, 92, 18), fill('#111827', 100), stroke('#22d3ee', 1, 70)]),
    group('thumb-b-glow', [rc(48, -54, 112, 48, 14), fill('#22d3ee', 18)]),
    group('thumb-c', [rc(-132, 62, 150, 92, 18), fill('#111827', 100), stroke('#34d399', 1, 70)]),
    group('thumb-c-glow', [rc(-132, 62, 112, 48, 14), fill('#34d399', 18)]),
    group('thumb-d', [rc(48, 62, 150, 92, 18), fill('#111827', 100), stroke('#f472b6', 1, 70)]),
    group('thumb-d-glow', [rc(48, 62, 112, 48, 14), fill('#f472b6', 18)]),
  ], {
    p: [1572, 782, 0],
    s: [k(0, [82, 82, 100]), k(710, [82, 82, 100]), k(754, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(710, 748, 100),
  })
  textLayer('thumbnail-label', 'Miniaturas del curso', 1430, 760, 22, '#f8fafc', {
    w: 310,
    h: 32,
    weight: 'semibold',
    o: fadeIn(730, 762, 100),
  })

  shapeLayer('cloudflare-r2', [
    group('cloud-glow', [el(0, 0, 260, 136), fill('#f97316', 10)]),
    group('cloud-a', [el(-44, 8, 92, 64), fill('#1f2937', 100), stroke('#f97316', 1.3, 72)]),
    group('cloud-b', [el(18, -18, 108, 84), fill('#1f2937', 100), stroke('#f97316', 1.3, 72)]),
    group('cloud-c', [el(78, 12, 82, 60), fill('#1f2937', 100), stroke('#f97316', 1.3, 72)]),
    group('cloud-base', [rc(28, 32, 204, 54, 27), fill('#1f2937', 100), stroke('#f97316', 1.3, 72)]),
  ], {
    p: [1628, 226, 0],
    s: [k(0, [74, 74, 100]), k(756, [74, 74, 100]), k(806, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(756, 806, 100),
  })
  textLayer('cloudflare-title', 'Cloudflare R2', 1534, 274, 21, '#fed7aa', {
    w: 260,
    h: 32,
    weight: 'bold',
    align: 1,
    o: fadeIn(782, 820, 100),
  })
  shapeLayer('storage-bar', [
    group('track', [rc(0, 0, 300, 16, 8), fill('#111827', 100), stroke('#334155', 1, 70)]),
    group('fill-1', [rc(-110, 0, 78, 10, 5), fill('#f97316', 94)]),
    group('fill-2', [rc(-32, 0, 72, 10, 5), fill('#22d3ee', 94)]),
    group('fill-3', [rc(58, 0, 96, 10, 5), fill('#34d399', 94)]),
  ], {
    p: [1628, 334, 0],
    s: [k(0, [40, 100, 100]), k(800, [40, 100, 100]), k(880, [72, 100, 100]), k(958, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(798, 832, 100),
  })
  textLayer('storage-percent', '0%', 1592, 362, 19, '#bbf7d0', {
    w: 80,
    h: 28,
    align: 1,
    weight: 'bold',
    docs: [
      { frame: 800, text: '12%' },
      { frame: 848, text: '42%' },
      { frame: 902, text: '78%' },
      { frame: 958, text: '100%' },
    ],
    o: fadeIn(800, 832, 100),
  })

  const flightPaths = [
    ['file-flight-docx', [1006, 820], [1466, 308], '#2563eb', 810],
    ['file-flight-pdf', [1160, 820], [1518, 318], '#ef4444', 830],
    ['file-flight-thumb', [1572, 782], [1600, 322], '#22d3ee', 850],
    ['file-flight-rubric', [1316, 820], [1564, 330], '#a855f7', 870],
  ]
  flightPaths.forEach(([name, from, to, color, start]) => {
    shapeLayer(name, [group('packet', [el(0, 0, 14, 14), fill(color, 100)])], {
      p: [k(0, [...from, 0]), k(start, [...from, 0]), k(start + 70, [...to, 0]), k(OP, [...to, 0])],
      o: [k(0, 0), k(start, 0), k(start + 10, 100), k(start + 70, 100), k(start + 92, 0), k(OP, 0)],
      s: [k(0, [88, 88, 100]), k(start + 42, [130, 130, 100]), k(start + 92, [70, 70, 100]), k(OP, [70, 70, 100])],
    })
    shapeLayer(`${name}-trail`, [group('trail', [path([from, to], false), stroke(color, 2, 40), trim(start, start + 58)])], {
      o: fadeIn(start, start + 10, 100, start + 84, start + 112),
    })
  })
}

function addCompletion() {
  shapeLayer('completion-focus-scrim', [
    group('scrim', [rc(0, 0, 690, 390, 34), fill('#030712', 86), stroke('#1f8f6b', 1.5, 65)]),
  ], {
    p: [1286, 570, 0],
    o: fadeIn(952, 992, 100),
  })
  shapeLayer('completion-glow', [group('glow', [el(0, 0, 490, 260), fill('#34d399', 10)])], {
    p: [1286, 526, 0],
    s: [k(0, [70, 70, 100]), k(960, [70, 70, 100]), k(1018, [118, 118, 100]), k(OP, [104, 104, 100])],
    o: fadeIn(958, 1002, 100),
  })
  shapeLayer('success-badge', [
    group('halo', [el(0, 0, 154, 154), fill('#34d399', 14)]),
    group('badge', [el(0, 0, 96, 96), fill('#052e26', 100), stroke('#34d399', 2.4, 100)]),
    group('check', [path([[-22, 2], [-8, 18], [26, -20]], false), stroke('#34d399', 7, 100)]),
  ], {
    p: [1286, 448, 0],
    s: [k(0, [74, 74, 100]), k(956, [74, 74, 100]), k(1010, [122, 122, 100]), k(1040, [100, 100, 100]), k(OP, [100, 100, 100])],
    o: fadeIn(956, 1000, 100),
  })
  textLayer('complete-title', 'Curso completo', 1144, 536, 40, '#f8fafc', {
    w: 300,
    h: 56,
    weight: 'bold',
    align: 1,
    o: fadeIn(982, 1020, 100),
  })
  textLayer('complete-meta', '32 semanas · documentos · miniaturas · R2 sincronizado', 1032, 594, 22, '#bbf7d0', {
    w: 526,
    h: 36,
    align: 1,
    weight: 'semibold',
    o: fadeIn(1002, 1034, 100),
  })
  shapeLayer('final-organized-files', [
    group('stack-a', [rc(-190, 104, 118, 34, 10), fill('#1e293b', 100), stroke('#2563eb', 1, 80)]),
    group('stack-b', [rc(-54, 104, 118, 34, 10), fill('#1e293b', 100), stroke('#ef4444', 1, 80)]),
    group('stack-c', [rc(82, 104, 118, 34, 10), fill('#1e293b', 100), stroke('#a855f7', 1, 80)]),
    group('stack-d', [rc(218, 104, 118, 34, 10), fill('#1e293b', 100), stroke('#34d399', 1, 80)]),
  ], {
    p: [1222, 626, 0],
    o: fadeIn(1008, 1036, 100),
  })
}

addBackground()
addChatInterface()
addThinkingNetwork()
addCourseGeneration()
addAutomationScene()
addCompletion()

const animation = {
  v: '5.7.0',
  fr: FPS,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: 'CourseV premium AI course onboarding',
  ddd: 0,
  assets: [],
  fonts,
  layers: visual.reverse(),
}

writeFileSync(OUT, JSON.stringify(animation))
console.log(`Wrote ${OUT} (${animation.layers.length} layers, ${OP / FPS}s)`)
