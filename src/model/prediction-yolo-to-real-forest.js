/**
 * prediction-yolo-to-real-forest.js
 *
 * Convertit un tableau de Prediction YOLO en RealForest.
 *
 * Pipeline :
 *   Prediction[] (classId, cx, cy, w, h, confidence)
 *     → enrichissement via CARD_CLASSES (yoloName, glCardName)
 *     → reconstruction spatiale via ForestAssembler (quel animal sur quel arbre)
 *     → RealForest peuplée (tree.up/down/left/right)
 *
 * Usage :
 *   const forest = predictionsToRealForest('Alice', predictions)
 */



// ─── Mapping yoloName → slot RealForest ──────────────────────────────────────
// Extrait depuis ForestDetector/src/model/cards.ts + card-position.ts

const YOLO_POSITION = {
  'Ahorn': 'base',
  'Alpen-Apollofalter_Blue': 'up',
  'Alpen-Apollofalter_Grey': 'up',
  'Alpen-Apollofalter_Lila': 'up',
  'Alpen-Apollofalter_Pink': 'up',
  'Alpenfledermaus_Left_Blue': 'left',
  'Alpenfledermaus_Left_Lila': 'left',
  'Alpenfledermaus_Right_Pink': 'right',
  'Alpenmurmeltier_Left_Green': 'left',
  'Alpenmurmeltier_Left_Lila': 'left',
  'Alpenmurmeltier_Right_LightGreen': 'right',
  'Alpenmurmeltier_Right_Pink': 'right',
  'Auerhuhn_Left_Lila': 'left',
  'Auerhuhn_Left_Pink': 'left',
  'Auerhuhn_Right_Green': 'right',
  'Auerhuhn_Right_Grey': 'right',
  'Bache_Left_Blue': 'left',
  'Bache_Left_LightGreen': 'left',
  'Bache_Right_Red': 'right',
  'Bartgeier_Blue': 'up',
  'Bartgeier_Lila': 'up',
  'Bartgeier_Pink': 'up',
  'Baumfarn_Blue': 'down',
  'Baumfarn_Orange': 'down',
  'Baumfarn_Yellow': 'down',
  'Baumsproessling': 'base',
  'Bechsteinfledermaus_Left_Brown': 'left',
  'Bechsteinfledermaus_Left_Green': 'left',
  'Bechsteinfledermaus_Right_LightGreen': 'right',
  'Bergmolch_Blue': 'down',
  'Bergmolch_Grey': 'down',
  'Bergmolch_Pink': 'down',
  'Bienenschwarm_Left_Green': 'left',
  'Bienenschwarm_Right_LightGreen': 'right',
  'Bienenschwarm_Right_Red': 'right',
  'Birke': 'base',
  'Braunbaer_Left_Yellow': 'left',
  'Braunbaer_Right_Green': 'right',
  'Braunbaer_Right_Orange': 'right',
  'Braunes-Langohr_Left_Red': 'left',
  'Braunes-Langohr_Right_Green': 'right',
  'Brennnessel_LightGreen': 'down',
  'Brennnessel_Orange': 'down',
  'Brennnessel_Red': 'down',
  'Brombeeren_Blue': 'down',
  'Brombeeren_Green': 'down',
  'Brombeeren_LightGreen': 'down',
  'Buche': 'base',
  'Buchfink_Green': 'up',
  'Buchfink_LightGreen': 'up',
  'Buchfink_Red': 'up',
  'Buntspecht_Grey': 'up',
  'Buntspecht_Yellow': 'up',
  'Dachs_Left_Orange': 'left',
  'Dachs_Right_Grey': 'right',
  'Damhirsch_Left_Yellow': 'left',
  'Damhirsch_Right_LightGreen': 'right',
  'Damhirsch_Right_Red': 'right',
  'Douglasie': 'base',
  'Edelweis_Lila': 'down',
  'Edelweis_Pink': 'down',
  'Eiche': 'base',
  'Eichelhaeher_LightGreen': 'up',
  'Eichelhaeher_Orange': 'up',
  'Eichelhaeher_Red': 'up',
  'Eichhoernchen_Brown': 'up',
  'Eichhoernchen_Green': 'up',
  'Eichhoernchen_Grey': 'up',
  'Eichhoernchen_Orange': 'up',
  'Elster_Blue': 'up',
  'Elster_Green': 'up',
  'Elster_LightGreen': 'up',
  'Enzian_Green': 'down',
  'Enzian_Lila': 'down',
  'Enzian_Pink': 'down',
  'Erdkroete_Blue': 'down',
  'Erdkroete_Brown': 'down',
  'Erdkroete_Green': 'down',
  'Erdkroete_Grey': 'down',
  'Erdkroete_Orange': 'down',
  'Erdkroete_Red': 'down',
  'Europaeische-Laerche': 'base',
  'Feldhase_Left_Blue': 'left',
  'Feldhase_Left_Brown': 'left',
  'Feldhase_Left_Green': 'left',
  'Feldhase_Left_LightGreen': 'left',
  'Feldhase_Left_Yellow': 'left',
  'Feldhase_Right_Blue': 'right',
  'Feldhase_Right_LightGreen': 'right',
  'Feldhase_Right_Red': 'right',
  'Feldhase_Right_Yellow': 'right',
  'Feuersalamander_Grey': 'down',
  'Feuersalamander_Orange': 'down',
  'Feuersalamander_Yellow': 'down',
  'Fingerhut_Brown': 'down',
  'Fingerhut_Grey': 'down',
  'Fingerhut_LightGreen': 'down',
  'Fingerhut_Red': 'down',
  'Fliegenpilz_Blue': 'down',
  'Fliegenpilz_Brown': 'down',
  'Frischling-Waldrand_Left_Orange': 'left',
  'Frischling-Waldrand_Right_Blue': 'right',
  'Frischling-Waldrand_Right_Grey': 'right',
  'Frischling_Left_Brown': 'left',
  'Frischling_Left_Orange': 'left',
  'Frischling_Right_Brown': 'right',
  'Frischling_Right_Red': 'right',
  'Fuchs_Left_Green': 'left',
  'Fuchs_Left_Yellow': 'left',
  'Fuchs_Right_Brown': 'right',
  'Fuchs_Right_Grey': 'right',
  'Gaemse_Left_Lila': 'left',
  'Gaemse_Right_Grey': 'right',
  'Gaemse_Right_Pink': 'right',
  'Gimpel_Blue': 'up',
  'Gimpel_Grey': 'up',
  'Gluehwuermchen_Green': 'down',
  'Gluehwuermchen_Grey': 'down',
  'Gluehwuermchen_Red': 'down',
  'Gluehwuermchen_Yellow': 'down',
  'Groser-Fuchs_Blue': 'up',
  'Groser-Fuchs_Green': 'up',
  'Groser-Fuchs_Red': 'up',
  'Gruenes-Heupferd_Blue': 'down',
  'Gruenes-Heupferd_Brown': 'down',
  'Gruenes-Heupferd_Green': 'down',
  'Habicht_Blue': 'up',
  'Habicht_Brown': 'up',
  'Habicht_Grey': 'up',
  'Haselnuss_Brown': 'base',
  'Haselnuss_Green': 'base',
  'Haselnuss_LightGreen': 'base',
  'Haselnuss_Orange': 'base',
  'Heidelbeere_LightGreen': 'down',
  'Heidelbeere_Pink': 'down',
  'Herbsttrompete_Lila': 'down',
  'Herbsttrompete_Pink': 'down',
  'Hirschkaefer_LightGreen': 'down',
  'Hirschkaefer_Red': 'down',
  'Holunder_Brown': 'base',
  'Holunder_LightGreen': 'base',
  'Holunder_Red': 'base',
  'Holunder_Yellow': 'base',
  'Holzbiene_Left_Blue': 'left',
  'Holzbiene_Left_Grey': 'left',
  'Holzbiene_Right_Grey': 'right',
  'Hufeisennase_Left_Green': 'left',
  'Hufeisennase_Right_Yellow': 'right',
  'Igel_Brown': 'down',
  'Igel_Green': 'down',
  'Igel_Orange': 'down',
  'Kaisermantel_Brown': 'up',
  'Kaisermantel_Green': 'up',
  'Kastanie': 'base',
  'Kolkrabe_Grey': 'up',
  'Kolkrabe_Lila': 'up',
  'Landkaertchen_Blue': 'up',
  'Landkaertchen_Brown': 'up',
  'Landkaertchen_Red': 'up',
  'Landkaertchen_Yellow': 'up',
  'Laubfrosch_Brown': 'down',
  'Laubfrosch_Yellow': 'down',
  'Linde': 'base',
  'Luchs_Left_Grey': 'left',
  'Luchs_Left_Orange': 'left',
  'Luchs_Right_Blue': 'right',
  'Luchs_Right_Green': 'right',
  'Luchs_Right_Yellow': 'right',
  'Maulwurf_Brown': 'down',
  'Maulwurf_Red': 'down',
  'Moos_Grey': 'down',
  'Moos_Yellow': 'down',
  'Mopsfledermaus_Left_Blue': 'left',
  'Mopsfledermaus_Left_Orange': 'left',
  'Mopsfledermaus_Right_Brown': 'right',
  'Nachtigall_Brown': 'up',
  'Nachtigall_Green': 'up',
  'Nachtigall_Orange': 'up',
  'Parasol_Blue': 'down',
  'Parasol_Orange': 'down',
  'Pfifferling_Blue': 'down',
  'Pfifferling_LightGreen': 'down',
  'Reh_Left_Blue': 'left',
  'Reh_Left_Yellow': 'left',
  'Reh_Right_Green': 'right',
  'Reh_Right_LightGreen': 'right',
  'Reh_Right_Orange': 'right',
  'Rothirsch_Left_Blue': 'left',
  'Rothirsch_Left_Yellow': 'left',
  'Rothirsch_Right_Brown': 'right',
  'Rothirsch_Right_Orange': 'right',
  'Schermaus_Green': 'down',
  'Schermaus_Red': 'down',
  'Schillerfalter_LightGreen': 'up',
  'Schillerfalter_Orange': 'up',
  'Schillerfalter_Yellow': 'up',
  'Schlehdorn_Blue': 'base',
  'Schlehdorn_Grey': 'base',
  'Schlehdorn_LightGreen': 'base',
  'Schlehdorn_Red': 'base',
  'Schleiereule_LightGreen': 'up',
  'Schleiereule_Red': 'up',
  'Schnake_Left_LightGreen': 'left',
  'Schnake_Right_Brown': 'right',
  'Schnake_Right_Green': 'right',
  'Schneehase_Left_Blue': 'left',
  'Schneehase_Left_Lila': 'left',
  'Schneehase_Right_Pink': 'right',
  'Siebenschlaefer_Left_Blue': 'left',
  'Siebenschlaefer_Left_Green': 'left',
  'Siebenschlaefer_Right_Brown': 'right',
  'Siebenschlaefer_Right_Grey': 'right',
  'Stechmuecke_Left_LightGreen': 'left',
  'Stechmuecke_Right_Brown': 'right',
  'Stechmuecke_Right_Orange': 'right',
  'Steinadler_Blue': 'up',
  'Steinadler_Green': 'up',
  'Steinadler_Lila': 'up',
  'Steinbock_Left_Lila': 'left',
  'Steinbock_Right_Grey': 'right',
  'Steinbock_Right_Pink': 'right',
  'Steinmarder_Left_Green': 'left',
  'Steinmarder_Left_Red': 'left',
  'Steinmarder_Right_Brown': 'right',
  'Steinmarder_Right_Orange': 'right',
  'Steinpilz_Grey': 'down',
  'Sumpfschildkroete_LightGreen': 'down',
  'Sumpfschildkroete_Red': 'down',
  'Tagpfauenauge_Blue': 'up',
  'Tagpfauenauge_Brown': 'up',
  'Tagpfauenauge_Orange': 'up',
  'Tagpfauenauge_Yellow': 'up',
  'Tanne': 'base',
  'Trauermantel_LightGreen': 'up',
  'Trauermantel_Orange': 'up',
  'Trauermantel_Red': 'up',
  'Waldameise_Green': 'down',
  'Waldameise_LightGreen': 'down',
  'Walderdbeeren_LightGreen': 'down',
  'Walderdbeeren_Red': 'down',
  'Waldiltis_Left_Blue': 'left',
  'Waldiltis_Right_Brown': 'right',
  'Waldiltis_Right_Red': 'right',
  'Waldkauz_Green': 'up',
  'Waldkauz_LightGreen': 'up',
  'Waldkauz_Red': 'up',
  'Waschbaer_Left_Blue': 'left',
  'Waschbaer_Left_Grey': 'left',
  'Waschbaer_Right_Blue': 'right',
  'Waschbaer_Right_LightGreen': 'right',
  'Wildkatze_Left_Brown': 'left',
  'Wildkatze_Left_Red': 'left',
  'Wildkatze_Right_Orange': 'right',
  'Wildschwein_Left_LightGreen': 'left',
  'Wildschwein_Left_Red': 'left',
  'Wildschwein_Right_Brown': 'right',
  'Wildschwein_Right_Grey': 'right',
  'Wisent_Left_Brown': 'left',
  'Wisent_Left_Green': 'left',
  'Wisent_Right_Green': 'right',
  'Wolf_Left_Grey': 'left',
  'Wolf_Left_Red': 'left',
  'Wolf_Right_Blue': 'right',
  'Zirbelkiefer': 'base',
  'Zwergfledermaus_Left_LightGreen': 'left',
  'Zwergfledermaus_Left_Yellow': 'left',
  'Zwergfledermaus_Right_Red': 'right',
}

