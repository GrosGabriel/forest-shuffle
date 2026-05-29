import { useCaveState } from "./caveState.svelte.js";
import { useRealForestState } from "./realForestState.svelte.js";
import { usePredictionsState } from "./predictionsState.svelte.js";
import { useImageUrlState } from "./imageUrlState.svelte.js";

let playerState = $state({
    selectedPlayer : "Joueur 1",
    listOfPlayers : ["Joueur 1"]
});


const caveState = useCaveState(); 
const realForestState = useRealForestState();
const predictionsState = usePredictionsState();
const imageUrlState = useImageUrlState();

const usePlayerState = () => {
    
    return {
        get player() {
            return playerState.selectedPlayer;
        },

        get allPlayers() {
            return playerState.listOfPlayers;
        },

        selectPlayer(player) {
            playerState.selectedPlayer = player;
        },

        addPlayer(player) {
            let index = 1;
            let finalName = player;
            while (playerState.listOfPlayers.includes(finalName)) {
                finalName = `${player} (${index})`;
                index++;

            }
            playerState.listOfPlayers = [...playerState.listOfPlayers, finalName];

            if (playerState.selectedPlayer == null) {
                playerState.selectedPlayer = finalName;
            }

            if (!caveState.caves[finalName]) {
                caveState.setCaveType(finalName, "cave", 0);
            }
            realForestState.addPlayer(player);
        },

        renamePlayer(oldName, newName) {
            //console.log("caveState au moment du rename :", JSON.stringify(caveState));
            //console.log("oldPlayerName :", oldName);
            //console.log("existe ?", oldName in caveState.caves);
            if (oldName == newName) {return}
            let index = 1;
            let finalNewName = newName;
            while (playerState.listOfPlayers.includes(finalNewName)) {
                finalNewName = `${newName} (${index})`;
                index++;
            }
            
            playerState.listOfPlayers = playerState.listOfPlayers.map(p => p === oldName ? finalNewName : p);
            if (playerState.selectedPlayer == oldName) {
                playerState.selectedPlayer = finalNewName;
            }
            caveState.renamePlayer(oldName, finalNewName);
            realForestState.renamePlayer(oldName, finalNewName);
            predictionsState.renamePlayer(oldName, finalNewName);
            imageUrlState.renamePlayer(oldName, finalNewName);
        },


        removePlayer(player) {
            if (!playerState.listOfPlayers.length <= 1) {
                playerState.listOfPlayers = playerState.listOfPlayers.filter(p => p !== player)
                if (playerState.selectedPlayer == player) {
                    playerState.selectedPlayer = playerState.listOfPlayers[0];
                }

                caveState.removePlayer(player);
                realForestState.removePlayer(player);
                predictionsState.removePlayer(player);
                imageUrlState.removePlayer(player);
            }
        }

        

    }
}


export { usePlayerState };
