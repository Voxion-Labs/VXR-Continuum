// src/crdt/VectorClock.ts

export enum VectorClockComparison {
  LESS = 'LESS',
  EQUAL = 'EQUAL',
  GREATER = 'GREATER',
  CONCURRENT = 'CONCURRENT'
}

export class VectorClock {
  private clock: Record<string, number>;
  private readonly nodeId: string;

  constructor(nodeId: string, initialClock: Record<string, number> = {}) {
    this.nodeId = nodeId;
    // Deep copy to prevent reference mutations
    this.clock = { ...initialClock };
    if (!(this.nodeId in this.clock)) {
      this.clock[this.nodeId] = 0;
    }
  }

  /**
   * Increments the logical clock counter for the current node.
   */
  public increment(): void {
    this.clock[this.nodeId] = (this.clock[this.nodeId] || 0) + 1;
  }

  /**
   * Merges this vector clock with another, taking the element-wise maximum.
   */
  public merge(remoteClock: VectorClock): void {
    const remoteState = remoteClock.getState();
    for (const [node, time] of Object.entries(remoteState)) {
      this.clock[node] = Math.max(this.clock[node] || 0, time);
    }
  }

  /**
   * Compares this vector clock with another.
   * Returns:
   * - VectorClockComparison.GREATER if this clock is causally ahead of otherClock.
   * - VectorClockComparison.LESS if this clock is causally behind otherClock.
   * - VectorClockComparison.EQUAL if both clocks are identical.
   * - VectorClockComparison.CONCURRENT if the clocks represent concurrent modifications.
   */
  public compare(otherClock: VectorClock): VectorClockComparison {
    let isGreater = false;
    let isLess = false;
    const otherState = otherClock.getState();
    
    const allNodes = new Set([...Object.keys(this.clock), ...Object.keys(otherState)]);

    for (const node of allNodes) {
      const localTime = this.clock[node] || 0;
      const remoteTime = otherState[node] || 0;

      if (localTime > remoteTime) {
        isGreater = true;
      } else if (localTime < remoteTime) {
        isLess = true;
      }
    }

    if (isGreater && isLess) {
      return VectorClockComparison.CONCURRENT;
    }
    if (isGreater && !isLess) {
      return VectorClockComparison.GREATER;
    }
    if (!isGreater && isLess) {
      return VectorClockComparison.LESS;
    }
    return VectorClockComparison.EQUAL;
  }

  /**
   * Returns a copy of the underlying clock state.
   */
  public getState(): Record<string, number> {
    return { ...this.clock };
  }
}