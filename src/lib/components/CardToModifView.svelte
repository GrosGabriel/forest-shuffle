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
    import { FILTRE_ICONS } from "$lib/utils/filterIcons.js";

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

    // Le nom de symbole n'est pas toujours identique à la clé du filtre
    // (ex: la case "pawed" du filtre correspond au symbole "pawedAnimal").
    const FILTRE_SYMBOL = {
        pawed: "pawedAnimal",
        clovenHoofed: "clovenHoofedAnimal",
    };

    const FILTRE_LABELS = {
        butterfly: "Papillons",
        bird: "Oiseaux",
        insect: "Insectes",
        pawed: "Mammifères à pattes",
        plant: "Plantes",
        amphibian: "Amphibiens",
        mushroom: "Champignons",
        clovenHoofed: "Ongulés",
        deer: "Cervidés",
        bat: "Chauves-souris",
    };

    function getFiltrePos(position) {
        switch (position) {
            case "side":
                return selectedFiltresSide;
            case "top":
                return selectedFiltresUp;
            case "bottom":
                return selectedFiltresDown;
            default:
                return null;
        }
    }

    function cardsPossibles(cardName) {

        const position = cards.find(c => c.name === cardName)?.position;
        const filtrePos = getFiltrePos(position);

        const parPosition = cards.filter(c => c.position === position && c.name !== "cuckoo");

        if (!filtrePos) return parPosition;

        // Aucune case cochée : on garde tout. Sinon on ne garde que les
        // cartes qui correspondent à au moins une case cochée.
        const aucuneCoche = Object.values(filtrePos).every(v => !v);
        if (aucuneCoche) return parPosition;

        return parPosition.filter(c =>
            Object.entries(filtrePos).some(([key, checked]) =>
                checked && c.symbols.includes(FILTRE_SYMBOL[key] ?? key)
            )
        );
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

    // Aucune case cochée : on affiche tout. Une case cochée : on affiche
    // seulement ce type. Les deux cochées : on affiche tout à nouveau.
    let selectedFiltresBase = $state({
        tree: false,
        shrub: false,
    });

    let bases_sorted_filtered = $derived.by(() => {
        return bases_sorted.filter(base => {
            if (!selectedFiltresBase.tree && !selectedFiltresBase.shrub) return true;
            if (selectedFiltresBase.tree && base.symbols.includes("tree")) return true;
            if (selectedFiltresBase.shrub && base.symbols.includes("shrub")) return true;
            return false;
        });
    });


    let selectedFiltresUp = $state({
        butterfly: false,
        bird: false,
        insect: false,
        pawed: false,
        plant: false,
    });

    let selectedFiltresDown = $state({
        amphibian: false,
        insect: false,
        mushroom: false,
        pawed: false,
        plant: false,
    });

    let selectedFiltresSide = $state({
        bat: false,
        bird: false,
        insect: false,
        clovenHoofed: false,
        deer: false,
        pawed: false,
    });

</script>

{#if (isTree) && (cardModifState.openModalModifCard) && (!(cardModifState.somethingSpecial))}
    <div class="modal">
        <div class="modal-content">
            
            <h3>Choisissez la base</h3>

            <div class="filters">
                <label class="filter-item">
                    <input type="checkbox" bind:checked={selectedFiltresBase.tree}>
                    <img class="filter-icon" src={FILTRE_ICONS.tree} alt="Arbres">
                </label>
                <label class="filter-item">
                    <input type="checkbox" bind:checked={selectedFiltresBase.shrub}>
                    <img class="filter-icon" src={FILTRE_ICONS.shrub} alt="Arbustes">
                </label>
            </div>

            <div class="option-list">
                {#each bases_sorted_filtered as base}
                <button class="btn btn-secondary option-item" onclick={() => {
                            treeModifState.treeToModif.tree = base.name ;
                            treeModifState.treeToModif.symbol = TreeColor[base.name] ?? "none";
                            cardModifState.validated = true;
                            cardModifState.openModalModifCard = false;
                            selectedFiltresBase.tree = false;
                            selectedFiltresBase.shrub = false;}}>
                    {FR_CARDS[base.name]}
                </button>
                {/each}
            </div>

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
    {@const positionCarteAModif = cards.find(c => c.name === cardModifState.cardToModif?.cardName)?.position}
    {@const filtrePos = getFiltrePos(positionCarteAModif)}
    <div class ="modal">
        <div class="modal-content">
            <h3>Choisissez la carte</h3>

            {#if filtrePos}
            <div class="filters">
                {#each Object.keys(filtrePos) as key}
                <label class="filter-item">
                    <input type="checkbox" bind:checked={filtrePos[key]}>
                    {#if FILTRE_ICONS[key]}
                        <img class="filter-icon" src={FILTRE_ICONS[key]} alt={FILTRE_LABELS[key] ?? key}>
                    {:else}
                        {FILTRE_LABELS[key] ?? key}
                    {/if}
                </label>
                {/each}
            </div>
            {/if}

                <div class="option-list">
                {#each cardsPossibles(cardModifState.cardToModif?.cardName).sort((a,b) => FR_CARDS[a.name].localeCompare(FR_CARDS[b.name], 'fr')) as card}
                <button class="btn btn-secondary option-item" onclick={() => {
                        cardModifState.cardToModif.cardName = card.name;
                        cardModifState.cardToModif.color = "none" //TODO gérer les couleurs des cartes (actuellement on perd l'info de la couleur quand on modifie une carte)
                        cardModifState.validated = true;
                        cardModifState.openModalModifCard = false;
                        treeModifState.updateCard(cardModifState.cardToModif);
                        if (filtrePos) {
                            for (const key of Object.keys(filtrePos)) filtrePos[key] = false;
                        }
                }}>
                {FR_CARDS[card.name]}
                </button>

                {/each}
                </div>

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

  /* Hauteur fixe (pas max-height) : la zone ne bouge pas quand un filtre
     réduit le nombre de cartes affichées, elle défile juste en interne. */
  .option-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 50vh;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .option-item {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    margin-bottom: 0.2rem;

  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: -0.5rem 0 1rem;
  }

  .filter-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px;
    border-radius: var(--radius-btn);
    border: 2px solid var(--border-strong);
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--ink-soft);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .filter-item:has(input:checked) {
    background: var(--forest-tint-soft);
    border-color: var(--forest);
  }
  .filter-item input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .filter-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    object-fit: cover;
    display: block;
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