<script>
    import { createEventDispatcher } from "svelte";
    import { colorPalette, resolveColor, NOMBRE_CARTES_COULEURS } from "$lib/utils/foretStyle.js";
    import { FR_CARDS } from "$lib/i18n/fr-cards";
    import { useTreeModifState } from "$lib/states/treeModifState.svelte.js";

    // side : "left" ou "right" — quel côté de l'arbre on édite.
    const { side } = $props();

    const treeModifState = useTreeModifState();

    const dispatch = createEventDispatcher();
    function closeModal() {
        dispatch("close");
    }

    // Limites par couleur pour le Lièvre d'Europe (nombre d'exemplaires de
    // chaque couleur réellement présents dans le jeu), remplies à la main
    // dans foretStyle.js.
    const limits = NOMBRE_CARTES_COULEURS[FR_CARDS.europeanHare] ?? {};

    let sideCards = $derived(treeModifState.treeToModif?.[side] ?? []);

    // Couleurs à afficher : celles qui ont une limite > 0, plus celles qui en
    // ont déjà (au cas où, ex. données existantes avec une limite passée à 0
    // depuis) — pas "none", un lièvre a toujours une couleur.
    let colorsToShow = $derived(
        Object.keys(colorPalette).filter(
            (c) => (limits[c] ?? 0) > 0 || countFor(c) > 0
        )
    );

    function countFor(colorName) {
        return sideCards.filter((c) => c.color === colorName).length;
    }

    function limitFor(colorName) {
        return limits[colorName] ?? 0;
    }

    function increment(colorName) {
        if (countFor(colorName) >= limitFor(colorName)) return;

        // Un lièvre "none" existe déjà (ex. le tout premier ajouté via le flux
        // générique, qui part toujours sans couleur) : on lui attribue la
        // couleur cliquée plutôt que d'ajouter un lièvre supplémentaire.
        const noneCard = colorName !== "none" ? sideCards.find((c) => c.color === "none") : null;
        if (noneCard) {
            treeModifState.updateCard({ ...noneCard, color: colorName });
            return;
        }

        treeModifState.addCard(side, {
            id: crypto.randomUUID(),
            cardName: "europeanHare",
            color: colorName,
        });
    }

    function decrement(colorName) {
        const card = sideCards.find((c) => c.color === colorName);
        if (!card) return;
        treeModifState.deleteCard(card);
    }
</script>

<div class="modal-content">
    <h3>Lièvres d'Europe</h3>
    <p class="hint">Combien de lièvres de chaque couleur de ce côté ?</p>

    <div class="color-count-list">
        {#each colorsToShow as colorName}
            {@const count = countFor(colorName)}
            {@const limit = limitFor(colorName)}
            <div class="color-count-row">
                <span class="color-dot" style={`background:${resolveColor(colorName)}`}></span>
                <span class="color-label">{colorName}</span>

                <div class="counter">
                    <button class="counter-step" onclick={() => decrement(colorName)} disabled={count === 0} aria-label="Retirer un lièvre {colorName}">−</button>
                    <span class="counter-value">{count} / {limit}</span>
                    <button class="counter-step" onclick={() => increment(colorName)} disabled={count >= limit} aria-label="Ajouter un lièvre {colorName}">+</button>
                </div>
            </div>
        {/each}
    </div>

    <button class="btn btn-primary" onclick={closeModal}>Fermer</button>
</div>

<style>
    .modal-content {
        min-width: 260px;
    }

    h3 {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 1.15rem;
        color: var(--ink);
        margin: 0 0 0.3rem;
    }

    .hint {
        font-size: 0.85rem;
        color: var(--ink-soft);
        margin: 0 0 1rem;
    }

    .color-count-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1.2rem;
    }

    .color-count-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.4rem 0.2rem;
        border-bottom: 1px solid var(--border);
    }

    .color-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
    }

    .color-label {
        flex: 1;
        font-family: var(--font-body);
        font-size: 0.9rem;
        color: var(--ink);
        text-transform: capitalize;
    }

    .counter {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .counter-step {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1.5px solid var(--bark);
        background: var(--surface-raised);
        color: var(--bark);
        font-family: var(--font-mono);
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .counter-step:hover {
        background: var(--bark-tint);
    }
    .counter-step:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }

    .counter-value {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        min-width: 3em;
        text-align: center;
        font-variant-numeric: tabular-nums;
    }
</style>
