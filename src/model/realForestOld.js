/**
 * real-forest.js
 *
 * Modèle physique de la forêt — reflète exactement la disposition des cartes sur la table.
 *
 * Structure :
 *   allForests = [{ player: "alice", forest: [tree] }]
 *
 *   tree = {
 *     tree:   cardName,   // ex: "beech", "oak"
 *     symbol: symbolType, // couleur de l'arbre (= sa couleur de fond)
 *     up:     card[],
 *     down:   card[],
 *     left:   card[],
 *     right:  card[],
 *   }
 *
 *   card = {
 *     cardName: string,   // ex: "chaffinch", "europeanHare"
 *     color:   string,   // couleur de fond 
 *   }
 */

// ─── Couleurs / symboles ──────────────────────────────────────────────────────

export const color = {
  VERTCLAIR:  'vert-clair',   // bouleau (birch)
  VERTFONCE:  'vert-foncé',   // hêtre   (beech)
  BLEU:       'bleu',         // sapin   (silverFir)
  MARRON:     'marron',       // chêne   (oak)
  GRIS:       'gris',         // douglas (douglasFir)
  JAUNE:      'jaune',        // tilleul (linden)
  ORANGE:     'orange',       // marronnier (horseChestnut)
  ROUGE:      'rouge',        // érable  (sycamore)
  VIOLET:     'violet',       // mélèze  (europeanLarch)
  ROSE:       'rose',         // pin sembro     (stonePine)
  NONE:       'none',         // arbuste / pousse (pas de couleur d'arbre) ou autres couleurs inutiles pour le scoring
}



// ─── Constructeurs ────────────────────────────────────────────────────────────

/**
 * Crée une carte.
 * @param {string} cardName  — nom glaures ex: "chaffinch"
 * @param {string} symbol    — couleur de fond ex: symbols.VERTFONCE
 * @returns {{ cardName: string, symbol: string }}
 */
export function makeCard(cardName, symbol = color.NONE) {
  return { cardName, color: symbol }
}

/**
 * Crée un arbre vide.
 * @param {string} treeName  — nom glaures ex: "beech"
 * @param {string} symbol    — couleur de l'arbre ex: symbols.VERTFONCE
 * @returns {tree}
 */
export function makeTree(treeName, symbol = color.NONE) {
  return {
    tree:   treeName,
    symbol: symbol,
    up:     [],
    down:   [],
    left:   [],
    right:  [],
  }
}

// ─── Classe principale ────────────────────────────────────────────────────────

export class RealForest {

  /**
   * @param {string} playerName
   */
  constructor(playerName) {
    this.playerName = playerName
    this.forest = []  // tree[]
    // this.cave = { caveType: 'cave', count: 0 }  // type de cave + nombre de cartes dedans
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  renamePlayerInTheForest(newName) {
    this.playerName = newName;
  }



  /**
   * Ajoute un arbre à la forêt.
   * @param {string} treeName   — ex: "beech"
   * @param {string} symbol     — ex: symbols.VERTFONCE
   * @returns {tree} l'arbre créé (pour y ajouter des cartes ensuite)
   */
  addTree(treeName, symbol) {
    const tree = makeTree(treeName, symbol)
    this.forest.push(tree)
    return tree
  }

  /**
   * Place une carte dans un slot d'un arbre.
   * Plusieurs cartes peuvent parfois cohabiter dans le même slot (lièvres, crapauds...).
   * @param {tree}   tree
   * @param {'up'|'down'|'left'|'right'} slot
   * @param {string} cardName
   * @param {string} symbol    — couleur de fond de la carte
   */
  placeCard(tree, slot, cardName, symbol = color.NONE) {
    tree[slot].push(makeCard(cardName, symbol))
  }

  /**
   * Retire une carte d'un slot (par cardName).
   * Si plusieurs exemplaires, n'en retire qu'un.
   * @param {tree}   tree
   * @param {'up'|'down'|'left'|'right'} slot
   * @param {string} cardName
   */
  removeCard(tree, slot, cardName) {
    const idx = tree[slot].findIndex(c => c.cardName === cardName)
    if (idx !== -1) tree[slot].splice(idx, 1)
  }

  // ─── Lecture ────────────────────────────────────────────────────────────────

  /**
   * Toutes les cartes de la forêt à plat (sans les arbres BASE).
   * @returns {{ cardName: string, symbol: string, tree: tree, slot: string }[]}
   */
  allCards() {
    return this.forest.flatMap(tree =>
      ['up', 'down', 'left', 'right'].flatMap(slot =>
        tree[slot].map(card => ({ ...card, tree, slot }))
      )
    )
  }

  /**
   * Tous les arbres réels de la forêt.
   * @returns {tree[]}
   */
  allTrees() {
    return this.forest
  }

  /**
   * Représentation aplatie des arbres BASE, utile pour l'affichage ou l'export.
   * @returns {{ cardName: string, symbol: string }[]}
   */
  allTreeCards() {
    return this.forest.map(tree => ({ cardName: tree.tree, symbol: tree.symbol }))
  }

  /**
   * Compte les cartes d'un type donné (arbres inclus ou non).
   * @param {string}  cardName
   * @param {boolean} includeTrees
   * @returns {number}
   */
  countByName(cardName, includeTrees = false) {
    const inSlots = this.allCards().filter(c => c.cardName === cardName).length
    const inBases = includeTrees
      ? this.allTrees().filter(t => t.tree === cardName).length
      : 0
    return inSlots + inBases
  }

  /**
   * Retourne les arbres d'un type donné.
   * @param {string|string[]} treeName
   * @returns {tree[]}
   */
  treesOfType(treeName) {
    const names = Array.isArray(treeName) ? treeName : [treeName]
    return this.allTrees().filter(t => names.includes(t.tree))
  }
}