<script>
  // ForestView.svelte
  // Affiche la forêt d'un seul joueur
  import  {FR_CARDS } from "$lib/i18n/fr-cards";
  import cards from "../../model/glaure/cards.js";
  import { useGlauresForestState } from "$lib/states/glauresForestState.svelte.js";
  import { calculateButterflyPoints } from "../../model/glaure/card-butterflies.js";
  let { forest } = $props();

  import { useCaveState } from "$lib/states/caveState.svelte.js";
  import { usePlayerState } from "$lib/states/playerState.svelte.js";
  import { useTreeModifState } from "$lib/states/treeModifState.svelte.js";
  import { useForestScanState } from "$lib/states/forestScanState.svelte.js";

  import AddACardView from "./AddACardView.svelte";
  import Modal from "./Modal.svelte";

  const caveState = useCaveState();
  const playerState = usePlayerState();

  const forestScanState = useForestScanState();


  import { lighten, resolveColor, cardStyle } from "../utils/foretStyle.js";

  let glauresForestState = useGlauresForestState();
  //let debugForest = $derived(glauresForestState.debugForest);
  let debugCards = $derived(glauresForestState.debugForest?.cards ?? []); // besoin que debugCards soit réactif pour getCardUnitPoints ; il est en getter dans le glaureState

  function getCardUnitPoints(cardName) {
    // console.log("debugCards", debugCards); // vide ou pas ?
    // console.log("cherche", cardName);
    const card = debugCards.find((c) => c.name === cardName);
    if (!card || !card.count || card.count === 0) return 0;
    //console.log("trouvé", card);
    return card.points / card.count;
  }

  function getButterflySharedPoints() {
    const rawForest = glauresForestState.glauresForest;
    if (!rawForest?.cards) return 0;  // guard

    const total = calculateButterflyPoints(rawForest);
    const totalUnits = debugCards
      .filter(c => {
        const cardDef = cards.find(def => def.name === c.name);
        return cardDef?.symbols?.includes('butterfly') && c.count > 0;
      })
      .reduce((sum, c) => sum + c.count, 0);
    return totalUnits > 0 ? Math.round(total / totalUnits) : 0;
  }
  function getBeardedVulturePoints() { //Pour les points du gypahète barbu
    return caveState.caves[playerState.player]["count"] 

  }

  const treeToModifState = useTreeModifState();

  // Seul le Lièvre d'Europe peut s'empiler à plusieurs sur un même côté
  // (règle du jeu : canOnlyAddLievre interdit d'ajouter autre chose une fois
  // qu'il y en a un). Dans ce cas précis, on affiche une seule carte + une
  // pastille "+N" plutôt que N cartes séparées — une colonne ne contient
  // donc jamais plus d'une carte visuelle, ce qui évite tout le casse-tête
  // de largeur variable/centrage/débordement pour ce cas.
  function isStacked(side) {
    return side.length > 1 && side.every(c => c.cardName === side[0].cardName);
  }

  function isBareTree(tree) {
    return tree.up.length === 0 && tree.down.length === 0 && tree.left.length === 0 && tree.right.length === 0;
  }

  // Regroupe les arbres du même type quand ils n'ont aucune carte autour
  // (rien à distinguer visuellement entre eux) : un seul cluster affiché,
  // avec une pastille "+N" sur la carte arbre — même logique que les piles
  // de lièvres. Un arbre qui a au moins une carte, ou qui est seul de son
  // type parmi les arbres nus, reste affiché normalement.
  let displayGroups = $derived.by(() => {
    const groups = [];
    const used = new Set();
    for (const tree of forest) {
      if (used.has(tree.id)) continue;
      if (isBareTree(tree)) {
        const sameType = forest.filter(t => !used.has(t.id) && t.tree === tree.tree && isBareTree(t));
        sameType.forEach(t => used.add(t.id));
        groups.push({ representative: sameType[0], count: sameType.length });
      } else {
        used.add(tree.id);
        groups.push({ representative: tree, count: 1 });
      }
    }
    return groups;
  });

</script>