// ─── Mapping couleur YOLO → couleur RealForest ───────────────────────────────
const YOLO_COLOR = {
  Green:      color.VERTFONCE,
  LightGreen: color.VERTCLAIR,
  Blue:       color.BLEU,
  Brown:      color.MARRON,
  Grey:       color.GRIS,
  Yellow:     color.JAUNE,
  Orange:     color.ORANGE,
  Red:        color.ROUGE,
  Lila:       color.VIOLET,
  Pink:       color.ROSE,
}

// ─── Couleur des arbres BASE ──────────────────────────────────────────────────
const BASE_COLORS = {
  'Buche': color.VERTFONCE,  // beech
  'Birke': color.VERTCLAIR,  // birch
  'Tanne': color.BLEU,  // silverFir
  'Eiche': color.MARRON,  // oak
  'Douglasie': color.GRIS,  // douglasFir
  'Linde': color.JAUNE,  // linden
  'Kastanie': color.ORANGE,  // horseChestnut
  'Ahorn': color.ROUGE,  // sycamore
  'Europaeische-Laerche': color.VIOLET,  // europeanLarch
  'Zirbelkiefer': color.ROSE,  // stonePine
  'Baumsproessling': color.NONE,  // treeSaplings
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extrait la couleur RealForest depuis un yoloName.
 * Ex: "Feldhase_Left_Green" → color.VERTFONCE
 *     "Buche"               → color.VERTFONCE
 */
function colorFromYoloName(yoloName) {
  const parts = yoloName.split('_')
  const last = parts[parts.length - 1]
  return YOLO_COLOR[last] ?? color.NONE
}

/**
 * Trouve l'arbre BASE le plus proche dans la bonne direction spatiale.
 * Adapté de ForestDetector/src/model/forest-assembler.ts
 *
 * Une carte LEFT cherche un arbre à sa droite (son bord gauche est à droite de la carte).
 * Une carte RIGHT cherche un arbre à sa gauche.
 * Une carte TOP cherche un arbre en dessous.
 * Une carte BOTTOM cherche un arbre au dessus.
 */
function findNearestBase(card, bases) {
  const slot = YOLO_POSITION[card.yoloName]
  let best = null
  let bestDist = Infinity

  for (const base of bases) {
    let dist = Infinity
    if (slot === 'left') {
      // Carte à gauche → l'arbre est à sa droite
      if (base.cx > card.cx) dist = base.cx - card.cx
    } else if (slot === 'right') {
      // Carte à droite → l'arbre est à sa gauche
      if (base.cx < card.cx) dist = card.cx - base.cx
    } else if (slot === 'up') {
      // Carte en haut → l'arbre est en dessous
      if (base.cy > card.cy) dist = base.cy - card.cy
    } else if (slot === 'down') {
      // Carte en bas → l'arbre est au dessus
      if (base.cy < card.cy) dist = card.cy - base.cy
    }

    // Ajouter la distance verticale/horizontale perpendiculaire comme tie-breaker
    const perp = slot === 'left' || slot === 'right'
      ? Math.abs(base.cy - card.cy)
      : Math.abs(base.cx - card.cx)

    const total = dist + perp * 0.5
    if (total < bestDist) { bestDist = total; best = base }
  }

  return best
}

// ─── Fonction principale ──────────────────────────────────────────────────────

import { CARD_CLASSES } from './card-yolo-to-glaure.js'
import { RealForest, color, addTree } from './realForest.js'

/**
 * Convertit un tableau de prédictions YOLO en RealForest.
 *
 * @param {string} playerName
 * @param {Array<{classId, confidence, cx, cy, w, h}>} predictions
 * @param {number} [confidenceThreshold=0.5]
 * @returns {RealForest} // Plus vraiment, on a plus de type RealForest a proprement parlé
 */
export function predictionsToRealForest(playerName, predictions, confidenceThreshold = 0.5) {
  const forest = new RealForest(playerName)

  // 1. Enrichir chaque prédiction avec yoloName, glCardName, slot, cardColor
  const enriched = predictions
    .filter(p => p.confidence >= confidenceThreshold)
    .map(p => {
      const cardClass = CARD_CLASSES[p.classId]
      if (!cardClass) return null
      const yoloName = cardClass.yoloName
      const slot = YOLO_POSITION[yoloName] ?? 'up'
      const cardColor = slot === 'base'
        ? BASE_COLORS[yoloName] ?? colorFromYoloName(yoloName)
        : colorFromYoloName(yoloName)

      return {
        ...p,
        yoloName,
        glCardName: cardClass.glCardName,
        slot,
        cardColor,
      }
    })
    .filter(Boolean)

  // 2. Séparer les arbres BASE des cartes animales/plantes
  const bases   = enriched.filter(p => p.slot === 'base')
  const animals = enriched.filter(p => p.slot !== 'base')

  // 3. Trier les bases de gauche à droite (ordre naturel de la forêt)
  bases.sort((a, b) => a.cx - b.cx)

  // 4. Créer les arbres dans RealForest
  const treeMap = new Map()  // prediction → tree RealForest
  for (const base of bases) {
    const tree = addTree(forest, base.glCardName, base.cardColor)
    treeMap.set(base, tree)
  }

  // 5. Placer chaque animal sur l'arbre le plus proche dans la bonne direction
  for (const animal of animals) {
    const nearestBase = findNearestBase(animal, bases)
    if (!nearestBase) continue

    const tree = treeMap.get(nearestBase)
    tree[animal.slot].push({
      cardName: animal.glCardName,
      color:    animal.cardColor,
      id : crypto.randomUUID(),
    })
  }

  return forest
}
