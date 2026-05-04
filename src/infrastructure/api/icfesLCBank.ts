/**
 * Banco real de preguntas ICFES — Lectura Crítica 2024-2025.
 * Fuente: docs/icfes_content/2024-2025/lectura critica/lecturacritica2024-2025.txt
 *
 * Cuando el backend no tenga preguntas disponibles, el adaptador usa este banco
 * como fallback offline.
 */

import type { IcfesQuestion } from './icfesAdapter'

const TOPIC = 'Comprensión lectora'

// Pasajes compartidos por varias preguntas
const P_DESCARTES = `El primer gran filósofo del siglo diecisiete (si exceptuamos a Bacon y Galileo) fue Descartes, y si alguna vez se dijo de alguien que estuvo a punto de ser asesinado habrá que decirlo de él.
La historia es la siguiente, según la cuenta Baillet en su Vie de M. Descartes, tomo I, páginas 102-103. En 1621, Descartes, que tenía unos veintiséis años, se hallaba como siempre viajando (pues era inquieto como una hiena) y, al llegar al Elba, tomó una embarcación para Friezland oriental. Nadie se ha enterado nunca de lo que podía buscar en Friezland oriental y tal vez él se hiciera la misma pregunta, ya que, al llegar a Embden, decidió dirigirse al instante a Friezland occidental, y siendo demasiado impaciente para tolerar cualquier demora, alquiló una barca y contrató a unos cuantos marineros.
Tan pronto habían salido al mar cuando hizo un agradable descubrimiento, al saber que se había encerrado en una guarida de asesinos. Se dio cuenta, dice M. Baillet, de que su tripulación estaba formada por criminales, no aficionados, señores, como lo somos nosotros, sino profesionales cuya máxima ambición, por el momento, era degollarlo.
[…] Perdonen que me ría, caballeros, pero a decir verdad me río siempre que recuerdo esta historia […]. Una de ellas es el pánico de Descartes, a quien se le debieron poner los pelos de punta, ante el pequeño drama de su propia muerte, funeral, herencia y administración de bienes. Pero hay otro aspecto que me parece aún más gracioso, y es que si los mastines de Friezland hubieran estado "a la altura", no tendríamos filosofía cartesiana.
Tomado y adaptado de: De Quincey, T. (1999). Del asesinato considerado como una de las bellas artes.`

const P_VALLENATO = `Uno de los escenarios donde empezó a codearse el vallenato con la música que escuchaba y bailaba la burguesía —valses, mazurcas, canciones napolitanas— fue el de las colitas. Era este el nombre que recibían las 'colas' o finales de fiesta de la clase adinerada: bodas, bautizos, cumpleaños, festejos religiosos… Despachada la orquesta, los de atrás eran invitados a pasar adelante, y patrones y vaqueros se sentaban a tomar y cantar juntos. Algunos dicen que estos remates de fiesta fueron el pabellón de maternidad del vallenato. "Las colitas son el ancestro directo del vallenato moderno", afirma López Michelsen.
Pero parece más acertado pensar que las colitas no ayudaron a formar el género, sino a divulgarlo. Esta clase de fiestas no se conocieron en toda la región, sino tan sólo en la zona del Valle de Upar. Además, los historiadores indican que las colitas surgieron a comienzos del siglo XX, cuando ya el vallenato había empezado a coger ritmo. En cambio, las piquerias y retos sí constituyeron desde el principio uno de los más efectivos moldes de creación, propagación y desarrollo del vallenato. Los grandes acordeoneros viajaban durante días para acudir a piquerias, como lo atestigua 'La gota fría': "Acordate Moralitos de aquel día / que estuviste en Urumita / y no quisiste hacer parada".
Tomado de: Samper, D. y Tafur M. (1997). 100 años de vallenato.`

const P_SINREMEDIO = `Con el siguiente fragmento comienza la novela "Sin remedio" de Antonio Caballero. Los protagonistas son Escobar, un poeta frustrado, y Fina, la mujer con quien vive.
A los treinta y un años Rimbaud estaba muerto. Desde la madrugada de sus treinta y un años Escobar contempló la revelación, parada en el alféizar como un pájaro: a los treinta y un años Rimbaud estaba muerto. Increíble.
Fina seguía durmiendo junto a él, como si no se diera cuenta de la gravedad de la cosa. Le tapó las narices con dos dedos. Fina gimió, se revolvió en las sábanas; y después, con un ronquido, empezó a respirar tranquilamente por la boca. Las mujeres no entienden.
Sentado sobre el coxis […], Escobar se esforzó por no pensar en nada. Que el universo lo absorbiera dulcemente, sin ruido. Pensó que ya nunca más sería el mismo que se esforzaba ahora por no pensar en nada. Sintió en su bajo vientre una punzada de advertencia: las ganas de orinar. La vida. Ah, levantarse. Tampoco esta vez moriremos.
Quieto en la cama vio el lento ensombrecerse del día […]. Tal vez hubiera sido preferible estar muerto. No soportar el mismo día una vez y otra vez […]: la vida que va pasando y va volviendo en redondo. Y si se acaba la vida, faltan las reencarnaciones. El previsible despertar de Fina, el jugo de naranja, el desayuno.`

const P_PRIVACIDAD = `LA PÉRDIDA DE LA PRIVACIDAD
El primer efecto de la globalización de la comunicación por Internet ha sido la crisis de la noción de límite. La etología nos enseña que todos los animales reconocen una burbuja de respeto, un área territorial dentro de la cual se sienten seguros. La antropología cultural nos ha demostrado que esta burbuja varía según las culturas.
En el caso de los humanos, esta zona de protección se ha extendido del individuo a la comunidad. El límite —de la ciudad, de la región, del reino— siempre se ha considerado una especie de ampliación colectiva de las burbujas de protección individual.
No obstante con Internet se rompen los límites que nos protegían y la privacidad queda expuesta. Por un lado, ya no hay comunidad nacional que pueda impedir a sus ciudadanos saber lo que sucede en otros países; además, en medio de una oleada migratoria imparable, se forman naciones por fuera de las fronteras físicas: es cada vez más fácil para una comunidad musulmana de Roma establecer vínculos con una comunidad musulmana de Berlín. Por otro lado, el severo control que los Estados ejercían ha pasado a otros centros de poder técnicamente preparados para saber a quién hemos escrito, qué hemos comprado, cuáles son nuestras curiosidades enciclopédicas y hasta nuestras preferencias sexuales. El gran problema del ciudadano celoso no es defenderse de los hackers sino de las cookies.
Adaptado de: Eco, U. (2007). La pérdida de la privacidad.`

const P_GOOGLE = `¿SERÁ QUE GOOGLE NOS ESTÁ VOLVIENDO ESTOOPIDOS?
Durante los últimos años he tenido la incómoda sensación de que alguien (o algo) ha estado cacharreando con mi cerebro, rehaciendo la cartografía de mis circuitos neuronales. Sumirme en un libro o un artículo largo solía ser una cosa fácil. Sin embargo, eso ya no me ocurre. Mi concentración se pierde tras leer apenas dos o tres páginas. La lectura profunda, que solía ser fácil, se ha vuelto una lucha.
Y creo saber qué es lo que está ocurriendo. Llevo ya más de una década pasando mucho tiempo en línea. Como subrayó McLuhan, los medios no son meros canales pasivos: configuran el proceso de pensamiento. Lo que la red parece estar haciendo es socavar poco a poco mi capacidad de concentración y contemplación. Mi mente ahora espera asimilar información como la red la distribuye: en un vertiginoso flujo de partículas. Alguna vez fui buzo y me sumergía en océanos de palabras. Hoy en día sobrevuelo a ras sus aguas como en una moto acuática.
Es probable que hoy estemos leyendo cuantitativamente más que en los 70 y 80. Pero, sea lo que sea, se trata de otra forma de leer, y detrás subyace otra forma de pensar… Quizás incluso, una nueva manera de ser. La idea de que nuestra mente debiera operar como una máquina-procesadora-de-datos-de-alta-velocidad no solo está incorporada al funcionamiento de internet, sino que se trata del modelo empresarial imperante de la red. Para bien de sus intereses económicos, les conviene distraernos a como dé lugar.
Tomado y adaptado de: Carr, Nicholas. Revista Arcadia, 2010.`

