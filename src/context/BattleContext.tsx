import React, { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { battleReducer } from '../reducers/battleReducer';
import { BattleState, BattleAction } from '../types/battleTypes';

interface BattleContextType {
  state: BattleState;
  dispatch: Dispatch<BattleAction>;
}

const initialState: BattleState = {
  units: {},
  heap: [],
  events: [],
  globalTick: 0,
  activeUnitId: undefined
};

export const BattleContext = createContext<BattleContextType>({
  state: initialState,
  dispatch: () => {}
});

export const BattleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(battleReducer, initialState);

  return (
    <BattleContext.Provider value={{ state, dispatch }}>
      {children}
    </BattleContext.Provider>
  );
};
