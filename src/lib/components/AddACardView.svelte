<script>
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useCardModifState } from "$lib/states/cardModifState.svelte.js";
    import { useTreeModifState } from "$lib/states/treeModifState.svelte.js";
    import { cardStyle, resolveColor, lighten } from "../utils/foretStyle.js";

    import { FR_CARDS } from "$lib/i18n/fr-cards";
    import cards from "../../model/glaure/cards.js";

    import CardToModifView from "./CardToModifView.svelte";

    import { createEventDispatcher } from "svelte";


    


    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }

    const realForestState = useRealForestState();
    const playerState = usePlayerState();

    const { idTree } = $props();
    

    const cardModifState = useCardModifState();
    
    const treeModifState = useTreeModifState();


    function validerModal() {
        // Mettre à jour la forêt réelle avec les modifications du nouvel arbre
        realForestState.updateTree(playerState.player, idTree, JSON.parse(JSON.stringify(treeModifState.treeToModif))); //TODO CETTE FONCTION
        closeModal();
    }

    function ortieOnTheTree(tree) {
        return tree.down.some(card => card.cardName === "stingingNettle");
    }

    function canAddButterfly(tree) {
        const hasOrtie = ortieOnTheTree(tree);
        const upIsEmpty = tree.up.length === 0;
        const upHasOnlyButterflies = tree.up.every(card =>
            cards.find(c => c.name === card.cardName)?.symbols.includes("butterfly")
        );
        return hasOrtie && (!upIsEmpty) && upHasOnlyButterflies;
    }

    function canOnlyAddButterfly(tree) {
        const hasOrtie = ortieOnTheTree(tree);
        const upHasOnlyButterflies = tree.up.every(card =>
            cards.find(c => c.name === card.cardName)?.symbols.includes("butterfly")
        );
        const upIsEmpty = tree.up.length === 0;
        return hasOrtie && upHasOnlyButterflies && (!upIsEmpty);
    }

    function canAddCoucou(tree) {
        if (tree.up.length !== 1) {
            return false
        }
        return cards.find(c => c.name === tree.up[0].cardName)?.symbols.includes("bird");
    }

    function canOnlyAddLievre(tree,side) {
        if (!side) {
            return false;
        }
        if (tree[side].length === 0) {
            return false
        } 
        return tree[side][0].cardName === "europeanHare";
    }

    function canAddCrapaudCommun(tree) {
        if (tree.down.length !== 1) {
            return false;
        }
        return tree.down[0].cardName === "commonToad";
    }

</script>





