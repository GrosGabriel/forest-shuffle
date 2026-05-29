


let predictionsState = $state({});


const usePredictionsState = () => {
    return {

        get predictions() {
            return predictionsState
        },

        renamePlayer(oldName, newName) {
            if (oldName in predictionsState) {
                predictionsState[newName] = predictionsState[oldName];
                delete predictionsState[oldName];
            } else {
                console.warn(`Can't rename predictions for oldname : "${oldName}" doesn't exist`);
            }
        },

        removePlayer(playerName) {
            if (playerName in predictionsState) {
                delete predictionsState[playerName];
            } else {
                console.warn(`Impossible de supprimer la prédiction du joueur ${playerName}`);
            }
        },
    }
}

export { usePredictionsState };