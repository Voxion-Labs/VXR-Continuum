// src/crdt/StateManager.ts

import { VectorClock, VectorClockComparison } from './VectorClock';

export interface CRDTEntry<T> {
  value: T;
  clock: Record<string, number>;
  timestamp: number; // Wall-clock fallback for exact concurrent hits
}

export class StateManager<T> {
  private state: Map<string, CRDTEntry<T>>;
  private localClock: VectorClock;
  private readonly nodeId: string;

  constructor(nodeId: string, initialState?: Record<string, CRDTEntry<T>>) {
    this.nodeId = nodeId;
    this.state = new Map();
    this.localClock = new VectorClock(nodeId);

    if (initialState) {
      for (const [key, entry] of Object.entries(initialState)) {
        this.state.set(key, {
          value: entry.value,
          clock: { ...entry.clock },
          timestamp: entry.timestamp
        });
        
        // Ensure local node is aware of the remote causal history from the initial state
        const entryClock = new VectorClock(nodeId, entry.clock);
        this.localClock.merge(entryClock);
      }
    }
  }

  /**
   * Updates a local value, increments the vector clock, and records the physical timestamp.
   */
  public set(key: string, value: T): void {
    this.localClock.increment();
    this.state.set(key, {
      value,
      clock: this.localClock.getState(),
      timestamp: Date.now()
    });
  }

  /**
   * Retrieves the value associated with the specified key.
   */
  public get(key: string): T | undefined {
    return this.state.get(key)?.value;
  }

  /**
   * Returns a deep copy of the full CRDT state record for remote sync.
   */
  public getFullState(): Record<string, CRDTEntry<T>> {
    const result: Record<string, CRDTEntry<T>> = {};
    this.state.forEach((value, key) => {
      result[key] = {
        value: value.value,
        clock: { ...value.clock },
        timestamp: value.timestamp
      };
    });
    return result;
  }

  /**
   * Merges remote CRDT state into local state resolving conflicts deterministically.
   */
  public merge(remoteState: Record<string, CRDTEntry<T>>): void {
    for (const [key, remoteEntry] of Object.entries(remoteState)) {
      const localEntry = this.state.get(key);

      if (!localEntry) {
        // Safe adoption: we have no local history for this key
        this.state.set(key, {
          value: remoteEntry.value,
          clock: { ...remoteEntry.clock },
          timestamp: remoteEntry.timestamp
        });
        
        const remoteClock = new VectorClock(this.nodeId, remoteEntry.clock);
        this.localClock.merge(remoteClock);
        continue;
      }

      // Perform a causal check on the clocks associated with these specific values
      const tempLocalClock = new VectorClock(this.nodeId, localEntry.clock);
      const tempRemoteClock = new VectorClock('remote', remoteEntry.clock);
      const comparison = tempLocalClock.compare(tempRemoteClock);

      if (comparison === VectorClockComparison.LESS) {
        // Remote is strictly newer, adopt it
        this.state.set(key, {
          value: remoteEntry.value,
          clock: { ...remoteEntry.clock },
          timestamp: remoteEntry.timestamp
        });
      } else if (comparison === VectorClockComparison.CONCURRENT) {
        // Concurrent conflict: Resolve using Last-Write-Wins (LWW) physical timestamp
        if (remoteEntry.timestamp > localEntry.timestamp) {
          this.state.set(key, {
            value: remoteEntry.value,
            clock: { ...remoteEntry.clock },
            timestamp: remoteEntry.timestamp
          });
        } else if (remoteEntry.timestamp === localEntry.timestamp) {
          // Break tie lexically on serialized value to guarantee deterministic convergence
          const localString = JSON.stringify(localEntry.value);
          const remoteString = JSON.stringify(remoteEntry.value);
          if (remoteString > localString) {
            this.state.set(key, {
              value: remoteEntry.value,
              clock: { ...remoteEntry.clock },
              timestamp: remoteEntry.timestamp
            });
          }
        }
      }
      // If comparison is GREATER or EQUAL, the local state is kept as it is causally dominant/equivalent.

      // Inform local node's clock of the remote causal history
      const remoteClock = new VectorClock(this.nodeId, remoteEntry.clock);
      this.localClock.merge(remoteClock);
    }
  }

  /**
   * Retrieves the current state of the local vector clock.
   */
  public getLocalClockState(): Record<string, number> {
    return this.localClock.getState();
  }
}