<div class="modal"> 
    <div class="modal-content">
    
    <h3>Modifiez votre arbre</h3>
        <div class="forest-root">
        <div class="trees-row">
    
            <div class="tree-cluster">

                <!-- UP row -->
                <div class="card-row row-up">

                {#if (treeModifState.treeToModif?.up.length == 0)}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "redSquirrel",
                            color : "none"
                        }
                        treeModifState.addCard("up", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}
                
                {#if canAddButterfly(treeModifState.treeToModif)} <!--On peut ajouter plusieurs papillons en haut-->
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "purpleEmperor",
                            color : "none",
                        }
                        treeModifState.addCard("up", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.multipleButterflies = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#if canAddCoucou(treeModifState.treeToModif)} <!--On peut ajouter un coucou-->    
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "cuckoo",
                            color : "vert-clair",
                        }
                        treeModifState.addCard("up", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.addingCoucou = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;
                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#each treeModifState.treeToModif?.up as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                        cardModifState.openModalModifCard = true;
                    }} // ouvrir le modal avec l'id de la carte à modifier
                    >
                    {#if card.color === 'none'}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon ribbon-none"
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.openModalModifCard = true;
                        }}
                        >
                            <span class="ribbon-icon">!</span>
                        </span>
                    {:else}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = card.color;
                            cardModifState.openModalModifCard = true;
                        }}
                        ></span>
                    {/if}
                    <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                {/each}

                
                </div>

                
                <!-- LEFT-->
            
                <div class="card-col col-left">

                    {#if treeModifState.treeToModif?.left.length == 0}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "elk",
                            color : "vert-clair"
                        }
                        treeModifState.addCard("left", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                    {/if}

                    {#if canOnlyAddLievre(treeModifState.treeToModif,"left")} <!--On peut ajouter qu'un lièvre à gauche-->
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "europeanHare",
                            color : "none",
                        }
                        treeModifState.addCard("left", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.addingLievre = true;
                        cardModifState.sideCardToModif = "left";
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    <span class="card-name"> + </span>
                    </button>
                    {/if}


                    {#each treeModifState.treeToModif?.left as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                        cardModifState.openModalModifCard = true;
                    }} // ouvrir le modal avec l'id de la carte à modifier 
                    >
                        {#if card.color === 'none'}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon ribbon-none"
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = "none";
                                cardModifState.openModalModifCard = true;
                            }}
                            >
                                <span class="ribbon-icon">!</span>
                            </span>
                        {:else}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = card.color;
                                cardModifState.openModalModifCard = true;
                            }}
                            ></span>
                        {/if}
                        <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                    {/each}

                    
                </div>
                

                <!-- TREE CARD -->
                

                    <button class="tree-card" style={`--tree-color: ${resolveColor(treeModifState.treeToModif?.symbol)}; --tree-soft: ${lighten(resolveColor(treeModifState.treeToModif?.symbol), 72)};`}
                    onclick={() => {
                        cardModifState.idCardToModif = treeModifState.idTreeToModif;
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    {#if treeModifState.treeToModif?.symbol === 'none'}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="tree-ribbon tree-ribbon-none"
                        role = "button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); //Empeche le clic de se propager au bouton parent.
                            cardModifState.idCardToModif = treeModifState.idTreeToModif;
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.openModalModifCard = true;
                        }}
                        >
                            <span class="tree-ribbon-icon">!</span>
                        </span>
                    {:else}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="tree-ribbon" style={`background:${resolveColor(treeModifState.treeToModif?.symbol)}`}
                        role = "button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); //Empeche le clic de se propager au bouton parent.
                            cardModifState.idCardToModif = treeModifState.idTreeToModif;
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.openModalModifCard = true;
                        }}
                        ></span>
                    {/if}
                    <span class="tree-icon">{cards.find(c => c.name === treeModifState.treeToModif?.tree)?.symbols?.includes('tree') ? '🌳' : '🌿'}</span>
                    <span class="tree-name">{FR_CARDS[treeModifState.treeToModif?.tree]}</span>
                    </button>


                <!-- RIGHT -->
                <div class="card-col col-right">
                    {#each treeModifState.treeToModif?.right as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.openModalModifCard = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                    }}
                    >
                        {#if card.color === 'none'}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon ribbon-none"
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = "none";
                                cardModifState.openModalModifCard = true;
                            }}
                            >
                                <span class="ribbon-icon">!</span>
                            </span>
                        {:else}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                            role="button"
                            tabindex="0"
                            onclick={(e) => {
                                e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                                cardModifState.idCardToModif = card.id;
                                cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                                cardModifState.somethingSpecial = true;
                                cardModifState.modifyColor = true;
                                cardModifState.colorToModify = card.color;
                                cardModifState.openModalModifCard = true;
                            }}
                            ></span>
                        {/if}
                        <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                    {/each}


                    {#if treeModifState.treeToModif?.right.length == 0}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "troll",
                            color : "gris"
                        }
                        treeModifState.addCard("right", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#if canOnlyAddLievre(treeModifState.treeToModif,"right")} <!--On peut ajouter qu'un lièvre à droite-->
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "europeanHare",
                            color : "none",
                        }
                        treeModifState.addCard("right", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.addingLievre = true;
                        cardModifState.sideCardToModif = "right";
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    <span class="card-name"> + </span>
                    </button>
                    {/if}

                </div>
            

                <!-- DOWN row -->
                <div class="card-row row-down">

                {#each treeModifState.treeToModif?.down as card}
                    <button class="card" style={cardStyle(card.color)}
                    onclick={() => {
                        cardModifState.idCardToModif = card.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                        cardModifState.openModalModifCard = true;
                    }}
                    >
                    {#if card.color === 'none'}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon ribbon-none"
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = "none";
                            cardModifState.openModalModifCard = true;
                        }}
                        >
                            <span class="ribbon-icon">!</span>
                        </span>
                    {:else}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <span class="ribbon" style={`background:${resolveColor(card.color)}`}
                        role="button"
                        tabindex="0"
                        onclick={(e) => {
                            e.stopPropagation(); // Empêche le clic de se propager au bouton parent
                            cardModifState.idCardToModif = card.id;
                            cardModifState.cardToModif = JSON.parse(JSON.stringify(card));
                            cardModifState.somethingSpecial = true;
                            cardModifState.modifyColor = true;
                            cardModifState.colorToModify = card.color;
                            cardModifState.openModalModifCard = true;
                        }}
                        ></span>
                    {/if}
                    <span class="card-name">{FR_CARDS[card.cardName]}</span>
                    </button>
                {/each}

                {#if treeModifState.treeToModif?.down.length == 0}
                    <button class = "card" 
                    onclick = {() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "edelweiss",
                            color : "none"
                        }
                        treeModifState.addCard("down", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;

                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}

                {#if canAddCrapaudCommun(treeModifState.treeToModif)} <!--On peut ajouter un crapaud commun-->    
                    <button class="card"
                    onclick={() => {
                        const newCard = {
                            id : crypto.randomUUID(),
                            cardName : "commonToad",
                            color : "none",
                        }
                        treeModifState.addCard("down", newCard);
                        cardModifState.idCardToModif = newCard.id;
                        cardModifState.somethingSpecial = true;
                        cardModifState.addingCrapaudCommun = true;
                        cardModifState.cardToModif = JSON.parse(JSON.stringify(newCard));
                        cardModifState.openModalModifCard = true;
                    }}>
                    <span class="card-name"> + </span>
                    </button>
                {/if}
                

                </div>

            </div>
        
        </div>
        </div>
    
    </div>
</div>

<div class="modal-backdrop">
    <button onclick={closeModal} class="close-button">Annuler</button>
    <button onclick={validerModal} class="validate-button">Valider</button>
</div>

{#if cardModifState.openModalModifCard}
    <CardToModifView  on:close={() => {cardModifState.sideCardToModif = null; cardModifState.somethingSpecial = false; cardModifState.openModalModifCard = false; cardModifState.idCardToModif = null;}} />
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


  .card:hover {
    border-color: var(--card-color);
    transform: scale(1.04);
    z-index: 2;
  }

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