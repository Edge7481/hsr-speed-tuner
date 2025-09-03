/*
how to resolve buffs?
have aura buffs be permanent
let units be able to give each other buffs
simplest way would be to separate source and target and have them be separate things?
*/

export interface BuffState {
    id: string                  // unique identifier for the buff type
    belongsTo?: string       // who applied it, for turn-based expiry logic
    duration?: number           // in turns for targeted buffs
    propagateTo?: string[]          // array of BUFF IDs linked (for things like auras)
    effects: {
        spdChange?: number
        advance?: number      // fraction of Base AV
        delay?: number        // fraction of Base AV
        // extendable with more effects
    }
}

// Unit
export interface UnitState {
    id: string
    name: string
    baseSPD: number
    currentSPD: number
    baseAV: number
    currentAV: number
    buffs: BuffState[]
    faction: 'ally' | 'enemy'
}

// Heap entry (used internally for turn order)
export interface TimelineEntry {
    unitId: string
    nextActionAV: number
    actionCount: number
}

// Log of what happened
export interface TimelineEvent {
    tick: number
    unitId: string
    actionType: string
    stateSnapshot: UnitState[]
}

// Global battle state
export interface BattleState {
    activeUnitId?: string
    units: Record<string, UnitState>
    heap: TimelineEntry[]
    events: TimelineEvent[]
    globalTick: number
}

export type BattleAction =
    | {
        type: 'INIT_BATTLE'
        payload: { units: Omit<UnitState, 'baseAV' | 'currentAV' | 'buffs'>[] }
    }
    | { type: 'PROGRESS_TIMELINE' } // advance globalTick to the next unit's turn
    | { type: 'START_TURN'; payload: { unitId: string } } // marks a unit as active, buffs can be applied
    | {
        type: 'ACT_UNIT'
        payload: {
            unitId: string
            actionType: string // could be enum or union of possible action types
            actionCount: number
        }
    }
    | { type: 'APPLY_BUFF'; payload: { unitId: string; buff: BuffState } }
    | { type: 'APPLY_EDIT'; payload: { editPoint: number; modification: (state: BattleState) => void } }
    | { type: 'SET_SPD'; payload: { unitId: string; newSPD: number } }
    | { type: 'RESET' }
    | { type: 'SIMULATE_NEXT' }
    | { type: 'CLEAR_BUFF'; payload: {buff: BuffState}}

