/**
 * Banco real de preguntas ICFES — Inglés 2024-2025.
 * Fuente: docs/icfes_content/2024-2025/ingles/ingles.txt
 *
 * 50 preguntas: 25 del Examen 1 y 25 del Examen 2.
 * Subtemas: Vocabulary and Matching, Reading Signs and Notices,
 *           Conversation and Dialogue, Grammar in Context, Reading Comprehension.
 */

import type { IcfesQuestion } from './icfesAdapter'

const TOPIC = 'English Language'

const IMG_E1_Q06 = 'https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/icfes/Captura%20de%20pantalla%202026-05-03%20005918.png'

// Shared reading passages
const COFFEE_PASSAGE = `Coffee is popular around the world. Over the past centuries, few subjects have been as carefully studied as coffee. Its (9) _______ important component is caffeine and it has lots of benefits. Coffee has been well-known (10) _______ the beginning of the 14th century, (11) _______ Sufi Yemenis started using coffee to stay alert during special activities. It became a popular medicine (12) _______ Europeans in the 1600s. Caffeine was first (13) _______ in the 1800s by Ferdinand Runge, a doctor that found out some effects of coffee on people. Some people say (14) _______ coffee isn't good, but doctors say you (15) _______ believe this. Thanks to caffeine you don't get hungry. Coffee can also reduce headaches and blood problems. (16) _______ many people believe coffee is bad, studies show it is good for your heart.`

const JAMES_SALTER_PASSAGE = `James Salter was an American writer who also worked in the world of cinema. During the sixties and seventies he worked in film making. One of his stories was adapted into a film called Passionate Falsehoods. Nick Paumgarten, in The Last Book, describes Salter's time in the film world as both good and bad. Despite the opportunities, Salter thought he was wasting his time. However, reading about his years in the cinema still makes for attractive reading. The Last Book is available to everyone in online stores.`

const SWIFT_PIZZA_PASSAGE = `Dear Swift Pizza and Sandwich House,\n\nI recently had a sad experience with my usual take away restaurant, so I decided to change. Last week I went to your restaurant and I had a great time. The food was absolutely excellent and the staff were very friendly. I will definitely come back very soon. – Mark\n\n[Restaurant notice] Well done to Mark for writing the best letter about us this week! He wins £25. Merry Christmas and Happy New Year to all of you!`

const WOLF_PASSAGE = `It is an African animal, which is called the Simien Jackal. Some scientists have (10) _______ it is not a real wolf. But studies show that (11) _______ close relationship to grey wolves and coyotes is evident. (12) _______ Ethiopian wolves are more similar to grey wolves and coyotes than any other African canines. Scientists also believe there are about 450 of them living in wild conditions. The (13) _______ group of Ethiopian wolves lives (14) _______ the Bale Mountains National Park.`

const ARTISTIC_PASSAGE = `Every Sunday morning, I watched a TV show with a French man who was painting. He could quickly make trees and rivers on the canvas; he made it look simple and easy. I was only seven but I wanted to paint like him. I could not buy oil paints because I was only seven. So I decided to use my mum's paints from around the house. After my mum saw what I did with her things, I was told I could not paint again.`

const JONATHAN_PASSAGE = `My name is Jonathan and last year I had a wonderful experience visiting Colombia. I stayed at a coffee farm in the hills. The price per night was $45,000. This includes three home-cooked meals a day, a swimming pool, and as much coffee as you can drink. The farm owners were incredibly welcoming. I hope that after reading this, you will feel inspired to do the same and visit this beautiful country.`

const VALENTINE_PASSAGE = `It's always a lot of fun to get a card or some chocolates, but (22) _______ do we do this? There is a lot of mystery about this day. One of the (23) _______ says that the original Valentine was a priest. When the King found (24) _______ he ordered soldiers to kill Valentine! Women buy (25) _______ 90% of the cards, but gentlemen still buy the most chocolates and flowers...`

type INGQ = Omit<IcfesQuestion, 'area' | 'topic'>

