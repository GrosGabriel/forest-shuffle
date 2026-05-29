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

    const positionRelative = {
        "left" : "side",
        "right" : "side",
        "top" : "top",
        "bottom" : "bottom",
    };


    function cardsPossibles(cardName) {

        const position = cards.find(c => c.name === cardName)?.position;
        return cards.filter(c => c.position === position);
    }

    function papillonCards() {
        return cards.filter(c => c.symbols.includes("butterfly"));
    }


    function ortieOnTheTree(tree) {
        return tree.down.some(card => card.cardName === "stingingNettle");
    }

    function canOnlyAddButterfly(tree) {
        const hasOrtie = ortieOnTheTree(tree);
        const upHasOnlyButterflies = tree.up.every(card =>
            cards.find(c => c.name === card.cardName)?.symbols.includes("butterfly")
        );
        const upIsEmpty = tree.up.length === 0;
        return hasOrtie && upHasOnlyButterflies && (!upIsEmpty);
    }

    function canOnlyAddCoucou(tree) {
        if (tree.up.length !== 1) {
            return false
        }
        return cards.find(c => c.name === tree.up[0].cardName)?.symbols.includes("bird");
    }
    
    function coucouCards() {
        return cards.filter(c => c.name === "cuckoo");
    }

    function lievreCards() {
        return cards.filter(c => c.name === "hare");
    }

    function crapaudCommunCards() {
        return cards.filter(c => c.name === "commonToad");
    }

    function canOnlyAddLievre(tree,side) {
        if (!side) {
            return false;
        }
        if (tree[side].length === 0) {
            return false
        } 
        return tree[side][0].cardName === "hare";
    }

    function canOnlyAddCrapaudCommun(tree) {
        if (tree.down.length == 0) {
            return false
        }
        return tree.down[0].cardName === "commonToad";
    }

</script>

{#if (isTree) && (cardModifState.openModalModifCard) && (!(cardModifState.somethingSpecial))}
    <div class="modal">
        <div class="modal-content">
            
            <h3>Choisissez la base</h3>
            
            {#each bases as base}
            <button class="tree-selector" onclick={() => {
                        treeModifState.treeToModif.tree = base.name ;
                        treeModifState.treeToModif.symbol = TreeColor[base.name] ?? "none";
                        cardModifState.openModalModifCard = false;}}>
                {FR_CARDS[base.name]}
            </button>
            {/each}
        
        </div>
    </div>
{/if}

{#if (!(isTree)) && (cardModifState.openModalModifCard) && (!(cardModifState.somethingSpecial)) && (!canOnlyAddButterfly(treeModifState.treeToModif)) && (!canOnlyAddCoucou(treeModifState.treeToModif))}
    <div class ="modal">
        <div class="modal-content">
            <h3>Choisissez la carte</h3>
                {#each cardsPossibles(cardModifState.cardToModif?.cardName) as card}
                <button class = "card-selector" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        cardModifState.openModalModifCard = false;
                        treeModifState.updateCard(cardModifState.cardToModif);
                }}>
                {FR_CARDS[card.name]}
                </button>

                {/each}

                <button class="card-delete"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.openModalModifCard = false;
                }}>
                <span>Supprimer la carte</span>
                </button>
        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.multipleButterflies)) || canOnlyAddButterfly(treeModifState.treeToModif)}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez le papillon</h3>
            {#each papillonCards() as card}
                <button class = "card-selector" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.multipleButterflies = false;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="card-delete"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.multipleButterflies = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.addingCoucou)) || canOnlyAddCoucou(treeModifState.treeToModif)}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez le coucou</h3>
            {#each coucouCards() as card}
                <button class = "card-selector" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.addingCoucou = false;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="card-delete"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.addingCoucou = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.addingLievre)) || canOnlyAddLievre(treeModifState.treeToModif, cardModifState.sideCardToModif)}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez le lièvre</h3>
            {#each lievreCards() as card}
                <button class = "card-selector" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.addingLievre = false;
                        cardModifState.sideCardToModif = null;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="card-delete"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.sideCardToModif = null;
                    cardModifState.addingLievre = false;
                    cardModifState.somethingSpecial = false;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la carte</span>
            </button>


        </div>
    </div>
{/if}

{#if ((cardModifState.somethingSpecial) && (cardModifState.addingCrapaudCommun)) || canOnlyAddCrapaudCommun(treeModifState.treeToModif)}
    <div class="modal">
        <div class="modal-content">
            <h3>Choisissez la carte</h3>
            {#each crapaudCommunCards() as card}
                <button class = "card-selector" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.addingCrapaudCommun = false;
                        cardModifState.openModalModifCard = false;
                }}>
                {FR_CARDS[card.name]}
                </button>
            {/each}

            <button class="card-delete"
                onclick={() => {
                    treeModifState.deleteCard(cardModifState.cardToModif);
                    cardModifState.cardToModif = null;
                    cardModifState.idCardToModif = null;
                    cardModifState.addingCrapaudCommun = false;
                    cardModifState.somethingSpecial = false;
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
                <button class = "color-selector" style={`background:${resolveColor(colorName)}`} onclick={() => {
                        cardModifState.cardToModif.color = colorName;
                        treeModifState.updateCard(cardModifState.cardToModif);
                        cardModifState.somethingSpecial = false;
                        cardModifState.modifyColor = false;
                        cardModifState.openModalModifCard = false;
                }}>
                {colorName}
                </button>
            {/each}

            <button class="card-delete"
                onclick={() => {
                    cardModifState.cardToModif.color = "none";
                    treeModifState.updateCard(cardModifState.cardToModif);
                    cardModifState.somethingSpecial = false;
                    cardModifState.modifyColor = false;
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
                <button class = "color-selector" style={`background:${resolveColor(colorName)}`} onclick={() => {
                        treeModifState.treeToModif.symbol = colorName;
                        cardModifState.somethingSpecial = false;
                        cardModifState.modifyColor = false;
                        cardModifState.openModalModifCard = false;
                }}>
                {colorName}
                </button>
            {/each}

            <button class="card-delete"
                onclick={() => {
                    treeModifState.treeToModif.symbol = "none";
                    cardModifState.somethingSpecial = false;
                    cardModifState.modifyColor = false;
                    cardModifState.openModalModifCard = false;
                }}>
            <span>Supprimer la couleur</span>
            </button>
        </div>
    </div>
{/if}