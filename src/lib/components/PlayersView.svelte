<script>
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { useCaveState } from "$lib/states/caveState.svelte.js";

    import Modal from "$lib/components/Modal.svelte";
    import ModifyPlayerName from "$lib/components/ModifyPlayerName.svelte";

    const playerState = usePlayerState();
    const realForestState = useRealForestState();
    const caveState = useCaveState();

    let openModalModifNom = $state(false);
    let playerToModifName = $state(null);
    let newPlayerName = $state("");

    // Joueur ciblé par la feuille d'actions (renommer / supprimer), ou null si fermée.
    // On passe par le Modal existant plutôt qu'un dropdown positionné en absolute :
    // le rack de joueurs défile horizontalement, et un dropdown ancré à une carte
    // proche du bord se faisait couper par le scroll du rack.
    let menuPlayer = $state(null);

    function openMenu(player) {
      menuPlayer = player;
    }

    function closeMenu() {
      menuPlayer = null;
    }

    function OpenModalModifNom(playerName) {
      newPlayerName = playerName; // Pré-remplir avec le nom du joueur qu'on veut modifier
      playerToModifName = playerName;
      openModalModifNom = true;
      closeMenu();
    }

    function supprimeJoueur(player) {
      playerState.removePlayer(player);
      closeMenu();
    }

    function ajouteJoueur() {
      const number = playerState.allPlayers.length + 1; // On compte le nombre de joueurs actuels et on ajoute 1 pour le nouveau joueur
      const name = "Joueur " + number.toString();
      playerState.addPlayer(name);
    }
</script>

<div class="player-rack">
  {#each playerState.allPlayers as player}
    {@const isActive = playerState.player === player}

    <div
      class="player-card"
      class:active={isActive}
      role="button"
      tabindex="0"
      onclick={() => playerState.selectPlayer(player)}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playerState.selectPlayer(player); } }}
    >
      <span class="player-ribbon"></span>
      <span class="player-name">{player}</span>

      <div class="player-footer">
        <div class="player-points-wrap">
          <span class="player-points">{realForestState.points(player, caveState.caves)}</span>
          <span class="player-points-label">points</span>
        </div>

        <button
          class="kebab"
          aria-label="Options pour {player}"
          onclick={(e) => { e.stopPropagation(); openMenu(player); }}
        >⋮</button>
      </div>
    </div>
  {/each}

  <button class="player-card add-card" onclick={ajouteJoueur}>
    <span class="plus">+</span>
    Ajouter un joueur
  </button>
</div>

<Modal open={!!menuPlayer} onclose={closeMenu}>
  {#if menuPlayer}
    <div class="player-menu-sheet">
      <h3>{menuPlayer}</h3>
      <button class="btn btn-secondary" onclick={() => OpenModalModifNom(menuPlayer)}>Modifier le nom</button>
      {#if playerState.allPlayers.length > 1}
        <button class="btn btn-danger" onclick={() => supprimeJoueur(menuPlayer)}>Supprimer le joueur</button>
      {/if}
    </div>
  {/if}
</Modal>

<Modal open={openModalModifNom} onclose={() => {openModalModifNom = false;}}>
  <ModifyPlayerName playerToModifName={playerToModifName} newPlayerName={newPlayerName} on:close={() => {openModalModifNom = false;}} />
</Modal>

<style>
  .player-rack {
    display: flex;
    gap: 0.7rem;
    overflow-x: auto;
    padding: 0.3rem 0.1rem 0.9rem;
    scrollbar-width: thin;
    /* Reste visible en scrollant la forêt plus bas — toujours voir qui joue
       et son score, même arrivé loin dans la page. */
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--surface);
    box-shadow: 0 4px 8px -6px hsl(var(--shadow-color) / 0.35);
  }

  .player-card {
    position: relative;
    flex: 0 0 auto;
    width: 132px;
    background: var(--surface-sunken);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-card);
    padding: 0.55rem 0.7rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-body);
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }

  .player-card:hover {
    border-color: var(--border-strong);
  }

  .player-card.active {
    background: var(--surface-raised);
    border-color: var(--forest);
    box-shadow: 0 10px 22px -14px hsl(var(--shadow-color) / 0.5);
    transform: translateY(-3px);
  }

  .player-ribbon {
    position: absolute;
    top: 0;
    right: 0;
    width: 22px;
    height: 22px;
    background: var(--forest-tint);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    border-radius: 0 var(--radius-card) 0 0;
  }
  .player-card.active .player-ribbon {
    background: var(--forest);
  }

  .player-name {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.02rem;
    color: var(--ink);
    line-height: 1.2;
  }

  /* Points + bouton d'options sur une seule ligne (au lieu de 2 blocs
     empilés) pour garder la carte basse. */
  .player-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
  }

  .player-points-wrap {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
  }

  .player-points {
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
    color: var(--forest);
  }
  .player-card:not(.active) .player-points {
    color: var(--ink-faint);
  }

  .player-points-label {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .kebab {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--ink-faint);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: pointer;
  }
  .kebab:hover {
    background: var(--surface-sunken);
    color: var(--ink);
  }

  .player-card.add-card {
    align-items: center;
    justify-content: center;
    text-align: center;
    border-style: dashed;
    background: transparent;
    color: var(--ink-faint);
    font-size: 0.85rem;
    font-weight: 600;
    gap: 0.3rem;
  }
  .player-card.add-card:hover {
    border-color: var(--forest);
    color: var(--forest);
  }
  .add-card .plus {
    font-family: var(--font-display);
    font-size: 1.4rem;
    line-height: 1;
  }

  .player-menu-sheet {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-width: 220px;
  }
  .player-menu-sheet h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.15rem;
    color: var(--ink);
    margin: 0 0 0.3rem;
  }
</style>
