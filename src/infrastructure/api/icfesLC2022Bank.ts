/**
 * Banco de preguntas ICFES — Lectura Crítica 2022.
 * Fuente: docs/icfes_content/2022/lectura critica/leectura critica.txt
 *
 * Cuando el backend no tenga preguntas disponibles, el adaptador usa este banco
 * como fallback offline (combinado con LC_BANK_2024_2025).
 */

import type { IcfesQuestion } from './icfesAdapter'

const TOPIC = 'Comprensión lectora'

// ─── Pasajes compartidos ─────────────────────────────────────────────────────

const P_ORIGEN_MAL = `El origen del mal
En un bosque vivía un ermitaño que entendía el lenguaje de las fieras y hasta podía conversar con ellas. En una ocasión en que descansaba debajo de un árbol, se cobijaron allí un cuervo, un palomo, un ciervo y una serpiente, y empezaron a discutir sobre el origen del mal.

—El mal procede del hambre —declaró el cuervo—. Cuando uno come hasta hartarse las cosas se le antojan color rosa. Pero, amigos, si durante días no se prueba bocado, cambia la situación y ya no parece tan hermosa la naturaleza. ¡Qué desasosiego! ¡Qué intranquilidad siente uno! Y si vislumbro un buen pedazo de carne, me abalanzo sobre él, ciegamente. Ni palos ni piedras, ni lobos enfurecidos serían capaces de hacerme soltar la presa. ¡Cuántos perecemos víctimas del hambre! No cabe duda de que es el origen del mal.

El palomo intervino. —El mal no proviene del hambre, sino del amor. Si viviéramos solos, sin hembras, sobrellevaríamos las penas. Más ¡ay!, vivimos en pareja y amamos tanto a nuestra compañera que no hallamos un minuto de sosiego, siempre pensando en ella. Y cuando se aleja un poco de nuestro lado, nos sentimos como perdidos y nos tortura la idea de que un gavilán la haya despedazado. Empezamos a buscarla por doquier, con loco afán. Y si desaparece, uno no come ni bebe; no hace más que buscarla y llorar. ¡Cuántos mueren así entre nosotros! Ya ven que todo el mal proviene del amor.

—No; el mal no viene ni del hambre ni del amor —arguyó la serpiente—. El mal viene de la ira. Si viviésemos tranquilos entonces todo iría bien. Pero, cuando algo se arregla de modo distinto a como quisiéramos, todo nos ofusca. Solo pensamos en descargar nuestra ira en el primero que encontramos. Entonces, como locos, nos retorcemos tratando de morder a alguien. En tales momentos no se tiene piedad de nadie; mordería uno a su propia madre; podríamos comernos a nosotros mismos. Sin duda alguna, todo el mal viene de la ira.

El ciervo no fue de este parecer. —No, no es de la ira ni del amor ni del hambre de donde procede el mal, sino del miedo. Si fuera posible no sentir miedo, todo marcharía bien. Podemos defendernos de un animal pequeño, con nuestros cuernos, y la huida nos preserva de los grandes. Pero es imposible no sentir miedo. Apenas cruje una rama en el bosque o se mueve una hoja, temblamos de terror. El corazón palpita, como si fuera a salirse del pecho, y echamos a correr. Siempre estamos alerta, llenos de terror. No hay modo de disfrutar de un poco de tranquilidad. Por eso el origen del mal está en el miedo.

Finalmente, intervino el ermitaño: —No es el hambre, el amor, la ira ni el miedo, la fuente de nuestros males, sino nuestra propia naturaleza. Ella es la que engendra el hambre, el amor, la ira y el miedo.
Tomado y adaptado de: Tolstoi, L. (s. f.). El origen del mal.`

