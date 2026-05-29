/**
 * param-handler.js
 *
 * Calcule automatiquement tous les params de glaures depuis RealForest.
 * Adapté à la structure réelle : realForest.allTrees(), tree.up/down/left/right (tableaux)
 */

// ─── Constantes ───────────────────────────────────────────────────────────────
import cards from './glaure/cards.js'

const SHRUB_CARDS = ['elderberry', 'commonHazel', 'blackthorn']

const BAT_CARDS = [
  'barbastelleBat', 'bechsteinsBat', 'brownLongEaredBat',
  'greaterHorseshoeBat', 'savisPipistrelle', 'duererBat', 'commonPipistrelle'
]

// Couleur de fond de chaque arbre → clé du compteur glaures
const TREE_TO_GL_COUNT = {
  'linden':        'linden',
  'oak':           'oak',
  'silverFir':     'silverFir',
  'birch':         'birch',
  'beech':         'beech',
  'sycamore':      'sycamore',
  'douglasFir':    'douglasFir',
  'horseChestnut': 'horseChestnut',
  'europeanLarch': 'europeanLarch',
  'stonePine':     'stonePine',
}

const FR_SYMBOL_TO_GL_SYMBOL = {
  'bleu':   'silverFir',
  'marron': 'oak',
  'gris':   'douglasFir',
  'jaune':  'linden',
  'orange': 'horseChestnut',
  'rouge':  'sycamore',
  'vert-clair' : 'birch',
  'vert-foncé' : 'beech',
  'violet': 'europeanLarch',
  'rose':   'stonePine',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { allCards } from "./realForest.js";

// Toutes les cartes dans les 4 slots d'un arbre (tableaux aplatis)
function slotsOf(tree) {
  return [...tree.up, ...tree.down, ...tree.left, ...tree.right]
}

// Arbres dont le BASE est d'un type donné
function treesOfType(realForest, treeName) {
  const names = Array.isArray(treeName) ? treeName : [treeName]
  return realForest.forest.filter(t => names.includes(t.tree))
}

// Compte les cartes d'un type dans les slots d'arbres d'un type donné
function countCardOnBase(realForest, cardName, baseCardName) {
  return treesOfType(realForest, baseCardName)
    .flatMap(slotsOf)
    .filter(c => c.cardName === cardName)
    .length
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

function handleFullyOccupiedTrees(realForest) {
  return realForest.forest.filter(tree =>
    tree.up.length > 0 && tree.down.length > 0 &&
    tree.left.length > 0 && tree.right.length > 0
  ).length
}

function handleCardsAttachedToSilverFirs(realForest) {
  return treesOfType(realForest, 'silverFir')
    .reduce((sum, tree) => sum + slotsOf(tree).length, 0)
}

function handleCardsAttachedToOChristmasTree(realForest) {
  return treesOfType(realForest, 'oChristmasTree')
    .reduce((sum, tree) => sum + slotsOf(tree).length, 0)
}

function handleSharingACardSlot(realForest) {
  // Crapaud : 2+ dans le même slot down du même arbre
  return realForest.forest.filter(tree =>
    tree.down.filter(c => c.cardName === 'commonToad').length > 1
  ).length
}

function handleEuropeanPolecatAloneOnTreeOrShrub(realForest) {
  return realForest.forest.filter(tree => {
    const all = slotsOf(tree)
    return all.length === 1 && all[0].cardName === 'europeanPolecat'
  }).length
}

function handleBatOnTheOtherSide(realForest) {
  let count = 0
  for (const tree of realForest.forest) {
    const all = slotsOf(tree)
    const hasDormouse = all.some(c => c.cardName === 'europeanFatDormouse')
    const hasBat      = all.some(c => BAT_CARDS.includes(c.cardName))
    const isTree      = cards.find((card) => card.name == tree.tree)?.symbols?.includes('tree');
    if (hasDormouse && hasBat && isTree) count++
  }
  return count
}

// ─── Dictionnaire de handlers ─────────────────────────────────────────────────

const PARAM_HANDLERS = {
  // Cross-joueurs → gérés par hasMostOfName() de glaures
  'hasMostLindens': () => 0,
  'hasMostTrees':   () => 0,

  'fullyOccupiedTrees':                handleFullyOccupiedTrees,
  'cardsAttachedToSilverFirs':         handleCardsAttachedToSilverFirs,
  'cardsAttachedToOChristmasTree':     handleCardsAttachedToOChristmasTree,
  'sharingACardSlot':                  handleSharingACardSlot,
  'europeanPolecatAloneOnTreeOrShrub': handleEuropeanPolecatAloneOnTreeOrShrub,
  'batOnTheOtherSide':                 handleBatOnTheOtherSide,

  'chaffinchesAtopABeech': (rf) => countCardOnBase(rf, 'chaffinch',    'beech'),
  'nightingalesAtopAShrub':(rf) => countCardOnBase(rf, 'nightingale',  SHRUB_CARDS),
  'redSquirrelsAtopAnOak': (rf) => countCardOnBase(rf, 'redSquirrel',  'oak'),
  'onABeech':              (rf) => countCardOnBase(rf, 'violetCarpenterBee', 'beech'),
  'onAHorseChestnut':      (rf) => countCardOnBase(rf, 'violetCarpenterBee', 'horseChestnut'),
  'onALinden':             (rf) => countCardOnBase(rf, 'violetCarpenterBee', 'linden'),

  // Compteurs de couleur → gérés par addCardColors()
  'beechCount':         () => 0,
  'oakCount':           () => 0,
  'birchCount':         () => 0,
  'horseChestnutCount': () => 0,
  'lindenCount':        () => 0,
  'silverFirCount':     () => 0,
  'sycamoreCount':      () => 0,
  'douglasFirCount':    () => 0,
  'europeanLarchCount': () => 0,
  'stonePineCount':     () => 0,
  'saplingCount':       () => 0,
}

export function computeParam(paramName, realForest) {
  const handler = PARAM_HANDLERS[paramName]
  if (!handler) {
    console.warn(`[ParamHandler] Pas de handler pour "${paramName}" — valeur 0`)
    return 0
  }
  return handler(realForest)
}

/**
 * Incrémente forest.beechCount, forest.oakCount... depuis les arbres BASE.
 */
export function addCardColors(realForest, glauresForest) {
  for (const tree of realForest.forest) {
    const symbol = FR_SYMBOL_TO_GL_SYMBOL[tree.symbol]
    if (symbol) glauresForest[symbol + 'Count']++
  }

  for (const card of allCards(realForest)) {
    const symbol = FR_SYMBOL_TO_GL_SYMBOL[card.color]
    if (symbol) glauresForest[symbol + 'Count']++
  }
}