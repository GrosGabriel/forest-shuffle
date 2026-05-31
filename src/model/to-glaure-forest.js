/**
 * to-glaures-forest.js  (v2 — remplace la version précédente)
 *
 * Transforme un tableau de RealForest en Forests glaures scorés,
 * sans aucune saisie manuelle.
 *
 * Pipeline :
 *   RealForest[]
 *     → addCard() pour chaque carte dans chaque slot
 *     → addCardColors() pour beechCount / oakCount...
 *     → computeParam() pour tous les autres params
 *     → updatePoints() après avoir rempli toutes les forêts
 */

import { Forest } from './glaure/Forest.js'

import { addCardColors, computeParam } from './param-handler.js'

import { allCards } from "./realForest.js";

/**
 * Transforme un tableau de RealForest en Forests glaures prêts pour le scoring.
 *
 * @param {import('./realForest.js').RealForest[]} realForests
 * @returns {import('@/model/Forest.js').Forest[]}
 *
 * @example
 * const scored = toGlauresForests([aliceForest, bobForest])
 * console.log(scored[0].points)  // score Alice
 * console.log(scored[1].points)  // score Bob
 */
export function toGlauresForests(realForests, caves = {}) {
  const allForests = []

  // 1. Créer toutes les instances Forest
  //    allForests doit être passé AVANT d'être rempli (référence partagée)
  //    En gros comme on passe une référence, c'est comme si c'était un objet référencé.
  const pairs = realForests.map(rf => {
    const gf = new Forest(rf.playerName, allForests)
    allForests.push(gf)
    //console.log(`[toGlauresForests] Forêt créée pour ${rf.playerName}`) 
    
    return { realForest: rf, glauresForest: gf }
  })

  // 2. Remplir chaque forêt
  for (const { realForest, glauresForest } of pairs) {
      // 2a. Ajouter d'abord les arbres BASE eux-mêmes.
      
      for (const { tree } of realForest.forest) {
        try {
          glauresForest.addCard(tree)
        } catch (e) {
          console.warn(`[toGlauresForests] Arbre inconnu ignoré : "${tree}"`)
        }
      }

    // 2a. Ajouter toutes les cartes (incrémente card.count dans glaures)
    for (const { cardName } of allCards(realForest)) {
      try {
        glauresForest.addCard(cardName)
      } catch (e) {
        console.warn(`[toGlauresForests] Carte inconnue ignorée : "${cardName}"`)
      }
    }

      // 2b. Incrémenter beechCount / oakCount... depuis les couleurs des arbres BASE
    addCardColors(realForest, glauresForest)

    // 2c. Calculer et injecter tous les params
    for (const card of glauresForest.cards) {
      if (!card.params) continue
      for (const param of card.params) {
        param.value = computeParam(param.name, realForest)
      }
    }

    // 2d. Cave par joueur
    const cave = caves[realForest.playerName] ?? {caveType : "cave" , count : 0} // Par défaut, cave classique
    glauresForest.setCaveType(cave.caveType)  // 'cave', 'batCave', etc.
    glauresForest.caveCount = cave.count
    
  }

  // 3. Calculer les scores — APRÈS avoir rempli toutes les forêts
  //    hasMostOfName() compare entre joueurs → tout doit être prêt
  allForests.forEach(gf => gf.updatePoints())

  return allForests
}