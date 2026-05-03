/**
 * Banco real de preguntas ICFES — Matemáticas 2020.
 * Fuente: docs/icfes_content/2020/matematicas/matematicas.txt
 *
 * Preguntas 9, 12 y 18 tienen opciones que son imágenes gráficas.
 * Se muestran como imagen en el enunciado; el alumno selecciona A, B, C o D.
 */

import type { IcfesQuestion } from './icfesAdapter'

const TOPIC = 'Razonamiento cuantitativo'

// ── URLs de imágenes ──────────────────────────────────────────────
const IMG_PISA_ANGULO  = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20211145.png'
const IMG_PISA_TABLA   = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20211701.png'
const IMG_PISCINAS     = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20211859.png'
const IMG_Q9_GRAFICAS  = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20212032.png'
const IMG_COMETA       = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20212311.png'
const IMG_ENCUESTA     = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20212444.png'
const IMG_Q12_GEOM     = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20212710.png'
const IMG_RAMIREZ      = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20213202.png'
const IMG_Q18_ARBOL    = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-02%20214432.png'

// ── Contextos compartidos ─────────────────────────────────────────
const CTX_PISA_TABLA = `La torre de Pisa recibió visitas durante una semana. Se registraron 3.100 visitantes sin reserva y 3.900 con reserva, para un total de 7.000 visitantes. Las entradas sin reserva tienen un costo de 17 euros y las entradas con reserva de 22,5 euros. (Ver tabla e imagen adjunta)`

const CTX_RAMIREZ = `La familia Ramírez tiene contratado un plan de telefonía con 220 minutos locales incluidos. En el mes de enero el consumo total fue de 331 minutos en llamadas locales. Los minutos adicionales se cobran a una tarifa diferente al plan. (Ver tabla e imagen adjunta)`

type MATQ = Omit<IcfesQuestion, 'area' | 'topic'>