<div class="forest-root">
  <div class="trees-row">
    {#each displayGroups as group}

    {@const treeData = group.representative}
    {@const treeCard = cards.find(c => c.name === treeData.tree)}
    {@const isTree = treeCard?.symbols?.includes('tree')}

      <div class="tree-cluster">

        <!-- UP row -->
        <div class="card-row row-up">
          {#each treeData.up as card}
            <div class="card" style={cardStyle(card.color)}>
              {#if card.color === 'none'}
                <span class="ribbon ribbon-none">
                  <span class="ribbon-icon">!</span>
                </span>
              {:else}
                <span class="ribbon" style={`background:${resolveColor(card.color)}`}></span>
              {/if}
              <span class="card-name">{FR_CARDS[card.cardName]}</span>

              {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->

                {#if cards.find(c => c.name === card.cardName)?.symbols?.includes('butterfly')}
                  <span class="card-points">{getButterflySharedPoints()}</span>

                {:else if card.cardName === "beardedVulture"}
                  <span class="card-points">{getBeardedVulturePoints()}</span>

                {:else}
                  <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
                {/if}

              {/if}
            </div>
          {/each}
        </div>

        
          <!-- LEFT CARD -->

          <div class="card-col col-left">
            {#if isStacked(treeData.left)}
              {@const card = treeData.left[0]}
              <div class="card" style={cardStyle(card.color)}>
                <span class="stack-badge">+{treeData.left.length - 1}</span>
                <span class="card-name">{FR_CARDS[card.cardName]}</span>

                {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->
                  <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
                {/if}

              </div>
            {:else}
              {#each treeData.left as card}
                <div class="card" style={cardStyle(card.color)}>
                  {#if card.color === 'none'}
                    <span class="ribbon ribbon-none">
                      <span class="ribbon-icon">!</span>
                    </span>
                  {:else}
                    <span class="ribbon" style={`background:${resolveColor(card.color)}`}></span>
                  {/if}
                  <span class="card-name">{FR_CARDS[card.cardName]}</span>

                  {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->
                    <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
                  {/if}

                </div>
              {/each}
            {/if}
          </div>

          <!-- TREE CARD -->
        
          
            <button class="tree-card" style={`--tree-color: ${resolveColor(treeData.symbol)}; --tree-soft: ${lighten(resolveColor(treeData.symbol), 72)};`}
            onclick={() => {treeToModifState.idTreeToModif = treeData.id; treeToModifState.treeToModif = JSON.parse(JSON.stringify(treeData)) ;treeToModifState.openModalModifTree = true; }}
            >
              {#if group.count > 1}
                <span class="stack-badge">+{group.count - 1}</span>
              {:else if treeData.symbol === 'none'}
                <span class="tree-ribbon tree-ribbon-none">
                  <span class="tree-ribbon-icon">!</span>
                </span>
              {:else}
                <span class="tree-ribbon" style={`background:${resolveColor(treeData.symbol)}`}></span>
              {/if}
              <span class="tree-icon">{isTree ? '🌳' : '🌿'}</span>
              <span class="tree-name">{FR_CARDS[treeData.tree]}</span>

              {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->
                <span class="card-points">{getCardUnitPoints(treeData.tree)}</span>
              {/if}

            </button>
          

          <!-- RIGHT CARD -->
          <div class="card-col col-right">
            {#if isStacked(treeData.right)}
              {@const card = treeData.right[0]}
              <div class="card" style={cardStyle(card.color)}>
                <span class="stack-badge">+{treeData.right.length - 1}</span>
                <span class="card-name">{FR_CARDS[card.cardName]}</span>

                {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->
                  <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
                {/if}

              </div>
            {:else}
            {#each treeData.right as card}
              <div class="card" style={cardStyle(card.color)}>
                {#if card.color === 'none'}
                  <span class="ribbon ribbon-none">
                    <span class="ribbon-icon">!</span>
                  </span>
                {:else}
                  <span class="ribbon" style={`background:${resolveColor(card.color)}`}></span>
                {/if}
                <span class="card-name">{FR_CARDS[card.cardName]}</span>

                {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->
                  <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
                {/if}

              </div>
            {/each}
            {/if}
          </div>


        <!-- DOWN row -->
        <div class="card-row row-down">
          {#each treeData.down as card}
            <div class="card" style={cardStyle(card.color)}>
              {#if card.color === 'none'}
                <span class="ribbon ribbon-none">
                  <span class="ribbon-icon">!</span>
                </span>
              {:else}
                <span class="ribbon" style={`background:${resolveColor(card.color)}`}></span>
              {/if}
              <span class="card-name">{FR_CARDS[card.cardName]}</span>

              {#if !forestScanState.openModalScan} <!-- On affiche pas les points si c'est le modal de scan-->
                <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
              {/if}
            </div>
          {/each}
        </div>

      </div>
    {/each}

      
  </div>

</div>


<Modal open={treeToModifState.openModalModifTree} onclose={() => {treeToModifState.openModalModifTree = false; treeToModifState.idTreeToModif = null;}}>
  {#if treeToModifState.openModalModifTree}
  <AddACardView idTree={treeToModifState.idTreeToModif} on:close={() => {treeToModifState.openModalModifTree = false; treeToModifState.idTreeToModif = null;}} />
  {/if}
</Modal>

<style>
  /* Polices chargées globalement via $lib/styles/tokens.css */

  .forest-root {
    font-family: 'DM Mono', monospace;
    background: linear-gradient(180deg, #ffffff 0%, #f5f7f2 100%);
    /* min-height: 100vh; */
    padding: 1.25rem 1rem;
    color: #374151;

    /* Si un arbre a beaucoup de cartes d'un côté, tout l'affichage de la forêt
       défile horizontalement sur lui-même plutôt que de déborder sur le reste
       de la page — l'agencement des arbres/cartes ne change pas. */
    overflow-x: auto;
    /* "contain" : une fois arrivé au bord de ce scroll, le geste ne se
       propage pas à la modale/page englobante (sinon, en scrollant la forêt
       jusqu'au bout, on continue à "pousser" la modale entière — ce qui
       donnait l'impression que les boutons bougeaient). */
    overscroll-behavior-x: contain;

    --tree-w: 68px;
    --tree-h: calc(var(--tree-w) * 7 / 5);
  }


  .tree-cluster {
    display: grid;
    grid-template-areas:
        ".      top    ."
        "left   tree   right"
        ".      bottom .";
    /* Gauche/droite ne contiennent jamais plus d'une carte visuelle (les
       piles de Lièvre d'Europe sont affichées comme 1 carte + pastille "+N",
       cf. isStacked()) : une largeur fixe à la taille d'une carte suffit,
       plus besoin de la calculer dynamiquement. */
    grid-template-columns: calc(var(--tree-w) / 2) var(--tree-w) calc(var(--tree-w) / 2);
    grid-template-rows: auto var(--tree-h) auto;
    align-items: center;
    justify-items: center;
    gap: 1px;
  }

  .trees-row {
    display: flex;
    flex-wrap: wrap;
    /* "safe" : centre normalement, mais si le contenu déborde de .forest-root
       (overflow-x: auto plus haut), retombe sur un alignement au début plutôt
       que de centrer — sinon la partie qui dépasserait "avant" le centre
       devient inaccessible au scroll (impossible de scroller en négatif). */
    justify-content: safe center;
    gap: 0.5rem;
    align-items: flex-end;
  }


  .card-points {
  font-family: 'DM Sans', sans-serif; /* ou Inter, system-ui… */
  font-size: calc(var(--tree-w) * 0.12);
  line-height: 1;
  }

  /* Pastille "+N" sur une carte qui représente en fait une pile de cartes
     identiques (Lièvre d'Europe, seule carte qui peut s'empiler à plusieurs
     sur un même côté). */
  .stack-badge {
    /* Prend la place de la banderole (coin haut-droit) plutôt que de
       s'ajouter en plus — une seule couleur ne représenterait de toute façon
       pas fidèlement une pile qui peut mélanger plusieurs couleurs.
       Entièrement contenue dans la carte (décalage positif, pas de
       débordement) — fond neutre pour rester lisible quelle que soit la
       couleur de la carte en dessous. */
    position: absolute;
    /* Décalage, padding ET taille de police proportionnels à --tree-w : les
       deux fichiers ont une taille de carte différente (ForestView.svelte
       vs AddACardView.svelte), donc une valeur fixe rendait le badge
       disproportionné dans l'un des deux. */
    top: calc(var(--tree-w) * 0.06);
    right: calc(var(--tree-w) * 0.06);
    background: rgba(20, 24, 18, 0.72);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    /* Taille plancher (max avec une valeur fixe) : proportionnel à
       --tree-w devenait illisible sur les petites cartes. */
    font-size: max(10px, calc(var(--tree-w) * 0.16));
    line-height: 1;
    padding: calc(var(--tree-w) * 0.045) calc(var(--tree-w) * 0.075);
    border-radius: 999px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .card-row {
    display: flex;
    flex-direction: column; /*row*/
    gap: 6px;
    justify-content: center;
    /* Hauteur fixe même si vide */
    min-height: calc(var(--tree-h) / 2);
  }

  .card-col {
    display: flex;
    flex-direction: row; /*column*/
    gap: 6px;
    /* Largeur fixe même si vide */
    min-width: calc(var(--tree-w) / 2);
  }

  /* ── carte haut/bas : pleine largeur, moitié hauteur ── */
  .card-row .card {
    position: relative;
    width: var(--tree-w);
    height: calc(var(--tree-h) / 2);
    background: #eef1f2;
    border: 1.5px solid #d5dbe0;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    justify-content: center;
    padding: 3px 4px;
    box-sizing: border-box;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.15s;
    cursor: default;
  }

  /* ── carte gauche/droite : moitié largeur, pleine hauteur ── */
  .card-col .card {
    position: relative;
    width: calc(var(--tree-w) / 2);
    flex-shrink: 0; /* garde sa largeur plutôt que de se compresser quand la colonne défile */
    height: var(--tree-h);
    background: #eef1f2;
    border: 1.5px solid #d5dbe0;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    justify-content: center;
    padding: 4px 3px;
    box-sizing: border-box;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.15s;
    cursor: default;
  }
  /*
  .card:hover {
    border-color: var(--card-color);
    transform: scale(1.04);
    z-index: 2;
  }
  */

  .card-name {
    /* Proportionnel à --tree-w plutôt qu'une taille fixe, pour rester lisible
       mais compact quel que soit la taille de carte choisie. */
    font-size: calc(var(--tree-w) * 0.070);
    line-height: 1.15;
    text-align: center;
    color: #3f4a51;
    word-break: break-word;
    hyphens: auto;
  }

  .ribbon {
    position: absolute;
    top: 0;
    right: 0;
    width: 18px;
    height: 18px;
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    border-radius: 0 5px 0 0;
    opacity: 0.92;
  }

  .ribbon-none {
  background: #c7c7c7;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.ribbon-icon {
  font-size: 0.5rem;
  font-weight: 700;
  color: #e53e3e;
  background: white;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  margin-right: 2px;
  line-height: 1;
  box-shadow: 0 0 0 1px #e53e3e;
}

  /* ── carte arbre : W × H ── */
  .tree-card {
    position: relative;
    width: var(--tree-w);
    height: var(--tree-h);
    background: linear-gradient(180deg, var(--tree-soft), #eef7ea);
    border: 2px solid var(--tree-color);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 12px 12px 12px;
    box-sizing: border-box;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(76, 126, 74, 0.08), 0 10px 26px rgba(64, 82, 59, 0.10);
    grid-area: tree; 
  }

  .tree-card:hover {
    border-color: var(--card-color);
    transform: scale(1.04);
    z-index: 2;
  }

  .tree-ribbon {
    position: absolute;
    top: 0;
    right: 0;
    width: 34px;
    height: 34px;
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    border-radius: 0 8px 0 0;
    opacity: 0.92;
  }

.tree-ribbon-none {
  background: #c7c7c7;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.tree-ribbon-icon {
  font-size: 0.6rem;
  font-weight: 700;
  color: #e53e3e;
  background: white;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3px;
  margin-right: 3px;
  line-height: 1;
  box-shadow: 0 0 0 1px #e53e3e;
}

  .tree-icon {
    /* Proportionnel à la taille de l'arbre plutôt qu'une taille fixe, pour
       rester bien proportionné si --tree-w change. */
    font-size: calc(var(--tree-w) * 0.3);
    line-height: 1;
  }

  .tree-name {
    font-family: 'Playfair Display', serif;
    font-size: calc(var(--tree-w) * 0.12);
    font-weight: 600;
    color: #38513a;
    text-align: center;
    letter-spacing: 0.02em;
  }



.card-row.row-up    { 
  grid-area: top;    
  display: flex; 
  flex-direction: 
  column; gap: 6px; 
}

.card-row.row-down  { 
  grid-area: bottom; 
  display: flex; 
  flex-direction: 
  column; gap: 6px; 
}
.card-col.col-left  {
  grid-area: left;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
}

.card-col.col-right {
  grid-area: right;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
}

</style>