const P_INSECTOS = `INSECTOS A LA CARTA (Infografía, 2014)
Fuente de los datos: Archivos FAO (Food and Agriculture Organization)
Infografía elaborada por Mario Chumpitazi, publicada por Infografías S.O.S.

La infografía presenta cuatro secciones:

1. Producción de carne: comparación entre la producción ganadera tradicional y la producción de insectos. Incluye un ícono de sostenibilidad. Los insectos requieren solo una cuarta parte del alimento que consume una vaca para producir la misma cantidad de proteína. No necesitan refrigeración, lo que reduce la emisión de contaminantes ambientales.

2. ¿Cuántas especies de insectos podemos consumir? Según el estudio de Rumpold y Schlüter (2013): 2.086 especies comestibles.

3. Beneficios para los humanos: alto contenido proteico, rico en minerales y vitaminas esenciales.

4. Anatomía de un insecto: ilustración con precauciones al consumir insectos (posibles efectos tóxicos o transmisión de parásitos si no son manipulados en condiciones higiénicas adecuadas).

Tomado de: Chumpitazi, M. (2014). Insectos a la carta [Infografía]. Infografías S.O.S.`

const P_HAMLET = `Monólogo de Hamlet
Hamlet. —Ser o no ser. Esa es la cuestión. ¿Qué es más noble? ¿Permanecer impasible ante los avatares de una fortuna adversa o afrontar los peligros de un turbulento mar y, desafiándolos, terminar con todo de una vez? Morir es… dormir… Nada más. Y durmiendo se acaban la ansiedad y la angustia y los miles de padecimientos de que son herederos nuestros míseros cuerpos. Es una deseable consumación: Morir… dormir… dormir… tal vez soñar. Ah, ahí está la dificultad. Es el miedo a los sueños que podamos tener al abandonar este breve hospedaje lo que nos hace titubear, pues a través de ellos podrían prolongarse indefinidamente las desdichas de esta vida. Si pudiésemos estar absolutamente seguros de que un certero golpe de daga terminaría con todo, ¿quién soportaría los azotes y desdenes del mundo, la injusticia de los opresores, los desprecios del arrogante, el dolor del amor no correspondido, la desidia de la justicia, la insolencia de los ministros, y los palos inmerecidamente recibidos? ¿Quién arrastraría, gimiendo y sudando, las cargas de esta vida, si no fuese por el temor de que haya algo después de la muerte, ese país inexplorado del que nadie ha logrado regresar? Es lo que inmoviliza la voluntad y nos hace concluir que mejor es el mal que padecemos que el mal que está por venir. La duda nos convierte en cobardes y nos desvía de nuestro racional curso de acción. Pero… interrumpamos nuestras filosofías, pues veo allí a la bella Ofelia. Ninfa de las aguas, perdona mis pecados y ruega por mí en tus plegarias.
Tomado de: Shakespeare, W. (2007). Hamlet (acto III, escena I). Traducción de José María Ruano de la Haza.`

const P_FILOLOGIA = `Texto sobre la filología y los Diálogos de Platón
Es un "milagro" que la obra de Platón haya sobrevivido y que nosotros podamos leerla en cualquier versión. Todos los textos de sus Diálogos estuvieron perdidos durante cerca de mil años. Cuando volvieron a aparecer, bajo la forma de varias copias de copias de copias, se puso en marcha durante quinientos años una cuidadosa investigación de esas copias. Es de suponer que los originales se convirtieron en polvo hace ya mucho tiempo. La tarea con la que se enfrentaron los eruditos era intimidadora. Obviamente, se encontraron muchas "corrupciones" en las diferentes copias supervivientes (denominadas "testigos"), y estas corrupciones o errores tenían que ser solucionadas sin que fuera posible preguntarle al autor.

En los tiempos de Darwin, los filólogos que dedicaban su vida profesional a recrear el origen de sus "testigos" habían tenido éxito al descubrir la totalidad de los linajes de copias de copias, y pudieron deducir muchos hechos curiosos acerca de las circunstancias históricas de su nacimiento, de su reproducción y, eventualmente, de su muerte. A veces, la arriesgada deducción que nace de sus trabajos es similar a la de Darwin: un grupo concreto de errores en los manuscritos, no corregidos y vueltos a copiar en todos los manuscritos descendientes de un particular linaje, se debía casi siempre al hecho de que el escriba que transcribía el dictado no pronunciaba el griego de la misma forma en que lo hacía el lector del texto y, en consecuencia, entendía incorrectamente un determinado fonema.
Tomado y adaptado de: Dennett D. (1999). La peligrosa idea de Darwin. Barcelona: Círculo de Lectores.`

