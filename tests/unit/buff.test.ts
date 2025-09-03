import { describe, it, expect } from 'vitest'
import { battleReducer } from "../../src/battle/battleReducer"
import { BattleState, BattleAction, UnitState, BuffState } from "../../src/battle/battleTypes"

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
      effects: { spdChange: 100 }
    }
    state = battleReducer(state, { type: 'APPLY_BUFF', payload: { unitId: 'u1', buff: spdBuff } })

    // Second action (tick 150)
    state = battleReducer(state, { type: 'SIMULATE_NEXT' })
    expect(state.globalTick).toBe(150)

    // Third action (tick 200)
    state = battleReducer(state, { type: 'SIMULATE_NEXT' })
    expect(state.globalTick).toBe(200)
    console.log(state)

    // Buff should expire here — back to SPD 100, baseAV = 100
    state = battleReducer(state, { type: 'SIMULATE_NEXT' })
    expect(state.globalTick).toBe(300)
  })
})
