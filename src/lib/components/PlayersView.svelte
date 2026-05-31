<script>
    import { usePlayerState } from "$lib/states/playerState.svelte.js";
    import { useRealForestState } from "$lib/states/realForestState.svelte.js";
    import { useCaveState } from "$lib/states/caveState.svelte.js";
    const playerState = usePlayerState();
    const realForestState = useRealForestState();
    const caveState = useCaveState();

    let openModalModifNom = $state(false);
    let playerToModifName = $state(null);

    let newPlayerName = $state("");

    function OpenModalModifNom(playerName) {
      newPlayerName = playerName; // Pré-remplir avec le nom du joueur qu'on veut modifier
      playerToModifName = playerName;
      openModalModifNom = true;
      
    }

    function ajouteJoueur() {
      const number = playerState.allPlayers.length + 1; // On compte le nombre de joueurs actuels et on ajoute 1 pour le nouveau joueur
      const name = "Joueur " + number.toString();
      playerState.addPlayer(name);
    }
</script>

<div class = "container" >
  {#each playerState.allPlayers as player}
    <div class = "container">
      <div class = "container ">
        {#if playerState.player == player}
        {player}
        {:else}
           <button onclick={() => {playerState.selectPlayer(player)}}>{player}</button>
        {/if}
       
      </div>

      <button onclick={() => {OpenModalModifNom(player)}}>Modifier le nom du joueur.</button>

        {#if playerState.allPlayers.length > 1} <!-- on peut remove un joueur que s'il y en a plus de 2-->
        <button onclick={() => {playerState.removePlayer(player)}}>Supprimer le joueur.</button>
        {/if}

      {#if realForestState.realForest[player]}
        {realForestState.points(player, caveState.caves)}
      {/if}
    </div>
  {/each}

  {#if openModalModifNom}

  <div class="modal">
    <div class="modal-content">
      
      <h3>Modifier le nom du joueur</h3>
      <input type="text" bind:value={newPlayerName} placeholder="Nouveau nom" />
      <button onclick={() => { playerState.renamePlayer(playerToModifName, newPlayerName); openModalModifNom = false; }}>Valider</button>
    </div>
  </div>


  {/if}

  <div class ="container">
    <button onclick={ajouteJoueur}>Ajouter un joueur</button>
  </div>

</div>