const P_DEMOCRACIA = `(i) "El argumento más poderoso contra la democracia es una conversación de cinco minutos con el votante medio". Winston Churchill.
(ii) "La democracia sustituye el nombramiento hecho por una minoría corrompida, por la elección debida a una mayoría incompetente". George Bernard Shaw.
(iii) "Aunque la tradición política democrática se remonta a la antigua Grecia, los pensadores políticos no se ocuparon de la causa democrática hasta el siglo XIX. Hasta entonces venía desechándose la democracia como el gobierno de las masas ignorantes y sin luces. Hoy parece que todos nos hemos vuelto demócratas sin contar con argumentos sólidos a favor. Los liberales, los conservadores, los socialistas, los comunistas, los anarquistas y hasta los fascistas se han apresurado a proclamar las virtudes de la democracia y a mostrar sus credenciales demócratas". Heywood, A. (2010).`

const P_FEYERABEND = `El conocimiento no consiste en una serie de teorías autoconsistentes que tiende a converger en una perspectiva ideal; no consiste en un acercamiento gradual hacia la verdad. Por el contrario, el conocimiento es un océano, siempre en aumento, de alternativas incompatibles entre sí (y tal vez inconmensurables); toda teoría particular, todo cuento de hadas, todo mito, forman parte del conjunto que obliga al resto a una articulación mayor. No hay nada establecido para siempre, ningún punto de vista puede quedar omitido en una explicación comprehensiva. Expertos y profanos, profesionales y diletantes, forjadores de utopías y mentirosos, todos ellos están invitados a participar en el debate y a contribuir al enriquecimiento de la cultura.
La tarea del científico no ha de ser por más tiempo "la búsqueda de la verdad", o "la glorificación de dios", o "la sistematización de las observaciones". Todas estas cosas no son más que efectos marginales de una actividad que consiste en "hacer de la causa más débil la causa más fuerte", como dijo el sofista, "por ello en apoyar el movimiento de conjunto".
Adaptado de: Paul Feyerabend (1986). Tratado contra el método.`

const P_1984 = `1984 es una novela futurista que tiene lugar en una sociedad totalitaria controlada por una figura omnipresente conocida como el Gran Hermano. Un miembro defensor del orden le explica al protagonista el principal propósito del régimen.
No habrá lealtad; no existirá más fidelidad que la que se debe al Partido, ni más amor que el amor al Gran Hermano. No habrá risa, excepto la risa triunfal cuando se derrota a un enemigo. No habrá arte, ni literatura, ni ciencia. No habrá ya distinción entre la belleza y la fealdad. Todos los placeres serán destruidos. Pero siempre, no lo olvides, Winston, siempre habrá el afán de poder, la sed de dominio, que aumentará constantemente y se hará cada vez más sutil. Si quieres hacerte una idea de cómo será el futuro, figúrate una bota aplastando un rostro humano... incesantemente.
Tomado de: Orwell, George. 1984.`

const P_FOTOGRAFIA = `Si las fotografías permiten la posesión imaginaria de un pasado irreal, también ayudan a tomar posesión de un espacio donde la gente está insegura. Así, la fotografía se desarrolla en conjunción con una de las actividades modernas más características: el turismo. Parece decididamente anormal viajar por placer sin llevar una cámara. Las fotografías son la prueba irrecusable de que se hizo la excursión, se cumplió el programa, se gozó del viaje.
El acto fotográfico, un modo de certificar la experiencia, es también un modo de rechazarla. El viaje se transforma en una estrategia para acumular fotos. La propia actividad fotográfica es tranquilizadora, y mitiga esa desorientación general que se suele agudizar con los viajes. Al no saber cómo reaccionar, hacen una foto. El método seduce sobre todo a gente subyugada a una ética de trabajo implacable: alemanes, japoneses y estadounidenses. El empleo de una cámara atenúa su ansiedad provocada por la inactividad laboral cuando están en vacaciones.
Tomado de: Sontag, S. (2009). Sobre la fotografía.`

const P_AGUADO = `Fray Pedro de Aguado fue un misionero español que vivió en el Nuevo Reino de Granada entre 1560 y 1590. Se le atribuye la autoría de la Recopilación historial. En el relato de las campañas del capitán Galarza en los actuales territorios del Tolima, Aguado se refiere a los indios de la región:
"Son estos indios de Ibagué grandes carniceros de carne humana y de cualquier otra carne; tienen algodón, aunque poco, de que hacen algunas mantas para su vestir; las indias son muy feas, y traen en la cabeza unos bonetes de venado con que aprietan y axen los cabellos; no hay entre ellos caciques, mas son mandados de algunos indios principales […]. Es tierra muy áspera y fragosa".
En su estudio Los indios medievales de fray Pedro de Aguado, el historiador Jaime Humberto Borja sostuvo que la Recopilación historial no puede ser tomada como fuente fiable; debe asumirse como un texto que respondía ideológica y culturalmente a una tradición europea. Afirma Borja que el de Aguado "es un indio retórico, que surge de una realidad textual y no de una realidad aprehendida por la experiencia". La construcción narrativa del indio reúne imágenes de la tradición cristiana y los imaginarios bíblicos: "El canibalismo, las exacerbadas costumbres, la fiereza de sus armas, su alianza con traidores, el engaño".`

const P_THOREAU = `DEL DEBER DE LA DESOBEDIENCIA CIVIL (1849)
Creo de todo corazón en el lema "El mejor gobierno es el que tiene que gobernar menos". El ejército permanente es sólo el brazo del gobierno establecido. El gobierno en sí, que es únicamente el modo escogido por el pueblo para ejecutar su voluntad, está igualmente sujeto al abuso y la corrupción.
Somos testigos de la actual guerra con México, obra de unos pocos individuos comparativamente, que utilizan como herramienta al gobierno actual; en principio, el pueblo no habría aprobado esta medida. Pero, para hablar en forma práctica y como ciudadano, yo pido un mejor gobierno. Después de todo, la razón práctica por la cual se le permite a una mayoría regir, no es porque esa mayoría esté tal vez en lo correcto, sino porque físicamente son los más fuertes. Pero un gobierno en el que la mayoría rige en todos los casos no se puede basar en la justicia. La ley nunca hizo al hombre un ápice más justo, y a causa del respeto por ella, aún el hombre bien dispuesto se convierte a diario en un agente de la injusticia. Henry David Thoreau.`

const P_GOMEZDAVILA = `Las filosofías comienzan en filosofía y acaban en retórica. (59)
La filosofía es actitud solitaria.
La adhesión de cualquier muchedumbre a una doctrina la convierte en mitología. (110)
Los sistemas filosóficos difieren los unos de los otros menos en la manera de resolver que en la manera de escamotear los problemas. (117)
Los que se ocupan de filosofía no la tomarían tan en serio, si generalmente no vivieran de ella como profesión. (130)
En filosofía lo que no sea fragmento es estafa. (162)
Tomado de: Gómez Dávila, N. (1992). Sucesivos escolios a un texto implícito.`

const P_GOODALL = `Cuando inicié mi estudio sobre chimpancés salvajes en 1960, no era permitido, en los círculos de etología, hablar sobre la mente de los animales. Solo los humanos tienen mentes. Tampoco era del todo correcto hablar acerca de la personalidad de los animales. Los etólogos, luchando por hacer de la suya una ciencia 'dura', se mantuvieron alejados de la tarea de tratar de explicar esas cosas objetivamente.
Qué ingenua era. Como no había tenido educación científica de pregrado, no me di cuenta de que en teoría los animales no debían tener personalidades, pensar o sentir emociones o dolor. No me di cuenta de que no era científico discutir sobre el comportamiento en términos de motivación o propósito. Hablar acerca de sus emociones era sentirse culpable del peor tipo de antropomorfismo (atribuirles características humanas a los animales).
En los comentarios editoriales al primer artículo que escribí, se exigía que todo "él" o "ella" fuera reemplazado por "ello" y que todo "quien" fuera reemplazado por "que". Enfurecida, taché uno a uno los "ello" y "que" y reescribí los pronombres originales.
Tomado de: Goodall, Jane. Science, 1998.`

