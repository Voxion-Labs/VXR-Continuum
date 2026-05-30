// src/utils/mockNetwork.ts

/**
 * Simulates network latency by returning a Promise that resolves after the specified milliseconds.
 * Useful for demonstrating eventual consistency and distributed synchronization delays.
 * 
 * @param ms Latency duration in milliseconds.
 */
export const simulateLatency = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility to manage mock Edge Node communication serialized within LocalStorage.
 * Simulates a shared cookie/localStorage-based mesh distribution network for state transfer.
 */
export const EdgeCookieNetwork = {
  /**
   * Serializes and writes the state to localStorage.
   * 
   * @param state The state object to serialize and save.
   */
  saveState: <T>(state: T): void => {
    try {
      localStorage.setItem('vxr_continuum_cookie', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to Edge Cookie storage:', error);
    }
  },
  
  /**
   * Reads, parses, and returns the serialized state from localStorage.
   * 
   * @returns The parsed state object of type T, or null if empty or invalid.
   */
  loadState: <T>(): T | null => {
    try {
      const data = localStorage.getItem('vxr_continuum_cookie');
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error('Failed to load state from Edge Cookie storage:', error);
      return null;
    }
  },

  /**
   * Clears the simulated edge cookie storage partition.
   */
  clearState: (): void => {
    try {
      localStorage.removeItem('vxr_continuum_cookie');
    } catch (error) {
      console.error('Failed to clear Edge Cookie storage:', error);
    }
  }
};