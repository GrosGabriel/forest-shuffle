import { toGlauresForests } from "../../model/to-glaure-forest.js";


let glauresForestState = $state({});

const useGlauresForestState = () => {
    return {
        get glauresForest() {
            return glauresForestState;
        },
        set glauresForest(realForest) {
            if (!realForest?.playerName) {
                glauresForestState = {};
                return;
            }

            glauresForestState = toGlauresForests([realForest])[0] ?? {};
        },

        get debugForest() {
            return {
                playerName: glauresForestState.playerName,
                points: glauresForestState.points,

                treeCounts: {
                    beech: glauresForestState.beechCount,
                    oak: glauresForestState.oakCount,
                    birch: glauresForestState.birchCount,
                },

                cards: (glauresForestState.cards ?? [])
                    .filter((card) => card.count > 0)
                    .map((card) => ({
                        name: card.name,
                        count: card.count,
                        points: card.points,

                        params: card.params?.map((param) => ({
                            name: param.name,
                            value: param.value,
                        })),
                    })),
            };
        },


    };
};

export { useGlauresForestState };