const P_SCHOPENHAUER = `«El arte de tener razón» — Arthur Schopenhauer (2006)

La dialéctica erística es el arte de discutir, y de discutir de tal modo que uno siempre lleve razón, es decir, per fas et nefas [justa o injustamente]. Uno puede, pues, tener razón objetiva en el asunto mismo y, sin embargo, carecer de ella a ojos de los presentes, incluso a veces a los propios ojos. Ese es el caso cuando, por ejemplo, el adversario refuta mi prueba y esto se considera una refutación de la propia afirmación, para la cual puede no obstante haber otras pruebas; en cuyo caso, naturalmente, la situación se invierte para el adversario: sigue llevando razón aunque objetivamente no la tenga. Por tanto, la verdad objetiva de una proposición y su validez en la aprobación de los que discuten y sus oyentes son dos cosas distintas. (De esto último se ocupa la dialéctica.)

¿A qué se debe esto? A la natural maldad del género humano. Si no existiera esta, si fuéramos por naturaleza honrados, en todo debate no tendríamos otra finalidad que la de poner de manifiesto la verdad, sin importarnos en nada que esta se conformara a la primera opinión que hubiéramos expuesto o a la del otro; esto sería indiferente, o por lo menos completamente secundario. Pero ahora es lo principal. La vanidad innata, especialmente susceptible en lo tocante a las capacidades intelectuales, se niega a admitir que lo que hemos empezado exponiendo resulte ser falso y cierto lo expuesto por el adversario. Pero a la vanidad innata se añaden en la mayoría la locuacidad y la innata mala fe.

Sin embargo, incluso esa mala fe, el persistir en una tesis que ya nos parece falsa a nosotros mismos, aún tiene una disculpa: muchas veces, al principio estamos firmemente convencidos de la verdad de nuestra afirmación, pero el argumento del adversario parece desbaratarla; si nos damos de inmediato por vencidos, frecuentemente descubrimos después que éramos nosotros quienes teníamos razón. De ahí surge en nosotros la máxima de que aun cuando el contraargumento parezca correcto y convincente, no obstante hay que oponerse a él en la creencia de que esa corrección no es sino aparente y que durante la discusión ya se nos ocurrirá un argumento para rebatirlo. Por ese motivo nos vemos casi forzados, o al menos fácilmente tentados, a la mala fe en la discusión.`

// ─── Items (sin area/topic, se añaden en el export) ─────────────────────────

