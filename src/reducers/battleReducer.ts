import { BattleState, UnitState, TimelineEntry, TimelineEvent, BattleAction, BuffState } from "../types/battleTypes"
import { instantiateBuff } from "../utils/buffHelper"
import { buildMinHeap, popMin } from "../utils/util"

export function battleReducer(state: BattleState, action: BattleAction): BattleState {
    switch (action.type) {
        case 'INIT_BATTLE': {
            const units: Record<string, UnitState> = {}
            const heap: TimelineEntry[] = []

            action.payload.units.forEach(u => {
                const baseAV = 10000 / u.baseSPD
                units[u.id] = {
                    ...u,
                    currentSPD: u.baseSPD,
                    baseAV: baseAV,
                    currentAV: baseAV,
                    buffs: []
                }
                heap.push({ unitId: u.id, nextActionAV: baseAV, actionCount: 0 })
            })

            return {
                units,
                heap: buildMinHeap(heap),
                events: [],
                globalTick: 0
            }
        }

        case 'SIMULATE_NEXT': {
            if (state.heap.length === 0) return state

            // 1. advance timeline
            let nextState = battleReducer(state, { type: 'PROGRESS_TIMELINE' })

            const unitId = nextState.activeUnitId!

            // 2. start turn
            nextState = battleReducer(nextState, { type: 'START_TURN', payload: { unitId } })

            // 3. act unit
            nextState = battleReducer(nextState, {
                type: 'ACT_UNIT',
                payload: { unitId, actionType: 'default', actionCount: nextState.heap.find(e => e.unitId === unitId)?.actionCount ?? 0 }
            })

            console.log(nextState.units)

            return nextState
        }

        case 'PROGRESS_TIMELINE': {
            // Find the next unit from the heap but don't pop it
            const next = state.heap[0]
            return { ...state, globalTick: next.nextActionAV, activeUnitId: next.unitId }
        }

        case 'START_TURN': {
            const unit = state.units[action.payload.unitId]
            let nextState = { ...state } // start with current state

            // Track buffs that will expire
            const expiredBuffs: BuffState[] = []

            // Decrement durations but do not remove buffs yet
            const updatedBuffs = unit.buffs.map(b => {
                if (b.duration !== undefined) {
                    const newDuration = b.duration - 1
                    if (newDuration <= 0) {
                        expiredBuffs.push(b)
                    }
                    return { ...b, duration: newDuration }
                }
                return b // permanent buff
            })

            // Update the unit with decremented durations
            const unitsCopy = { ...nextState.units, [unit.id]: { ...unit, buffs: updatedBuffs } }
            nextState = { ...nextState, units: unitsCopy, activeUnitId: unit.id }

            // Clear expired buffs via reducer calls
            expiredBuffs.forEach(buff => {
                nextState = battleReducer(nextState, {
                    type: 'CLEAR_BUFF',
                    payload: { buff }
                })
            })

            return nextState
        }




        case 'ACT_UNIT': {
            const unit = state.units[action.payload.unitId]
            const heapCopy = state.heap.filter(e => e.unitId !== unit.id)
            const updatedUnit = { ...unit, currentAV: unit.currentAV + unit.baseAV }

            heapCopy.push({ unitId: unit.id, nextActionAV: updatedUnit.currentAV, actionCount: action.payload.actionCount + 1 })

            const snapshot = Object.values(state.units).map(u => ({ ...u }))
            const event: TimelineEvent = {
                tick: state.globalTick,
                unitId: unit.id,
                actionType: action.payload.actionType,
                stateSnapshot: snapshot
            }

            // Check if any buffs should trigger
            state.buffTemplates?.forEach(template => {
                const triggers = template.schedule[unit.id]
                if (triggers?.includes(action.payload.actionCount + 1)) {
                    const buff = instantiateBuff(template, unit.id)
                    state = battleReducer(state, {
                        type: "APPLY_BUFF",
                        payload: { unitId: unit.id, buff }
                    })
                }
            })


            return {
                ...state,
                units: { ...state.units, [unit.id]: updatedUnit },
                heap: buildMinHeap(heapCopy),
                events: [...state.events, event],
                activeUnitId: undefined
            }
        }


        case 'APPLY_BUFF': {
            const { unitId, buff } = action.payload
            let nextState = { ...state }

            // Add the buff to the unit
            const unit = { ...nextState.units[unitId] }
            unit.buffs = [...unit.buffs, buff]
            nextState.units = { ...nextState.units, [unitId]: unit }


            // If buff affects speed, dispatch SET_SPD
            if (buff.effects.spdChangeFlat || buff.effects.spdChangePercent) {
                const totalFlat = unit.buffs.reduce((sum, b) => sum + (b.effects.spdChangeFlat ?? 0), 0)
                const totalPercent = unit.buffs.reduce((sum, b) => sum + (b.effects.spdChangePercent ?? 0), 0)

                const newSPD = unit.baseSPD * (1 + totalPercent) + totalFlat
                nextState = battleReducer(nextState, {
                    type: 'SET_SPD',
                    payload: { unitId, newSPD }
                })
            }

            // Apply advance/delay
            if (buff.effects.advance || buff.effects.delay) {
                const delta = unit.baseAV * ((buff.effects.advance ?? 0) - (buff.effects.delay ?? 0))
                const updatedUnit = { ...nextState.units[unitId], currentAV: Math.max(nextState.globalTick, nextState.units[unitId].currentAV - delta) }
                nextState.units = { ...nextState.units, [unitId]: updatedUnit }
            }

            // Rebuild heap based on updated AVs
            const heapCopy: TimelineEntry[] = nextState.heap.map(e => ({
                ...e,
                nextActionAV: nextState.units[e.unitId].currentAV
            }))

            console.log("applying", buff, "new state", nextState.units)


            return { ...nextState, heap: buildMinHeap(heapCopy) }
        }


        case 'SET_SPD': {
            const { unitId, newSPD } = action.payload
            const unit = { ...state.units[unitId] }
            const unitsCopy = { ...state.units }

            const oldSPD = unit.currentSPD
            unit.currentSPD = newSPD
            unit.currentAV = state.globalTick + (unit.currentAV - state.globalTick) * (oldSPD / newSPD)
            unit.baseAV = 10000 / newSPD

            unitsCopy[unitId] = unit

            const heapCopy: TimelineEntry[] = state.heap.map(e => ({
                ...e,
                nextActionAV: unitsCopy[e.unitId].currentAV
            }))

            return { ...state, units: unitsCopy, heap: buildMinHeap(heapCopy) }
        }

        case 'CLEAR_BUFF': {
            const buffToClear: BuffState = action.payload.buff
            let nextState = { ...state }


            // First, clear the buff from all units that have it
            Object.values(nextState.units).forEach(unit => {
                const index = unit.buffs.findIndex(b => b.id === buffToClear.id)
                if (index !== -1) {
                    const [removed] = unit.buffs.splice(index, 1)

                    // If it had a SPD effect, call SET_SPD internally
                    if (removed.effects.spdChangeFlat || removed.effects.spdChangePercent) {

                        const totalFlat = unit.buffs.reduce((sum, b) => sum + (b.effects.spdChangeFlat ?? 0), 0)
                        const totalPercent = unit.buffs.reduce((sum, b) => sum + (b.effects.spdChangePercent ?? 0), 0)

                        const newSPD = unit.baseSPD * (1 + totalPercent) + totalFlat
                        nextState = battleReducer(nextState, {
                            type: 'SET_SPD',
                            payload: { unitId: unit.id, newSPD }
                        })
                    }
                }
            })

            // Then, clear all propagated buffs recursively
            if (buffToClear.propagateTo) {
                buffToClear.propagateTo.forEach(targetBuff => {
                    nextState = battleReducer(nextState, {
                        type: 'CLEAR_BUFF',
                        payload: { buff: targetBuff }
                    })
                })
            }

            return nextState
        }



        case 'APPLY_EDIT': {
            const { editPoint, modification } = action.payload
            const truncatedEvents = state.events.slice(0, editPoint + 1)
            const snapshot = truncatedEvents[truncatedEvents.length - 1]?.stateSnapshot ?? []

            // Restore units
            const unitsCopy: Record<string, UnitState> = {}
            snapshot.forEach(u => { unitsCopy[u.id] = { ...u } })

            // Reset heap
            const heapCopy: TimelineEntry[] = []
            Object.values(unitsCopy).forEach(u => {
                heapCopy.push({ unitId: u.id, nextActionAV: u.currentAV, actionCount: 0 })
            })

            let newState: BattleState = {
                ...state,
                units: unitsCopy,
                heap: buildMinHeap(heapCopy),
                events: truncatedEvents,
                globalTick: truncatedEvents[truncatedEvents.length - 1]?.tick ?? 0
            }

            // Apply modification
            modification(newState)

            return newState
        }

        case 'RESET':
            return { units: {}, heap: [], events: [], globalTick: 0 }

        default:
            return state
    }
}