const items: INGQ[] = [
  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 1 — Parte 1: Vocabulary and Matching (Clothes & Accessories)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E1-Q01',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'CLOTHES AND ACCESSORIES — Choose the word that matches the description.\n\nA person can carry things in one of these.',
    options: [
      { id: 'A', text: 'hat' },
      { id: 'B', text: 'handbags' },
      { id: 'C', text: 'socks' },
      { id: 'D', text: 'scarf' },
    ],
    correct: 'B',
    explanation: '"Handbags" are bags carried by hand or over the shoulder to hold personal items. The description directly describes the function of a handbag.',
  },
  {
    id: 'ING-2024-E1-Q02',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'CLOTHES AND ACCESSORIES — Choose the word that matches the description.\n\nYou wear this when you go to bed.',
    options: [
      { id: 'A', text: 'glasses' },
      { id: 'B', text: 'scarf' },
      { id: 'C', text: 'hat' },
      { id: 'D', text: 'pajamas' },
    ],
    correct: 'D',
    explanation: '"Pajamas" are the clothing worn to sleep. "You wear this when you go to bed" is the defining use of pajamas.',
  },
  {
    id: 'ING-2024-E1-Q03',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'CLOTHES AND ACCESSORIES — Choose the word that matches the description.\n\nYou cover your neck with this.',
    options: [
      { id: 'A', text: 'glasses' },
      { id: 'B', text: 'skirt' },
      { id: 'C', text: 'scarf' },
      { id: 'D', text: 'handbags' },
    ],
    correct: 'C',
    explanation: '"Scarf" is a piece of fabric worn around the neck for warmth or as a fashion accessory.',
  },
  {
    id: 'ING-2024-E1-Q04',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'CLOTHES AND ACCESSORIES — Choose the word that matches the description.\n\nSome people need them to see well.',
    options: [
      { id: 'A', text: 'glasses' },
      { id: 'B', text: 'socks' },
      { id: 'C', text: 'pajamas' },
      { id: 'D', text: 'hat' },
    ],
    correct: 'A',
    explanation: '"Glasses" (eyeglasses/spectacles) are worn to correct vision. "Some people need them to see well" matches the purpose of glasses.',
  },
  {
    id: 'ING-2024-E1-Q05',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'CLOTHES AND ACCESSORIES — Choose the word that matches the description.\n\nThese are for your feet.',
    options: [
      { id: 'A', text: 'scarf' },
      { id: 'B', text: 'glasses' },
      { id: 'C', text: 'handbags' },
      { id: 'D', text: 'socks' },
    ],
    correct: 'D',
    explanation: '"Socks" are worn on the feet inside shoes. "These are for your feet" directly matches socks.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 1 — Parte 2: Reading Signs and Notices
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E1-Q06',
    subtopic: 'Reading Signs and Notices',
    difficulty: 1,
    stem: 'WHERE CAN YOU SEE THIS NOTICE?\n\n"Draw a line to complete the snake and color it"\n\n[See the image for the notice]',
    images: [
      { id: 'ING-2024-E1-Q06-stem', position: 'stem', url: IMG_E1_Q06, alt: 'Notice: Draw a line to complete the snake and color it' },
    ],
    options: [
      { id: 'A', text: 'on a rug' },
      { id: 'B', text: 'on a test' },
      { id: 'C', text: 'on a bookcase' },
      { id: 'D', text: 'in a school' },
    ],
    correct: 'B',
    explanation: 'The instruction "draw a line to complete the snake and color it" is a typical instruction found on a school test or activity worksheet ("on a test").',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 1 — Parte 3: Conversation and Dialogue
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E1-Q07',
    subtopic: 'Conversation and Dialogue',
    difficulty: 1,
    stem: 'COMPLETE THE CONVERSATION. Choose the best response.\n\n— "Grandma, shall I hold those bags for you?"\n— "___________"',
    options: [
      { id: 'A', text: "I'm not afraid!" },
      { id: 'B', text: 'Where are you?' },
      { id: 'C', text: "That's fine." },
      { id: 'D', text: 'Sure, go ahead!' },
    ],
    correct: 'C',
    explanation: '"Shall I...?" is an offer of help. The natural and polite response to someone offering to carry bags is "That\'s fine" (Yes, that is okay/thank you).',
  },
  {
    id: 'ING-2024-E1-Q08',
    subtopic: 'Conversation and Dialogue',
    difficulty: 1,
    stem: 'COMPLETE THE CONVERSATION. Choose the best response.\n\n— "How much is that umbrella?"\n— "___________"',
    options: [
      { id: 'A', text: 'Anything else?' },
      { id: 'B', text: '50 dollars.' },
      { id: 'C', text: 'Cash only!' },
      { id: 'D', text: 'No problem.' },
    ],
    correct: 'B',
    explanation: '"How much...?" asks for a price. The only option that gives a monetary amount is "50 dollars".',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 1 — Parte 4: Grammar in Context (COFFEE)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E1-Q09',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (9):`,
    options: [
      { id: 'A', text: 'much' },
      { id: 'B', text: 'more' },
      { id: 'C', text: 'most' },
      { id: 'D', text: 'many' },
    ],
    correct: 'C',
    explanation: 'The superlative "most" is required to express "its most important component". "Much" and "more" are not superlatives in this context.',
  },
  {
    id: 'ING-2024-E1-Q10',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (10):`,
    options: [
      { id: 'A', text: 'during' },
      { id: 'B', text: 'until' },
      { id: 'C', text: 'since' },
      { id: 'D', text: 'after' },
    ],
    correct: 'C',
    explanation: '"Since" indicates the starting point of an action continuing to the present ("well-known since the beginning of the 14th century").',
  },
  {
    id: 'ING-2024-E1-Q11',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (11):`,
    options: [
      { id: 'A', text: 'when' },
      { id: 'B', text: 'which' },
      { id: 'C', text: 'who' },
      { id: 'D', text: 'where' },
    ],
    correct: 'A',
    explanation: '"When" introduces a time clause referring to "the beginning of the 14th century". "Which" and "who" are relative pronouns for things/people, not time references.',
  },
  {
    id: 'ING-2024-E1-Q12',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (12):`,
    options: [
      { id: 'A', text: 'among' },
      { id: 'B', text: 'about' },
      { id: 'C', text: 'along' },
      { id: 'D', text: 'above' },
    ],
    correct: 'A',
    explanation: '"Among" means "within a group" and is correct when describing acceptance within a collective (Europeans).',
  },
  {
    id: 'ING-2024-E1-Q13',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (13):`,
    options: [
      { id: 'A', text: 'describe' },
      { id: 'B', text: 'described' },
      { id: 'C', text: 'describes' },
      { id: 'D', text: 'describing' },
    ],
    correct: 'B',
    explanation: 'The passive voice structure "was first + past participle" requires "described". "Describe" and "describes" do not work in a passive construction.',
  },
  {
    id: 'ING-2024-E1-Q14',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (14):`,
    options: [
      { id: 'A', text: 'drink' },
      { id: 'B', text: 'drinking' },
      { id: 'C', text: 'drunk' },
      { id: 'D', text: 'drank' },
    ],
    correct: 'B',
    explanation: '"Drinking coffee" (gerund as subject of the clause) is grammatically correct. A gerund functions as the subject meaning "taking coffee is not good".',
  },
  {
    id: 'ING-2024-E1-Q15',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (15):`,
    options: [
      { id: 'A', text: "mustn't" },
      { id: 'B', text: "couldn't" },
      { id: 'C', text: "wouldn't" },
      { id: 'D', text: "shouldn't" },
    ],
    correct: 'A',
    explanation: '"Mustn\'t" expresses a strong prohibition or advice against doing something ("you must not believe this").',
  },
  {
    id: 'ING-2024-E1-Q16',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nCOFFEE\n\n${COFFEE_PASSAGE}\n\nChoose the correct word for blank (16):`,
    options: [
      { id: 'A', text: 'While' },
      { id: 'B', text: 'Except' },
      { id: 'C', text: 'Because' },
      { id: 'D', text: 'Unless' },
    ],
    correct: 'A',
    explanation: '"While" (meaning "although / whereas") shows contrast between what people believe and what studies show.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 1 — Parte 5: Reading Comprehension (JAMES SALTER'S DAYS IN FILM)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E1-Q17',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nJames Salter played an important part in the making of movies...`,
    options: [
      { id: 'A', text: 'from 1960 to 1979.' },
      { id: 'B', text: 'in 1957.' },
      { id: 'C', text: 'after 1997.' },
      { id: 'D', text: 'in the 1980s.' },
    ],
    correct: 'A',
    explanation: 'The article states "during the sixties and seventies he worked in film making", corresponding to the period from 1960 to 1979.',
  },
  {
    id: 'ING-2024-E1-Q18',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nPassionate Falsehoods is...`,
    options: [
      { id: 'A', text: 'a newspaper.' },
      { id: 'B', text: 'a play.' },
      { id: 'C', text: 'a movie.' },
      { id: 'D', text: 'a book.' },
    ],
    correct: 'C',
    explanation: 'The article states that one of Salter\'s stories "was adapted into a film called Passionate Falsehoods", confirming it is a movie.',
  },
  {
    id: 'ING-2024-E1-Q19',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nSalter had nice and difficult times when he was...`,
    options: [
      { id: 'A', text: 'an actor.' },
      { id: 'B', text: 'making movies.' },
      { id: 'C', text: 'in a different city.' },
      { id: 'D', text: 'writing novels.' },
    ],
    correct: 'B',
    explanation: 'The article describes Salter\'s time "in the film world as both good and bad", meaning he had positive and negative experiences while making movies.',
  },
  {
    id: 'ING-2024-E1-Q20',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nThe Last Book was written by...`,
    options: [
      { id: 'A', text: 'James Salter.' },
      { id: 'B', text: 'Deborah Treisman.' },
      { id: 'C', text: 'Nick Paumgarten.' },
      { id: 'D', text: 'Ferdinand Runge.' },
    ],
    correct: 'C',
    explanation: 'The article says "Nick Paumgarten, in The Last Book, describes...", identifying Nick Paumgarten as the author.',
  },
  {
    id: 'ING-2024-E1-Q21',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nJames Salter thinks that his work in the cinema business was...`,
    options: [
      { id: 'A', text: 'not useful.' },
      { id: 'B', text: 'not hard.' },
      { id: 'C', text: 'not usual.' },
      { id: 'D', text: 'not long.' },
    ],
    correct: 'A',
    explanation: '"Salter thought he was wasting his time" means he considered his work in cinema unproductive — not useful.',
  },
  {
    id: 'ING-2024-E1-Q22',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nReading about James Salter's years in the cinema could be...`,
    options: [
      { id: 'A', text: 'clever enough.' },
      { id: 'B', text: 'just fair.' },
      { id: 'C', text: 'quite interesting.' },
      { id: 'D', text: 'rather boring.' },
    ],
    correct: 'C',
    explanation: 'The article concludes that reading about his cinema years "still makes for attractive reading" — meaning it is quite interesting.',
  },
  {
    id: 'ING-2024-E1-Q23',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJAMES SALTER'S DAYS IN FILM\n\n${JAMES_SALTER_PASSAGE}\n\nThe Last Book can be found...`,
    options: [
      { id: 'A', text: 'in museums.' },
      { id: 'B', text: 'at a café.' },
      { id: 'C', text: 'on the web.' },
      { id: 'D', text: 'in libraries.' },
    ],
    correct: 'C',
    explanation: 'The article states the book is "available to everyone in online stores", meaning it can be found on the web.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 1 — Parte 6: Reading Comprehension (SWIFT PIZZA AND SANDWICH HOUSE)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E1-Q24',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nSWIFT PIZZA AND SANDWICH HOUSE\n\n${SWIFT_PIZZA_PASSAGE}\n\nAccording to the text, the customer...`,
    options: [
      { id: 'A', text: 'left a £25 tip to the waiters who work there.' },
      { id: 'B', text: 'celebrated Christmas and New Year at this restaurant.' },
      { id: 'C', text: 'found this great restaurant after many attempts.' },
      { id: 'D', text: 'posted an excellent review about this restaurant.' },
    ],
    correct: 'D',
    explanation: 'Mark won £25 "for writing the best letter about us this week", which is equivalent to posting an excellent review about the restaurant.',
  },
  {
    id: 'ING-2024-E1-Q25',
    subtopic: 'Reading Comprehension',
    difficulty: 4,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nSWIFT PIZZA AND SANDWICH HOUSE\n\n${SWIFT_PIZZA_PASSAGE}\n\nIt can be inferred from the text that Mark...`,
    options: [
      { id: 'A', text: 'does not like cooking food for himself.' },
      { id: 'B', text: 'almost always eats hamburgers.' },
      { id: 'C', text: 'enjoys eating fast food sometimes.' },
      { id: 'D', text: 'is tired of going to restaurants.' },
    ],
    correct: 'C',
    explanation: 'From "I recently had a sad experience with my usual take away restaurant" and his delight at Swift Pizza, we infer Mark enjoys fast food occasionally.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 1: Vocabulary and Matching (Transportation)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q01',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'TRANSPORTATION — Choose the word that matches the description.\n\nYou often learn to ride it when you are a child.',
    options: [
      { id: 'A', text: 'bus' },
      { id: 'B', text: 'plane' },
      { id: 'C', text: 'bike' },
      { id: 'D', text: 'boat' },
    ],
    correct: 'C',
    explanation: '"Bike" (bicycle) is what most children learn to ride. A plane, bus, and boat are not typically learned to ride as a child.',
  },
  {
    id: 'ING-2024-E2-Q02',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'TRANSPORTATION — Choose the word that matches the description.\n\nPeople pay to take this public transport by road.',
    options: [
      { id: 'A', text: 'bike' },
      { id: 'B', text: 'boat' },
      { id: 'C', text: 'plane' },
      { id: 'D', text: 'bus' },
    ],
    correct: 'D',
    explanation: '"Bus" is the public road transport that people pay to use. A bike is personal, a plane travels by air, a boat by water.',
  },
  {
    id: 'ING-2024-E2-Q03',
    subtopic: 'Vocabulary and Matching',
    difficulty: 1,
    stem: 'TRANSPORTATION — Choose the word that matches the description.\n\nMany people fly on it to go to a place.',
    options: [
      { id: 'A', text: 'bus' },
      { id: 'B', text: 'bike' },
      { id: 'C', text: 'boat' },
      { id: 'D', text: 'plane' },
    ],
    correct: 'D',
    explanation: '"Plane" (airplane) is the vehicle people fly on to travel long distances.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 2: Reading Signs and Notices
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q04',
    subtopic: 'Reading Signs and Notices',
    difficulty: 1,
    stem: 'WHERE CAN YOU SEE THIS NOTICE?\n\n"How do I drive? Phone: 0152067"',
    options: [
      { id: 'A', text: 'on a plane' },
      { id: 'B', text: 'on a bus' },
      { id: 'C', text: 'on a boat' },
      { id: 'D', text: 'at a park' },
    ],
    correct: 'B',
    explanation: '"How do I drive?" with a phone number is a standard notice on the rear of commercial road vehicles such as buses.',
  },
  {
    id: 'ING-2024-E2-Q05',
    subtopic: 'Reading Signs and Notices',
    difficulty: 1,
    stem: 'WHERE CAN YOU SEE THIS NOTICE?\n\n"New Toys: Green monsters, angry dolls, and black helicopters"',
    options: [
      { id: 'A', text: 'in a house' },
      { id: 'B', text: 'in a shop' },
      { id: 'C', text: 'in a zoo' },
      { id: 'D', text: 'at a park' },
    ],
    correct: 'B',
    explanation: 'A notice advertising new toys would be found in a toy shop. Zoos have animals, not toys.',
  },
  {
    id: 'ING-2024-E2-Q06',
    subtopic: 'Reading Signs and Notices',
    difficulty: 1,
    stem: 'WHERE CAN YOU SEE THIS NOTICE?\n\n"Please, take the one you want to read"',
    options: [
      { id: 'A', text: 'on a stool' },
      { id: 'B', text: 'on a computer' },
      { id: 'C', text: 'on a bookshelf' },
      { id: 'D', text: 'in a classroom' },
    ],
    correct: 'C',
    explanation: '"Please, take the one you want to read" is a sign placed near books on a bookshelf, inviting people to take a book.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 3: Conversation and Dialogue
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q07',
    subtopic: 'Conversation and Dialogue',
    difficulty: 1,
    stem: 'COMPLETE THE CONVERSATION. Choose the best response.\n\n— "I can\'t eat a cold sandwich. It is horrible!"\n— "___________"',
    options: [
      { id: 'A', text: 'I hope so.' },
      { id: 'B', text: 'I agree.' },
      { id: 'C', text: 'I am not.' },
      { id: 'D', text: "I don't." },
    ],
    correct: 'B',
    explanation: '"I agree" expresses agreement with the speaker\'s opinion that a cold sandwich is horrible.',
  },
  {
    id: 'ING-2024-E2-Q08',
    subtopic: 'Conversation and Dialogue',
    difficulty: 1,
    stem: 'COMPLETE THE CONVERSATION. Choose the best response.\n\n— "I am going on vacation to Vancouver!"\n— "___________"',
    options: [
      { id: 'A', text: "That's great!" },
      { id: 'B', text: 'I like swimming!' },
      { id: 'C', text: 'You are first!' },
      { id: 'D', text: 'How nice for you!' },
    ],
    correct: 'A',
    explanation: '"That\'s great!" is the natural enthusiastic response to positive news like a vacation announcement.',
  },
  {
    id: 'ING-2024-E2-Q09',
    subtopic: 'Conversation and Dialogue',
    difficulty: 2,
    stem: 'COMPLETE THE CONVERSATION. Choose the best response.\n\n— "It rained a lot last night!"\n— "___________"',
    options: [
      { id: 'A', text: 'Did you accept?' },
      { id: 'B', text: 'Did you understand?' },
      { id: 'C', text: 'Did you sleep?' },
      { id: 'D', text: 'Did you stay dry?' },
    ],
    correct: 'C',
    explanation: '"Did you sleep?" is the logical follow-up — asking whether the heavy rain noise kept the person awake.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 4: Grammar in Context (THE ETHIOPIAN WOLF)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q10',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nTHE ETHIOPIAN WOLF\n\n${WOLF_PASSAGE}\n\nChoose the correct word for blank (10):`,
    options: [
      { id: 'A', text: 'saying' },
      { id: 'B', text: 'said' },
      { id: 'C', text: 'say' },
      { id: 'D', text: 'says' },
    ],
    correct: 'B',
    explanation: 'The present perfect "have said" requires the past participle "said". "Saying" is a gerund and "say" is the base form.',
  },
  {
    id: 'ING-2024-E2-Q11',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nTHE ETHIOPIAN WOLF\n\n${WOLF_PASSAGE}\n\nChoose the correct word for blank (11):`,
    options: [
      { id: 'A', text: 'its' },
      { id: 'B', text: 'his' },
      { id: 'C', text: 'your' },
      { id: 'D', text: 'their' },
    ],
    correct: 'A',
    explanation: '"Its" is the possessive adjective for animals and things (third person singular, neuter), referring to the wolf\'s relationship.',
  },
  {
    id: 'ING-2024-E2-Q12',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nTHE ETHIOPIAN WOLF\n\n${WOLF_PASSAGE}\n\nChoose the correct word for blank (12):`,
    options: [
      { id: 'A', text: 'This' },
      { id: 'B', text: 'That' },
      { id: 'C', text: 'These' },
      { id: 'D', text: 'Those' },
    ],
    correct: 'C',
    explanation: '"These" is the plural demonstrative adjective, matching the plural noun "Ethiopian wolves". "This" and "That" are singular.',
  },
  {
    id: 'ING-2024-E2-Q13',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nTHE ETHIOPIAN WOLF\n\n${WOLF_PASSAGE}\n\nChoose the correct word for blank (13):`,
    options: [
      { id: 'A', text: 'larger' },
      { id: 'B', text: 'largest' },
      { id: 'C', text: 'large' },
      { id: 'D', text: 'most large' },
    ],
    correct: 'B',
    explanation: '"The largest" uses the definite article + superlative, indicating the biggest group. "Larger" is comparative and requires "than".',
  },
  {
    id: 'ING-2024-E2-Q14',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nTHE ETHIOPIAN WOLF\n\n${WOLF_PASSAGE}\n\nChoose the correct word for blank (14):`,
    options: [
      { id: 'A', text: 'in' },
      { id: 'B', text: 'along' },
      { id: 'C', text: 'on' },
      { id: 'D', text: 'at' },
    ],
    correct: 'A',
    explanation: '"In" is the correct preposition to indicate location within a defined geographical area (a national park).',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 5: Reading Comprehension (MY ARTISTIC ADVENTURE)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q15',
    subtopic: 'Reading Comprehension',
    difficulty: 2,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nMY ARTISTIC ADVENTURE\n\n${ARTISTIC_PASSAGE}\n\nWhere was the painter from?`,
    options: [
      { id: 'A', text: 'Ireland' },
      { id: 'B', text: 'Spain' },
      { id: 'C', text: 'France' },
      { id: 'D', text: 'England' },
    ],
    correct: 'C',
    explanation: 'The text explicitly states "a French man who was painting", identifying the painter as being from France.',
  },
  {
    id: 'ING-2024-E2-Q16',
    subtopic: 'Reading Comprehension',
    difficulty: 2,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nMY ARTISTIC ADVENTURE\n\n${ARTISTIC_PASSAGE}\n\nShe was mostly excited by the...`,
    options: [
      { id: 'A', text: "painter's ability." },
      { id: 'B', text: "painter's voice." },
      { id: 'C', text: "painter's show." },
      { id: 'D', text: "painter's brushes." },
    ],
    correct: 'A',
    explanation: 'The narrator was amazed by how quickly and easily the painter could create trees and rivers — this refers to his skill/ability.',
  },
  {
    id: 'ING-2024-E2-Q17',
    subtopic: 'Reading Comprehension',
    difficulty: 2,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nMY ARTISTIC ADVENTURE\n\n${ARTISTIC_PASSAGE}\n\nHow often did she watch the show?`,
    options: [
      { id: 'A', text: 'three times a week' },
      { id: 'B', text: 'once a week' },
      { id: 'C', text: 'twice a week' },
      { id: 'D', text: 'every day' },
    ],
    correct: 'B',
    explanation: '"Every Sunday morning" means once a week — every Sunday (one day per week).',
  },
  {
    id: 'ING-2024-E2-Q18',
    subtopic: 'Reading Comprehension',
    difficulty: 2,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nMY ARTISTIC ADVENTURE\n\n${ARTISTIC_PASSAGE}\n\nShe could not get oil paints because she...`,
    options: [
      { id: 'A', text: "didn't speak Spanish." },
      { id: 'B', text: 'was too young.' },
      { id: 'C', text: 'always watched TV.' },
      { id: 'D', text: 'had no money.' },
    ],
    correct: 'B',
    explanation: '"I could not buy oil paints; I was only seven" — she was too young (only seven years old) to purchase paints.',
  },
  {
    id: 'ING-2024-E2-Q19',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nMY ARTISTIC ADVENTURE\n\n${ARTISTIC_PASSAGE}\n\nStopping painting was...`,
    options: [
      { id: 'A', text: "the painter's idea." },
      { id: 'B', text: "her mother's order." },
      { id: 'C', text: 'her own decision.' },
      { id: 'D', text: "her teacher's rule." },
    ],
    correct: 'B',
    explanation: '"After my mum saw what I did with her things, I was told I could not paint again." The passive voice indicates the mother gave the order.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 6: Reading Comprehension (JONATHAN'S TRIP TO COLOMBIA)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q20',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJONATHAN'S TRIP TO COLOMBIA\n\n${JONATHAN_PASSAGE}\n\nWhat is the writer trying to do in this article?`,
    options: [
      { id: 'A', text: 'encouraging tourists to visit Colombia.' },
      { id: 'B', text: 'convincing people to buy a Colombian coffee farm.' },
      { id: 'C', text: 'telling readers to run a coffee business in Colombia.' },
      { id: 'D', text: 'inviting tourists to write about places they visit in Colombia.' },
    ],
    correct: 'A',
    explanation: 'Jonathan concludes that he hopes readers "will feel inspired to do the same and visit this beautiful country" — encouraging tourists to visit Colombia.',
  },
  {
    id: 'ING-2024-E2-Q21',
    subtopic: 'Reading Comprehension',
    difficulty: 3,
    stem: `READ THE ARTICLE AND ANSWER THE QUESTIONS.\n\nJONATHAN'S TRIP TO COLOMBIA\n\n${JONATHAN_PASSAGE}\n\nWhat can a reader find out from this text?`,
    options: [
      { id: 'A', text: 'how to grow coffee on the farm.' },
      { id: 'B', text: 'when the best time to visit the farm is.' },
      { id: 'C', text: 'what the accommodation price includes.' },
      { id: 'D', text: 'which activities tourists prefer to do at the farm.' },
    ],
    correct: 'C',
    explanation: 'The article explicitly details what the $45,000 price includes: "three home-cooked meals a day, a swimming pool, and as much coffee as you can drink".',
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EXAMEN 2 — Parte 7: Grammar in Context (VALENTINE'S DAY)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'ING-2024-E2-Q22',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nVALENTINE'S DAY\n\n${VALENTINE_PASSAGE}\n\nChoose the correct word for blank (22):`,
    options: [
      { id: 'A', text: 'where' },
      { id: 'B', text: 'why' },
      { id: 'C', text: 'when' },
      { id: 'D', text: 'what' },
    ],
    correct: 'B',
    explanation: '"Why do we do this?" asks for the reason behind Valentine\'s Day customs, which the following text explores.',
  },
  {
    id: 'ING-2024-E2-Q23',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nVALENTINE'S DAY\n\n${VALENTINE_PASSAGE}\n\nChoose the correct word for blank (23):`,
    options: [
      { id: 'A', text: 'essays' },
      { id: 'B', text: 'stories' },
      { id: 'C', text: 'reports' },
      { id: 'D', text: 'letters' },
    ],
    correct: 'B',
    explanation: '"Stories" (tales/legends) is correct in this folkloric context about the origin of Valentine\'s Day.',
  },
  {
    id: 'ING-2024-E2-Q24',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nVALENTINE'S DAY\n\n${VALENTINE_PASSAGE}\n\nChoose the correct word for blank (24):`,
    options: [
      { id: 'A', text: 'off' },
      { id: 'B', text: 'in' },
      { id: 'C', text: 'at' },
      { id: 'D', text: 'out' },
    ],
    correct: 'D',
    explanation: 'The phrasal verb "find out" means "to discover". When the King found out what Valentine was doing, he ordered his execution.',
  },
  {
    id: 'ING-2024-E2-Q25',
    subtopic: 'Grammar in Context',
    difficulty: 2,
    stem: `READ THE TEXT AND SELECT THE CORRECT WORD FOR EACH BLANK.\n\nVALENTINE'S DAY\n\n${VALENTINE_PASSAGE}\n\nChoose the correct word for blank (25):`,
    options: [
      { id: 'A', text: 'almost' },
      { id: 'B', text: 'only' },
      { id: 'C', text: 'hardly' },
      { id: 'D', text: 'just' },
    ],
    correct: 'A',
    explanation: '"Almost" (nearly/close to) expresses a quantity approaching but not reaching the stated figure ("almost 90%").',
  },
]

export const ING_BANK_2024_2025: IcfesQuestion[] = items.map(q => ({
  ...q,
  area: 'ING',
  topic: TOPIC,
}))
