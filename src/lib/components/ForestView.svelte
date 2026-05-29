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

  import AddACardView from "./AddACardView.svelte";


  const caveState = useCaveState();
  const playerState = usePlayerState();



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

</script>


<div class="forest-root">
  <div class="trees-row">
    {#each forest as treeData}

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

              {#if cards.find(c => c.name === card.cardName)?.symbols?.includes('butterfly')}
                <span class="card-points">{getButterflySharedPoints()}</span>

              {:else if card.cardName === "beardedVulture"}
                <span class="card-points">{getBeardedVulturePoints()}</span>

              {:else}
                <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
              {/if}
              
            </div>
          {/each}
        </div>

        
          <!-- LEFT CARD -->
        
          <div class="card-col col-left">
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
                <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
              </div>
            {/each}
          </div>
          
          <!-- TREE CARD -->
        
          
            <button class="tree-card" style={`--tree-color: ${resolveColor(treeData.symbol)}; --tree-soft: ${lighten(resolveColor(treeData.symbol), 72)};`}
            onclick={() => {treeToModifState.idTreeToModif = treeData.id; treeToModifState.treeToModif = JSON.parse(JSON.stringify(treeData)) ;treeToModifState.openModalModifTree = true; }}
            >
              {#if treeData.symbol === 'none'}
                <span class="tree-ribbon tree-ribbon-none">
                  <span class="tree-ribbon-icon">!</span>
                </span>
              {:else}
                <span class="tree-ribbon" style={`background:${resolveColor(treeData.symbol)}`}></span>
              {/if}
              <span class="tree-icon">{isTree ? '🌳' : '🌿'}</span>
              <span class="tree-name">{FR_CARDS[treeData.tree]}</span>
              <span class="card-points">{getCardUnitPoints(treeData.tree)}</span>
            </button>
          

          <!-- RIGHT CARD -->
          <div class="card-col col-right">
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
                <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
              </div>
            {/each}
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
              <span class="card-points">{getCardUnitPoints(card.cardName)}</span>
            </div>
          {/each}
        </div>

      </div>
    {/each}

      
  </div>
</div>

{#if treeToModifState.openModalModifTree}

  <AddACardView idTree={treeToModifState.idTreeToModif} on:close={() => {treeToModifState.openModalModifTree = false; treeToModifState.idTreeToModif = null;}} />

{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Mono:wght@400;500&display=swap');

  :global(body) {
    background: #ffffff;
    margin: 0;
  }

  .forest-root {
    font-family: 'DM Mono', monospace;
    background: linear-gradient(180deg, #ffffff 0%, #f5f7f2 100%);
    min-height: 100vh;
    padding: 2.5rem 2rem;
    color: #374151;

    --tree-w: 140px;
    --tree-h: calc(var(--tree-w) * 7 / 5);
  }


  .tree-cluster {
    display: grid;
    grid-template-areas:
        ".      top    ."
        "left   tree   right"
        ".      bottom .";
    grid-template-columns: max-content var(--tree-w) max-content;
    grid-template-rows: auto var(--tree-h) auto;
    align-items: center;
    justify-items: center;
    gap: 6px;
  }

  .trees-row {
    display: flex;
    flex-wrap: wrap;
    gap: 3.5rem;
    align-items: flex-end;
  }


  .card-points {
  font-family: 'DM Sans', sans-serif; /* ou Inter, system-ui… */
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
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    box-sizing: border-box;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.15s;
    cursor: default;
  }

  /* ── carte gauche/droite : moitié largeur, pleine hauteur ── */
  .card-col .card {
    position: relative;
    width: calc(var(--tree-w) / 2);
    height: var(--tree-h);
    background: #eef1f2;
    border: 1.5px solid #d5dbe0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 6px;
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
    font-size: 0.58rem;
    line-height: 1.3;
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
    font-size: 1.8rem;
    line-height: 1;
  }

  .tree-name {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem;
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