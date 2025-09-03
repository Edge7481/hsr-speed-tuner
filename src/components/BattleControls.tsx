import React, { useContext, useState } from 'react';
import { BattleState, UnitState, BuffState } from '../types/battleTypes';
import { battleReducer } from '../reducers/battleReducer';
import { BattleContext } from '../context/BattleContext';

export const BattleControls = () => {
  const { state, dispatch } = useContext(BattleContext);
  const [simulatedActions, setSimulatedActions] = useState<string[]>([]);

  const initializeTeam = () => {
    const units: Record<string, UnitState> = {};
    for (let i = 1; i <= 4; i++) {
      const id = `unit${i}`;
      const spd = 160;
      units[id] = {
        id,
        name: `Unit ${i}`,
        baseSPD: spd,
        currentSPD: spd,
        baseAV: 10000 / spd,
        currentAV: 10000 / spd,
        buffs: []
      };
    }


    const heap = Object.values(units).map(u => ({
      unitId: u.id,
      nextActionAV: u.currentAV,
      actionCount: 0
    }));

    dispatch({
      type: 'RESET'
    });

    // Object.values(units).forEach(u =>
    //   dispatch({
    //     type: 'APPLY_BUFF',
    //     payload: { unitId: u.id, buff: { id: `init-${u.id}`, effects: {} } }
    //   })
    // );

    dispatch({
      type: 'INIT_BATTLE',
      payload: { units: Object.values(units) }
    });

    setSimulatedActions([]);
  };

  const simulateToAV = (maxAV: number) => {
    let nextState: BattleState = { ...state };
    const actions: string[] = [];

    while (true) {
      const nextUnit = nextState.heap[0];
      if (!nextUnit || nextUnit.nextActionAV > maxAV) break;

      nextState = battleReducer(nextState, { type: 'SIMULATE_NEXT' });
      if (nextState.activeUnitId) actions.push(nextState.activeUnitId);
    }

    setSimulatedActions(actions);
    console.log(simulatedActions)
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Battle Simulator</h2>
      <button onClick={initializeTeam} style={{ marginRight: '1rem' }}>
        Initialize Team
      </button>
      <button onClick={() => simulateToAV(250)}>Simulate to AV 250</button>

      <div style={{ marginTop: '1rem' }}>
        <h3>Action Order</h3>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {simulatedActions.map((unitId, i) => (
            <div
              key={i}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'lightblue',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
            >
              {unitId}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
