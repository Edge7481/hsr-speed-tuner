// Buff
export interface BuffState {
    id: string
    duration: number // in turns
    effects: {
      spdChange?: number
      advance?: number // fraction of Base AV
      delay?: number   // fraction of Base AV
    }
  }
  
  // Unit
  export interface UnitState {
    id: string
    name: string
    baseSPD: number
    currentSPD: number
    baseAV: number
    currentAV: number
    buffs: BuffState[]
  }
  
  // Heap entry (used internally for turn order)
  export interface TimelineEntry {
    unitId: string
    nextActionAV: number
    actionCount: number
  }
  
  // Log of what happened
  export interface TimelineEvent {
    tick: number
    unitId: string
    actionType: string
    stateSnapshot: UnitState[]
  }
  
  // Global battle state
  export interface BattleState {
    units: Record<string, UnitState>
    heap: TimelineEntry[]
    events: TimelineEvent[]
    globalTick: number
  }
  