const P_CRATES = `[Historieta filosófica] Discípulo: "Me enseñaste a usar la razón como una forma de libertad. Y ahora, Crates, me libero de ti." Crates: "Que no puedes jalar a un filósofo de la ropa, sino de los oídos: mi cuerpo puede seguirte, pero mi mente ya no." Discípulo: "Todo lo que existe se divide en lo que depende de nosotros y en lo que no. De nosotros dependen el juicio, el deseo y todo lo que hacemos. Por eso depende de mí separarme de ti, Crates."`

const P_GOMBRICH = `A mucha gente le gusta ver en los cuadros lo que también le gustaría ver en la realidad. Cuando el gran artista flamenco Rubens dibujó a su hijo, estaba orgulloso de sus agradables acciones y deseaba que también nosotros admiráramos al pequeño. Pero esta inclinación a los temas bonitos puede convertirse en nociva si nos conduce a rechazar obras que representan asuntos menos agradables. El gran pintor alemán Alberto Durero seguramente dibujó a su madre con tanta devoción y cariño como Rubens a su hijo. Su verista estudio de la vejez y la decrepitud puede producirnos tan viva impresión que nos haga apartar los ojos de él y, sin embargo, si reaccionamos contra esta primera aversión, quedaremos recompensados con creces, pues el dibujo de Durero, en su tremenda sinceridad, es una gran obra. La hermosura de un cuadro no reside realmente en la belleza de su tema. No sé si los golfillos que Murillo se complacía en pintar eran estrictamente bellos o no, pero tal como fueron pintados por él, poseen desde luego gran encanto.
Tomado de: Gombrich, E. H. (2003). La historia del arte.`

const P_GIGES = `Nadie es justo por voluntad sino porque no tiene el poder de cometer injusticias. Demos tanto al justo como al injusto el poder de hacer lo que quiere. Sorprenderemos al justo tomando el mismo camino que el injusto, siguiendo sus propios intereses, lo que toda criatura persigue por naturaleza como un bien, pero que la fuerza de la ley obliga a seguir el camino del respeto por la igualdad.
Giges era un pastor que servía al rey de Lidia. Un terremoto rasgó la tierra y produjo un abismo. Descendió y halló un caballo de bronce, hueco; adentro un cadáver con un anillo de oro. Giges le quitó el anillo. Cuando giraba el engaste hacia adentro, su dueño se hacía invisible. Maquinó el modo de formar parte de los informantes del rey y, una vez allí, sedujo a la reina y con ayuda de ella mató al rey y se apoderó del reino.
Si hubiese dos anillos como el de Giges y se diera uno a un hombre justo y otro a uno injusto, ninguno perseveraría en la justicia. Todo hombre piensa que la injusticia le brinda más ventajas individuales que la justicia, y está en lo cierto, si habla de acuerdo con esta teoría.
Tomado de: Platón. República.`

const P_MATRIMONIO = `En nuestra sociedad, se tiende a pensar que el matrimonio se sostiene si hay confianza mutua y buena comunicación. Su piedra angular es un amor maduro y sincero. No obstante, la idea de que este deba ser la razón última del enlace es bastante reciente: aparece en el siglo XVIII y se afianza en el XIX, con el movimiento romántico. Hasta entonces, el matrimonio era ante todo una institución económica y política. Resultaba inconcebible que semejante acuerdo se basara en algo tan irracional como el enamoramiento.
Para las élites, era una manera de consolidar la riqueza, fusionar recursos y forjar uniones políticas. Desde la Edad Media, la dote de boda de la mujer constituía el mayor ingreso que un hombre iba a recibir en toda su vida. Para los más pobres, también suponía una transacción económica. La imagen del marido trabajando fuera de la casa y la mujer haciéndose cargo de la misma es un producto reciente, de los años 50.
Que el matrimonio no se basara en el amor no quiere decir que las personas no se enamoraran. Sin embargo, en algunas culturas se trata de algo incompatible con el matrimonio. En la China tradicional, una atracción excesiva entre los esposos era tenida como una amenaza al respeto y solidaridad debida a la familia. Fue en la década de 1920 cuando se inventó un término para designar el cariño entre cónyuges.
Aún hoy, muchas sociedades desaprueban la idea de que el amor sea el centro del matrimonio. Es el caso de los fulbes africanos, del norte de Camerún. "Muchas de sus mujeres niegan vehementemente cualquier apego hacia el marido".
Adaptado de: Sabadell, Miguel Ángel (2013). Muy Interesante.`

const P_TRANSITO = `[Infografía OMS — "Traumatismos causados por el tránsito: los hechos"]
• Cada año hay 1,24 millones de muertes por accidentes de tránsito.
• Es la 1.ª causa de muerte en el grupo etario de 15-29 años.
• 3 de 4 de los fallecidos son del sexo masculino.
• Los países de ingresos medios solo tienen la mitad de los vehículos existentes en el mundo y, a pesar de eso, sufren el 80% de las muertes por accidente de tránsito.
• Tasas de mortalidad por 100.000 hab. según ingresos: medios (20,1), bajos (18,3), altos (8,7).
• Por región (muertes por 100.000 hab.): África (24,1), Mediterráneo Oriental / Asia Sudoriental / Pacífico Occidental (≈18,5), Américas (16,1), Europa (10,3).
• El 50% de los fallecidos son peatones (23%), motociclistas (22%) y ciclistas (5%).
Fuente: OMS — Informe sobre la situación mundial de la seguridad vial 2013.`

// Imagenes (caricaturas)
const IMG_CALVIN = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-04-29%20212132.png'
const IMG_QUINO_ANGEL = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-04-29%20212021.png'
const IMG_QUINO_CUADROS = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-04-29%20211841.png'
const IMG_CRATES = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-04-29%20211518.png'
const IMG_TRANSITO = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-04-29%20211713.png'

type LCQ = Omit<IcfesQuestion, 'area' | 'topic'>

