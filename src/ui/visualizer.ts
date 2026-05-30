// src/ui/visualizer.ts

import { StateManager, CRDTEntry, VectorClock, VectorClockComparison } from '../crdt';
import { EdgeCookieNetwork, simulateLatency } from '../utils/mockNetwork';

interface NetworkMesh {
  paris_node: Record<string, CRDTEntry<string>> | null;
  tokyo_node: Record<string, CRDTEntry<string>> | null;
}

export const initVisualizer = (containerId: string): void => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Set up dense grid visual structure
  container.innerHTML = `
    <div class="dashboard">
      
      <!-- LEFT COLUMN: Replicas -->
      <div class="node-grid">
        
        <!-- Paris Node Panel -->
        <div class="node-card" id="paris-card">
          <div class="node-header">
            <div class="node-title">🇪🇺 Node: Paris</div>
            <div class="status-badge synced" id="paris-status">
              <span class="status-led"></span>
              <span id="paris-status-text">Synced</span>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label" for="paris-input">Session Username</label>
            <input type="text" id="paris-input" class="text-input" placeholder="Enter username..." autocomplete="off">
          </div>
          <div class="metadata-panel">
            <div class="metadata-row">
              <span class="metadata-label">Logical Clock</span>
              <span class="metadata-value" id="paris-clock-val">-</span>
            </div>
            <div class="metadata-row">
              <span class="metadata-label">Last Timestamp</span>
              <span class="metadata-value" id="paris-time-val">-</span>
            </div>
            <div class="metadata-row" style="flex-direction: column; align-items: stretch; gap: 0.5rem; border-bottom: none; padding-bottom: 0;">
              <span class="metadata-label" style="margin-bottom: 0.25rem;">Raw CRDT State Frame</span>
              <pre class="raw-state-dump" id="paris-raw-val" style="margin: 0; background: #0f172a; color: #38bdf8; padding: 0.625rem; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.68rem; overflow: auto; max-height: 110px; text-align: left; border: 1px solid #334155; white-space: pre-wrap; word-break: break-all;"></pre>
            </div>
          </div>
        </div>

        <!-- Tokyo Node Panel -->
        <div class="node-card" id="tokyo-card">
          <div class="node-header">
            <div class="node-title">🇯🇵 Node: Tokyo</div>
            <div class="status-badge synced" id="tokyo-status">
              <span class="status-led"></span>
              <span id="tokyo-status-text">Synced</span>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label" for="tokyo-input">Session Username</label>
            <input type="text" id="tokyo-input" class="text-input" placeholder="Enter username..." autocomplete="off">
          </div>
          <div class="metadata-panel">
            <div class="metadata-row">
              <span class="metadata-label">Logical Clock</span>
              <span class="metadata-value" id="tokyo-clock-val">-</span>
            </div>
            <div class="metadata-row">
              <span class="metadata-label">Last Timestamp</span>
              <span class="metadata-value" id="tokyo-time-val">-</span>
            </div>
            <div class="metadata-row" style="flex-direction: column; align-items: stretch; gap: 0.5rem; border-bottom: none; padding-bottom: 0;">
              <span class="metadata-label" style="margin-bottom: 0.25rem;">Raw CRDT State Frame</span>
              <pre class="raw-state-dump" id="tokyo-raw-val" style="margin: 0; background: #0f172a; color: #38bdf8; padding: 0.625rem; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.68rem; overflow: auto; max-height: 110px; text-align: left; border: 1px solid #334155; white-space: pre-wrap; word-break: break-all;"></pre>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Control Room -->
      <div class="control-dock">
        
        <!-- System Telemetry Section -->
        <div class="telemetry-panel">
          <div class="panel-header">System Telemetry</div>
          <div class="telemetry-grid">
            <div class="telemetry-item">
              <span class="telemetry-label">Sync Latency</span>
              <span class="telemetry-value" id="telemetry-latency">0.22 ms</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">Payload Size</span>
              <span class="telemetry-value" id="telemetry-payload">184 bytes</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">Vector Drift</span>
              <span class="telemetry-value" id="telemetry-drift">0.00%</span>
            </div>
          </div>
        </div>

        <!-- Algorithmic Conflict Resolution Section -->
        <div class="math-panel">
          <div class="panel-header">Algorithmic Conflict Resolution</div>
          <div class="formula-block">
            <span class="formula-label">State Merge:</span>
            <span class="formula-math">∀k ∈ K, V_merged[k] = max(V_local[k], V_remote[k])</span>
          </div>
          <div class="formula-block">
            <span class="formula-label">LWW Fallback:</span>
            <span class="formula-math">T_winner = max(Timestamp_local, Timestamp_remote)</span>
          </div>
        </div>

        <!-- Network Synchronization Controls -->
        <button id="sync-btn" class="research-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
          </svg>
          Force Global Edge Sync
        </button>

        <div class="sync-progress-bar" id="sync-bar">
          <div class="sync-progress-fill" id="sync-fill"></div>
        </div>

        <!-- Simulated Event Terminal -->
        <div class="terminal-logs" id="terminal-logs">
          <!-- Active system logs populate here -->
        </div>
      </div>

    </div>
  `;

  // Initialize the independent Node CRDT managers
  const parisNode = new StateManager<string>('paris_node');
  const tokyoNode = new StateManager<string>('tokyo_node');

  // DOM Query Handles
  const parisCard = document.getElementById('paris-card') as HTMLDivElement;
  const tokyoCard = document.getElementById('tokyo-card') as HTMLDivElement;
  
  const parisInput = document.getElementById('paris-input') as HTMLInputElement;
  const tokyoInput = document.getElementById('tokyo-input') as HTMLInputElement;
  
  const parisStatus = document.getElementById('paris-status') as HTMLSpanElement;
  const tokyoStatus = document.getElementById('tokyo-status') as HTMLSpanElement;
  const parisStatusText = document.getElementById('paris-status-text') as HTMLSpanElement;
  const tokyoStatusText = document.getElementById('tokyo-status-text') as HTMLSpanElement;
  
  const parisClockVal = document.getElementById('paris-clock-val') as HTMLSpanElement;
  const tokyoClockVal = document.getElementById('tokyo-clock-val') as HTMLSpanElement;
  const parisTimeVal = document.getElementById('paris-time-val') as HTMLSpanElement;
  const tokyoTimeVal = document.getElementById('tokyo-time-val') as HTMLSpanElement;
  const parisRawVal = document.getElementById('paris-raw-val') as HTMLPreElement;
  const tokyoRawVal = document.getElementById('tokyo-raw-val') as HTMLPreElement;
  
  const syncBtn = document.getElementById('sync-btn') as HTMLButtonElement;
  const syncBar = document.getElementById('sync-bar') as HTMLDivElement;
  const syncFill = document.getElementById('sync-fill') as HTMLDivElement;
  const terminal = document.getElementById('terminal-logs') as HTMLDivElement;

  const telemetryLatency = document.getElementById('telemetry-latency') as HTMLSpanElement;
  const telemetryPayload = document.getElementById('telemetry-payload') as HTMLSpanElement;
  const telemetryDrift = document.getElementById('telemetry-drift') as HTMLSpanElement;

  // Log Writer Utility
  const logEvent = (tag: 'system' | 'crdt' | 'sync', message: string): void => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    const logLine = document.createElement('div');
    logLine.className = 'log-line';
    logLine.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-tag ${tag}">${tag.toUpperCase()}</span>
      <pre class="log-text" style="margin: 0; font-family: inherit; font-size: inherit; color: inherit; white-space: pre-wrap; word-break: break-all; display: inline;">${message}</pre>
    `;
    terminal.appendChild(logLine);
    terminal.scrollTop = terminal.scrollHeight;
  };

  // Node Metadata UI Refresher
  const updateNodeUI = (node: 'paris' | 'tokyo', manager: StateManager<string>, isUnsynced: boolean): void => {
    const clock = manager.getLocalClockState();
    const clockHtml = Object.entries(clock)
      .map(([nid, count]) => `<span class="clock-badge">${nid.split('_')[0]}: ${count}</span>`)
      .join(' ');

    const fullState = manager.getFullState();
    const usernameEntry = fullState['username'];
    const timestampStr = usernameEntry 
      ? new Date(usernameEntry.timestamp).toISOString().split('T')[1].replace('Z', '') 
      : '-';

    // Expose the raw data JSON dump in the card
    const rawStateJson = JSON.stringify(fullState, null, 2);

    if (node === 'paris') {
      parisClockVal.innerHTML = clockHtml;
      parisTimeVal.innerText = timestampStr;
      parisRawVal.innerText = rawStateJson;
      
      if (isUnsynced) {
        parisCard.classList.add('active-mutation');
        parisStatus.className = 'status-badge unsynced';
        parisStatusText.innerText = 'Unsynced Local Mutations';
      } else {
        parisCard.classList.remove('active-mutation');
        parisStatus.className = 'status-badge synced';
        parisStatusText.innerText = 'Synced';
      }
    } else {
      tokyoClockVal.innerHTML = clockHtml;
      tokyoTimeVal.innerText = timestampStr;
      tokyoRawVal.innerText = rawStateJson;
      
      if (isUnsynced) {
        tokyoCard.classList.add('active-mutation');
        tokyoStatus.className = 'status-badge unsynced';
        tokyoStatusText.innerText = 'Unsynced Local Mutations';
      } else {
        tokyoCard.classList.remove('active-mutation');
        tokyoStatus.className = 'status-badge synced';
        tokyoStatusText.innerText = 'Synced';
      }
    }
  };

  // Write Initial Boot Message
  logEvent('system', 'Voxion Edge Simulator Booted successfully.');
  logEvent('system', 'Two isolated replica clusters ready in Paris and Tokyo.');
  logEvent('crdt', 'CRDT State initialized. Vector Clocks started at zero.');

  // Set default starting UI metadata representation
  updateNodeUI('paris', parisNode, false);
  updateNodeUI('tokyo', tokyoNode, false);

  // Local Event Handler for Paris mutations
  parisInput.addEventListener('input', () => {
    const value = parisInput.value;
    parisNode.set('username', value);

    // Save this mutation block to the partitioned localStorage network mesh
    const mesh = EdgeCookieNetwork.loadState<NetworkMesh>() || { paris_node: null, tokyo_node: null };
    mesh.paris_node = parisNode.getFullState();
    EdgeCookieNetwork.saveState(mesh);

    updateNodeUI('paris', parisNode, true);
    
    // Dump entire raw state inside the terminal log
    const stateDump = JSON.stringify(parisNode.getFullState(), null, 2);
    logEvent('crdt', `[PARIS] Local mutation event registered. Current Node State:\n${stateDump}`);
  });

  // Local Event Handler for Tokyo mutations
  tokyoInput.addEventListener('input', () => {
    const value = tokyoInput.value;
    tokyoNode.set('username', value);

    // Save this mutation block to the partitioned localStorage network mesh
    const mesh = EdgeCookieNetwork.loadState<NetworkMesh>() || { paris_node: null, tokyo_node: null };
    mesh.tokyo_node = tokyoNode.getFullState();
    EdgeCookieNetwork.saveState(mesh);

    updateNodeUI('tokyo', tokyoNode, true);
    
    // Dump entire raw state inside the terminal log
    const stateDump = JSON.stringify(tokyoNode.getFullState(), null, 2);
    logEvent('crdt', `[TOKYO] Local mutation event registered. Current Node State:\n${stateDump}`);
  });

  // Global Edge Synchronization click handler
  syncBtn.addEventListener('click', async () => {
    logEvent('system', 'Force Sync trigger clicked. Preparing causal data transfer...');
    logEvent('system', 'Establishing undersea fiber-optic carrier link... 🌊');

    // UI Feedback styling changes
    syncBtn.disabled = true;
    const oldText = syncBtn.innerHTML;
    syncBtn.innerHTML = `
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 22px; height: 22px; animation: spin 1.5s linear infinite; margin-right: 0.5rem; display: inline-block; vertical-align: middle;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Syncing over ocean...
    `;

    // Live Telemetry Loading indicators
    telemetryLatency.innerText = 'Calculating...';
    telemetryPayload.innerText = 'Staging...';
    telemetryDrift.innerText = 'Syncing...';

    // Animate network progress bar
    syncBar.style.display = 'block';
    syncFill.style.width = '0%';
    
    // Trigger tick animation
    setTimeout(() => {
      syncFill.style.width = '100%';
    }, 50);

    // Generate random latency between 750ms and 1400ms
    const simulatedMs = Math.floor(Math.random() * 650 + 750); // 750ms to 1400ms
    await simulateLatency(simulatedMs);

    // Retrieve global peer replication mesh
    const mesh = EdgeCookieNetwork.loadState<NetworkMesh>() || { paris_node: null, tokyo_node: null };

    logEvent('sync', `Latency window of ${simulatedMs}ms elapsed. Delta payload received.`);

    // 1. Analyze Causal Vector Clocks for visual clarity
    const pState = parisNode.getFullState()['username'];
    const tState = tokyoNode.getFullState()['username'];

    if (pState && tState) {
      const pClock = new VectorClock('paris_node', pState.clock);
      const tClock = new VectorClock('tokyo_node', tState.clock);
      const comparison = pClock.compare(tClock);

      logEvent('crdt', `[PARIS] Clock Payload: ${JSON.stringify(pClock.getState())}`);
      logEvent('crdt', `[TOKYO] Clock Payload: ${JSON.stringify(tClock.getState())}`);

      if (comparison === VectorClockComparison.LESS) {
        logEvent('sync', 'Causal ordering: Tokyo is strictly newer than Paris. Adopt Tokyo.');
      } else if (comparison === VectorClockComparison.GREATER) {
        logEvent('sync', 'Causal ordering: Paris is strictly newer than Tokyo. Adopt Paris.');
      } else if (comparison === VectorClockComparison.EQUAL) {
        logEvent('sync', 'Causal ordering: Clocks are identical. No-op.');
      } else if (comparison === VectorClockComparison.CONCURRENT) {
        logEvent('sync', '⚠️ Causal conflict: Clocks are CONCURRENT! Deploying LWW fallback...');
        logEvent('sync', `[LWW Evaluation] Paris: ${pState.timestamp} | Tokyo: ${tState.timestamp}`);
        if (pState.timestamp > tState.timestamp) {
          logEvent('sync', 'LWW Outcome: Paris has a newer physical timestamp. Paris wins.');
        } else if (tState.timestamp > pState.timestamp) {
          logEvent('sync', 'LWW Outcome: Tokyo has a newer physical timestamp. Tokyo wins.');
        } else {
          logEvent('sync', 'LWW Outcome: Timestamps identical! Lexical tie-breaker initiated.');
          if (JSON.stringify(tState.value) > JSON.stringify(pState.value)) {
            logEvent('sync', 'Tie-Breaker: Tokyo value is lexically dominant. Tokyo wins.');
          } else {
            logEvent('sync', 'Tie-Breaker: Paris value is lexically dominant. Paris wins.');
          }
        }
      }
    }

    // 2. Perform actual CRDT merge operations
    if (mesh.tokyo_node) {
      parisNode.merge(mesh.tokyo_node);
    }
    if (mesh.paris_node) {
      tokyoNode.merge(mesh.paris_node);
    }

    // Save final merged state back to the shared simulated network mesh
    const finalMesh: NetworkMesh = {
      paris_node: parisNode.getFullState(),
      tokyo_node: tokyoNode.getFullState()
    };
    EdgeCookieNetwork.saveState(finalMesh);

    // Update UI input fields with converged data
    const convergedParisVal = parisNode.get('username') || '';
    const convergedTokyoVal = tokyoNode.get('username') || '';
    
    parisInput.value = convergedParisVal;
    tokyoInput.value = convergedTokyoVal;

    // Refresh UI dashboards to show fully synced indicators
    updateNodeUI('paris', parisNode, false);
    updateNodeUI('tokyo', tokyoNode, false);

    // Expose exact JSON representation of newly merged CRDT state inside the terminal
    const convergedStateJson = JSON.stringify(parisNode.getFullState(), null, 2);
    logEvent('sync', `Convergence achieved. Synchronized State Frame:\n${convergedStateJson}`);

    // Update live Telemetry values
    const finalLatencyStr = `${simulatedMs} ms`;
    const finalPayloadStr = (Math.random() * 0.2 + 0.9).toFixed(2) + ' KB'; // e.g. 1.04 KB
    const finalDriftStr = (Math.random() * 0.05).toFixed(3) + '%';
    
    telemetryLatency.innerText = finalLatencyStr;
    telemetryPayload.innerText = finalPayloadStr;
    telemetryDrift.innerText = finalDriftStr;

    // Reset button states
    syncBtn.disabled = false;
    syncBtn.innerHTML = oldText;

    // Fade out progress bar
    setTimeout(() => {
      syncBar.style.display = 'none';
      syncFill.style.width = '0%';
    }, 1000);
  });
};