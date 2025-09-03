import { describe, it, expect } from "vitest"
import { battleReducer } from "../../src/battle/battleReducer"
import { BattleState, BattleAction, UnitState } from "../../src/battle/battleTypes"


function makeUnit(id: string, name: string, spd: number): UnitState {
  const av = 10000 / spd
  return {
    id,
    name,
    baseSPD: spd,
    currentSPD: spd,
    baseAV: av,
    currentAV: av,
    buffs: [],
  }
}

function initUnits(): Omit<UnitState, "baseAV" | "currentAV" | "buffs">[] {
  return [
    { id: "a", name: "UnitA", baseSPD: 67, currentSPD: 67 },
    { id: "b", name: "UnitB", baseSPD: 133, currentSPD: 133 },
    { id: "c", name: "UnitC", baseSPD: 134, currentSPD: 134 },
    { id: "d", name: "UnitD", baseSPD: 202, currentSPD: 201 },
  ]
}

function initBattle(units: Omit<UnitState, "baseAV" | "currentAV" | "buffs">[]): BattleState {
  return battleReducer(undefined as any, {
    type: "INIT_BATTLE",
    payload: { units },
  })
}

function simulateUntil(state: BattleState, limit: number): BattleState {
  let s = state
  while (s.globalTick < limit) {
    s = battleReducer(s, { type: "SIMULATE_NEXT" })
  }
  return s
}

describe("Battle Reducer Hardcoded Timeline", () => {
  it("should match exact action sequence up to AV=150", () => {
    let state = initBattle(initUnits())
    state = simulateUntil(state, 150)

    const turnEvents = state.events
    console.log(turnEvents)

    // Hardcoded expected sequence. todo break ties
    const expected = [
      { unitId: "d", tick: 49.505 },
      { unitId: "c", tick: 74.627 },
      { unitId: "b", tick: 75.188 },
      { unitId: "d", tick: 99.010 },
      { unitId: "d", tick: 148.515 },
      { unitId: "a", tick: 149.254 },
      { unitId: "c", tick: 149.254 },
      { unitId: "b", tick: 150.376}
    ]

    expect(turnEvents.length).toBe(expected.length)

    for (let i = 0; i < expected.length; i++) {
      expect(turnEvents[i].unitId).toBe(expected[i].unitId)
      expect(turnEvents[i].tick).toBeCloseTo(expected[i].tick, 2)
    }
  })
})
