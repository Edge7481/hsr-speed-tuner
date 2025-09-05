import { expect, test } from "vitest"
import { battleReducer } from "../../src/reducers/battleReducer"
import { runSimulation } from "../../src/reducers/simulator"
import { source } from "framer-motion/client"

test("Alice gets +20 SPD buff after turn 1 and keeps it for 3 turns", () => {
  const initial = battleReducer(undefined as any, {
    type: "INIT_BATTLE",
    payload: { units: [{ id: "u1", name: "Alice", baseSPD: 100 }] }
  })

  const templates = [
    {
      id: "spdBoost",
      effects: { spdChangeFlat: 20 },  
      duration: 3,
      schedule: [
        {
          source: 'u1',
          target: 'u1',
          turns: [1]
        }
      ]
    }
  ]

  const result = runSimulation(
    { ...initial, buffTemplates: templates },
    5
  )

  // Verify ticks: first tick is 100 (10000 / 100), afterwards increments by ~83.333 (10000 / 120)
  const ticks = result.events.map(e => e.tick)
  expect(ticks[0]).toBeCloseTo(100, 3) // 1st action before buff
  expect(ticks[1]).toBeCloseTo(183.33,2)
  expect(ticks[2]).toBeCloseTo(266.666,2)
  expect(ticks[3]).toBeCloseTo(350, 2)
  expect(ticks[4]).toBeCloseTo(450,2)
})
