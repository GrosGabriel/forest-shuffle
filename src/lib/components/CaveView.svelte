<script>
import { usePlayerState } from "$lib/states/playerState.svelte.js";
import { useCaveState } from "$lib/states/caveState.svelte.js";
import { FR_CARDS } from "$lib/i18n/fr-cards";
import Modal from "$lib/components/Modal.svelte";
import ModifyCave from "$lib/components/ModifyCave.svelte";

const playerState = usePlayerState();
const caveState = useCaveState();

let openModal = $state(false);

let caveType = $derived(caveState.caves[playerState.player]?.caveType ?? 'cave');
let caveCount = $derived(caveState.caves[playerState.player]?.count ?? 0);

</script>

<div class="cave-block">
  <span class="cave-mark"></span>

  <div class="cave-info">
    <button class="cave-name" onclick={() => openModal = true}>
      {FR_CARDS[caveType] ?? 'Grotte'}
    </button>
    <div class="cave-count">{caveCount}</div>
  </div>

  <div class="cave-controls">
    <button class="cave-step" aria-label="Retirer une carte de la grotte" onclick={() => caveState.removeOneFromCave(playerState.player)}>−</button>
    <button class="cave-step" aria-label="Ajouter une carte à la grotte" onclick={() => caveState.addOneToCave(playerState.player)}>+</button>
    <button class="btn btn-ghost cave-reset" onclick={() => caveState.resetCave(playerState.player)}>Reset</button>
  </div>
</div>

<Modal open={openModal} onclose={() => {openModal = false;}}>
  <ModifyCave on:close={() => {openModal = false;}} />
</Modal>

<style>
  .cave-block {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1.1rem;
    background: var(--bark-tint);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 0.5rem 1.2rem 0.5rem 1.5rem;
    margin: 0.6rem 0;
    overflow: hidden;
  }

  /* Repère visuel discret, dans le langage des rubans de carte, sans icône */
  .cave-mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: var(--bark);
  }

  /* Nom + compteur sur une seule ligne (au lieu d'empilés) pour garder la
     bande basse. */
  .cave-info {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
  }

  .cave-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    color: var(--ink);
    background: none;
    border: none;
    padding: 0;
    text-align: left;
    cursor: pointer;
    text-decoration: underline dotted;
    text-underline-offset: 3px;
  }
  .cave-name:hover {
    color: var(--bark);
  }

  .cave-count {
    font-family: var(--font-mono);
    font-size: 1.3rem;
    color: var(--bark);
    font-variant-numeric: tabular-nums;
  }

  .cave-controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .cave-step {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid var(--bark);
    background: var(--surface-raised);
    color: var(--bark);
    font-family: var(--font-mono);
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .cave-step:hover {
    background: var(--bark-tint);
  }

  .cave-reset {
    min-height: 38px;
  }
</style>
