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
 *     id : idUnique,
 *     up:     card[],
 *     down:   card[],
 *     left:   card[],
 *     right:  card[],
 *   }
 *
 *   card = {
 *     cardName: string,   // ex: "chaffinch", "europeanHare"
 *     color:   string,   // couleur de fond ,
 *     id : idUnique,
 *   }
 */


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


export function makeCard(cardName, symbol = color.NONE) {
  return { cardName, color: symbol, id : crypto.randomUUID() }
}


export function makeTree(treeName, symbol = color.NONE) {
  return {
    tree:   treeName,
    symbol: symbol,
    id : crypto.randomUUID(),
    up:     [],
    down:   [],
    left:   [],
    right:  [],
  }
}



export function RealForest(playerName) {
    return {playerName : playerName, forest : []}
}

export function renamePlayerInTheForest(forest,newName) {
    forest[playerName] = newName;
}

export function addTree(realForest, treeName, symbol) {
    const tree = makeTree(treeName,symbol);
    realForest.forest.push(tree);
    return tree;
}


export function placeCard(tree, slot, cardName, symbol = color.NONE) {
    const card = makeCard(cardName, symbol);
    tree[slot].push(card)
}

export function removeCard(tree, slot, id) {
    tree[slot] = tree[slot].filter(c => c.id !== id);
}


export function allCards(realForest) { //Toutes les cartes, sans les bases
    return realForest.forest.flatMap(tree =>
      ['up', 'down', 'left', 'right'].flatMap(slot =>
        tree[slot].map(card => ({ ...card, tree, slot }))
      )
    )
}

export function allTreesCard(realForest) { //Tous les cartes arbres (aplaties)
    return realForest.forest.map(tree => ({ cardName: tree.tree, symbol: tree.symbol, id : tree.id }))
}


export function countByName(forest, cardName, includeTrees = false) {
    const inSlots = allCards(forest).filter(c => c.cardName === cardName).length
    const inBases = includeTrees
      ? allTrees(forest).filter(t => t.tree === cardName).length
      : 0
    return inSlots + inBases
}


export function treesOfType(forest, treeName) {
    const names = Array.isArray(treeName) ? treeName : [treeName]
    return allTrees(forest).filter(t => names.includes(t.tree))
}