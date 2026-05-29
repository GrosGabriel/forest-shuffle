/*
caveState = {"Alice : {caveType : "cave", count : 0}, "Bob" : {caveType : "cave", count : 0}}
*/

let caveState = $state({"Joueur 1" : {caveType : "cave", count : 0}});

const useCaveState = () => {
    return {
        get caves() {
            return caveState;
        },

        setCaveType(playerName, caveType) {
            if (caveState[playerName]) {
                caveState[playerName].caveType = caveType;
                
            } else {
                caveState[playerName] = { caveType: caveType, count: 0 };
            }
        },

        removePlayer(playerName) {
            delete caveState[playerName];
        },

        addOneToCave(playerName) {
            if (!caveState[playerName]) {
                console.warn(`Cave for player "${playerName}" not found. Creating a new cave with count 1.`);
                caveState[playerName] = { caveType: "cave", count: 1 };
            } else {
                caveState[playerName].count += 1;
            }
        },

        removeOneFromCave(playerName) {
            if (!caveState[playerName]) {
                console.warn(`Cave for player "${playerName}" not found. Creating a new cave with count 0.`);
                caveState[playerName] = { caveType: "cave", count: 0 };
            } else {
                caveState[playerName].count = Math.max(0, caveState[playerName].count - 1);
            }
        },

        cardInTheCave(playerName) {
            return caveState[playerName]?.count > 0 ? caveState[playerName].count : 0;
        },

        renamePlayer(oldPlayerName, newPlayerName) {
            if (caveState[oldPlayerName]) {
                caveState[newPlayerName] = caveState[oldPlayerName];
                delete caveState[oldPlayerName];
            } else {
                console.warn(`Cave for player "${oldPlayerName}" not found. Cannot rename to "${newPlayerName}".`);
                //caveState[newPlayerName] = { caveType: "cave", count: 0 };
            }
        },

        resetCave(playerName) {
            if (caveState[playerName]) {
                caveState[playerName].count = 0;
            } else {
                console.warn(`Cave for player "${playerName}" not found. Cannot reset.`);
            }
        },
    }
}

export { useCaveState };