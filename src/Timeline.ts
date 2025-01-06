export class Actor {
  name: string;
  baseSPD: number;
  spdPercent: number;
  flatSPD: number;
  baseAV: number;
  currentAV: number;

  constructor(name: string, baseSPD: number, spdPercent: number = 0, flatSPD: number = 0) {
    this.name = name;
    this.baseSPD = baseSPD;
    this.spdPercent = spdPercent;
    this.flatSPD = flatSPD;

    const effectiveSPD = this.calculateEffectiveSPD();
    this.baseAV = this.calculateBaseAV(effectiveSPD);
    this.currentAV = this.baseAV;
  }

  // Calculate effective SPD based on base SPD, SPD%, and flat SPD
  calculateEffectiveSPD(): number {
    return this.baseSPD * (1 + this.spdPercent / 100) + this.flatSPD;
  }

  // Calculate base AV based on effective SPD
  calculateBaseAV(effectiveSPD: number): number {
    return 10000 / effectiveSPD; // Base AV calculation formula
  }

  // Recalculate AV whenever SPD modifiers change
  updateSpeed(spdPercent: number, flatSPD: number) {
    const oldSPD = this.calculateEffectiveSPD(); // Get the current effective SPD
    const oldAV = this.currentAV; // Save the current AV for recalculation

    // Update the speed modifiers
    this.spdPercent = spdPercent;
    this.flatSPD = flatSPD;

    // Recalculate base AV and effective SPD
    const newSPD = this.calculateEffectiveSPD();
    this.baseAV = this.calculateBaseAV(newSPD);

    // Adjust current AV using the formula AVnew = AVold * SPDold / SPDnew
    this.currentAV = oldAV * oldSPD / newSPD;
  }

  modifyAVForAction(actionAdvancePercent: number, actionDelayPercent: number) {
    const adjustment = this.baseAV * (actionAdvancePercent - actionDelayPercent);
    this.currentAV = Math.max(0, this.currentAV - adjustment);
  }

  setAVToZero() {
    this.currentAV = 0;
  }

  // Reset the actor's AV to their base AV
  resetAV() {
    this.currentAV = this.baseAV;
  }

  // Advance the actor's AV by subtracting the elapsed time
  applyTimeElapsed(timeElapsed: number) {
    this.currentAV -= timeElapsed;
  }
}

export enum ModifierType {
  IN_ACTION = 'IN_ACTION',
  POST_ACTION = 'POST_ACTION',
}

export interface Modifier {
  type: ModifierType;
  spdChange?: number; // Percent change (positive or negative)
  actionAdvancePercent?: number; // Action advance/delay change
  expiration: number;
  target: 'all' | string; // Either all actors or a specific actor name
  timeApplied: number; // Track the tick when this modifier is applied
  name: string;
}

export class ModifierHandler {
  modifiers: Modifier[];

  constructor() {
    this.modifiers = [];
  }

  // Add a new modifier
  addModifier(modifier: Modifier) {
    this.modifiers.push(modifier);
  }

  // Apply modifiers based on their type and the current tick
  applyModifiers(actors: Actor[], currentTick: number, modifierType: ModifierType) {
    actors.forEach(actor => {
      this.modifiers.forEach(modifier => {
        // If the modifier is active and matches the current target
        if (modifier.expiration > 0 && (modifier.target === 'all' || modifier.target === actor.name)) {
          // Apply modifiers if they match the given type and the expiration is still valid
          if (modifier.type === modifierType) {
            if (modifier.spdChange !== undefined) {
              actor.updateSpeed(actor.spdPercent + modifier.spdChange, actor.flatSPD);
            }
            if (modifier.actionAdvancePercent !== undefined) {
              // Apply action advance only for the current cycle
              actor.modifyAVForAction(modifier.actionAdvancePercent, 0); // Assuming no action delay for simplicity
            }
          }

          // Decrease expiration after each tick, tracking from pre-action
          modifier.expiration -= 1;
        }
      });
    });
  }
}




export class ActionTimeline {
  actors: Actor[];
  totalAV: number;
  modifierHandler: ModifierHandler;

  constructor(actors: Actor[], totalAV: number, modifierHandler: ModifierHandler) {
    this.actors = actors;
    this.totalAV = totalAV;
    this.modifierHandler = modifierHandler;
  }

  // Get the actor with the lowest current AV (who should act next)
  getNextActor(): Actor {
    const minAV = Math.min(...this.actors.map(actor => actor.currentAV));
    return this.actors.find(actor => actor.currentAV === minAV)!;
  }

  simulateTurn(): { actor: string; actionAV: number }[] {
    let totalAVElapsed = 0; // Track the total AV elapsed
    const timelineLogs: { actor: string; actionAV: number }[] = [];
    let currentTick = 0;

    while (totalAVElapsed < this.totalAV) {
      // Find the minimum AV to subtract from all actors
      const avToSubtract = Math.min(...this.actors.map(actor => actor.currentAV));

      // Calculate the projected total AV after this actor acts
      const projectedTotalAV = totalAVElapsed + avToSubtract;

      // If acting would exceed the total AV, break out of the loop
      if (projectedTotalAV > this.totalAV) {
        break;
      }

      // Add the AV to the total time elapsed
      totalAVElapsed += avToSubtract;

      // Subtract this minimum AV from all actors (update currentAV for each actor)
      this.actors.forEach(actor => actor.applyTimeElapsed(avToSubtract));

      // Apply IN_ACTION modifiers immediately after AV subtraction
      this.modifierHandler.applyModifiers(this.actors, currentTick, ModifierType.IN_ACTION);

      // Find the actor with the minimum AV (who should act next)
      const nextActor = this.getNextActor();

      // Log the actor’s action
      timelineLogs.push({ actor: nextActor.name, actionAV: totalAVElapsed });

      // Reset the selected actor's current AV to its base value
      nextActor.resetAV();

      // Apply POST_ACTION modifiers immediately after AV reset
      this.modifierHandler.applyModifiers(this.actors, currentTick, ModifierType.POST_ACTION);

      // Increment the tick count
      currentTick++;

      // If total AV elapsed exceeds or matches the total, break the loop
      if (totalAVElapsed >= this.totalAV) {
        break;
      }
    }

    return timelineLogs;
  }
}