import { writeFileSync } from 'node:fs'

const FPS = 60
const W = 1920
const H = 1080
const OP = 1320
const OUT = 'public/animations/coursev-ai-onboarding.json'

let ind = 1
const layers = []

const fonts = {
  list: [
    { fName: 'CourseV-Regular', fFamily: 'Arial', fStyle: 'Regular', ascent: 78 },
    { fName: 'CourseV-SemiBold', fFamily: 'Arial', fStyle: 'Semi Bold', ascent: 78 },
    { fName: 'CourseV-Bold', fFamily: 'Arial', fStyle: 'Bold', ascent: 78 },
  ],
}

const palette = {
  bg: '#03050b',
  appBlack: '#000000',
  header: '#0d0d0d',
  assistant: '#1c1c1e',
  input: '#1c1c1e',
  line: '#24242a',
  text: '#f5f5f7',
  muted: '#8e8e93',
  faint: '#636366',
  purple: '#6200ee',
  purpleLight: '#bf5af2',
  green: '#10a37f',
  greenBright: '#30d158',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  red: '#ff453a',
  card: '#101725',
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

function key(t, s, e = ease()) {
  return { t, s: Array.isArray(s) ? s : [s], ...e }
}

function hold(t, s) {
  return { t, s: Array.isArray(s) ? s : [s], h: 1 }
}

function prop(value) {
  if (Array.isArray(value) && value.length && typeof value[0] === 'object' && 't' in value[0]) {
    return { a: 1, k: value }
  }
  return { a: 0, k: value }
}

function fadeIn(start, end, peak = 100, outStart = null, outEnd = null) {
  const keys = start === 0
    ? [key(0, 0), key(end, peak)]
    : [key(0, 0), key(start, 0), key(end, peak)]
  if (outStart != null && outEnd != null) {
    keys.push(key(outStart, peak), key(outEnd, 0), key(OP, 0))
  } else {
    keys.push(key(OP, peak))
  }
  return keys
}

function fadeWindow(start, end, outStart, outEnd, peak = 100) {
  return fadeIn(start, end, peak, outStart, outEnd)
}

function move(from, to, start, end) {
  return [
    key(0, [...from, 0]),
    key(start, [...from, 0]),
    key(end, [...to, 0]),
    key(OP, [...to, 0]),
  ]
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

function gradient(name, colors, opacity = 100) {
  return {
    ty: 'gf',
    nm: name,
    t: 1,
    o: { a: 0, k: opacity },
    r: 1,
    g: {
      p: colors.length,
      k: {
        a: 0,
        k: colors.flatMap((entry, idx) => {
          const stop = colors.length === 1 ? 0 : idx / (colors.length - 1)
          const rgb = c(entry).slice(0, 3)
          return [stop, ...rgb]
        }),
      },
    },
    s: { a: 0, k: [-220, -120] },
    e: { a: 0, k: [220, 120] },
  }
}

function trim(start, end) {
  return {
    ty: 'tm',
    s: { a: 0, k: 0 },
    e: { a: 1, k: [key(0, 0), key(start, 0), key(end, 100), key(OP, 100)] },
    o: { a: 0, k: 0 },
    m: 1,
  }
}

function group(name, items) {
  return { ty: 'gr', nm: name, it: [...items, tr()] }
}

function shapeLayer(name, shapes, opts = {}) {
  layers.push({
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
    f: opts.weight === 'bold'
      ? 'CourseV-Bold'
      : opts.weight === 'semibold'
        ? 'CourseV-SemiBold'
        : 'CourseV-Regular',
    t: text,
    j: opts.align ?? 0,
    tr: 0,
    lh: opts.lh ?? Math.round(size * 1.24),
    ls: 0,
    fc: c(color).slice(0, 3),
  }
}

function textLayer(name, text, x, y, size, color, opts = {}) {
  const documents = opts.docs
    ? opts.docs.map(item => ({ t: item.frame, s: doc(item.text, size, color, opts) }))
    : [{ t: 0, s: doc(text, size, color, opts) }]

  layers.push({
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

function typeDocs(text, start, step = 2) {
  const docs = []
  for (let i = 0; i <= text.length; i += 1) {
    docs.push({ frame: Math.round(start + i * step), text: text.slice(0, i) })
  }
  docs.push({ frame: Math.round(start + text.length * step + 24), text })
  return docs
}

function wrap(text, max = 38) {
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
  return lines.join('\r')
}

function checkShape(size = 1) {
  const s = size
  return path([[-12 * s, 1 * s], [-4 * s, 9 * s], [14 * s, -12 * s]], false)
}

function sendPlaneShape() {
  return path([[-10, -10], [16, 0], [-10, 10], [-4, 0]], true)
}

function cursor(name, points, start, end, outStart = null, outEnd = null) {
  const frames = [key(0, [...points[0], 0])]
  points.forEach(([x, y], i) => {
    const t = start + i * ((end - start) / Math.max(points.length - 1, 1))
    frames.push(key(Math.round(t), [x, y, 0]))
  })
  frames.push(key(OP, [...points.at(-1), 0]))

  shapeLayer(name, [
    group('pointer', [
      path([[0, 0], [28, 12], [14, 19], [8, 35]], true),
      fill('#ffffff', 100),
      stroke('#050816', 1.6, 80),
    ]),
  ], {
    p: frames,
    o: fadeIn(start - 8, start, 100, outStart, outEnd),
  })
}

function clickRing(name, x, y, frame, color = palette.purpleLight, size = 58) {
  shapeLayer(name, [group('ring', [el(0, 0, size, size), fill('#000000', 0), stroke(color, 3, 90)])], {
    p: [x, y, 0],
    s: [
      key(0, [35, 35, 100]),
      key(frame, [35, 35, 100]),
      key(frame + 18, [145, 145, 100]),
      key(frame + 36, [165, 165, 100]),
      key(OP, [165, 165, 100]),
    ],
    o: [key(0, 0), key(frame, 100), key(frame + 36, 0), key(OP, 0)],
  })
}

function addBackground() {
  shapeLayer('background-base', [
    group('base', [rc(W / 2, H / 2, W, H, 0), fill(palette.bg, 100)]),
  ])
  shapeLayer('background-glow', [
    group('purple-glow', [el(390, 120, 850, 420), fill(palette.purpleLight, 11)]),
    group('green-glow', [el(1550, 820, 700, 380), fill(palette.greenBright, 8)]),
    group('cyan-glow', [el(1420, 260, 620, 320), fill(palette.cyan, 8)]),
  ])
  for (let i = 0; i < 12; i += 1) {
    const y = 120 + i * 78
    shapeLayer(`grid-h-${i}`, [group('grid', [path([[110, y], [1810, y]], false), stroke('#1f2937', 1, i % 3 === 0 ? 26 : 13)])])
  }
  for (let i = 0; i < 14; i += 1) {
    const x = 110 + i * 130
    shapeLayer(`grid-v-${i}`, [group('grid', [path([[x, 70], [x, 1010]], false), stroke('#111827', 1, 18)])])
  }
  for (let i = 0; i < 18; i += 1) {
    const x = 150 + ((i * 139) % 1640)
    const y = 110 + ((i * 83) % 850)
    const color = [palette.purpleLight, palette.cyan, palette.greenBright, palette.amber][i % 4]
    shapeLayer(`ambient-node-${i}`, [
      group('node', [el(0, 0, 6 + (i % 3) * 2, 6 + (i % 3) * 2), fill(color, 65)]),
    ], {
      p: [key(0, [x, y, 0]), key(620, [x + (i % 2 ? 18 : -16), y + (i % 3 ? -12 : 14), 0]), key(OP, [x, y, 0])],
      o: [key(0, 22), key(140 + i * 13, 65), key(260 + i * 11, 28), key(900, 65), key(OP, 28)],
    })
  }
}

const chat = {
  x: 500,
  y: 540,
  w: 620,
  h: 900,
}

function addChatFrame() {
  const { x, y, w, h } = chat
  shapeLayer('chat-device-shadow', [group('shadow', [rc(22, 28, w + 12, h + 12, 42), fill('#000000', 42)])], {
    p: [key(0, [x - 28, y + 28, 0]), key(70, [x, y, 0]), key(OP, [x, y, 0])],
    s: [key(0, [96, 96, 100]), key(70, [100, 100, 100]), key(OP, [100, 100, 100])],
    o: fadeIn(0, 46, 100),
  })
  shapeLayer('chat-device-body', [
    group('body', [rc(0, 0, w, h, 38), fill(palette.appBlack, 100), stroke('#24242a', 1.5, 100)]),
    group('header', [rc(0, -h / 2 + 52, w, 104, 38), fill(palette.header, 100)]),
    group('divider', [rc(0, -h / 2 + 104, w, 2, 0), fill('#ffffff', 8)]),
    group('input-area', [rc(0, h / 2 - 52, w, 104, 38), fill(palette.header, 100), stroke('#ffffff', 1, 5)]),
    group('input', [rc(-28, h / 2 - 52, w - 192, 52, 26), fill(palette.input, 100)]),
    group('send', [el(w / 2 - 54, h / 2 - 52, 44, 44), fill(palette.purple, 100)]),
    group('mic', [el(-w / 2 + 108, h / 2 - 52, 36, 36), fill('#111111', 100), stroke('#333333', 1, 80)]),
    group('course-mode-icon', [el(-w / 2 + 58, h / 2 - 52, 36, 36), fill('#111111', 100), stroke('#333333', 1, 80)]),
  ], {
    p: [key(0, [x - 28, y + 28, 0]), key(70, [x, y, 0]), key(OP, [x, y, 0])],
    s: [key(0, [96, 96, 100]), key(70, [100, 100, 100]), key(OP, [100, 100, 100])],
    o: fadeIn(0, 46, 100),
  })

  shapeLayer('chat-header-icons', [
    group('back', [path([[-8, 0], [2, -10], [-8, 0], [2, 10]], false), stroke('#ffffff', 2.4, 96)]),
    group('avatar', [el(62, 0, 42, 42), fill('#1c1c1e', 100), stroke(palette.green, 1.6, 90)]),
    group('avatar-i', [path([[62, -5], [62, 7]], false), stroke(palette.green, 2.1, 100)]),
    group('status', [el(77, 16, 10, 10), fill(palette.green, 100), stroke(palette.header, 2, 100)]),
    group('trash-top', [path([[494, -12], [536, -12]], false), stroke('#666666', 2.2, 100)]),
    group('trash-body', [path([[502, -8], [506, 18], [526, 18], [530, -8]], false), stroke('#666666', 2.2, 100)]),
  ], {
    p: [key(0, [220, 154, 0]), key(70, [230, 142, 0]), key(OP, [230, 142, 0])],
    o: fadeIn(18, 58, 100),
  })
  textLayer('bot-name', 'Asistente IA', 314, 126, 23, palette.text, {
    w: 240,
    h: 34,
    weight: 'semibold',
    o: fadeIn(20, 62, 100),
  })
  textLayer('bot-model', 'DeepSeek-V3.2-Speciale', 314, 156, 16, '#666666', {
    w: 280,
    h: 24,
    o: fadeIn(20, 62, 100),
  })
  shapeLayer('send-plane-icon', [
    group('plane', [sendPlaneShape(), fill('#ffffff', 96)]),
  ], {
    p: [756, 938, 0],
    o: fadeIn(38, 70, 100),
  })
  shapeLayer('course-cap-icon', [
    group('cap', [path([[-13, -2], [0, -9], [13, -2], [0, 5]], true), stroke(palette.muted, 1.7, 100)]),
    group('base', [path([[-8, 4], [-8, 10], [8, 10], [8, 4]], false), stroke(palette.muted, 1.7, 100)]),
  ], { p: [248, 938, 0], o: fadeIn(38, 70, 100) })
}

function addWelcomeState() {
  shapeLayer('welcome-avatar', [
    group('box', [rc(0, 0, 72, 72, 22), gradient('avatar-grad', ['#1c1c1e', '#2c2c2e'], 100), stroke('#ffffff', 1, 8)]),
    group('person-head', [el(0, -10, 18, 18), stroke('#8e8e93', 2, 100)]),
    group('person-body', [path([[-18, 20], [-8, 8], [8, 8], [18, 20]], false), stroke('#8e8e93', 2, 100)]),
  ], {
    p: [500, 444, 0],
    o: fadeWindow(54, 86, 160, 196, 100),
  })
  textLayer('welcome-title', 'Asistente IA', 380, 504, 28, palette.text, {
    w: 240,
    h: 40,
    weight: 'bold',
    align: 1,
    o: fadeWindow(64, 96, 160, 196, 100),
  })
  textLayer('welcome-desc', 'Haz preguntas sobre tus cursos, tareas y materias.', 338, 548, 18, palette.faint, {
    w: 324,
    h: 52,
    align: 1,
    lh: 24,
    o: fadeWindow(74, 106, 160, 196, 100),
  })
}

function addTaskPanel() {
  shapeLayer('task-panel-shadow', [group('shadow', [rc(18, 24, 760, 670, 28), fill('#000000', 28)])], {
    p: [1322, 540, 0],
    o: fadeWindow(70, 112, 772, 826, 100),
  })
  shapeLayer('task-panel', [
    group('panel', [rc(0, 0, 760, 670, 28), fill('#090f1a', 96), stroke('#334155', 1.2, 84)]),
    group('topbar', [rc(0, -286, 690, 66, 20), fill('#111827', 100)]),
    group('dot1', [el(-314, -286, 13, 13), fill(palette.red, 100)]),
    group('dot2', [el(-290, -286, 13, 13), fill(palette.amber, 100)]),
    group('dot3', [el(-266, -286, 13, 13), fill(palette.greenBright, 100)]),
  ], {
    p: [1322, 540, 0],
    o: fadeWindow(70, 112, 772, 826, 100),
  })
  textLayer('task-panel-title', 'Lista de tareas', 1012, 204, 30, palette.text, {
    w: 310,
    h: 44,
    weight: 'bold',
    o: fadeWindow(84, 120, 770, 818, 100),
  })
  textLayer('task-panel-meta', 'Curso: Backend con Node.js', 1012, 248, 20, '#9ca3af', {
    w: 380,
    h: 32,
    o: fadeWindow(94, 130, 770, 818, 100),
  })

  const rows = [
    ['Ensayo: Arquitectura web', 'Pendiente', palette.amber],
    ['Proyecto: API REST', 'Entregado', palette.cyan],
    ['Quiz: Autenticacion JWT', 'Pendiente', palette.amber],
    ['Practica: Deploy en Railway', 'Entregado', palette.cyan],
  ]
  rows.forEach(([title, status, color], i) => {
    const y = 338 + i * 92
    const isSelected = i === 1
    shapeLayer(`task-row-${i}`, [
      group('row', [rc(0, 0, 668, 70, 16), fill(isSelected ? '#111827' : '#0f172a', 100), stroke(isSelected ? palette.cyan : '#263244', isSelected ? 1.8 : 1, isSelected ? 92 : 58)]),
      group('icon', [rc(-298, 0, 38, 38, 11), fill(color, 18), stroke(color, 1, 72)]),
      group('paper', [path([[-304, -10], [-292, -10], [-286, -4], [-286, 12], [-304, 12]], false), stroke(color, 1.7, 100)]),
      group('status-dot', [el(284, 0, 12, 12), fill(color, 100)]),
    ], {
      p: [1322, y, 0],
      s: isSelected
        ? [key(0, [100, 100, 100]), key(160, [100, 100, 100]), key(186, [104, 104, 100]), key(224, [100, 100, 100]), key(OP, [100, 100, 100])]
        : [100, 100, 100],
      o: fadeWindow(108 + i * 12, 144 + i * 12, 770, 818, 100),
    })
    textLayer(`task-title-${i}`, title, 1065, y - 23, 22, palette.text, {
      w: 420,
      h: 32,
      weight: isSelected ? 'semibold' : 'regular',
      o: fadeWindow(116 + i * 12, 152 + i * 12, 770, 818, 100),
    })
    textLayer(`task-status-${i}`, status, 1065, y + 9, 16, '#9ca3af', {
      w: 260,
      h: 24,
      o: fadeWindow(122 + i * 12, 158 + i * 12, 770, 818, 100),
    })
  })

  shapeLayer('selected-task-glow', [
    group('glow', [rc(0, 0, 684, 86, 22), fill(palette.cyan, 8), stroke(palette.cyan, 2.2, 88)]),
  ], {
    p: [1322, 430, 0],
    s: [key(0, [94, 94, 100]), key(170, [94, 94, 100]), key(210, [106, 106, 100]), key(254, [100, 100, 100]), key(OP, [100, 100, 100])],
    o: fadeWindow(170, 202, 690, 746, 100),
  })

  shapeLayer('grade-chip-bg', [
    group('chip', [rc(0, 0, 142, 40, 20), fill('#052e26', 100), stroke(palette.greenBright, 1.6, 100)]),
    group('check', [checkShape(0.72), stroke(palette.greenBright, 4, 100)]),
  ], {
    p: [1600, 433, 0],
    s: [key(0, [80, 80, 100]), key(690, [80, 80, 100]), key(724, [112, 112, 100]), key(752, [100, 100, 100]), key(OP, [100, 100, 100])],
    o: fadeWindow(684, 716, 772, 818, 100),
  })
  textLayer('grade-chip', '9.2 / 10', 1540, 418, 20, '#d1fae5', {
    w: 120,
    h: 30,
    weight: 'bold',
    align: 1,
    o: fadeWindow(690, 722, 772, 818, 100),
  })
}

function addGradingChat() {
  const prompt = 'Califica la tarea API REST de Sofia con la rubrica del curso.'
  textLayer('grading-input-placeholder', 'Escribe un mensaje...', 328, 928, 19, '#666666', {
    w: 350,
    h: 28,
    o: fadeWindow(70, 96, 198, 222, 100),
  })
  shapeLayer('grading-input-focus', [
    group('glow', [rc(0, 0, 390, 58, 28), fill(palette.purpleLight, 9)]),
    group('line', [rc(0, 0, 390, 58, 28), fill('#000000', 0), stroke(palette.purpleLight, 2.2, 80)]),
  ], {
    p: [502, 938, 0],
    o: fadeWindow(198, 220, 356, 382, 100),
  })
  textLayer('grading-input-type', '', 328, 912, 18, palette.text, {
    w: 350,
    h: 62,
    lh: 23,
    docs: typeDocs(prompt, 220, 2),
    o: fadeWindow(214, 228, 356, 386, 100),
  })
  cursor('cursor-grade-flow', [[1440, 414], [1322, 430], [502, 938], [756, 938], [756, 938], [558, 566]], 132, 680, 714, 752)
  clickRing('click-task-row', 1322, 430, 170, palette.cyan, 64)
  clickRing('click-input-grade', 502, 938, 204, palette.purpleLight, 60)
  clickRing('click-send-grade', 756, 938, 362, palette.purpleLight, 56)

  shapeLayer('grading-user-bubble', [
    group('bubble', [rc(0, 0, 382, 82, 18), fill(palette.purple, 100)]),
  ], {
    p: [key(0, [642, 290, 0]), key(374, [642, 290, 0]), key(410, [556, 308, 0]), key(OP, [556, 308, 0])],
    o: fadeWindow(374, 410, 766, 810, 100),
  })
  textLayer('grading-user-text', wrap(prompt, 32), 390, 288, 18, '#ffffff', {
    w: 330,
    h: 64,
    lh: 23,
    o: fadeWindow(386, 414, 766, 810, 100),
    p: [key(0, [476, 270, 0]), key(374, [476, 270, 0]), key(410, [390, 288, 0]), key(OP, [390, 288, 0])],
  })
  textLayer('grading-user-time', '10:24', 646, 344, 13, '#ffffff', {
    w: 55,
    h: 18,
    align: 2,
    o: [key(0, 0), key(386, 0), key(414, 62), key(766, 62), key(810, 0), key(OP, 0)],
  })

  shapeLayer('assistant-small-avatar-grade', [
    group('avatar', [el(0, 0, 30, 30), fill('#1c1c1e', 100), stroke(palette.green, 1.3, 80)]),
  ], { p: [222, 420, 0], o: fadeWindow(410, 438, 766, 810, 100) })
  shapeLayer('typing-bubble-grade', [group('bubble', [rc(0, 0, 104, 46, 18), fill(palette.assistant, 100)])], {
    p: [302, 420, 0],
    o: fadeWindow(414, 440, 526, 550, 100),
  })
  for (let i = 0; i < 3; i += 1) {
    shapeLayer(`typing-grade-dot-${i}`, [group('dot', [el(0, 0, 8, 8), fill([palette.muted, palette.purpleLight, palette.greenBright][i], 100)])], {
      p: [268 + i * 28, 420, 0],
      s: [
        key(0, [70, 70, 100]),
        key(430 + i * 8, [70, 70, 100]),
        key(448 + i * 8, [126, 126, 100]),
        key(486 + i * 8, [70, 70, 100]),
        key(OP, [70, 70, 100]),
      ],
      o: fadeWindow(414, 440, 526, 550, 100),
    })
  }

  const reply = 'Calificacion sugerida: 9.2/10. Cumple endpoints, validacion y persistencia; mejora manejo de errores.'
  shapeLayer('grade-reply-bubble', [
    group('bubble', [rc(0, 0, 420, 112, 18), fill(palette.assistant, 100), stroke('#2c2c2e', 1, 100)]),
  ], {
    p: [key(0, [290, 462, 0]), key(530, [290, 462, 0]), key(566, [412, 476, 0]), key(OP, [412, 476, 0])],
    o: fadeWindow(530, 566, 766, 810, 100),
  })
  textLayer('grade-reply-text', wrap(reply, 39), 224, 432, 18, '#ffffff', {
    w: 370,
    h: 90,
    lh: 23,
    o: fadeWindow(544, 572, 766, 810, 100),
    p: [key(0, [102, 418, 0]), key(530, [102, 418, 0]), key(566, [224, 432, 0]), key(OP, [224, 432, 0])],
  })
  shapeLayer('grade-button-before', [
    group('btn', [rc(0, 0, 346, 46, 23), fill(palette.green, 100)]),
  ], {
    p: [key(0, [416, 556, 0]), key(584, [416, 556, 0]), key(618, [434, 566, 0]), key(680, [434, 566, 0]), key(704, [434, 566, 0]), key(OP, [434, 566, 0])],
    s: [key(0, [96, 96, 100]), key(584, [96, 96, 100]), key(618, [100, 100, 100]), key(666, [100, 100, 100]), key(684, [92, 92, 100]), key(OP, [92, 92, 100])],
    o: [key(0, 0), key(584, 0), key(618, 100), key(680, 100), key(704, 0), key(OP, 0)],
  })
  textLayer('grade-button-before-text', 'Agregar calificacion (9.2/10)', 282, 550, 17, '#ffffff', {
    w: 308,
    h: 26,
    weight: 'semibold',
    align: 1,
    o: [key(0, 0), key(590, 0), key(622, 100), key(680, 100), key(704, 0), key(OP, 0)],
  })
  clickRing('click-grade-button', 558, 566, 668, palette.greenBright, 58)

  shapeLayer('grade-button-after', [
    group('btn', [rc(0, 0, 318, 42, 21), fill('#063c31', 100), stroke(palette.greenBright, 1.3, 100)]),
    group('check', [checkShape(0.62), stroke(palette.greenBright, 3.4, 100)]),
  ], {
    p: [434, 566, 0],
    s: [key(0, [84, 84, 100]), key(686, [84, 84, 100]), key(724, [108, 108, 100]), key(752, [100, 100, 100]), key(OP, [100, 100, 100])],
    o: fadeWindow(686, 724, 766, 810, 100),
  })
  textLayer('grade-button-after-text', 'Calificacion agregada', 328, 560, 16, '#d1fae5', {
    w: 260,
    h: 24,
    weight: 'semibold',
    align: 1,
    o: fadeWindow(694, 724, 766, 810, 100),
  })
}

function addReasoningNetwork() {
  const nodes = [
    [940, 360], [1046, 314], [1124, 418], [1010, 508], [1172, 552], [918, 568],
  ]
  const links = [
    [0, 1, palette.purpleLight],
    [1, 2, palette.cyan],
    [2, 4, palette.greenBright],
    [0, 3, palette.purpleLight],
    [3, 5, palette.amber],
    [3, 4, palette.cyan],
  ]
  links.forEach(([a, b, color], i) => {
    shapeLayer(`grade-ai-link-${i}`, [
      group('line', [path([nodes[a], nodes[b]], false), stroke(color, 2.2, 42), trim(430 + i * 10, 462 + i * 10)]),
    ], {
      o: fadeWindow(430 + i * 10, 456 + i * 10, 566, 606, 100),
    })
  })
  nodes.forEach(([x, y], i) => {
    const color = [palette.purpleLight, palette.cyan, palette.greenBright, palette.amber][i % 4]
    shapeLayer(`grade-ai-node-${i}`, [
      group('halo', [el(0, 0, 52, 52), fill(color, 12)]),
      group('dot', [el(0, 0, 14, 14), fill(color, 96)]),
    ], {
      p: [x, y, 0],
      s: [key(0, [64, 64, 100]), key(430 + i * 8, [64, 64, 100]), key(460 + i * 8, [125, 125, 100]), key(512 + i * 8, [90, 90, 100]), key(OP, [90, 90, 100])],
      o: fadeWindow(418 + i * 6, 442 + i * 6, 570, 612, 100),
    })
  })
  for (let i = 0; i < 8; i += 1) {
    shapeLayer(`grade-packet-${i}`, [group('packet', [el(0, 0, 9, 9), fill(i % 2 ? palette.cyan : palette.greenBright, 100)])], {
      p: [key(0, [1180, 430, 0]), key(520 + i * 10, [1180, 430, 0]), key(612 + i * 8, [760, 545, 0]), key(OP, [760, 545, 0])],
      o: [key(0, 0), key(520 + i * 10, 0), key(532 + i * 10, 100), key(612 + i * 8, 100), key(638 + i * 8, 0), key(OP, 0)],
    })
  }
}

function addCourseModeBanner() {
  shapeLayer('course-banner', [
    group('banner', [rc(0, 0, chat.w, 46, 0), fill('#1a0f23', 100), stroke(palette.purpleLight, 1, 18)]),
    group('icon', [rc(-278, 0, 24, 24, 8), fill(palette.purpleLight, 18)]),
    group('cap', [path([[-286, 0], [-278, -5], [-270, 0], [-278, 5]], true), stroke(palette.purpleLight, 1.4, 100)]),
  ], {
    p: [chat.x, chat.y + chat.h / 2 - 120, 0],
    o: fadeIn(846, 878, 100),
  })
  textLayer('course-banner-text', 'Modo curso - describe la tematica o pega tu planificacion', 260, 820, 16, '#c7a0e8', {
    w: 480,
    h: 24,
    o: fadeIn(856, 882, 100),
  })
}

function addCourseChat() {
  const prompt = 'Creame un curso de programacion web full stack, nivel basico, 8 semanas.'
  shapeLayer('course-input-focus', [
    group('glow', [rc(0, 0, 390, 58, 28), fill(palette.purpleLight, 10)]),
    group('line', [rc(0, 0, 390, 58, 28), fill('#000000', 0), stroke(palette.purpleLight, 2.2, 82)]),
  ], { p: [502, 938, 0], o: fadeWindow(812, 832, 946, 970, 100) })
  textLayer('course-input-text', '', 328, 912, 18, palette.text, {
    w: 350,
    h: 62,
    lh: 23,
    docs: typeDocs(prompt, 834, 1.65),
    o: fadeWindow(824, 842, 946, 972, 100),
  })
  cursor('cursor-course-flow', [[252, 938], [502, 938], [756, 938], [620, 906], [622, 860]], 796, 1128, 1160, 1198)
  clickRing('click-course-mode', 248, 938, 806, palette.purpleLight, 58)
  clickRing('click-course-input', 502, 938, 824, palette.purpleLight, 58)
  clickRing('click-course-send', 756, 938, 954, palette.purpleLight, 58)

  shapeLayer('course-user-bubble', [
    group('bubble', [rc(0, 0, 390, 86, 18), fill(palette.purple, 100)]),
  ], {
    p: [key(0, [644, 300, 0]), key(964, [644, 300, 0]), key(996, [556, 302, 0]), key(OP, [556, 302, 0])],
    o: fadeIn(964, 996, 100),
  })
  textLayer('course-user-text', wrap(prompt, 34), 386, 278, 18, '#ffffff', {
    w: 338,
    h: 66,
    lh: 23,
    o: fadeIn(974, 1002, 100),
    p: [key(0, [474, 276, 0]), key(964, [474, 276, 0]), key(996, [386, 278, 0]), key(OP, [386, 278, 0])],
  })
  shapeLayer('typing-bubble-course', [group('bubble', [rc(0, 0, 104, 46, 18), fill(palette.assistant, 100)])], {
    p: [302, 410, 0],
    o: fadeWindow(1000, 1024, 1070, 1094, 100),
  })
  for (let i = 0; i < 3; i += 1) {
    shapeLayer(`typing-course-dot-${i}`, [group('dot', [el(0, 0, 8, 8), fill([palette.muted, palette.purpleLight, palette.cyan][i], 100)])], {
      p: [268 + i * 28, 410, 0],
      s: [
        key(0, [70, 70, 100]),
        key(1016 + i * 8, [70, 70, 100]),
        key(1034 + i * 8, [126, 126, 100]),
        key(1068 + i * 8, [70, 70, 100]),
        key(OP, [70, 70, 100]),
      ],
      o: fadeWindow(1000, 1024, 1070, 1094, 100),
    })
  }
  shapeLayer('course-assistant-bubble', [
    group('bubble', [rc(0, 0, 350, 52, 18), fill(palette.assistant, 100), stroke('#2c2c2e', 1, 100)]),
  ], {
    p: [key(0, [324, 414, 0]), key(1080, [324, 414, 0]), key(1110, [394, 428, 0]), key(OP, [394, 428, 0])],
    o: fadeIn(1080, 1110, 100),
  })
  textLayer('course-assistant-text', 'Aqui esta tu plan de curso.', 250, 413, 18, '#ffffff', {
    w: 300,
    h: 28,
    weight: 'semibold',
    o: fadeIn(1088, 1116, 100),
    p: [key(0, [180, 399, 0]), key(1080, [180, 399, 0]), key(1110, [250, 413, 0]), key(OP, [250, 413, 0])],
  })
}

function addCoursePlanCard() {
  shapeLayer('plan-card-shadow', [group('shadow', [rc(14, 18, 548, 382, 24), fill('#000000', 34)])], {
    p: [key(0, [506, 724, 0]), key(1084, [506, 724, 0]), key(1120, [500, 698, 0]), key(OP, [500, 698, 0])],
    o: fadeIn(1084, 1120, 100),
  })
  shapeLayer('plan-card-base', [
    group('base', [rc(0, 0, 548, 382, 22), gradient('plan-grad', ['#3f3f46', '#2f3035', '#242529'], 100), stroke('#ffffff', 1, 16)]),
    group('accent', [rc(0, -190, 548, 4, 2), gradient('accent', ['#d4d4d8', '#71717a'], 100)]),
    group('icon', [rc(-232, -144, 46, 46, 12), fill('#ffffff', 10), stroke('#ffffff', 1, 16)]),
    group('cap', [path([[-242, -144], [-232, -150], [-222, -144], [-232, -138]], true), stroke('#ffffff', 1.6, 100)]),
  ], {
    p: [key(0, [506, 724, 0]), key(1084, [506, 724, 0]), key(1120, [500, 698, 0]), key(OP, [500, 698, 0])],
    s: [key(0, [92, 92, 100]), key(1084, [92, 92, 100]), key(1128, [100, 100, 100]), key(OP, [100, 100, 100])],
    o: fadeIn(1084, 1120, 100),
  })
  textLayer('plan-eyebrow', 'PROPUESTA DE CURSO', 300, 542, 14, '#e4e4e7', {
    w: 220,
    h: 20,
    weight: 'bold',
    o: fadeIn(1100, 1126, 100),
  })
  textLayer('plan-title', 'Programacion Web Full Stack', 300, 568, 24, '#ffffff', {
    w: 420,
    h: 34,
    weight: 'semibold',
    o: fadeIn(1104, 1130, 100),
  })
  textLayer('plan-desc', wrap('Curso practico para crear interfaces, APIs, bases de datos y despliegues reales.', 48), 236, 612, 16, '#f4f4f5', {
    w: 470,
    h: 52,
    lh: 22,
    o: fadeIn(1112, 1138, 100),
  })
  const tags = [
    ['Desarrollo', 306, 678, 116],
    ['Basico', 426, 678, 82],
    ['8 semanas', 528, 678, 112],
  ]
  tags.forEach(([label, x, y, w], i) => {
    shapeLayer(`plan-tag-bg-${i}`, [group('tag', [rc(0, 0, w, 28, 14), fill('#ffffff', 10), stroke('#ffffff', 1, 14)])], {
      p: [x, y, 0],
      o: fadeIn(1120 + i * 6, 1142 + i * 6, 100),
    })
    textLayer(`plan-tag-text-${i}`, label, x - w / 2 + 10, y - 9, 13, '#ffffff', {
      w: w - 20,
      h: 18,
      align: 1,
      o: fadeIn(1122 + i * 6, 1144 + i * 6, 100),
    })
  })

  const modules = [
    ['1', 'Frontend moderno', 'HTML, CSS, Vue y componentes'],
    ['2', 'Backend y APIs', 'Node.js, autenticacion y datos'],
    ['3', 'Proyecto final', 'Deploy, rubrica y evidencias'],
  ]
  modules.forEach(([num, title, sub], i) => {
    const y = 720 + i * 44
    shapeLayer(`plan-module-${i}`, [
      group('row', [rc(0, 0, 474, 40, 12), fill('#ffffff', 8), stroke('#ffffff', 1, 12)]),
      group('num', [rc(-214, 0, 24, 24, 8), fill('#ffffff', 14)]),
    ], {
      p: [500, y, 0],
      o: fadeIn(1136 + i * 8, 1156 + i * 8, 100),
    })
    textLayer(`plan-module-num-${i}`, num, 278, y - 8, 12, '#ffffff', {
      w: 20,
      h: 18,
      weight: 'bold',
      align: 1,
      o: fadeIn(1138 + i * 8, 1158 + i * 8, 100),
    })
    textLayer(`plan-module-title-${i}`, title, 320, y - 14, 15, '#ffffff', {
      w: 190,
      h: 20,
      weight: 'semibold',
      o: fadeIn(1140 + i * 8, 1160 + i * 8, 100),
    })
    textLayer(`plan-module-sub-${i}`, sub, 320, y + 5, 12, '#d4d4d8', {
      w: 300,
      h: 18,
      o: fadeIn(1142 + i * 8, 1162 + i * 8, 100),
    })
  })

  shapeLayer('plan-confirm-before', [
    group('btn', [rc(0, 0, 178, 38, 19), fill('#52525b', 100)]),
    group('check', [checkShape(0.48), stroke('#ffffff', 2.8, 100)]),
  ], {
    p: [622, 860, 0],
    o: [key(0, 0), key(1116, 0), key(1130, 100), key(1138, 100), key(1162, 0), key(OP, 0)],
  })
  textLayer('plan-confirm-text', 'Confirmar y crear', 566, 849, 14, '#ffffff', {
    w: 120,
    h: 20,
    weight: 'semibold',
    align: 1,
    o: [key(0, 0), key(1116, 0), key(1130, 100), key(1138, 100), key(1162, 0), key(OP, 0)],
  })
  clickRing('click-confirm-course', 622, 860, 1132, '#ffffff', 56)
  shapeLayer('plan-confirm-loading', [
    group('btn', [rc(0, 0, 152, 38, 19), fill('#52525b', 100)]),
    group('spinner-track', [el(-54, 0, 16, 16), stroke('#ffffff', 2, 32)]),
    group('spinner-head', [path([[-54, -8], [-46, -4]], false), stroke('#ffffff', 2.4, 100)]),
  ], {
    p: [622, 860, 0],
    r: [key(0, 0), key(1160, 0), key(1210, 180), key(OP, 720)],
    o: fadeWindow(1138, 1162, 1222, 1244, 100),
  })
  textLayer('plan-confirm-loading-text', 'Creando...', 590, 849, 14, '#ffffff', {
    w: 100,
    h: 20,
    weight: 'semibold',
    align: 1,
    o: fadeWindow(1142, 1164, 1222, 1244, 100),
  })
  shapeLayer('plan-created-state', [
    group('done', [rc(0, 0, 490, 54, 16), fill('#ffffff', 8), stroke('#ffffff', 1, 14)]),
    group('check-bg', [el(-206, 0, 30, 30), fill('#71717a', 100)]),
    group('check', [checkShape(0.48), stroke('#ffffff', 2.8, 100)]),
    group('view', [rc(185, 0, 98, 34, 17), fill('#52525b', 100)]),
  ], {
    p: [500, 860, 0],
    s: [key(0, [88, 88, 100]), key(1218, [88, 88, 100]), key(1242, [104, 104, 100]), key(OP, [100, 100, 100])],
    o: fadeIn(1218, 1242, 100),
  })
  textLayer('plan-created-title', 'Curso creado', 322, 843, 15, '#ffffff', {
    w: 130,
    h: 20,
    weight: 'semibold',
    o: fadeIn(1222, 1244, 100),
  })
  textLayer('plan-created-sub', 'Listo para comenzar', 322, 862, 12, '#d4d4d8', {
    w: 160,
    h: 18,
    o: fadeIn(1224, 1246, 100),
  })
  textLayer('plan-view-text', 'Ver curso', 652, 849, 13, '#ffffff', {
    w: 70,
    h: 18,
    weight: 'semibold',
    align: 1,
    o: fadeIn(1228, 1248, 100),
  })
}

function addCourseAutomationPanel() {
  shapeLayer('automation-panel-shadow', [group('shadow', [rc(20, 24, 780, 720, 32), fill('#000000', 30)])], {
    p: [1328, 548, 0],
    o: fadeIn(930, 980, 100),
  })
  shapeLayer('automation-panel', [
    group('panel', [rc(0, 0, 780, 720, 32), fill('#080d18', 96), stroke('#334155', 1.2, 82)]),
    group('topbar', [rc(0, -324, 710, 58, 20), fill('#101725', 100)]),
    group('dot-a', [el(-326, -324, 12, 12), fill(palette.purpleLight, 100)]),
    group('dot-b', [el(-302, -324, 12, 12), fill(palette.cyan, 100)]),
    group('dot-c', [el(-278, -324, 12, 12), fill(palette.greenBright, 100)]),
  ], { p: [1328, 548, 0], o: fadeIn(930, 980, 100) })
  textLayer('automation-title', 'Creacion automatica del curso', 1010, 188, 30, palette.text, {
    w: 520,
    h: 42,
    weight: 'bold',
    o: fadeIn(950, 990, 100),
  })
  textLayer('automation-meta', 'Competencias -> modulos -> temas -> tareas -> materiales', 1010, 230, 19, '#9ca3af', {
    w: 620,
    h: 30,
    o: fadeIn(960, 998, 100),
  })

  const boxes = [
    ['Competencias', 'Resultados medibles', 1086, 340, palette.purpleLight, 1048],
    ['Modulos', '3 bloques principales', 1370, 340, palette.cyan, 1070],
    ['Tareas', 'Evidencias por semana', 1086, 500, palette.amber, 1092],
    ['Materiales', 'Docs, PDF y rubricas', 1370, 500, palette.greenBright, 1114],
  ]
  boxes.forEach(([title, sub, x, y, color, start]) => {
    shapeLayer(`automation-box-${title}`, [
      group('box', [rc(0, 0, 244, 108, 18), fill('#111827', 100), stroke(color, 1.4, 76)]),
      group('icon-bg', [rc(-94, -24, 32, 32, 10), fill(color, 18)]),
      group('line-a', [rc(18, -16, 112, 7, 4), fill('#ffffff', 16)]),
      group('line-b', [rc(-8, 8, 164, 7, 4), fill('#ffffff', 10)]),
    ], {
      p: [key(0, [x, y + 50, 0]), key(start, [x, y + 50, 0]), key(start + 34, [x, y, 0]), key(OP, [x, y, 0])],
      o: fadeIn(start, start + 32, 100),
    })
    textLayer(`automation-box-title-${title}`, title, x - 72, y - 38, 18, '#ffffff', {
      w: 180,
      h: 26,
      weight: 'semibold',
      o: fadeIn(start + 8, start + 34, 100),
    })
    textLayer(`automation-box-sub-${title}`, sub, x - 72, y + 22, 14, '#9ca3af', {
      w: 180,
      h: 22,
      o: fadeIn(start + 12, start + 38, 100),
    })
  })

  const linkDefs = [
    [[1208, 340], [1248, 340], palette.purpleLight, 1110],
    [[1086, 396], [1086, 444], palette.amber, 1122],
    [[1370, 396], [1370, 444], palette.cyan, 1134],
    [[1208, 500], [1248, 500], palette.greenBright, 1146],
  ]
  linkDefs.forEach(([a, b, color, start], i) => {
    shapeLayer(`automation-link-${i}`, [
      group('link', [path([a, b], false), stroke(color, 2.5, 58), trim(start, start + 34)]),
    ], { o: fadeIn(start, start + 18, 100) })
  })

  for (let i = 0; i < 12; i += 1) {
    const from = [780, 720]
    const to = [1050 + (i % 4) * 112, 625 + Math.floor(i / 4) * 40]
    const color = [palette.purpleLight, palette.cyan, palette.greenBright, palette.amber][i % 4]
    const start = 1150 + i * 6
    shapeLayer(`course-data-packet-${i}`, [group('packet', [el(0, 0, 10, 10), fill(color, 100)])], {
      p: [key(0, [...from, 0]), key(start, [...from, 0]), key(start + 62, [...to, 0]), key(OP, [...to, 0])],
      s: [key(0, [86, 86, 100]), key(start + 28, [130, 130, 100]), key(start + 78, [74, 74, 100]), key(OP, [74, 74, 100])],
      o: [key(0, 0), key(start, 0), key(start + 8, 100), key(start + 62, 100), key(start + 86, 0), key(OP, 0)],
    })
  }

  shapeLayer('created-course-card', [
    group('card', [rc(0, 0, 620, 132, 22), fill('#0f172a', 100), stroke(palette.greenBright, 1.6, 86)]),
    group('thumb', [rc(-248, 0, 92, 92, 18), gradient('thumb-grad', [palette.purpleLight, palette.cyan], 100)]),
    group('check-bg', [el(266, -34, 42, 42), fill('#052e26', 100), stroke(palette.greenBright, 1.8, 100)]),
    group('check', [checkShape(0.7), stroke(palette.greenBright, 4, 100)]),
    group('bar1', [rc(12, 16, 308, 9, 5), fill('#ffffff', 12)]),
    group('bar2', [rc(-32, 40, 220, 9, 5), fill('#ffffff', 9)]),
  ], {
    p: [1328, 756, 0],
    s: [key(0, [82, 82, 100]), key(1210, [82, 82, 100]), key(1244, [110, 110, 100]), key(OP, [100, 100, 100])],
    o: fadeIn(1210, 1242, 100),
  })
  textLayer('created-course-title', 'Programacion Web Full Stack', 1188, 704, 25, '#ffffff', {
    w: 360,
    h: 36,
    weight: 'bold',
    o: fadeIn(1218, 1246, 100),
  })
  textLayer('created-course-meta', '8 semanas - 3 modulos - 12 tareas', 1188, 742, 18, '#bbf7d0', {
    w: 360,
    h: 26,
    weight: 'semibold',
    o: fadeIn(1222, 1248, 100),
  })
}

function addFinalSuccess() {
  shapeLayer('final-check-glow', [
    group('glow', [el(0, 0, 240, 240), fill(palette.greenBright, 12)]),
    group('badge', [el(0, 0, 118, 118), fill('#052e26', 100), stroke(palette.greenBright, 2.6, 100)]),
    group('check', [checkShape(1.7), stroke(palette.greenBright, 8, 100)]),
  ], {
    p: [1596, 172, 0],
    s: [key(0, [70, 70, 100]), key(1218, [70, 70, 100]), key(1250, [126, 126, 100]), key(OP, [100, 100, 100])],
    o: fadeIn(1218, 1248, 100),
  })
  textLayer('final-label', 'Tarea calificada y curso creado', 1334, 272, 26, '#ffffff', {
    w: 520,
    h: 38,
    weight: 'bold',
    align: 1,
    o: fadeIn(1228, 1254, 100),
  })
}

addBackground()
addChatFrame()
addWelcomeState()
addTaskPanel()
addGradingChat()
addReasoningNetwork()
addCourseModeBanner()
addCourseChat()
addCoursePlanCard()
addCourseAutomationPanel()
addFinalSuccess()

const animation = {
  v: '5.7.0',
  fr: FPS,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: 'CourseV ChatBotView task grading and course creation showcase',
  ddd: 0,
  assets: [],
  fonts,
  slots: {
    bgColor: { p: { k: c(palette.bg) } },
    accentColor: { p: { k: c(palette.purpleLight) } },
  },
  layers: layers.reverse(),
}

writeFileSync(OUT, JSON.stringify(animation))
console.log(`Wrote ${OUT} (${animation.layers.length} layers, ${(OP / FPS).toFixed(1)}s)`)
