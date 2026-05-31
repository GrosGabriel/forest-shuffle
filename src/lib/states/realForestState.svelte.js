import { predictionsToRealForest } from "../../model/prediction-yolo-to-real-forest.js";
import { toGlauresForests } from "../../model/to-glaure-forest.js";
import { TreeColor } from "../../model/card-color.js";

let realForestState = $state({"Joueur 1" : {playerName : "Joueur 1" , forest : []}});

/*
la realForest  a la forme 

{
    "Alice": {
    playerName : "Alice",
    forest : [
            {
            "tree": "stonePine",
            "symbol": "rose",
            "id" : idUnique,
            "up": [
                    {
                    "cardName": "eurasianJay",
                    "color": "orange"
                    "id" : idUnique
                    },
                ],
            "down": [],
            "left": [],
            "right": []
            },
        ]

    },

}

*/

const useRealForestState = () => {
    return {
        get realForest() {
            return realForestState;
        },

        get playerRealForest() {
            return (playerName) => {
                /* Retourne la foret dans la liste realForestState qui a comme playerName playerName */
                return realForestState[playerName];
            };
        },

        loadFromPredictions2(playerName, predictions) {
                realForestState[playerName] = predictionsToRealForest(playerName, predictions);
        },


        loadFromPredictions(playerName, predictions) {
        
            const rf = predictionsToRealForest(playerName, predictions)
            realForestState[playerName] = rf
        },

        points2(playerName, cave = { caveType: 'cave', count: 0 }) {
            const realForest = realForestState[playerName];
            if (!realForest) return 0;

            return toGlauresForests([realForest], cave)[0]?.points ?? 0;
        }, 


        points(playerName, cave = {}) {
            const allRealForests = Object.values(realForestState)
                .filter(rf => rf && rf.forest);

            if (!allRealForests.length) return 0;

            const scored = toGlauresForests(allRealForests, cave);
            return scored.find(f => f.playerName == playerName)?.points ?? 0;
        },


        renamePlayer(oldName, newName) {
            if (realForestState[oldName]) {
                realForestState[newName] = realForestState[oldName];
                renamePlayerInTheForest(realForestState[newName], newName); // Assurez-vous de mettre à jour le playerName à l'intérieur de la forêt
                delete realForestState[oldName];
            } else {
                console.warn(`Real forest for player "${oldName}" not found. Cannot rename to "${newName}".`);
                //realForestState[newName] = { playerName: newName, allTrees: () => [] };
                //En vrai c'est pas grave, on peut modifier le nom avant d'envoyer une photo de sa forêt
                //Normalement n'arrive pas car quand on ajoute un joueur ça rajoute une forêt vide.
            }
        },

        removePlayer(playerName) {
            if (playerName in realForestState) {
                delete realForestState[playerName]
            } else {
                console.warn(`Impossible de supprimer la forêt du joueur ${playerName}`);
            }
        },

        addTree(playerName, treeName) {

            if (playerName in realForestState) {
                const newTree = {
                    tree: treeName,
                    symbol: TreeColor[treeName] || 'none',
                    id : crypto.randomUUID(),
                    up: [],
                    down: [],
                    left: [],
                    right: []
                };

                realForestState[playerName].forest.push(newTree);

            } else {
                console.warn(`Impossible d'ajouter un arbre à la forêt du joueur ${playerName} car elle n'existe pas.`);
            }
        },

        addPlayer(playerName) {
            if (!(playerName in realForestState)) {
                realForestState[playerName] = {playerName : playerName, forest : []}
            }
        },


        addCardOnTree(playerName, treeId, cardName, position, color = color.NONE) {
            const playerForest = realForestState[playerName];
            if (!playerForest) {
                console.warn(`Impossible d'ajouter une carte à la forêt du joueur ${playerName} car elle n'existe pas.`);
                return;
            }

            const tree = playerForest.forest.find(t => t.id === treeId);
            if (!tree) {
                console.warn(`Impossible de trouver l'arbre avec l'ID ${treeId} dans la forêt du joueur ${playerName}.`);
                return;
            }

            const card = { cardName, color, id : crypto.randomUUID() };
            tree[position].push(card);
        },

        updateTree(playerName, treeId, newTree) {
            realForestState[playerName].forest = realForestState[playerName].forest.map(tree =>
                tree.id === treeId ? newTree : tree
            );
        },

        deleteTree(playerName, treeId) {
            realForestState[playerName].forest = realForestState[playerName].forest.filter(tree => tree.id !== treeId) 
        },
    }
}

export { useRealForestState };

