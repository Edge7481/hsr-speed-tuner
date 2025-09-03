import { battleReducer } from "../reducers/battleReducer"
import { BattleState, BuffState } from "../types/battleTypes"

// Helper to apply aura buffs
export function applyAuraBuff(
    state: BattleState,
    sourceId: string,
    buffTemplate: BuffState,
    targetIds: string[]
): BattleState {
    let nextState = { ...state }

    // Apply copies of the buff to all targets (including the source)
    const targetBuffs: BuffState[] = targetIds.map(targetId => ({
        ...buffTemplate,
        id: `${buffTemplate.id}-${targetId}`, // unique per target
        duration: undefined,                  // permanent until source expires
        belongsTo: sourceId,
        propagateTo: []                        // copies do not propagate further
    }))



    // Create a “tracker” buff on the source to record all propagated copies
    const trackerBuff: BuffState = {
        ...buffTemplate,
        effects: {},
        duration: buffTemplate.duration,   // timed for source
        propagateTo: targetBuffs           // references all copies
    }

    nextState = battleReducer(nextState, {
        type: 'APPLY_BUFF',
        payload: { unitId: sourceId, buff: trackerBuff }
    })

    console.log('called on tracker')


    // Apply each target buff
    targetBuffs.forEach((buff, i) => {
        console.log('called on recipient')
        nextState = battleReducer(nextState, {
            type: 'APPLY_BUFF',
            payload: { unitId: targetIds[i], buff }
        })
    })

    return nextState
}
