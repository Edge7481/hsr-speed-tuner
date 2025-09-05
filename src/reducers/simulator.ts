import { BattleState, BattleAction } from "../types/battleTypes"
import { battleReducer } from "./battleReducer"

export function runSimulation(
  initial: BattleState,
  steps: number
): BattleState {
  let state = initial
  for (let i = 0; i < steps; i++) {
    state = battleReducer(state, { type: "SIMULATE_NEXT" } as BattleAction)
    // console.log(state.units)
  }
  return state
}