const items: Omit<IcfesQuestion, 'area' | 'topic'>[] = [
  // ── TEXTO 1: El origen del mal (Tolstoi) ── Q01–Q03 ──────────────────────
  {
    id: 'LC-2022-01', subtopic: 'Tesis y argumentos', difficulty: 1,
    stem: `${P_ORIGEN_MAL}\n\n1. De acuerdo con expresiones del texto anterior como "¡Qué intranquilidad siente uno!", "¡Cuántos perecemos víctimas del hambre!" y "¡Cuántos mueren así entre nosotros!", el narrador pretende principalmente:`,
    options: [
      { id: 'A', text: 'Alarmar a los interlocutores.' },
      { id: 'B', text: 'Despertar la ira de los interlocutores.' },
      { id: 'C', text: 'Llamar la atención de los interlocutores.' },
      { id: 'D', text: 'Hacer partícipes de sus ideas a los interlocutores.' },
    ],
    correct: 'D',
    explanation: 'Las expresiones citadas son una estrategia para hacer al lector partícipe de la historia, compartiendo los sentimientos y perspectivas de los personajes. Las opciones A y B son incorrectas porque no buscan asustar ni despertar ira. La opción C es incorrecta porque el propósito va más allá de llamar la atención: invita al lector a compartir las ideas expuestas.',
  },
  {
    id: 'LC-2022-02', subtopic: 'Cohesión', difficulty: 1,
    stem: `${P_ORIGEN_MAL}\n\n2. Según el texto, la serpiente intervino luego de que lo hicieran:`,
    options: [
      { id: 'A', text: 'El cuervo y el palomo.' },
      { id: 'B', text: 'El cuervo y el ciervo.' },
      { id: 'C', text: 'El palomo y el ermitaño.' },
      { id: 'D', text: 'El palomo y el ciervo.' },
    ],
    correct: 'A',
    explanation: 'En el texto, el primero en intervenir es el cuervo (párrafo 2), luego el palomo (párrafo 3) y después la serpiente (párrafo 4). Las opciones B, C y D son incorrectas porque incluyen personajes que intervienen después de la serpiente.',
  },
  {
    id: 'LC-2022-03', subtopic: 'Tipología textual', difficulty: 1,
    stem: `${P_ORIGEN_MAL}\n\n3. De acuerdo con el texto anterior, los personajes de la historia son:`,
    options: [
      { id: 'A', text: 'El ermitaño, la serpiente, los lobos y el árbol.' },
      { id: 'B', text: 'El ermitaño, el cuervo, la serpiente, el gavilán y el árbol.' },
      { id: 'C', text: 'El ermitaño, el cuervo, el palomo y la serpiente.' },
      { id: 'D', text: 'El ermitaño, el cuervo, el palomo, la serpiente y el ciervo.' },
    ],
    correct: 'D',
    explanation: 'En el primer párrafo se nombran los cinco personajes: el ermitaño, el cuervo, el palomo, el ciervo y la serpiente. La opción A incluye "los lobos" y "el árbol", que no son personajes. La opción B incluye el gavilán y el árbol. La opción C omite al ciervo.',
  },
  // ── TEXTO 2: Insectos a la carta (Infografía FAO) ── Q04–Q07 ──────────────
  {
    id: 'LC-2022-04', subtopic: 'Inferencia', difficulty: 2,
    stem: `${P_INSECTOS}\n\n4. Los datos que se presentan en el texto se han tomado de:`,
    options: [
      { id: 'A', text: 'Mario Chumpitazi.' },
      { id: 'B', text: 'La FAO.' },
      { id: 'C', text: 'Rumpold y Schlüter.' },
      { id: 'D', text: 'Infografías S.O.S.' },
    ],
    correct: 'B',
    explanation: 'La referencia indica "Archivos FAO (Food and Agriculture Organization)" como fuente de los datos. Mario Chumpitazi es el creador de la infografía, Infografías S.O.S. la publica, y Rumpold y Schlüter son autores citados sobre el estudio de especies de insectos; ninguno de estos es la fuente de los datos.',
  },
  {
    id: 'LC-2022-05', subtopic: 'Inferencia', difficulty: 2,
    stem: `${P_INSECTOS}\n\n5. De acuerdo con el texto anterior, el ícono de sostenibilidad da a entender que la producción y el consumo de insectos:`,
    options: [
      { id: 'A', text: 'Forman parte de un programa de seguridad alimentaria que proveerá los alimentos que se demandarán a nivel mundial.' },
      { id: 'B', text: 'Forman parte de un proceso de reciclaje exitoso: recolección, remanufacturación y circulación del producto para la venta.' },
      { id: 'C', text: 'Emplean tecnologías limpias y respetuosas con el medio ambiente que generan menos contaminación durante el proceso de fabricación.' },
      { id: 'D', text: 'Dan lugar a un uso más eficiente de los recursos naturales y a una reducción de la emisión de contaminantes ambientales.' },
    ],
    correct: 'D',
    explanation: 'El ícono señala dos ideas del texto: los insectos usan menos recursos (comen la cuarta parte de alimento respecto a una vaca) y no necesitan refrigeración, lo que reduce la emisión de contaminantes. Las opciones A, B y C presentan descripciones no respaldadas por el texto.',
  },
  {
    id: 'LC-2022-06', subtopic: 'Tipología textual', difficulty: 2,
    stem: `${P_INSECTOS}\n\n6. Suponga que van a publicarse cuatro informes que tienen los títulos de las opciones de respuesta. ¿Dentro de cuál podría incluirse el texto anterior, de manera que el título resulte pertinente?`,
    options: [
      { id: 'A', text: 'De la sobreexplotación a la gestión inteligente de los recursos naturales.' },
      { id: 'B', text: 'Saciedad y obesidad, hambruna y malnutrición: una paradoja global.' },
      { id: 'C', text: 'Salud y cultura: biología y antropología del desarrollo de hábitos alimentarios.' },
      { id: 'D', text: 'Nutrición y seguridad alimentaria: una estrategia de cambio.' },
    ],
    correct: 'D',
    explanation: 'El texto aborda los insectos como alternativa nutritiva y segura de alimentación (nutrición y seguridad alimentaria). La opción A no aplica porque el texto no menciona explotación de recursos. La opción B no aplica porque no se habla de obesidad ni hambruna. La opción C no aplica porque no hay alusiones a cultura ni hábitos alimentarios.',
  },
  {
    id: 'LC-2022-07', subtopic: 'Cohesión', difficulty: 3,
    stem: `${P_INSECTOS}\n\n7. Considere la siguiente información que no está en el texto anterior: "No se conocen casos de transmisión de enfermedades o parásitos a humanos derivados del consumo de insectos (siempre que los insectos hayan sido manipulados en las mismas condiciones de higiene que cualquier otro alimento)" [FAO, 2013]. ¿Con cuál de los apartados del texto "INSECTOS A LA CARTA" está relacionada la anterior información?`,
    options: [
      { id: 'A', text: '«¿Cuántas especies de insectos podemos consumir?»' },
      { id: 'B', text: '«Producción de carne».' },
      { id: 'C', text: '«Anatomía de un insecto».' },
      { id: 'D', text: '«Beneficios para los humanos».' },
    ],
    correct: 'C',
    explanation: 'El apartado "Anatomía de un insecto" indica las precauciones al consumir insectos (efectos tóxicos o parásitos), lo cual se relaciona directamente con la afirmación de que no se conocen casos de transmisión de enfermedades cuando se manipulan adecuadamente. Las opciones A y B no tienen relación con enfermedades o parásitos. La opción D habla de beneficios proteínicos, no de seguridad sanitaria.',
  },
  // ── TEXTO 3: Monólogo de Hamlet (Shakespeare) ── Q08–Q11 ──────────────────
  {
    id: 'LC-2022-08', subtopic: 'Tesis y argumentos', difficulty: 2,
    stem: `${P_HAMLET}\n\n8. De acuerdo con el texto anterior, ¿a qué conclusión llega el príncipe Hamlet en sus reflexiones?`,
    options: [
      { id: 'A', text: 'Ante el dolor de la vida, es preferible el suicidio.' },
      { id: 'B', text: 'La incertidumbre nos impide actuar.' },
      { id: 'C', text: 'Es mejor ser cobarde que valiente.' },
      { id: 'D', text: 'Morir es dormir y soñar.' },
    ],
    correct: 'B',
    explanation: 'Al final del texto Hamlet concluye que "La duda nos convierte en cobardes y nos desvía de nuestro racional curso de acción", lo que equivale a decir que la incertidumbre nos impide actuar. La opción A es incorrecta porque el texto no propone el suicidio como salida. La opción C es incorrecta porque el texto no motiva la cobardía. La opción D confunde el miedo a soñar con morir.',
  },
  {
    id: 'LC-2022-09', subtopic: 'Tipología textual', difficulty: 2,
    stem: `${P_HAMLET}\n\n9. ¿Cuál de las siguientes opciones describe el tema principal del texto anterior?`,
    options: [
      { id: 'A', text: 'El sentido de la vida.' },
      { id: 'B', text: 'La cobardía y el temor.' },
      { id: 'C', text: 'La tentación del suicidio.' },
      { id: 'D', text: 'La naturaleza de los sueños.' },
    ],
    correct: 'C',
    explanation: 'En el monólogo, Hamlet sopesa las razones y temores que implica la tentación de quitarse la vida. La opción A plantea un tema que no se cuestiona explícitamente. La opción B es solo un tema secundario. La opción D confunde el miedo a soñar (después de la muerte) con la naturaleza de los sueños.',
  },
  {
    id: 'LC-2022-10', subtopic: 'Tipología textual', difficulty: 3,
    stem: `${P_HAMLET}\n\n10. ¿Cuál de los siguientes adjetivos describe mejor el texto anterior?`,
    options: [
      { id: 'A', text: 'Filosófico, porque argumenta a favor de la existencia de la vida después de la muerte.' },
      { id: 'B', text: 'Dramático, porque presenta el monólogo de un personaje en un contexto teatral.' },
      { id: 'C', text: 'Poético, por su métrica y elaboración de sus imágenes.' },
      { id: 'D', text: 'Autobiográfico, porque constituye una confesión.' },
    ],
    correct: 'B',
    explanation: 'La referencia del texto indica que es del acto III, escena I de Hamlet, lo que corresponde a lo dramático/teatral. La opción A es incorrecta porque el texto no reflexiona filosóficamente sobre la vida después de la muerte sino sobre la incertidumbre de actuar. La opción C no aplica porque el propósito es la representación teatral. La opción D es incorrecta porque Hamlet es un personaje ficticio.',
  },
  {
    id: 'LC-2022-11', subtopic: 'Valoración argumentativa', difficulty: 4,
    stem: `${P_HAMLET}\n\n11. A partir del texto anterior, ¿con cuál de las siguientes afirmaciones Hamlet NO estaría de acuerdo?`,
    options: [
      { id: 'A', text: 'No sabemos lo que hay después de la muerte.' },
      { id: 'B', text: 'La incertidumbre es parte de la existencia.' },
      { id: 'C', text: 'No hay mal que por bien no venga.' },
      { id: 'D', text: 'La vida está llena de injusticias.' },
    ],
    correct: 'C',
    explanation: 'La consideración optimista "no hay mal que por bien no venga" es incompatible con el estado atormentado de Hamlet, quien afirma que "mejor es el mal que padecemos que el mal que está por venir". Las opciones A, B y D son ideas que Hamlet sí aborda y con las cuales estaría de acuerdo.',
  },
  // ── TEXTO 4: Filología y los Diálogos de Platón (Dennett) ── Q12–Q16 ──────
  {
    id: 'LC-2022-12', subtopic: 'Tipología textual', difficulty: 4,
    stem: `${P_FILOLOGIA}\n\n12. Teniendo en cuenta la forma, el contenido y el estilo del texto anterior, se puede afirmar que este es:`,
    options: [
      { id: 'A', text: 'Un ensayo sobre el rol de los Diálogos en la historia de la filosofía.' },
      { id: 'B', text: 'Un estudio comparativo sobre el desarrollo de la filología y el darwinismo.' },
      { id: 'C', text: 'Una columna de opinión acerca de los orígenes de la filología platónica.' },
      { id: 'D', text: 'Una conferencia acerca de la influencia de Platón en la biología y la filología.' },
    ],
    correct: 'B',
    explanation: 'El texto compara dos metodologías similares usadas en la lingüística y el darwinismo. La opción A no aplica porque el texto no desarrolla la importancia de los Diálogos en la historia de la filosofía. La opción C no aplica porque el autor no aborda los orígenes de la filosofía platónica. La opción D no aplica porque el texto habla de reconstrucción filológica, no del pensamiento de Platón.',
  },
  {
    id: 'LC-2022-13', subtopic: 'Inferencia', difficulty: 3,
    stem: `${P_FILOLOGIA}\n\n13. Según el segundo párrafo del texto anterior, ¿cuál de las siguientes palabras es un sinónimo de la palabra linajes?`,
    options: [
      { id: 'A', text: 'Modelos.' },
      { id: 'B', text: 'Familias.' },
      { id: 'C', text: 'Manuscritos.' },
      { id: 'D', text: 'Reproducciones.' },
    ],
    correct: 'B',
    explanation: 'Linajes significa "ascendencia o descendencia de una familia". En el contexto, hace referencia a copias anteriores con un vínculo hereditario o de origen familiar. La opción A (modelos) apunta a referencias o ejemplares. La opción C (manuscritos) refiere a textos escritos a mano. La opción D (reproducciones) apunta a copiar algo original, no a determinar su origen.',
  },
  {
    id: 'LC-2022-14', subtopic: 'Cohesión', difficulty: 3,
    stem: `${P_FILOLOGIA}\n\n14. El autor del texto anterior hace alusión a los Diálogos en el primer párrafo para referirse a:`,
    options: [
      { id: 'A', text: 'Las obras de Darwin y las teorías filosóficas de Platón.' },
      { id: 'B', text: 'Los textos de los estudiosos de Platón.' },
      { id: 'C', text: 'Los textos originales de la obra sobre biología de Platón.' },
      { id: 'D', text: 'Las copias de las obras de Platón.' },
    ],
    correct: 'D',
    explanation: 'Los Diálogos hacen parte de la obra de Platón y se mencionan en el contexto de que aparecieron bajo la forma de copias de copias de copias. Las demás opciones introducen elementos no presentes o distorsionados respecto al propósito del autor en ese párrafo.',
  },
  {
    id: 'LC-2022-15', subtopic: 'Valoración argumentativa', difficulty: 4,
    stem: `${P_FILOLOGIA}\n\n15. Considere los siguientes enunciados del texto anterior:\n1. "En los tiempos de Darwin, los filólogos que dedicaban su vida profesional a recrear el origen de sus «testigos» habían tenido éxito al descubrir la totalidad de los linajes de copias de copias, y pudieron deducir muchos hechos curiosos acerca de las circunstancias históricas de su nacimiento, de su reproducción y, eventualmente, de su muerte."\n2. "Un grupo concreto de errores en los manuscritos, no corregidos y vueltos a copiar en todos los manuscritos descendientes de un particular linaje, se debía casi siempre al hecho de que el escriba que transcribía el dictado no pronunciaba el griego de la misma forma en que lo hacía el lector del texto y, en consecuencia, entendía incorrectamente un determinado fonema."\n¿Cuál de las siguientes opciones describe la relación entre 1 y 2?`,
    options: [
      { id: 'A', text: 'El primer enunciado es una razón a favor de lo dicho en el segundo.' },
      { id: 'B', text: 'El segundo enunciado es un ejemplo que explica lo dicho en el primero.' },
      { id: 'C', text: 'El primer enunciado es la tesis y el segundo una razón a favor de la tesis.' },
      { id: 'D', text: 'El segundo enunciado es un contraejemplo de la idea expresada en el primero.' },
    ],
    correct: 'B',
    explanation: 'El primer enunciado introduce el logro de los filólogos al descubrir los linajes y deducir hechos curiosos; el segundo presenta un caso concreto (el escriba pronunciaba diferente el griego) que ilustra o ejemplifica lo dicho en el primero. Las otras opciones confunden las funciones de razón, tesis y contraejemplo.',
  },
  {
    id: 'LC-2022-16', subtopic: 'Tesis y argumentos', difficulty: 4,
    stem: `${P_FILOLOGIA}\n\n16. ¿Cuál de las siguientes opciones es la pregunta central a la que responde el texto anterior?`,
    options: [
      { id: 'A', text: '¿Cuál fue la influencia de la selección natural en campos como la filología griega?' },
      { id: 'B', text: '¿Por qué la existencia actual de los Diálogos de Platón puede considerarse milagrosa?' },
      { id: 'C', text: '¿Qué implicaciones tiene que los filósofos apliquen el método darwiniano?' },
      { id: 'D', text: '¿Cómo se aplicaron métodos darwinianos en la reconstrucción filológica de los Diálogos de Platón?' },
    ],
    correct: 'D',
    explanation: 'El texto explica de manera detallada cómo los filólogos usaron métodos similares a los darwinianos para reconstruir el origen de las copias de los Diálogos de Platón. La opción A invierte la causalidad. La opción B solo aborda el primer párrafo introductorio. La opción C plantea una pregunta que el texto no desarrolla.',
  },
  // ── TEXTO 5: El arte de tener razón (Schopenhauer) ── Q17–Q20 ──────────────
  {
    id: 'LC-2022-17', subtopic: 'Tesis y argumentos', difficulty: 3,
    stem: `${P_SCHOPENHAUER}\n\n17. ¿Cuál de los siguientes enunciados presenta el tema principal del texto anterior?`,
    options: [
      { id: 'A', text: '"Uno puede, pues, tener razón objetiva en el asunto mismo y, sin embargo, carecer de esta a ojos de los presentes".' },
      { id: 'B', text: '"La dialéctica erística es el arte de discutir, y de discutir de tal modo que uno siempre lleve razón, es decir, per fas et nefas".' },
      { id: 'C', text: '"Si fuéramos por naturaleza honrados, en todo debate no tendríamos otra finalidad que la de poner de manifiesto la verdad".' },
      { id: 'D', text: '"La verdad objetiva de una proposición y su validez en la aprobación de los que discuten y sus oyentes son dos cosas distintas".' },
    ],
    correct: 'B',
    explanation: 'La dialéctica erística — el arte de discutir de manera que siempre se lleve la razón — es el eje temático. Schopenhauer lo define al inicio y el resto del texto explica por qué existe este fenómeno (vanidad, mala fe, locuacidad).',
  },
  {
    id: 'LC-2022-18', subtopic: 'Inferencia', difficulty: 3,
    stem: `${P_SCHOPENHAUER}\n\n18. De acuerdo con la frase «Pero a la vanidad innata se añaden en la mayoría la locuacidad y la innata mala fe», ¿cuál de las siguientes palabras es un antónimo de la palabra «locuacidad»?`,
    options: [
      { id: 'A', text: 'Ingenuidad.' },
      { id: 'B', text: 'Cordura.' },
      { id: 'C', text: 'Pudor.' },
      { id: 'D', text: 'Discreción.' },
    ],
    correct: 'D',
    explanation: 'La «locuacidad» es hablar mucho antes de pensar. Su antónimo es «discreción»: prudencia al expresarse, reserva y cuidado en el uso de las palabras.',
  },
  {
    id: 'LC-2022-19', subtopic: 'Valoración argumentativa', difficulty: 4,
    stem: `${P_SCHOPENHAUER}\n\n19. De acuerdo con los dos últimos párrafos del texto, el último párrafo presenta`,
    options: [
      { id: 'A', text: 'un desarrollo de la idea del párrafo anterior, pues proporciona un nuevo argumento mediante el cual se justifica la idea de que la mala fe está siempre presente en las discusiones.' },
      { id: 'B', text: 'la antítesis de la idea del párrafo anterior, pues plantea una forma alternativa de entender la mala fe: esta no solo no es problemática en las discusiones, sino que de hecho es ventajosa para cada interlocutor.' },
      { id: 'C', text: 'un contraargumento frente a lo anotado en el párrafo anterior, pues expone un argumento que justifica que todos nosotros actuemos de mala fe cuando discutimos.' },
      { id: 'D', text: 'la conclusión de lo dicho en el párrafo anterior, pues retoma las razones por las cuales el autor sostiene que hay mala fe en todo debate y presenta una tesis concreta.' },
    ],
    correct: 'A',
    explanation: 'El último párrafo aporta una razón adicional para defender que la mala fe está presente en las discusiones: a veces uno tiene razón aunque en ese momento no encuentre el argumento para demostrarlo. No es una antítesis, ni un contraargumento, ni una conclusión: es una nueva razón que desarrolla la idea del párrafo precedente.',
  },
  {
    id: 'LC-2022-20', subtopic: 'Tesis y argumentos', difficulty: 4,
    stem: `${P_SCHOPENHAUER}\n\n20. Según el último párrafo del texto anterior, es acertado afirmar que el autor`,
    options: [
      { id: 'A', text: 'incita al uso de la mala fe en los debates.' },
      { id: 'B', text: 'celebra la existencia de la dialéctica erística.' },
      { id: 'C', text: 'condena la vanidad innata en las discusiones.' },
      { id: 'D', text: 'justifica que las personas no piensen antes de hablar.' },
    ],
    correct: 'A',
    explanation: 'Schopenhauer dice «nos vemos casi forzados, o al menos fácilmente tentados, a la mala fe en la discusión», lo que equivale a incitar implícitamente a usarla como estrategia racional. No celebra ni condena, sino que describe y casi recomienda la mala fe como recurso inevitable.',
  },
]

export const LC_BANK_2022: IcfesQuestion[] = items.map(q => ({
  ...q,
  area: 'LC' as const,
  topic: TOPIC,
}))
