import { describe, it, expect } from 'vitest'
import { battleReducer } from "../../src/reducers/battleReducer"
import { BattleState, BattleAction, UnitState, BuffState } from "../../src/types/battleTypes"

describe('Buff application with duration', () => {
    it('applies +100 SPD buff for 2 turns after first action', () => {
        // Initial setup: 1 unit with 100 SPD
        const initialUnit: UnitState = {
            id: 'u1',
            name: 'Test Unit',
            baseSPD: 100,
            currentSPD: 100,
            baseAV: 10000 / 100,
            currentAV: 10000 / 100, // first action at 100
            buffs: []
        }

        let state: BattleState = {
            activeUnitId: undefined,
            units: { u1: initialUnit },
            heap: [{ unitId: 'u1', nextActionAV: initialUnit.currentAV, actionCount: 0 }],
            events: [],
            globalTick: 0
        }

        // First action (tick 100)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(100)

        // Apply +100 SPD buff lasting 2 turns
        const spdBuff: BuffState = {
            id: 'buff1',
            duration: 2,
            belongsTo: 'u1',
            effects: { spdChangeFlat: 100 }
        }
        state = battleReducer(state, { type: 'APPLY_BUFF', payload: { unitId: 'u1', buff: spdBuff } })

        // Second action (tick 150)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(150)

        // Third action (tick 200)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(200)

        // Buff should expire here — back to SPD 100, baseAV = 100
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(300)
    })
})

import { applyAuraBuff } from "../../src/utils/buffHelper"

describe('Aura buff application', () => {
    it('applies a 2-turn aura from support to DPS and expires correctly', () => {
        // Initial setup: 2 units with 100 SPD
        const support: UnitState = {
            id: 'support',
            name: 'Support',
            baseSPD: 100,
            currentSPD: 100,
            baseAV: 10000 / 100,
            currentAV: 10000 / 100,
            buffs: []
        }
        const dps: UnitState = {
            id: 'dps',
            name: 'DPS',
            baseSPD: 100,
            currentSPD: 100,
            baseAV: 10000 / 100,
            currentAV: 10000 / 100 * 1.5, // 50% delay to intersperse actions
            buffs: []
        }

        let state: BattleState = {
            activeUnitId: undefined,
            units: { support, dps },
            heap: [
                { unitId: 'support', nextActionAV: support.currentAV, actionCount: 0 },
                { unitId: 'dps', nextActionAV: dps.currentAV, actionCount: 0 }
            ],
            events: [],
            globalTick: 0
        }

        // Support's first action (tick 100)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(100)

        // Support applies aura to DPS: +0 spd, 2 turns
        const auraBuff: BuffState = {
            id: 'aura1',
            belongsTo: 'support',
            duration: 2,
            effects: { spdChangeFlat: 0 }
        }

        state = applyAuraBuff(state, 'support', auraBuff, ['support', 'dps'])

        // DPS's action (tick 150)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(150)

        // Check DPS has an active buff belonging to support
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(true)

        // Support's second action (tick 200)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(200)

        // DPS's second action (tick 250)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(250)

        // Check DPS still has active buff from support
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(true)

        // Check that support has a buff that propagates to DPS during this interval
        expect(state.units.support.buffs.some(b => b.propagateTo?.some(pb => pb.belongsTo === 'support'))).toBe(true)

        // Support's third action (tick 300) — aura should expire
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(300)

        // DPS should no longer have the propagated buff
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(false)

        // Support’s aura buff has expired
        expect(state.units.support.buffs.some(b => b.id === 'aura1')).toBe(false)

    })
})

describe('Aura SPD buff application', () => {
    it('applies +100 SPD aura from support to DPS and expires correctly', () => {
        // Initial setup: 2 units with 100 SPD
        const support: UnitState = {
            id: 'support',
            name: 'Support',
            baseSPD: 100,
            currentSPD: 100,
            baseAV: 10000 / 100,
            currentAV: 10000 / 100,
            buffs: []
        }
        const dps: UnitState = {
            id: 'dps',
            name: 'DPS',
            baseSPD: 100,
            currentSPD: 100,
            baseAV: 10000 / 100,
            currentAV: 10000 / 100 * 1.5, // 50% delay to intersperse actions
            buffs: []
        }

        let state: BattleState = {
            activeUnitId: undefined,
            units: { support, dps },
            heap: [
                { unitId: 'support', nextActionAV: support.currentAV, actionCount: 0 },
                { unitId: 'dps', nextActionAV: dps.currentAV, actionCount: 0 }
            ],
            events: [],
            globalTick: 0
        }

        // Support's first action (tick 100)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(100)

        // Support applies aura: +100 SPD, 2 turns
        const auraBuff: BuffState = {
            id: 'aura1',
            belongsTo: 'support',
            duration: 2,
            effects: { spdChangeFlat: 100 },
            propagateTo: [] // will be set internally if using helper
        }
        state = applyAuraBuff(state, 'support', auraBuff, ['support', 'dps'])

        // After applying aura, both units should have +100 SPD
        expect(state.units.support.currentSPD).toBe(200)
        expect(state.units.dps.currentSPD).toBe(200)

        // Check AVs for the next few actions
        // AV = 10000 / SPD
        expect(state.units.support.baseAV).toBeCloseTo(50)
        expect(state.units.dps.baseAV).toBeCloseTo(50)

        // Second action (DPS acts first now, tick 125)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(125)
        expect(state.activeUnitId).toBeUndefined()
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(true)

        // Support second action (tick 150)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(150)
        expect(state.units.support.buffs.some(b => b.id === 'aura1')).toBe(true)

        // DPS third action (tick 175)
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(175)
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(true)

        // Support third action (tick 200) — aura expires
        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(200)
        expect(state.units.support.buffs.some(b => b.id === 'aura1')).toBe(false)
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(false)

        state = battleReducer(state, { type: 'SIMULATE_NEXT' })
        expect(state.globalTick).toBe(250)
        expect(state.units.support.buffs.some(b => b.id === 'aura1')).toBe(false)
        expect(state.units.dps.buffs.some(b => b.belongsTo === 'support')).toBe(false)

        // AVs should reset to original SPD 100
        expect(state.units.support.currentSPD).toBe(100)
        expect(state.units.dps.currentSPD).toBe(100)
        expect(state.units.support.baseAV).toBeCloseTo(100)
        expect(state.units.dps.baseAV).toBeCloseTo(100)
    })
})