const items: MATQ[] = [
  // ── 1 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-01',
    subtopic: 'Probabilidad',
    difficulty: 2,
    stem: 'En una bolsa hay 3 bolas rojas, 3 negras y 12 blancas. Una persona afirma que al sacar una bola al azar, los tres colores tienen la misma probabilidad de salir. Esta afirmación es...',
    options: [
      { id: 'A', text: 'verdadera, pues el número de bolas de cada color no importa.' },
      { id: 'B', text: 'falsa, pues no se sabe el número total de bolas en la bolsa.' },
      { id: 'C', text: 'falsa, pues hay más bolas de un color que de los otros dos.' },
      { id: 'D', text: 'verdadera, pues las bolas están repartidas de igual manera.' },
    ],
    correct: 'C',
    explanation: 'Hay 18 bolas en total. P(roja)=3/18, P(negra)=3/18, P(blanca)=12/18. Como 3 < 12, el color blanco tiene mayor probabilidad; los colores NO son equiprobables.',
  },

  // ── 2 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-02',
    subtopic: 'Geometría',
    difficulty: 2,
    stem: 'La torre de Pisa, con respecto a la vertical, se ha inclinado 4° como se muestra en la imagen. ¿Cuánto mide el otro ángulo formado entre la torre y el suelo horizontal?',
    images: [
      { id: 'MAT-2020-02-stem', position: 'stem', url: IMG_PISA_ANGULO, alt: 'Diagrama de la torre de Pisa inclinada 4° respecto a la vertical' },
    ],
    options: [
      { id: 'A', text: '4°' },
      { id: 'B', text: '14°' },
      { id: 'C', text: '86°' },
      { id: 'D', text: '90°' },
    ],
    correct: 'C',
    explanation: 'La suma de los dos ángulos debe ser 90°. Como uno mide 4°, el otro mide 90° − 4° = 86°.',
  },

  // ── 3 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-03',
    subtopic: 'Estadística',
    difficulty: 3,
    stem: `${CTX_PISA_TABLA}\n\nAproximadamente, ¿qué porcentaje del total de personas que visitaron la torre esa semana entraron sin hacer reserva?`,
    images: [
      { id: 'MAT-2020-03-stem', position: 'stem', url: IMG_PISA_TABLA, alt: 'Tabla de visitantes de la torre de Pisa por tipo de entrada' },
    ],
    options: [
      { id: 'A', text: '56%' },
      { id: 'B', text: '50%' },
      { id: 'C', text: '44%' },
      { id: 'D', text: '40%' },
    ],
    correct: 'C',
    explanation: '3.100 sin reserva sobre 7.000 total: (3.100/7.000)×100 ≈ 44%.',
  },

  // ── 4 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-04',
    subtopic: 'Razonamiento',
    difficulty: 3,
    stem: `${CTX_PISA_TABLA}\n\nEl proceso para obtener el dinero recaudado en la semana es: 1. Sumar la cantidad de personas por tipo de entrada. 2. Multiplicar esa cantidad por el precio de la entrada. 3. Comparar los recaudos.\n\n¿Cuál de las siguientes preguntas NO se puede resolver empleando una parte del proceso anterior?`,
    images: [
      { id: 'MAT-2020-04-stem', position: 'stem', url: IMG_PISA_TABLA, alt: 'Tabla de visitantes y precios de la torre de Pisa' },
    ],
    options: [
      { id: 'A', text: '¿Con cuál tipo de entrada se recaudó más dinero?' },
      { id: 'B', text: '¿Cuántas personas ingresaron en la semana?' },
      { id: 'C', text: '¿Cuál es la ganancia total del sitio turístico?' },
      { id: 'D', text: '¿Cuánto dinero se recaudó por tipo de entrada?' },
    ],
    correct: 'C',
    explanation: 'Con el proceso solo se calcula el dinero recaudado por entradas. La ganancia total requiere conocer también los gastos, que son desconocidos.',
  },

  // ── 5 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-05',
    subtopic: 'Estadística',
    difficulty: 3,
    stem: `${CTX_PISA_TABLA}\n\nEl recaudo total de la semana fue aproximadamente de...`,
    images: [
      { id: 'MAT-2020-05-stem', position: 'stem', url: IMG_PISA_TABLA, alt: 'Tabla de visitantes y precios de la torre de Pisa' },
    ],
    options: [
      { id: 'A', text: '14 mil euros.' },
      { id: 'B', text: '140 mil euros.' },
      { id: 'C', text: '120 euros.' },
      { id: 'D', text: '120.000 euros.' },
    ],
    correct: 'B',
    explanation: 'Sin reserva: 3.100 × 17 = 52.700 €. Con reserva: 3.900 × 22,5 = 87.750 €. Total ≈ 140.450 € ≈ 140 mil euros.',
  },

  // ── 6 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-06',
    subtopic: 'Estadística',
    difficulty: 3,
    stem: `${CTX_PISA_TABLA}\n\nLa mediana de la cantidad de turistas sin reserva que ingresan a la torre es 300 y la de los que ingresan con reserva es 600. Solamente teniendo esto en cuenta, ¿es correcto afirmar que entran el doble de turistas con reserva que sin ella?`,
    images: [
      { id: 'MAT-2020-06-stem', position: 'stem', url: IMG_PISA_TABLA, alt: 'Tabla de visitantes de la torre de Pisa' },
    ],
    options: [
      { id: 'A', text: 'No, la mediana es una medida de localización central.' },
      { id: 'B', text: 'No, la mediana muestra la dispersión de los datos.' },
      { id: 'C', text: 'Sí, la mediana me da el promedio de los datos.' },
      { id: 'D', text: 'Sí, la mediana me da la mitad de los datos.' },
    ],
    correct: 'A',
    explanation: 'La mediana es el valor central de los datos ordenados, no representa el total ni el promedio. No se puede concluir que entran el doble de turistas con reserva.',
  },

  // ── 7 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-07',
    subtopic: 'Álgebra',
    difficulty: 3,
    stem: 'El dueño de un parque recreativo planea construir tres piscinas y decorar sus bordes con baldosas blancas y azules. Observando las figuras 1, 2 y 3 de la imagen, puede afirmarse correctamente que el número de baldosas...',
    images: [
      { id: 'MAT-2020-07-stem', position: 'stem', url: IMG_PISCINAS, alt: 'Tres piscinas con bordes de baldosas blancas y azules de tamaño creciente' },
    ],
    options: [
      { id: 'A', text: 'azules se incrementa en seis de una piscina a la del siguiente tamaño.' },
      { id: 'B', text: 'blancas aumenta en ocho a medida que crece el tamaño de las piscinas.' },
      { id: 'C', text: 'azules es el doble de la cantidad de baldosas blancas en cada piscina.' },
      { id: 'D', text: 'blancas es la tercera parte de la cantidad de las baldosas azules.' },
    ],
    correct: 'A',
    explanation: 'En la figura 1 hay 12 baldosas azules, en la 2 hay 18 (+6) y en la 3 hay 24 (+6). El número de baldosas azules aumenta en 6 de una piscina a la siguiente.',
  },

  // ── 8 ─────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-08',
    subtopic: 'Probabilidad',
    difficulty: 4,
    stem: 'Se lanzan cuatro fichas que tienen dos caras cada una. Una ficha es azul por sus dos caras, otra es blanca por sus dos caras, y las otras dos tienen una cara azul y una cara blanca. ¿Cuál de los siguientes eventos es imposible que ocurra?',
    options: [
      { id: 'A', text: 'Obtener una cara azul y tres caras blancas.' },
      { id: 'B', text: 'Obtener dos caras azules y dos caras blancas.' },
      { id: 'C', text: 'Obtener tres caras azules y una cara blanca.' },
      { id: 'D', text: 'Obtener cuatro caras azules y cero blancas.' },
    ],
    correct: 'D',
    explanation: 'La ficha totalmente blanca siempre mostrará blanco en cualquier lanzamiento. Por tanto, es imposible obtener cuatro caras azules y cero blancas.',
  },

  // ── 9 — opciones son imágenes (gráficas) ──────────────────────
  {
    id: 'MAT-2020-09',
    subtopic: 'Funciones',
    difficulty: 3,
    stem: 'El costo de la boleta en un cinema depende de la edad de la persona según la siguiente tabla: menores de 8 años: $5.000; de 8 a 16 años: $7.000; de 16 a 56 años: $10.000; mayores de 56 años: $6.000.\n\nObserva las cuatro gráficas de la imagen y selecciona la que representa correctamente esta función a trozos.',
    images: [
      { id: 'MAT-2020-09-stem', position: 'stem', url: IMG_Q9_GRAFICAS, alt: 'Cuatro gráficas (A, B, C y D) que representan posibles funciones a trozos para el costo del cine según la edad' },
    ],
    options: [
      { id: 'A', text: 'Gráfica A' },
      { id: 'B', text: 'Gráfica B' },
      { id: 'C', text: 'Gráfica C' },
      { id: 'D', text: 'Gráfica D' },
    ],
    correct: 'A',
    explanation: 'La gráfica A muestra correctamente los cuatro tramos: $5.000 (0–8), $7.000 (8–16), $10.000 (16–56) y $6.000 (mayores de 56), con intervalos abiertos/cerrados apropiados en cada tramo.',
  },

  // ── 10 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-10',
    subtopic: 'Geometría',
    difficulty: 3,
    stem: 'En la figura se muestra la construcción de una cometa triangular con un ángulo de 150°. Se realiza un análisis por pasos para determinar si la cometa volará. Observa la imagen e identifica el paso en el que se comete un error.',
    images: [
      { id: 'MAT-2020-10-stem', position: 'stem', url: IMG_COMETA, alt: 'Análisis por pasos de la cometa triangular con ángulo de 150°' },
    ],
    options: [
      { id: 'A', text: 'Paso I' },
      { id: 'B', text: 'Paso III, porque la suma de los ángulos internos de un triángulo debe ser 180°' },
      { id: 'C', text: 'Paso VII' },
      { id: 'D', text: 'Paso VIII' },
    ],
    correct: 'B',
    explanation: 'La suma de los ángulos internos de un triángulo es siempre 180°, no 160° como afirma el paso III. Allí está el error.',
  },

  // ── 11 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-11',
    subtopic: 'Estadística',
    difficulty: 2,
    stem: 'Se realizó una encuesta a 200 clientes sobre la calidad del servicio. El 35% la calificó como "bueno". ¿Cuál de las siguientes afirmaciones es verdadera? (Ver imagen con los resultados completos)',
    images: [
      { id: 'MAT-2020-11-stem', position: 'stem', url: IMG_ENCUESTA, alt: 'Gráfica de resultados de la encuesta de calidad del servicio a 200 clientes' },
    ],
    options: [
      { id: 'A', text: 'Más de 30 clientes consideran que la calidad del servicio es excelente.' },
      { id: 'B', text: 'Menos de 50 clientes consideran que la calidad del servicio es regular.' },
      { id: 'C', text: 'Menos de 55 clientes están satisfechos con el servicio.' },
      { id: 'D', text: 'Más de 60 clientes consideran que la calidad del servicio es bueno.' },
    ],
    correct: 'D',
    explanation: '35% de 200 = 70 clientes calificaron el servicio como "bueno". Por tanto, es verdadero que más de 60 clientes la consideran buena.',
  },

  // ── 12 — opciones son imágenes (construcciones geométricas) ───
  {
    id: 'MAT-2020-12',
    subtopic: 'Geometría',
    difficulty: 4,
    stem: 'En una clase de Matemáticas se pide dividir un segmento MN en dos partes congruentes mediante construcción geométrica con compás y regla.\n\nObserva las cuatro construcciones de la imagen y selecciona la que realizó correctamente el estudiante.',
    images: [
      { id: 'MAT-2020-12-stem', position: 'stem', url: IMG_Q12_GEOM, alt: 'Cuatro construcciones geométricas (A, B, C y D) para dividir el segmento MN en dos partes iguales' },
    ],
    options: [
      { id: 'A', text: 'Construcción A' },
      { id: 'B', text: 'Construcción B' },
      { id: 'C', text: 'Construcción C' },
      { id: 'D', text: 'Construcción D' },
    ],
    correct: 'D',
    explanation: 'La construcción D es correcta: se trazan dos arcos desde M y N con el mismo radio para obtener los puntos P y Q, y la recta PQ intersecta a MN en su punto medio R.',
  },

  // ── 13 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-13',
    subtopic: 'Aritmética',
    difficulty: 2,
    stem: `${CTX_RAMIREZ}\n\nEl tiempo adicional consumido por la familia Ramírez en enero fue:`,
    images: [
      { id: 'MAT-2020-13-stem', position: 'stem', url: IMG_RAMIREZ, alt: 'Tabla de la factura telefónica de la familia Ramírez en enero' },
    ],
    options: [
      { id: 'A', text: '1 hora y 11 minutos.' },
      { id: 'B', text: '1 hora y 51 minutos.' },
      { id: 'C', text: '3 horas y 40 minutos.' },
      { id: 'D', text: '5 horas y 31 minutos.' },
    ],
    correct: 'B',
    explanation: 'Plan local = 220 min. Consumo enero = 331 min. Diferencia = 331 − 220 = 111 minutos = 1 hora y 51 minutos.',
  },

  // ── 14 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-14',
    subtopic: 'Razonamiento',
    difficulty: 3,
    stem: `${CTX_RAMIREZ}\n\n¿Cuál de los siguientes datos NO se necesita para hallar la diferencia entre el valor del minuto del plan local y el valor del minuto adicional?`,
    images: [
      { id: 'MAT-2020-14-stem', position: 'stem', url: IMG_RAMIREZ, alt: 'Tabla de la factura telefónica de la familia Ramírez' },
    ],
    options: [
      { id: 'A', text: 'La cantidad de minutos del plan.' },
      { id: 'B', text: 'El valor del consumo adicional.' },
      { id: 'C', text: 'El total de cargos del mes.' },
      { id: 'D', text: 'El valor del plan local.' },
    ],
    correct: 'C',
    explanation: 'Para calcular la diferencia entre el valor por minuto del plan y el valor por minuto adicional solo se necesita el costo y los minutos del plan local, y el costo y los minutos adicionales. El total de cargos del mes es innecesario.',
  },

  // ── 15 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-15',
    subtopic: 'Aritmética',
    difficulty: 2,
    stem: 'Isabel llegó al hospital con el turno número 180 (Nivel III). Tras 6 horas, el tablero electrónico marca el turno 240. ¿Aproximadamente cuántas personas por hora llegaron en ese tiempo?',
    options: [
      { id: 'A', text: '60 personas por hora.' },
      { id: 'B', text: '40 personas por hora.' },
      { id: 'C', text: '15 personas por hora.' },
      { id: 'D', text: '10 personas por hora.' },
    ],
    correct: 'D',
    explanation: 'En 6 horas llegaron 240 − 180 = 60 personas. Entonces 60 ÷ 6 = 10 personas por hora.',
  },

  // ── 16 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-16',
    subtopic: 'Geometría',
    difficulty: 3,
    stem: 'Se traslada y amplía un cuadrilátero en el plano cartesiano. Dos de los vértices de la figura resultante están en (−5, 7) y (−1, 1). ¿Cuáles son las coordenadas de los otros dos vértices?',
    options: [
      { id: 'A', text: '(−1, 5) y (3, 7)' },
      { id: 'B', text: '(5, −1) y (7, 3)' },
      { id: 'C', text: '(5, 7) y (1, 1)' },
      { id: 'D', text: '(1, 5) y (−5, −7)' },
    ],
    correct: 'A',
    explanation: 'Al realizar la traslación y ampliación descrita, los vértices resultantes completan la figura en las coordenadas (−1, 5) y (3, 7).',
  },

  // ── 17 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-17',
    subtopic: 'Álgebra',
    difficulty: 3,
    stem: 'Un empresario compra un apartamento de $80.000.000 y puede pagarlo en diferentes cantidades de cuotas iguales (sin intereses). Respecto a la tabla de cuotas, es verdadero afirmar que...',
    options: [
      { id: 'A', text: 'el empresario paga más por el apartamento dependiendo de la cantidad de cuotas que decida pagar.' },
      { id: 'B', text: 'de manera proporcional, a mayor cantidad de cuotas menor valor se pagará en cada una de ellas.' },
      { id: 'C', text: 'el empresario paga solo el valor del apartamento únicamente cuando elige el menor número de cuotas.' },
      { id: 'D', text: 'de manera proporcional, a mayor valor pagado por cuota, más tiempo se tardará en pagar la deuda.' },
    ],
    correct: 'B',
    explanation: 'El número de cuotas y el valor de cada cuota son inversamente proporcionales: a mayor número de cuotas, menor valor por cuota, ya que el total siempre es $80.000.000.',
  },

  // ── 18 — opciones son imágenes (diagramas de árbol) ───────────
  {
    id: 'MAT-2020-18',
    subtopic: 'Probabilidad',
    difficulty: 3,
    stem: 'Para ambientar una reunión se cuenta con 3 CD, cada uno con canciones de salsa (S) y merengue (M). Se desea seleccionar una canción de cada CD.\n\nObserva los cuatro diagramas de árbol de la imagen y selecciona el que representa correctamente todas las posibles selecciones.',
    images: [
      { id: 'MAT-2020-18-stem', position: 'stem', url: IMG_Q18_ARBOL, alt: 'Cuatro diagramas de árbol (A, B, C y D) que representan la selección de una canción de cada uno de los 3 CD' },
    ],
    options: [
      { id: 'A', text: 'Diagrama A' },
      { id: 'B', text: 'Diagrama B' },
      { id: 'C', text: 'Diagrama C' },
      { id: 'D', text: 'Diagrama D' },
    ],
    correct: 'A',
    explanation: 'El diagrama A es correcto: tiene una sola raíz que se bifurca en S y M para el CD1; cada rama se bifurca nuevamente en S y M para el CD2; y cada rama vuelve a bifurcarse en S y M para el CD3, generando 8 resultados posibles.',
  },

  // ── 19 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-19',
    subtopic: 'Funciones',
    difficulty: 4,
    stem: 'La temperatura corporal de un animal varía periódicamente. La temperatura mínima es 34°C, la máxima es 38°C y el período de variación es 3 horas. En t = 0 la temperatura es 36°C y va en aumento. ¿Cuál de las siguientes expresiones corresponde a la función que describe la temperatura en función del tiempo?',
    options: [
      { id: 'A', text: 'F(t) = 2 cos(2π/3 · t) + 36' },
      { id: 'B', text: 'F(t) = 3 cos(2π/3 · t) + 38' },
      { id: 'C', text: 'F(t) = 2 sen(2π/3 · t) + 36' },
      { id: 'D', text: 'F(t) = 3 sen(2π/3 · t) + 38' },
    ],
    correct: 'C',
    explanation: 'La amplitud es (38−34)/2 = 2, el desplazamiento vertical es 36 y el período es 3 h, por lo que ω = 2π/3. En t = 0 la temperatura es 36°C y crece, lo que corresponde a la función seno: F(t) = 2 sen(2π/3 · t) + 36.',
  },

  // ── 20 ────────────────────────────────────────────────────────
  {
    id: 'MAT-2020-20',
    subtopic: 'Álgebra',
    difficulty: 2,
    stem: 'La velocidad máxima de un automóvil es 100 km/h. Pilar afirma que en 100 horas el auto avanzará solamente 1 km. La afirmación de Pilar es...',
    options: [
      { id: 'A', text: 'falsa, porque a la velocidad máxima en una hora recorrerá 100 km.' },
      { id: 'B', text: 'verdadera, porque al dividir la velocidad máxima entre 100 horas se obtiene 1 km.' },
      { id: 'C', text: 'falsa, porque en 100 horas el auto recorrerá 100 km.' },
      { id: 'D', text: 'verdadera, porque al dividir 100 entre 1, se obtiene el valor 100.' },
    ],
    correct: 'A',
    explanation: '100 km/h significa que cada hora recorre 100 km. En 100 horas recorrería 100 × 100 = 10.000 km, por lo que la afirmación de Pilar es falsa.',
  },
]

export const MAT_BANK_2020: IcfesQuestion[] = items.map(q => ({
  ...q,
  area: 'MAT' as const,
  topic: TOPIC,
}))
