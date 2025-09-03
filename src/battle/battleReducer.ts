import { BattleState, UnitState, TimelineEntry, TimelineEvent, BattleAction } from "./battleTypes"
import { buildMinHeap, popMin } from "./util"

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
                    baseAV,
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

            return nextState
        }

        case 'PROGRESS_TIMELINE': {
            // Find the next unit from the heap but don't pop it
            const next = state.heap[0]
            return { ...state, globalTick: next.nextActionAV, activeUnitId: next.unitId }
        }

        case 'START_TURN': {
            const unit = state.units[action.payload.unitId]
            return { ...state, activeUnitId: unit.id }
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
            const unit = { ...state.units[unitId] }
            const unitsCopy = { ...state.units }

            unit.buffs = [...unit.buffs, buff]

            if (buff.effects.spdChange) {
                //find remaining av and apply spd change to av
                const oldSPD = unit.currentSPD
                unit.currentSPD += buff.effects.spdChange
                const newSPD = unit.currentSPD
                const remainingTime = unit.currentAV - state.globalTick
                const newBaseAV = 10000 / newSPD
                unit.baseAV = newBaseAV
                unit.currentAV = state.globalTick + remainingTime * (oldSPD / newSPD)

            }

            if (buff.effects.advance || buff.effects.delay) {
                // set to either right now or apply advance
                const delta = unit.baseAV * ((buff.effects.advance ?? 0) - (buff.effects.delay ?? 0))
                unit.currentAV = Math.max(state.globalTick, unit.currentAV - delta)
            }

            unitsCopy[unitId] = unit

            //fix heap

            const heapCopy: TimelineEntry[] = state.heap.map(e => ({
                ...e,
                nextActionAV: unitsCopy[e.unitId].currentAV
            }))

            return {
                ...state,
                units: unitsCopy,
                heap: buildMinHeap(heapCopy)
            }
        }

        case 'SET_SPD': {
            const { unitId, newSPD } = action.payload
            const unit = { ...state.units[unitId] }
            const unitsCopy = { ...state.units }

            const oldSPD = unit.currentSPD
            unit.currentSPD = newSPD
            unit.currentAV = unit.currentAV * (oldSPD / newSPD)
            unit.baseAV = 10000 / newSPD

            unitsCopy[unitId] = unit
            return { ...state, units: unitsCopy }
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
