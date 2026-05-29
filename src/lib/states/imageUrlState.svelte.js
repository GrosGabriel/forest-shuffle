


let imageUrlState = $state({});

const useImageUrlState = () => {
    return {
        get imageUrl() {
            return imageUrlState
        },

        renamePlayer(oldName, newName) {
            if (oldName in imageUrlState) {
                imageUrlState[newName] = imageUrlState[oldName];
                delete imageUrlState[oldName];
            } else {
                console.warn(`Can't rename imageUrl for oldname : "${oldName}" doesn't exist`);
            }
        },

        removePlayer(playerName) {
            if (playerName in imageUrlState) {
                delete imageUrlState[playerName];
            } else {
                console.warn(`Impossible de supprimer l'imageUrl du joueur ${playerName}`);
            }
        },
    }
}

export { useImageUrlState };