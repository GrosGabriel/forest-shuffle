// Mapping couleur de carte → nom de symbole glaures
// Correspond à la couleur de fond imprimée sur chaque carte animale du jeu

export const CardColor = {
  NONE:          '',        // arbuste / pousse d'arbre
  LINDEN:        'Yellow',
  OAK:           'Brown',
  SILVER_FIR:    'Blue',
  BIRCH:         'LightGreen',
  BEECH:         'Green',
  SYCAMORE:      'Red',
  DOUGLAS_FIR:   'Grey',
  HORSE_CHESTNUT:'Orange',
  LARIX:         'Lila',
  PINUS:         'Pink',
}

// Couleur → clé de compteur dans Forest (ex: 'Green' → 'beech' → forest.beechCount)
const COLOR_TO_GL_SYMBOL = {
  [CardColor.NONE]:          null,           // pas de compteur pour les arbustes
  [CardColor.LINDEN]:        'linden',
  [CardColor.OAK]:           'oak',
  [CardColor.SILVER_FIR]:    'silverFir',
  [CardColor.BIRCH]:         'birch',
  [CardColor.BEECH]:         'beech',
  [CardColor.SYCAMORE]:      'sycamore',
  [CardColor.DOUGLAS_FIR]:   'douglasFir',
  [CardColor.HORSE_CHESTNUT]:'horseChestnut',
  [CardColor.LARIX]:         'europeanLarch',
  [CardColor.PINUS]:         'stonePine',
}


export const TreeColor = {
  "beech" : "vert-foncé",
  "birch" : "vert-clair",
  "douglasFir" : "gris",
  "horseChestnut" : "orange",
  "linden" : "jaune",
  "oak" : "marron",
  "silverFir" : "bleu",
  "sycamore" : "rouge",
  "europeanLarch" : "violet",
  "stonePine" : "rose",
  "downyBirch" : "vert-clair",
  "moorBirch" : "vert-clair",
  "turkeyOak" : "marron",
  "oChristmasTree" : "marron",
  
}
/**
 * Retourne le nom du compteur glaures correspondant à une couleur de carte.
 * Ex: CardColor.BEECH → 'beech' → forest.beechCount
 * @param {string} color — une valeur de CardColor
 * @returns {string|null}
 */
export function cardColorToGlSymbol(color) {
  return COLOR_TO_GL_SYMBOL[color] ?? null
}