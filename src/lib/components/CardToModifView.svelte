<script>
    import { createEventDispatcher } from "svelte";
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useCardModifState } from "$lib/states/cardModifState.svelte.js";
    import { useTreeModifState } from "$lib/states/treeModifState.svelte.js";
    import { cardStyle, resolveColor, lighten } from "../utils/foretStyle.js";
    import { FR_CARDS } from "$lib/i18n/fr-cards";
    import cards from "../../model/glaure/cards.js";

    import { TreeColor } from "../../model/card-color.js";
    import { colorPalette } from "$lib/utils/foretStyle.js";

    const dispatch = createEventDispatcher();
    function closeModal() {
        dispatch("close");
    }


    const treeModifState = useTreeModifState();
    const cardModifState = useCardModifState();

    const isTree = $derived(cardModifState.idCardToModif === treeModifState.idTreeToModif);

    const bases = cards.filter(c => c.symbols.includes("tree") || c.symbols.includes("shrub"));
    const bases_sorted = bases.sort((a, b) =>
		FR_CARDS[a.name].localeCompare(FR_CARDS[b.name], 'fr'));

    const positionRelative = {
        "left" : "side",
        "right" : "side",
        "top" : "top",
        "bottom" : "bottom",
    };


    function cardsPossibles(cardName) {

        const position = cards.find(c => c.name === cardName)?.position;
        return cards.filter(c => c.position === position && c.name !== "cuckoo");
    }

    function papillonCards() {
        return cards.filter(c => c.symbols.includes("butterfly"));
    }


    function ortieOnTheTree(tree) {
        return tree.down.some(card => card.cardName === "stingingNettle");
    }

    function canOnlyAddButterfly(tree) {
        if (tree.up.length <= 1) {
            return false;
        }

        const hasOrtie = ortieOnTheTree(tree);
        const upHasOnlyButterflies = tree.up.every(card =>
            cards.find(c => c.name === card.cardName)?.symbols.includes("butterfly")
        );
        
        return hasOrtie && upHasOnlyButterflies;
    }

    function canOnlyAddCoucou(tree) {
        if (tree.up.length == 0) {
            return false
        }
        return cards.find(c => c.name === tree.up[0].cardName)?.symbols.includes("bird");
    }
    



    function coucouCards() {
        return cards.filter(c => c.name === "cuckoo");
    }

    function lievreCards() {
        return cards.filter(c => c.name === "europeanHare");
    }

    function crapaudCommunCards() {
        return cards.filter(c => c.name === "commonToad");
    }

    function canOnlyAddLievre(tree,side) {
        if (!side) {
            return false;
        }
        if (tree[side].length <= 1) {
            return false
        } 
        return tree[side][0].cardName === "europeanHare";
    }

    function canOnlyAddCrapaudCommun(tree) {
        if (tree.down.length == 0) {
            return false
        }
        return (tree.down[0].cardName === "commonToad") && (tree.down.length == 2);
    }

</script>

{#if (isTree) && (cardModifState.openModalModifCard) && (!(cardModifState.somethingSpecial))}
    <div class="modal">
        <div class="modal-content">
            
            <h3>Choisissez la base</h3>
            
            {#each bases_sorted as base}
            <button class="btn btn-secondary option-item" onclick={() => {
                        treeModifState.treeToModif.tree = base.name ;
                        treeModifState.treeToModif.symbol = TreeColor[base.name] ?? "none";
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;}}>
                {FR_CARDS[base.name]}
            </button>
            {/each}
        
        </div>
    </div>
{/if}

{#if (!(isTree)) 
    && (cardModifState.openModalModifCard) 
    && (!(cardModifState.somethingSpecial)) 
    && !(canOnlyAddButterfly(treeModifState.treeToModif) && (cardModifState.sideCardToModif === "up")) 
    && !(canOnlyAddCoucou(treeModifState.treeToModif) && (cardModifState.sideCardToModif === "up") && (cardModifState.isNewCard)) 
    && !(canOnlyAddLievre(treeModifState.treeToModif, cardModifState.sideCardToModif)) 
    && !(canOnlyAddCrapaudCommun(treeModifState.treeToModif) && (cardModifState.sideCardToModif === "down"))
    }
    <div class ="modal">
        <div class="modal-content">
            <h3>Choisissez la carte</h3>
                {#each cardsPossibles(cardModifState.cardToModif?.cardName).sort((a,b) => FR_CARDS[a.name].localeCompare(FR_CARDS[b.name], 'fr')) as card}
                <button class="btn btn-secondary option-item" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                        treeModifState.updateCard(cardModifState.cardToModif);
                }}>
                {FR_CARDS[card.name]}
                </button>

                {/each}

                <button class="btn btn-danger option-item"
                onclick={() => {
                    if (canOnlyAddButterfly(treeModifState.treeToModif) && cardModifState.sideCardToModif == "down") {
                        treeModifState.resetUpWithFirst();
                    }
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
                <span>Supprimer la carte</span>
                </button>
        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.multipleButterflies)) || (!(cardModifState.somethingSpecial) && canOnlyAddButterfly(treeModifState.treeToModif) && (cardModifState.sideCardToModif === "up"))}
    {@const papillonCards_sorted = papillonCards().sort((a, b) => FR_CARDS[a.name].localeCompare(FR_CARDS[b.name], 'fr'))}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez le papillon</h3>
            
            {#each papillonCards_sorted as card}
                <button class="btn btn-secondary option-item" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.multipleButterflies = false;
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                        
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="btn btn-danger option-item"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.multipleButterflies = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.addingCoucou)) || (canOnlyAddCoucou(treeModifState.treeToModif) && (cardModifState.sideCardToModif === "up") && (cardModifState.isNewCard))}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez le coucou</h3>
            {#each coucouCards() as card} <!--qu'une seule carte donc pas besoin de trier-->
                <button class="btn btn-secondary option-item" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "vert-clair";
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.addingCoucou = false;
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="btn btn-danger option-item"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.addingCoucou = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.addingLievre)) || (!(cardModifState.somethingSpecial) && canOnlyAddLievre(treeModifState.treeToModif, cardModifState.sideCardToModif) && (cardModifState.sideCardToModif === "left" || cardModifState.sideCardToModif === "right"))}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez le lièvre</h3>
            {#each lievreCards() as card} <!--qu'une seule carte donc pas besoin de trier-->
                <button class="btn btn-secondary option-item" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.addingLievre = false;
                        cardModifState.sideCardToModif = null;
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="btn btn-danger option-item"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.sideCardToModif = null;
                    cardModifState.addingLievre = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.addingCrapaudCommun)) || (!(cardModifState.somethingSpecial) && canOnlyAddCrapaudCommun(treeModifState.treeToModif) && (cardModifState.sideCardToModif === "down"))}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez la carte</h3>
            {#each crapaudCommunCards() as card} <!--qu'une seule carte donc pas besoin de trier-->
                <button class="btn btn-secondary option-item" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.addingCrapaudCommun = false;
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="btn btn-danger option-item"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.addingCrapaudCommun = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}


