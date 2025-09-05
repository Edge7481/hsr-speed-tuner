import { expect, test } from "vitest"
import { battleReducer } from "../../src/reducers/battleReducer"
import {runSimulation} from "../../src/reducers/simulator"

test("Alice gets her speed buff on turn 1", () => {
  const initial = battleReducer(undefined as any, {
    type: "INIT_BATTLE",
    payload: { units: [{ id: "u1", name: "Alice", baseSPD: 100 }] }
  })

  const templates = [
    { id: "spdBoost", effects: { spdChangeFlat: 20 }, duration: 5, schedule: { u1: [1] } }
  ]
  const result = runSimulation({ ...initial, buffTemplates: templates }, 3)
  // console.log(result)
  expect(result.units.u1.currentSPD).toBeGreaterThan(100)
})
