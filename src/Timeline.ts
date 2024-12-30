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

export class ActionTimeline {
  actors: Actor[];
  totalAV: number;

  constructor(actors: Actor[], totalAV: number) {
    this.actors = actors;
    this.totalAV = totalAV;
  }

  // Get the actor with the lowest current AV (who should act next)
  getNextActor(): Actor {
    const minAV = Math.min(...this.actors.map(actor => actor.currentAV));
    return this.actors.find(actor => actor.currentAV === minAV)!; // Only one actor will have the lowest AV
  }

  simulateTurn(): { actor: string; actionAV: number }[] {
    let totalAVElapsed = 0; // Track the total AV elapsed
    const timelineLogs: { actor: string; actionAV: number }[] = [];
  
    while (totalAVElapsed < this.totalAV) {
      // Find the minimum AV to subtract from all actors (actor who acts next)
      const avToSubtract = Math.min(...this.actors.map(actor => actor.currentAV));
      console.log(this.actors.map(actor => actor.currentAV)); // Debugging log
  
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
  
      // Find the actor with the minimum AV (who should act next)
      const nextActor = this.getNextActor();
  
      // Log the actor’s action
      timelineLogs.push({ actor: nextActor.name, actionAV: totalAVElapsed });
  
      // Reset the selected actor's current AV to its base value
      nextActor.resetAV();
  
      // If total AV elapsed exceeds or matches the total, break the loop
      if (totalAVElapsed >= this.totalAV) {
        break;
      }
    }
  
    return timelineLogs;
  
}

}