{#if (cardModifState.somethingSpecial) && (cardModifState.modifyColor) && (!isTree)} 
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez la couleur de la carte</h3>
            {#each Object.entries(colorPalette) as [colorName, color]}
                <button class="color-swatch" style={`background:${resolveColor(colorName)}`} onclick={() => {
                        cardModifState.cardToModif.color = colorName;
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.modifyColor = false;
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                }}>
                {colorName}
                </button>
            {/each}

            <button class="btn btn-danger option-item"
                onclick={() => {
                    cardModifState.cardToModif.color = "none";
                    treeModifState.updateCard(cardModifState.cardToModif);
                    cardModifState.somethingSpecial = false;
                    cardModifState.modifyColor = false;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la couleur</span>
            </button>
        </div>
    </div>
{/if}

{#if (cardModifState.somethingSpecial) && (cardModifState.modifyColor) && (isTree)} 
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez la couleur de l'arbre</h3>
            {#each Object.entries(colorPalette) as [colorName, color]}
                <button class="color-swatch" style={`background:${resolveColor(colorName)}`} onclick={() => {
                        treeModifState.treeToModif.symbol = colorName;
                        cardModifState.somethingSpecial = false;
                        cardModifState.modifyColor = false;
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                }}>
                {colorName}
                </button>
            {/each}

            <button class="btn btn-danger option-item"
                onclick={() => {
                    treeModifState.treeToModif.symbol = "none";
                    cardModifState.somethingSpecial = false;
                    cardModifState.modifyColor = false;
                    cardModifState.validated = true;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la couleur</span>
            </button>
        </div>
    </div>
{/if}

{#if cardModifState.somethingSpecial && cardModifState.onlyBirds}
  <div class="modal">
    <div class="modal-content">
      <h3>Choisissez l'oiseau</h3>
      {#each cards.filter(c => c.symbols.includes("bird") && c.position === "top" && c.name !== "cuckoo").sort((a,b) => FR_CARDS[a.name].localeCompare(FR_CARDS[b.name], 'fr')) as card}
        <button class="btn btn-secondary option-item" onclick={() => {
          cardModifState.cardToModif.cardName = card.name;
          cardModifState.cardToModif.color = "none";
          treeModifState.updateCard(cardModifState.cardToModif);
          cardModifState.somethingSpecial = false;
          cardModifState.onlyBirds = false;
          cardModifState.validated = true;
          cardModifState.openModalModifCard = false;
        }}>
          {FR_CARDS[card.name]}
        </button>
      {/each}

      <button class="btn btn-danger option-item" onclick={() => {
        treeModifState.resetUp();
        cardModifState.cardToModif = null;
        cardModifState.idCardToModif = null;
        cardModifState.onlyBirds = false;
        cardModifState.somethingSpecial = false;
        cardModifState.validated = true;
        cardModifState.openModalModifCard = false;
      }}>
        <span>Supprimer la carte</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-content h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.15rem;
    color: var(--ink);
    margin: 0 0 1rem;
  }

  .option-item {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    margin-bottom: 0.2rem;
    
  }

  /* Nuancier de couleurs de carte : chrome du bouton seulement, la couleur
     de fond de chaque puce reste pilotée par les données (foretStyle.js). */
  .color-swatch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 96px;
    height: 44px;
    padding: 0 0.9rem;
    margin: 0 0.4rem 0.5rem 0;
    border-radius: var(--radius-btn);
    border: 1.5px solid rgba(0, 0, 0, 0.15);
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.82rem;
    color: var(--ink);
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: transform 0.12s ease;
  }
  .color-swatch:hover {
    transform: scale(1.05);
  }
</style>