const items: LCQ[] = [
  {
    id: 'LC-2425-01', subtopic: 'Tipología textual', difficulty: 3,
    stem: `1. A juzgar por su estilo, tema y estructura, ¿en cuál de los siguientes contextos estaría inscrito más apropiadamente el pasaje anterior?`,
    readingPassage: P_DESCARTES,
    options: [
      { id: 'A', text: 'En una revista académica, como parte de un artículo sobre los orígenes y la importancia de la filosofía cartesiana.' },
      { id: 'B', text: 'En un discurso ofrecido a un grupo conformado por aficionados al estudio de asesinatos en la historia de la filosofía.' },
      { id: 'C', text: 'En una crónica periodística, con motivo de un especial acerca de las muertes más curiosas de la historia.' },
      { id: 'D', text: 'En un seminario dirigido a historiadores especialistas en la vida de los personajes insignes del siglo XX.' },
    ],
    correct: 'B',
    explanation: 'El tono humorístico, la dirección a una audiencia ("señores", "perdonen que me ría") y la temática indican un discurso para aficionados al asesinato como tema histórico-filosófico.',
  },
  {
    id: 'LC-2425-02', subtopic: 'Inferencia', difficulty: 2,
    stem: `2. El autor cita el verso de La gota fría para apoyar la idea de que los acordeoneros viajaban para asistir a diferentes piquerias, porque en este se hace referencia a`,
    readingPassage: P_VALLENATO,
    options: [
      { id: 'A', text: 'un acordeonero que cantaba colitas, llamado Lorenzo Morales.' },
      { id: 'B', text: 'Urumita, un pueblo famoso por la realización de colitas.' },
      { id: 'C', text: 'un acordeonero que se encontraba de paso por un pueblo.' },
      { id: 'D', text: 'Urumita, un pueblo al cual iban los acordeoneros.' },
    ],
    correct: 'B',
    explanation: 'El verso menciona a Moralitos en Urumita, evocando un acordeonero que viaja a una piqueria.',
  },
  {
    id: 'LC-2425-03', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `3. El autor introduce la cita de López Michelsen con el fin de presentar la opinión de un conocedor del vallenato y`,
    readingPassage: P_VALLENATO,
    options: [
      { id: 'A', text: 'reforzar la tesis principal del texto, según la cual las colitas fueron divulgadoras del género.' },
      { id: 'B', text: 'señalar una posición discutible sobre el papel que desempeñaron las colitas en el origen del género.' },
      { id: 'C', text: 'legitimar la tesis principal del texto, según la cual las colitas originaron el vallenato moderno.' },
      { id: 'D', text: 'convencer al lector de que las colitas fueron las únicas divulgadoras del vallenato moderno.' },
    ],
    correct: 'C',
    explanation: 'La cita respalda la idea de que las colitas son el ancestro directo del vallenato.',
  },
  {
    id: 'LC-2425-04', subtopic: 'Inferencia', difficulty: 2,
    stem: `4. A partir de sus pensamientos y actitudes, es posible concluir que Escobar es un hombre`,
    readingPassage: P_SINREMEDIO,
    options: [
      { id: 'A', text: 'psicótico y con tendencias depresivas.' },
      { id: 'B', text: 'entusiasta y entregado a su pareja.' },
      { id: 'C', text: 'organizado e inmerso en la rutina.' },
      { id: 'D', text: 'sensible y con angustias.' },
    ],
    correct: 'D',
    explanation: 'Sus reflexiones sobre la muerte, la vida y la rutina muestran sensibilidad y angustia existencial.',
  },
  {
    id: 'LC-2425-05', subtopic: 'Tipología textual', difficulty: 3,
    stem: `5. ¿Cuál de los siguientes enunciados sintetiza mejor el contenido del primer párrafo?`,
    readingPassage: P_PRIVACIDAD,
    options: [
      { id: 'A', text: 'Una profunda tradición intelectual ha configurado el concepto de límite como el espacio de defensa que crean los seres a su alrededor.' },
      { id: 'B', text: 'Internet ha generado cambios en el concepto tradicional de límite, tal como lo define la etología y la antropología.' },
      { id: 'C', text: 'Por naturaleza los seres vivos exigen el respeto del propio espacio, y esto aplica incluso para las relaciones que se dan en Internet.' },
      { id: 'D', text: 'Los estudios de la etología y la antropología nos permiten comprender por qué Internet vulnera la intimidad de las personas.' },
    ],
    correct: 'B',
    explanation: 'El párrafo enmarca el concepto de límite desde la etología y la antropología en el contexto del impacto de Internet.',
  },
  {
    id: 'LC-2425-06', subtopic: 'Inferencia', difficulty: 3,
    stem: `6. En el tercer párrafo, cuando el autor menciona a las naciones que se forman fuera de las fronteras físicas, hace referencia a`,
    readingPassage: P_PRIVACIDAD,
    options: [
      { id: 'A', text: 'los individuos de una misma cultura que viven en territorios diferentes.' },
      { id: 'B', text: 'la fluencia migratoria que genera el amplio número de turistas.' },
      { id: 'C', text: 'el encuentro virtual de personas de pensamientos diferentes.' },
      { id: 'D', text: 'las comunidades virtuales que se crean en el ciberespacio.' },
    ],
    correct: 'A',
    explanation: 'El ejemplo de la comunidad musulmana de Roma con la de Berlín alude a culturas compartidas en territorios diferentes.',
  },
  {
    id: 'LC-2425-07', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `7. En el último párrafo del texto se`,
    readingPassage: P_GOOGLE,
    options: [
      { id: 'A', text: 'legitiman las prácticas del manejo de información en Internet que buscan distraernos a como dé lugar.' },
      { id: 'B', text: 'desestima la efectividad de las estrategias publicitarias utilizadas en la web para obtener información.' },
      { id: 'C', text: 'denuncian las motivaciones de varias compañías al respecto de cómo se maneja la información en Internet.' },
      { id: 'D', text: 'rescatan estrategias para procesar datos a alta velocidad, sin caer en las manos de las empresas imperantes.' },
    ],
    correct: 'C',
    explanation: 'El autor denuncia los intereses económicos de Google que motivan distraernos.',
  },
  {
    id: 'LC-2425-08', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `8. Considere el siguiente enunciado: "Pero, sea lo que sea, se trata de otra forma de leer, y detrás subyace otra forma de pensar… Quizás incluso, una nueva manera de ser". Esta frase, dentro de la globalidad del texto, es`,
    readingPassage: P_GOOGLE,
    options: [
      { id: 'A', text: 'una idea introductoria.' },
      { id: 'B', text: 'una conclusión del texto.' },
      { id: 'C', text: 'una idea de importancia secundaria.' },
      { id: 'D', text: 'una evidencia que apoya la tesis principal.' },
    ],
    correct: 'B',
    explanation: 'Sintetiza la conclusión del autor sobre la transformación que produce internet en el pensamiento.',
  },
  {
    id: 'LC-2425-09', subtopic: 'Inferencia', difficulty: 2,
    stem: `9. Según el texto (iii), ¿qué posiciones políticas se identifican como democráticas?`,
    readingPassage: P_DEMOCRACIA,
    options: [
      { id: 'A', text: 'Solo las posiciones políticas que no son extremistas.' },
      { id: 'B', text: 'Las posiciones políticas más recientes históricamente.' },
      { id: 'C', text: 'La mayoría de posiciones políticas existentes.' },
      { id: 'D', text: 'La totalidad de corrientes políticas posibles.' },
    ],
    correct: 'C',
    explanation: 'El texto enumera múltiples corrientes (liberales, conservadores, socialistas, etc.) sin afirmar que sean todas.',
  },
  {
    id: 'LC-2425-10', subtopic: 'Inferencia', difficulty: 3,
    stem: `10. ¿Cuál de las siguientes afirmaciones se infiere del texto (i)?`,
    readingPassage: P_DEMOCRACIA,
    options: [
      { id: 'A', text: 'El votante medio no podría explicar en cinco minutos qué es la democracia.' },
      { id: 'B', text: 'La mayoría de los votantes en los sistemas democráticos son ignorantes o incompetentes.' },
      { id: 'C', text: 'Con una conversación corta con el votante medio, cualquier persona se da cuenta de que la democracia no funciona.' },
      { id: 'D', text: 'Cinco minutos toma exponer el argumento básico contra la conveniencia del sistema político democrático.' },
    ],
    correct: 'C',
    explanation: 'La cita de Churchill implica que tras una breve conversación se concluye la inviabilidad democrática.',
  },
  {
    id: 'LC-2425-11', subtopic: 'Tesis y argumentos', difficulty: 4,
    stem: `11. ¿Cuál de las siguientes opciones describe mejor la relación entre el contenido del texto y el título de la obra de la que se extrajo ("Tratado contra el método")?`,
    readingPassage: P_FEYERABEND,
    options: [
      { id: 'A', text: 'El texto introduce la propuesta de un nuevo método para la investigación científica, diferente del tradicional.' },
      { id: 'B', text: 'El texto ataca diferentes ideas a propósito de qué es aquello en lo que consiste el llamado "método científico".' },
      { id: 'C', text: 'El texto crítica concepciones del conocimiento científico, el cual se ha concebido como resultado de un método.' },
      { id: 'D', text: 'El texto argumenta a favor de la pluralidad de métodos disponibles para que cada ciencia alcance sus verdades.' },
    ],
    correct: 'C',
    explanation: 'Feyerabend critica la idea de que el conocimiento provenga de un método único.',
  },
  {
    id: 'LC-2425-12', subtopic: 'Tesis y argumentos', difficulty: 4,
    stem: `12. El autor del texto aplica a la filosofía de la ciencia el principio del liberalismo, según el cual "todos los ciudadanos son iguales ante la ley y ante el Estado". ¿Cuál de las siguientes afirmaciones refleja de manera más directa la influencia de las ideas liberales?`,
    readingPassage: P_FEYERABEND,
    options: [
      { id: 'A', text: 'La tarea del científico no ha de ser por más tiempo la glorificación de dios.' },
      { id: 'B', text: 'Toda teoría particular, todo cuento de hadas, todo mito, forman parte del conocimiento.' },
      { id: 'C', text: 'Hacer de la causa más débil la causa más fuerte, por ello en apoyar el movimiento de conjunto.' },
      { id: 'D', text: 'El conocimiento no consiste en una serie de teorías autoconsistentes que tiende a converger en una perspectiva ideal.' },
    ],
    correct: 'B',
    explanation: 'Pone en igualdad a todas las formas de conocimiento, reflejando el principio de igualdad.',
  },
  {
    id: 'LC-2425-13', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `[Tira cómica de Calvin and Hobbes] Calvin vende limonada a $15 el vaso y justifica el precio usando la "ley de la oferta y la demanda", argumentando que, como único accionista, presidente y empleado de la empresa, él mismo DEMANDA enormes beneficios, salario exorbitante y prestaciones. Al final, cuando el comprador se va, Calvin pide un subsidio.\n\n13. El niño intenta justificar el alto precio de la limonada recurriendo a`,
    options: [
      { id: 'A', text: 'argumentos absurdos pero consistentes.' },
      { id: 'B', text: 'un modelo económico fiel a la realidad.' },
      { id: 'C', text: 'una ley de mercado que no existe.' },
      { id: 'D', text: 'su propia versión de la economía.' },
    ],
    images: [{ id: 'img-13', position: 'stem', url: IMG_CALVIN, alt: 'Tira cómica Calvin and Hobbes — limonada' }],
    correct: 'D',
    explanation: 'Calvin distorsiona la ley económica reinterpretándola a su favor.',
  },
  {
    id: 'LC-2425-14', subtopic: 'Tipología textual', difficulty: 2,
    stem: `[Caricatura de Quino] Una multitud rodea a un ser con alas (ángel). El texto dice: "Llegó hablando de cosas muy raras... bondad, amor, tolerancia, caridad, cuando aquí lo que necesitamos es seguridad, casa, pan y trabajo. Pero lo que nos hizo sospechar enseguida de él es que no recordamos haberlo visto una vez en televisión".\n\n14. ¿Cuál de los siguientes enunciados describe mejor la caricatura?`,
    options: [
      { id: 'A', text: 'El pueblo hace justicia por su propia mano.' },
      { id: 'B', text: 'El linchamiento de un ángel.' },
      { id: 'C', text: 'Entrevista con el asesino.' },
      { id: 'D', text: 'Un ángel bajó del cielo.' },
    ],
    images: [{ id: 'img-14', position: 'stem', url: IMG_QUINO_ANGEL, alt: 'Caricatura de Quino — ángel' }],
    correct: 'B',
    explanation: 'La escena describe la condena colectiva de un ángel por la multitud.',
  },
  {
    id: 'LC-2425-15', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `15. La frase "figúrate una bota aplastando un rostro humano…incesantemente"`,
    readingPassage: P_1984,
    options: [
      { id: 'A', text: 'explica los planes para el futuro del régimen.' },
      { id: 'B', text: 'ejemplifica las ideas transmitidas al pueblo.' },
      { id: 'C', text: 'expone el verdadero propósito del sistema de gobierno.' },
      { id: 'D', text: 'ilustra las condiciones de los ciudadanos bajo el régimen.' },
    ],
    correct: 'D',
    explanation: 'La imagen ilustra mediante una metáfora visual la condición del ciudadano oprimido.',
  },
  {
    id: 'LC-2425-16', subtopic: 'Inferencia', difficulty: 3,
    stem: `16. ¿Cuál de las siguientes afirmaciones es incompatible con las políticas del Partido?`,
    readingPassage: P_1984,
    options: [
      { id: 'A', text: 'El pueblo debe mantenerse unido.' },
      { id: 'B', text: 'La individualidad debe ser eliminada.' },
      { id: 'C', text: 'El poder está en ser fiel a uno mismo.' },
      { id: 'D', text: 'Un pueblo ignorante es más poderoso.' },
    ],
    correct: 'C',
    explanation: 'El Partido demanda fidelidad absoluta hacia él, no hacia uno mismo.',
  },
  {
    id: 'LC-2425-17', subtopic: 'Cohesión', difficulty: 2,
    stem: `17. En la frase "Las fotografías son la prueba irrecusable de que se hizo la excursión", ¿cuál de las siguientes palabras es un sinónimo de la palabra 'irrecusable'?`,
    readingPassage: P_FOTOGRAFIA,
    options: [
      { id: 'A', text: 'Inminente.' },
      { id: 'B', text: 'Concluyente.' },
      { id: 'C', text: 'Irremplazable.' },
      { id: 'D', text: 'Cuestionable.' },
    ],
    correct: 'B',
    explanation: '"Irrecusable" significa que no admite duda, equivalente a "concluyente".',
  },
  {
    id: 'LC-2425-18', subtopic: 'Tipología textual', difficulty: 4,
    stem: `18. Considere el siguiente resumen del texto: "La autora analiza la relación entre el turismo y la fotografía, teniendo en cuenta que los cosmopolitas ven en sus viajes al acto de fotografiar como una necesidad. Según ella, ese acto acaba por convertirse en una práctica trivial con la que solo se busca mitigar la desorientación general que causan los viajes. Así, la fotografía se convierte para los cosmopolitas japoneses, estadounidenses y alemanes en una especie de reemplazo del trabajo al que están acostumbrados". El anterior resumen se puede describir como inadecuado porque`,
    readingPassage: P_FOTOGRAFIA,
    options: [
      { id: 'A', text: 'expone ideas contrarias a las afirmaciones principales del texto.' },
      { id: 'B', text: 'se centra en un tipo particular de turistas y no en los turistas en general.' },
      { id: 'C', text: 'omite el tono irónico y burlón con que la autora se refiere al arte de la fotografía.' },
      { id: 'D', text: 'se detiene en presentar información en extremo detallada y secundaria del texto.' },
    ],
    correct: 'B',
    explanation: 'El texto habla de turistas en general, no solo cosmopolitas.',
  },
  {
    id: 'LC-2425-19', subtopic: 'Inferencia', difficulty: 4,
    stem: `19. De acuerdo con el texto, se puede afirmar que la descripción de los indios de Ibagué hecha por Aguado corresponde a`,
    readingPassage: P_AGUADO,
    options: [
      { id: 'A', text: 'un periodo anterior a la llegada de los españoles al continente americano.' },
      { id: 'B', text: 'el proceso de fundación de la ciudad colonial de Ibagué.' },
      { id: 'C', text: 'la etapa de "conquista" de los territorios que se anexarían a la colonia neogranadina.' },
      { id: 'D', text: 'un periodo histórico indeterminado.' },
    ],
    correct: 'C',
    explanation: 'El texto sitúa la descripción dentro del relato de una campaña militar de conquista.',
  },
  {
    id: 'LC-2425-20', subtopic: 'Tipología textual', difficulty: 3,
    stem: `20. ¿Cuál de los siguientes títulos se ajusta mejor al contenido del texto?`,
    readingPassage: P_AGUADO,
    options: [
      { id: 'A', text: 'Civilización y barbarie en la colonización española.' },
      { id: 'B', text: 'Fray Pedro de Aguado y la construcción retórica del indígena.' },
      { id: 'C', text: 'El canibalismo ritual en la crónica de fray Pedro de Aguado.' },
      { id: 'D', text: 'La influencia de los autores clásicos en los cronistas neogranadinos: el caso de Aguado.' },
    ],
    correct: 'B',
    explanation: 'El eje del texto es la construcción retórica del indio en la obra de Aguado.',
  },
  {
    id: 'LC-2425-21', subtopic: 'Tipología textual', difficulty: 2,
    stem: `[Caricatura de Quino, 1972] Una habitación completamente cubierta de patrones de cuadros (piso, paredes, techo, muebles, ropa) genera una sensación de uniformidad aplastante.\n\n21. ¿En cuál de los siguientes contextos se inscribe mejor la caricatura?`,
    options: [
      { id: 'A', text: 'Anuncio publicitario.' },
      { id: 'B', text: 'Reportaje gráfico.' },
      { id: 'C', text: 'Humor gráfico.' },
      { id: 'D', text: 'Sátira política.' },
    ],
    images: [{ id: 'img-21', position: 'stem', url: IMG_QUINO_CUADROS, alt: 'Caricatura de Quino — habitación de cuadros' }],
    correct: 'C',
    explanation: 'Es una caricatura de humor gráfico que comenta la uniformidad estética.',
  },
  {
    id: 'LC-2425-22', subtopic: 'Tesis y argumentos', difficulty: 2,
    stem: `22. ¿Cuál de los siguientes es un ejemplo que menciona el autor para apoyar su posición frente a los Gobiernos?`,
    readingPassage: P_THOREAU,
    options: [
      { id: 'A', text: 'La guerra con México.' },
      { id: 'B', text: 'Los abusos del ejército.' },
      { id: 'C', text: 'La tiranía de las mayorías.' },
      { id: 'D', text: 'La debilidad de las minorías.' },
    ],
    correct: 'A',
    explanation: 'Cita la guerra con México como ejemplo de abuso del gobierno.',
  },
  {
    id: 'LC-2425-23', subtopic: 'Cohesión', difficulty: 2,
    stem: `23. De acuerdo con el aforismo "Los sistemas filosóficos difieren los unos de los otros menos en la manera de resolver que en la manera de escamotear los problemas", la principal diferencia entre un sistema filosófico y otro consiste en la manera de`,
    readingPassage: P_GOMEZDAVILA,
    options: [
      { id: 'A', text: 'plantear los problemas.' },
      { id: 'B', text: 'resolver los problemas.' },
      { id: 'C', text: 'esquivar los problemas.' },
      { id: 'D', text: 'burlarse de los problemas.' },
    ],
    correct: 'C',
    explanation: '"Escamotear" significa esquivar o eludir.',
  },
  {
    id: 'LC-2425-24', subtopic: 'Inferencia', difficulty: 4,
    stem: `24. Considere el enunciado: "No me di cuenta de que no era científico discutir sobre el comportamiento en términos de motivación o propósito". ¿Qué prejuicio cuestiona la autora?`,
    readingPassage: P_GOODALL,
    options: [
      { id: 'A', text: 'Los animales tienen mente y, por tanto, deben tratarse como seres con personalidades o emociones.' },
      { id: 'B', text: 'La etología es una ciencia "dura" que se esfuerza por mantener a raya las explicaciones subjetivas.' },
      { id: 'C', text: 'Las explicaciones científicas sobre el comportamiento no deben tener en cuenta la intención al explicar la conducta.' },
      { id: 'D', text: 'La variabilidad entre animales individuales es un hecho contingente que la etología no debe considerar.' },
    ],
    correct: 'C',
    explanation: 'Cuestiona el prejuicio que excluye las nociones de motivación o propósito de las explicaciones científicas.',
  },
  {
    id: 'LC-2425-25', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `25. ¿Cuál de los siguientes enunciados se contradice con la tesis central del texto?`,
    readingPassage: P_CRATES,
    options: [
      { id: 'A', text: 'No todo se divide entre lo que depende y lo que no depende de nosotros.' },
      { id: 'B', text: 'Alejarnos de alguien no depende de nosotros mismos.' },
      { id: 'C', text: 'La mente de un filósofo funciona de la misma manera que su cuerpo.' },
      { id: 'D', text: 'El juicio y el deseo no dependen de nosotros.' },
    ],
    images: [{ id: 'img-25', position: 'stem', url: IMG_CRATES, alt: 'Historieta filosófica — Crates' }],
    correct: 'B',
    explanation: 'La tesis es que separarse de alguien depende de nosotros; lo contrario contradice al autor.',
  },
  {
    id: 'LC-2425-26', subtopic: 'Tesis y argumentos', difficulty: 2,
    stem: `26. En el texto, el autor hace referencia a Rubens para mostrar que`,
    readingPassage: P_GOMBRICH,
    options: [
      { id: 'A', text: 'a todos nos atrae lo bello y por fortuna el arte lo recoge en la pintura.' },
      { id: 'B', text: 'el público siempre exige que el artista refleje la realidad en los cuadros.' },
      { id: 'C', text: 'algunos artistas plasman en sus obras lo que nos gusta ver en la realidad.' },
      { id: 'D', text: 'la inclinación en el arte por los temas bonitos y atractivos es bastante nociva.' },
    ],
    correct: 'C',
    explanation: 'Rubens es el ejemplo de un artista que pinta lo que el público desea ver.',
  },
  {
    id: 'LC-2425-27', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `27. ¿Cuál de los siguientes enunciados expresa un juicio de valor presente en el texto?`,
    readingPassage: P_GOMBRICH,
    options: [
      { id: 'A', text: 'Mientras Rubens dibujó la juventud, Durero dibujó la vejez.' },
      { id: 'B', text: 'Los golfillos del pintor español Murillo tienen gran encanto.' },
      { id: 'C', text: 'Rubens estaba orgulloso de su hijo y deseaba que lo admiráramos.' },
      { id: 'D', text: 'Para el público, la hermosura de un cuadro reside en la belleza de su tema.' },
    ],
    correct: 'B',
    explanation: '"Gran encanto" es un juicio de valor estético del autor.',
  },
  {
    id: 'LC-2425-28', subtopic: 'Tipología textual', difficulty: 3,
    stem: `28. ¿Cuál de los siguientes títulos podría ser el más adecuado para el texto anterior?`,
    readingPassage: P_GOMBRICH,
    options: [
      { id: 'A', text: 'En defensa del mal gusto en el arte.' },
      { id: 'B', text: 'El arte como modelo de la realidad.' },
      { id: 'C', text: 'La representación de la belleza en el arte.' },
      { id: 'D', text: 'Rubens, Durero y Murillo: el arte de la pintura.' },
    ],
    correct: 'C',
    explanation: 'El texto reflexiona sobre cómo el arte representa lo bello.',
  },
  {
    id: 'LC-2425-29', subtopic: 'Tesis y argumentos', difficulty: 4,
    stem: `29. ¿Cuál de las siguientes afirmaciones contradice las ideas que presenta el autor?`,
    readingPassage: P_GIGES,
    options: [
      { id: 'A', text: 'Algunas personas actúan justamente a pesar de poder actuar de manera injusta.' },
      { id: 'B', text: 'La injusticia, contrariamente a la justicia, es natural en el ser humano.' },
      { id: 'C', text: 'Actuar con justicia brinda menos ventajas que hacerlo con injusticia.' },
      { id: 'D', text: 'La injusticia, contrariamente a la justicia, se comete voluntariamente.' },
    ],
    correct: 'A',
    explanation: 'El autor niega que existan personas justas voluntariamente.',
  },
  {
    id: 'LC-2425-30', subtopic: 'Tipología textual', difficulty: 4,
    stem: `30. ¿Cuál de las siguientes afirmaciones sintetiza adecuadamente las ideas contenidas en el primer párrafo?`,
    readingPassage: P_GIGES,
    options: [
      { id: 'A', text: 'El que alguien sea justo es un deber que se deriva de la conciencia moral.' },
      { id: 'B', text: 'El que alguien sea justo resulta de una imposición; sin las restricciones de la ley toda persona buscará satisfacer sus deseos.' },
      { id: 'C', text: 'La justicia es una ilusión, ya que lo natural es buscar cumplir los deseos sin reparar en la igualdad que exige la ley.' },
      { id: 'D', text: 'La justicia es un ideal inalcanzable, ya que toda persona tiene intereses propios que pueden llevarla a cometer injusticias.' },
    ],
    correct: 'B',
    explanation: 'El párrafo presenta a la justicia como una imposición externa de la ley.',
  },
  {
    id: 'LC-2425-31', subtopic: 'Tesis y argumentos', difficulty: 4,
    stem: `31. ¿Qué propósito general tiene el autor al introducir el relato sobre el anillo de Giges, y cómo lo alcanza?`,
    readingPassage: P_GIGES,
    options: [
      { id: 'A', text: 'Promover en la audiencia la idea de que es más ventajoso seguir el camino de la injusticia.' },
      { id: 'B', text: 'Convencer a la audiencia de que todo hombre cometerá injusticias cuando tenga la oportunidad.' },
      { id: 'C', text: 'Reforzar en la audiencia la idea de que todos cometemos injusticias.' },
      { id: 'D', text: 'Persuadir a la audiencia de que actuar justamente requiere mucha fuerza de voluntad; la tentación derivada del poder del anillo doblegó la voluntad de Giges.' },
    ],
    correct: 'D',
    explanation: 'La narrativa muestra cómo la oportunidad doblega la voluntad de actuar con justicia.',
  },
  {
    id: 'LC-2425-32', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `32. ¿Cuál de las siguientes afirmaciones constituye una razón a favor de la tesis principal del texto, a saber, que cuando alguien actúa justamente lo hace por obligación y no voluntariamente?`,
    readingPassage: P_GIGES,
    options: [
      { id: 'A', text: 'La gente se ve obligada a actuar justamente.' },
      { id: 'B', text: 'Solo la igualdad garantiza el respeto por la ley.' },
      { id: 'C', text: 'La injusticia brinda las mismas ventajas individuales que la justicia.' },
      { id: 'D', text: 'Siempre que una persona cuente con la libertad para cometer injusticias lo hará.' },
    ],
    correct: 'B',
    explanation: 'La igualdad ante la ley funciona como la imposición que obliga a actuar justamente.',
  },
  {
    id: 'LC-2425-33', subtopic: 'Inferencia', difficulty: 4,
    stem: `33. ¿Cuál presenta un supuesto subyacente a la afirmación "Todo hombre piensa que la injusticia le brinda más ventajas individuales que la justicia, y está en lo cierto, si habla de acuerdo con esta teoría"?`,
    readingPassage: P_GIGES,
    options: [
      { id: 'A', text: 'La injusticia brinda las mismas ventajas individuales que la justicia.' },
      { id: 'B', text: 'La justicia, al igual que la injusticia, brinda ventajas individuales.' },
      { id: 'C', text: 'La injusticia, a diferencia de la justicia, brinda pocas ventajas individuales.' },
      { id: 'D', text: 'La justicia no brinda ninguna de las ventajas individuales que la injusticia brinda.' },
    ],
    correct: 'B',
    explanation: 'Comparar ventajas presupone que ambas las ofrecen.',
  },
  {
    id: 'LC-2425-34', subtopic: 'Cohesión', difficulty: 3,
    stem: `34. La función del conector "sin embargo" del penúltimo párrafo es`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'introducir un nuevo tema de reflexión.' },
      { id: 'B', text: 'negar información suministrada previamente.' },
      { id: 'C', text: 'agregar nuevos detalles acerca de lo dicho anteriormente.' },
      { id: 'D', text: 'contrastar la información anterior sin llegar a invalidarla.' },
    ],
    correct: 'C',
    explanation: 'El conector amplía el contraste sin invalidar lo previo.',
  },
  {
    id: 'LC-2425-35', subtopic: 'Inferencia', difficulty: 3,
    stem: `35. Para el autor, el amor o el enamoramiento son`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'las bases fundamentales del matrimonio y de la familia.' },
      { id: 'B', text: 'amenazas al respeto y la solidaridad debida a la familia.' },
      { id: 'C', text: 'ideas solo recientemente vinculadas al matrimonio y a la familia.' },
      { id: 'D', text: 'sentimientos irracionales que contradicen el deber ser del matrimonio.' },
    ],
    correct: 'D',
    explanation: 'El texto presenta el enamoramiento como algo "irracional" frente al matrimonio tradicional.',
  },
  {
    id: 'LC-2425-36', subtopic: 'Cohesión', difficulty: 2,
    stem: `36. La palabra 'dote' del segundo párrafo puede remplazarse, sin que la frase pierda su significado, por`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'ahorros de la futura esposa.' },
      { id: 'B', text: 'dinero de los familiares.' },
      { id: 'C', text: 'aporte patrimonial.' },
      { id: 'D', text: 'ceremonia matrimonial.' },
    ],
    correct: 'C',
    explanation: 'La dote es el aporte patrimonial que aporta la mujer al matrimonio.',
  },
  {
    id: 'LC-2425-37', subtopic: 'Tipología textual', difficulty: 3,
    stem: `37. El tercer párrafo del texto`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'presenta un paralelo entre las concepciones del amor y el matrimonio en la China tradicional y en Occidente.' },
      { id: 'B', text: 'demuestra que en China el enamoramiento entre esposos era una amenaza al respeto y la solidaridad de la familia.' },
      { id: 'C', text: 'sintetiza las razones por las cuales en algunas culturas el enamoramiento y el matrimonio se consideran incompatibles.' },
      { id: 'D', text: 'provee un ejemplo de que la asociación entre el amor y el matrimonio no es algo propio de todos los tiempos y culturas.' },
    ],
    correct: 'D',
    explanation: 'China funciona como ejemplo de cultura distinta en su concepción del amor y matrimonio.',
  },
  {
    id: 'LC-2425-38', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `38. ¿Cuál de los siguientes enunciados apoya la idea de que el amor maduro y sincero no siempre ha sido considerado como la base de la familia?`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'En los años 50 se produjo una marcada distinción entre los roles masculino y femenino en la familia.' },
      { id: 'B', text: 'La idea del amor como la razón que ha de llevar al matrimonio surgió con el movimiento romántico en el siglo XVIII.' },
      { id: 'C', text: 'Ambos miembros de la pareja deben poner mucho empeño para que el matrimonio se sostenga.' },
      { id: 'D', text: 'El matrimonio se consolidó en el siglo XIX como la principal forma de institucionalización del amor conyugal.' },
    ],
    correct: 'B',
    explanation: 'Aclara que la idea es relativamente moderna.',
  },
  {
    id: 'LC-2425-39', subtopic: 'Tesis y argumentos', difficulty: 2,
    stem: `39. ¿Cuál de los siguientes ejemplos ilustra la idea de la familia como una institución política y económica?`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'En la Edad Media la mujer aportaba una dote en el momento de casarse.' },
      { id: 'B', text: 'Entre los fulbes africanos es común que las mujeres nieguen amar a sus maridos.' },
      { id: 'C', text: 'En los siglos XVIII y XIX cambió la idea sobre cuál es la base que sostiene la familia.' },
      { id: 'D', text: 'En la sociedad china solo hasta la década de 1920 se acuñó un término para designar el cariño entre esposos.' },
    ],
    correct: 'A',
    explanation: 'La dote es un mecanismo económico de la institución familiar.',
  },
  {
    id: 'LC-2425-40', subtopic: 'Inferencia', difficulty: 3,
    stem: `40. ¿Qué implicación sobre el matrimonio entre los fulbes africanos puede derivarse a partir de lo dicho por el autor?`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'Que en esa comunidad no sucede que haya amor entre esposos.' },
      { id: 'B', text: 'Que en esa comunidad el amor no es una condición necesaria para el matrimonio.' },
      { id: 'C', text: 'Que las mujeres de esa comunidad sienten temor a enamorarse de sus esposos.' },
      { id: 'D', text: 'Que las mujeres de esa comunidad no ven su amor correspondido por sus esposos.' },
    ],
    correct: 'B',
    explanation: 'No se afirma que no haya amor, solo que no es requisito del matrimonio.',
  },
  {
    id: 'LC-2425-41', subtopic: 'Tipología textual', difficulty: 3,
    stem: `41. De acuerdo con el texto, ¿qué se puede concluir acerca del matrimonio?`,
    readingPassage: P_MATRIMONIO,
    options: [
      { id: 'A', text: 'Que es una institución que tiene únicamente propósitos económicos y políticos.' },
      { id: 'B', text: 'Que es la base de la familia en culturas tan diversas y complejas como las nuestras.' },
      { id: 'C', text: 'Que es una institución que varía dependiendo del contexto histórico y social.' },
      { id: 'D', text: 'Que es un pacto entre dos individuos que debe basarse en el amor y la confianza.' },
    ],
    correct: 'C',
    explanation: 'El texto muestra cómo el matrimonio cambia con el tiempo y la cultura.',
  },
  {
    id: 'LC-2425-42', subtopic: 'Inferencia', difficulty: 4,
    stem: `42. De la información del cuadro inferior izquierdo, donde se presentan estadísticas sobre la cantidad relativa de muertes por accidentes de tránsito en función de la región, se puede inferir`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'cuáles son los países donde menos se utilizan vehículos motorizados.' },
      { id: 'B', text: 'que en el Pacífico y en Asia hay el mismo número de muertes por accidentes de tránsito.' },
      { id: 'C', text: 'cuál es el riesgo de morir en un accidente de tránsito según la zona geográfica.' },
      { id: 'D', text: 'cuáles son las zonas geográficas en donde se requiere un mejoramiento de las vías.' },
    ],
    images: [{ id: 'img-42', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'A',
    explanation: 'Los datos por región permiten inferir el riesgo asociado a cada zona.',
  },
  {
    id: 'LC-2425-43', subtopic: 'Inferencia', difficulty: 3,
    stem: `43. De acuerdo con la información presentada sobre el porcentaje de muertes por tipo de vehículo, se puede afirmar que es más probable que alguien que haya muerto por accidente de tránsito hubiera estado desplazándose`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'a pie.' },
      { id: 'B', text: 'en moto.' },
      { id: 'C', text: 'en bicicleta.' },
      { id: 'D', text: 'en otro tipo de vehículo.' },
    ],
    images: [{ id: 'img-43', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'D',
    explanation: 'El 50% restante corresponde a otros vehículos, mayor que cualquier categoría individual.',
  },
  {
    id: 'LC-2425-44', subtopic: 'Tipología textual', difficulty: 4,
    stem: `44. Considere la siguiente descripción del contenido de la infografía: «La infografía muestra datos sobre la frecuencia de los accidentes de tránsito en el mundo, y ejemplos relacionados. Además, informa sobre la mortalidad por género, por ingresos, por número de vehículos, por tipo de vehículo y por ubicación regional». Esta descripción es insatisfactoria porque`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'pasa por alto información esencial contenida en la infografía.' },
      { id: 'B', text: 'el orden de su contenido no corresponde con el de la infografía.' },
      { id: 'C', text: 'menciona información que no está presente en la infografía.' },
      { id: 'D', text: 'omite evidencias que sustentan la información de la infografía.' },
    ],
    images: [{ id: 'img-44', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'D',
    explanation: 'La descripción enumera categorías pero no las cifras y evidencias específicas.',
  },
  {
    id: 'LC-2425-45', subtopic: 'Cohesión', difficulty: 3,
    stem: `45. En el enunciado "los países de ingresos medios solo tienen la mitad de los vehículos existentes en el mundo y, a pesar de eso, sufren el 80% de las muertes por accidente de tránsito", la conjunción 'a pesar de' cumple la función de`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'resaltar que el índice de muertes por accidente de tránsito en países de ingresos medios es bastante elevado dadas sus condiciones particulares.' },
      { id: 'B', text: 'oponer el alto número de vehículos en países de ingresos medios frente al bajo porcentaje de muertes por accidente de tránsito.' },
      { id: 'C', text: 'aclarar que el alto índice de muertes por accidente de tránsito en países de ingresos medios está estrechamente relacionado con el número de autos.' },
      { id: 'D', text: 'señalar que el índice de muertes por accidente de tránsito en países de ingresos medios puede ser aún más alto de lo dicen las cifras oficiales.' },
    ],
    images: [{ id: 'img-45', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'C',
    explanation: 'El conector "a pesar de" introduce un contraste entre las dos cifras.',
  },
  {
    id: 'LC-2425-46', subtopic: 'Inferencia', difficulty: 4,
    stem: `46. A partir de las gráficas sobre la relación entre el número de vehículos y el número de muertes en accidentes de tránsito se puede inferir que, comparada con la población de los países de ingresos medios, la de los países de ingresos altos`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'tiene más vehículos por persona.' },
      { id: 'B', text: 'usa menos el vehículo particular.' },
      { id: 'C', text: 'es más educada en materia vial.' },
      { id: 'D', text: 'está más expuesta a multas de tránsito.' },
    ],
    images: [{ id: 'img-46', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'C',
    explanation: 'A pesar de tener más vehículos, los países de ingresos altos tienen menor mortalidad, lo que sugiere mejor educación vial.',
  },
  {
    id: 'LC-2425-47', subtopic: 'Tipología textual', difficulty: 2,
    stem: `47. A propósito del cuadro que presenta la información según la cual 3 de 4 de los fallecidos en accidentes de tránsito son del sexo masculino, se puede afirmar que las figuras que acompañan el texto`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'ilustran la información presentada.' },
      { id: 'B', text: 'profundizan la información dada.' },
      { id: 'C', text: 'proporcionan información adicional.' },
      { id: 'D', text: 'ejemplifican la información descrita.' },
    ],
    images: [{ id: 'img-47', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'A',
    explanation: 'Las figuras visualizan la proporción dada (ilustración).',
  },
  {
    id: 'LC-2425-48', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `48. A partir de la información presentada, se puede afirmar que el autor de la infografía tiene como propósito`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'sensibilizar al espectador sobre los riesgos de morir en un accidente de tránsito.' },
      { id: 'B', text: 'incentivar al espectador a que use formas de movilidad alternas al automóvil.' },
      { id: 'C', text: 'conmover al espectador presentando datos sobre el número de accidentes de tránsito.' },
      { id: 'D', text: 'sensibilizar al espectador acerca de la necesidad de manejar sobrio y despacio.' },
    ],
    images: [{ id: 'img-48', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'A',
    explanation: 'Los datos buscan generar conciencia sobre el riesgo de morir en accidente.',
  },
  {
    id: 'LC-2425-49', subtopic: 'Tipología textual', difficulty: 3,
    stem: `49. De acuerdo con el contenido de la información presentada, ¿a cuál de los siguientes contextos se adecuaría mejor la infografía?`,
    readingPassage: P_TRANSITO,
    options: [
      { id: 'A', text: 'Una protesta ecológica en contra del uso de vehículos motorizados.' },
      { id: 'B', text: 'Una exposición sobre el transporte público como alternativa de movilidad.' },
      { id: 'C', text: 'Una campaña diseñada para promover la adquisición de seguros de vida.' },
      { id: 'D', text: 'Un estudio sobre asesinatos según el género y la condición socioeconómica.' },
    ],
    images: [{ id: 'img-49', position: 'stem', url: IMG_TRANSITO, alt: 'Infografía OMS — accidentes de tránsito' }],
    correct: 'C',
    explanation: 'Los datos son útiles para una campaña de seguros de vida que muestre los riesgos viales.',
  },
]

export const LC_BANK_2024_2025: IcfesQuestion[] = items.map(q => ({
  ...q,
  area: 'LC',
  topic: TOPIC,
}))
