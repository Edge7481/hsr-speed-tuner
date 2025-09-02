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

            const heapCopy = [...state.heap]
            const entry = popMin(heapCopy) // unit with lowest AV
            const actingUnit = { ...state.units[entry.unitId] }

            // Advance time
            const tickAdvance = entry.nextActionAV
            const globalTick = state.globalTick + tickAdvance

            // Subtract AV from all units
            const unitsCopy: Record<string, UnitState> = {}
            Object.values(state.units).forEach(u => {
                unitsCopy[u.id] = { ...u, currentAV: u.currentAV - tickAdvance }
            })

            // === Unit acts ===
            const actionType = 'default' // placeholder, UI chooses later

            const snapshot = Object.values(unitsCopy).map(u => ({ ...u }))
            const event: TimelineEvent = {
                tick: globalTick,
                unitId: actingUnit.id,
                actionType,
                stateSnapshot: snapshot
            }

            // Reset acting unit’s AV
            const updatedUnit = {
                ...unitsCopy[actingUnit.id],
                baseAV: 10000 / actingUnit.currentSPD,
                currentAV: 10000 / actingUnit.currentSPD
            }
            unitsCopy[actingUnit.id] = updatedUnit

            heapCopy.push({
                unitId: updatedUnit.id,
                nextActionAV: updatedUnit.currentAV,
                actionCount: entry.actionCount + 1
            })

            return {
                ...state,
                units: unitsCopy,
                heap: buildMinHeap(heapCopy),
                events: [...state.events, event],
                globalTick
            }
        }

        case 'APPLY_BUFF': {
            const { unitId, buff } = action.payload
            const unit = { ...state.units[unitId] }
            const unitsCopy = { ...state.units }

            unit.buffs = [...unit.buffs, buff]

            if (buff.effects.spdChange) {
                const oldSPD = unit.currentSPD
                unit.currentSPD += buff.effects.spdChange
                const newSPD = unit.currentSPD
                unit.currentAV = unit.currentAV * (oldSPD / newSPD)
                unit.baseAV = 10000 / newSPD
            }

            if (buff.effects.advance || buff.effects.delay) {
                const delta = unit.baseAV * ((buff.effects.advance ?? 0) - (buff.effects.delay ?? 0))
                unit.currentAV = Math.max(0, unit.currentAV - delta)
            }

            unitsCopy[unitId] = unit
            return { ...state, units: unitsCopy }
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
