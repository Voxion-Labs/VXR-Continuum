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

  // Inject scoped visualizer styles for premium aesthetics
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
      text-align: left;
    }
    .node-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
      position: relative;
    }
    .node-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .node-card:hover {
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
      transform: translateY(-2px);
    }
    .node-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--accent);
      opacity: 0.1;
    }
    .node-card.active-mutation::before {
      opacity: 1;
      background: #f59e0b;
    }
    .node-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 0.75rem;
    }
    .node-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-badge.synced {
      background-color: #ecfdf5;
      color: #059669;
    }
    .status-badge.unsynced {
      background-color: #fef3c7;
      color: #d97706;
    }
    .status-led {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-badge.synced .status-led {
      background-color: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .status-badge.unsynced .status-led {
      background-color: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
      animation: pulse-amber 1.5s infinite;
    }
    @keyframes pulse-amber {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .input-group {
      margin-bottom: 1.5rem;
    }
    .input-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.375rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .text-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-family: var(--font-sans);
      font-size: 0.95rem;
      color: var(--text-primary);
      background-color: #f8fafc;
      transition: var(--transition-smooth);
    }
    .text-input:focus {
      outline: none;
      border-color: var(--accent);
      background-color: #ffffff;
      box-shadow: 0 0 0 4px var(--accent-light);
    }
    .metadata-panel {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      font-size: 0.8rem;
    }
    .metadata-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-family: monospace;
    }
    .metadata-row:last-child {
      margin-bottom: 0;
    }
    .metadata-label {
      color: var(--text-muted);
      font-weight: 500;
    }
    .metadata-value {
      color: var(--text-primary);
      font-weight: 600;
    }
    .clock-badge {
      background-color: #e2e8f0;
      color: #334155;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      margin-left: 0.25rem;
      font-weight: bold;
    }
    .network-bridge {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 2px;
      background: repeating-linear-gradient(90deg, #cbd5e1, #cbd5e1 6px, transparent 6px, transparent 12px);
      transform: translate(-50%, -50%);
      z-index: 0;
    }
    @media (max-width: 768px) {
      .network-bridge { display: none; }
    }
    .control-dock {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      border-top: 1px solid var(--border-color);
      padding-top: 2rem;
    }
    .sync-progress-bar {
      width: 100%;
      max-width: 500px;
      height: 4px;
      background-color: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      display: none;
    }
    .sync-progress-fill {
      width: 0%;
      height: 100%;
      background-color: var(--accent);
      transition: width 0.8s linear;
    }
    .terminal-logs {
      width: 100%;
      height: 180px;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 14px;
      padding: 1rem;
      color: #38bdf8;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.8rem;
      overflow-y: auto;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    .log-line {
      margin-bottom: 0.375rem;
      line-height: 1.4;
    }
    .log-time { color: #64748b; margin-right: 0.5rem; }
    .log-tag { font-weight: bold; margin-right: 0.5rem; }
    .log-tag.system { color: #f43f5e; }
    .log-tag.crdt { color: #34d399; }
    .log-tag.sync { color: #fbbf24; }
  `;
  document.head.appendChild(styleEl);

  // Set up visual structure
  container.innerHTML = `
    <div class="dashboard">
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
            <div class="metadata-row">
              <span class="metadata-label">Raw CRDT Value</span>
              <span class="metadata-value" id="paris-raw-val">""</span>
            </div>
          </div>
        </div>

        <div class="network-bridge"></div>

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
            <div class="metadata-row">
              <span class="metadata-label">Raw CRDT Value</span>
              <span class="metadata-value" id="tokyo-raw-val">""</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Network Synchronization Controls -->
      <div class="control-dock">
        <button id="sync-btn" class="research-btn" style="padding: 1rem 3rem; font-size: 1.05rem;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 22px; height: 22px;">
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
  const parisRawVal = document.getElementById('paris-raw-val') as HTMLSpanElement;
  const tokyoRawVal = document.getElementById('tokyo-raw-val') as HTMLSpanElement;
  
  const syncBtn = document.getElementById('sync-btn') as HTMLButtonElement;
  const syncBar = document.getElementById('sync-bar') as HTMLDivElement;
  const syncFill = document.getElementById('sync-fill') as HTMLDivElement;
  const terminal = document.getElementById('terminal-logs') as HTMLDivElement;

  // Log Writer Utility
  const logEvent = (tag: 'system' | 'crdt' | 'sync', message: string): void => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    
    const logLine = document.createElement('div');
    logLine.className = 'log-line';
    logLine.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-tag ${tag}">${tag.toUpperCase()}</span>
      <span>${message}</span>
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
    const val = usernameEntry ? `"${usernameEntry.value}"` : '""';
    const timestampStr = usernameEntry 
      ? new Date(usernameEntry.timestamp).toISOString().split('T')[1].replace('Z', '') 
      : '-';

    if (node === 'paris') {
      parisClockVal.innerHTML = clockHtml;
      parisTimeVal.innerText = timestampStr;
      parisRawVal.innerText = val;
      
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
      tokyoRawVal.innerText = val;
      
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
    logEvent('crdt', `[PARIS] Local input mutation: username = "${value}" (Vector Clock incremented).`);
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
    logEvent('crdt', `[TOKYO] Local input mutation: username = "${value}" (Vector Clock incremented).`);
  });

  // Global Edge Synchronization click handler
  syncBtn.addEventListener('click', async () => {
    logEvent('system', 'Force Sync trigger clicked. Preparing causal data transfer...');
    logEvent('system', 'Establishing undersea fiber-optic carrier link... 🌊');

    // UI Feedback styling changes
    syncBtn.disabled = true;
    syncBtn.innerHTML = `
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 22px; height: 22px; animation: spin 1.5s linear infinite; margin-right: 0.5rem;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Syncing over ocean...
    `;

    // Inject temporary spin animation inside page header stylesheet
    const spinStyle = document.createElement('style');
    spinStyle.id = 'spin-style';
    spinStyle.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(spinStyle);

    // Animate network progress bar
    syncBar.style.display = 'block';
    syncFill.style.width = '0%';
    
    // Trigger tick animation
    setTimeout(() => {
      syncFill.style.width = '100%';
    }, 50);

    // Run the latency simulation
    await simulateLatency(800);

    // Retrieve global peer replication mesh
    const mesh = EdgeCookieNetwork.loadState<NetworkMesh>() || { paris_node: null, tokyo_node: null };

    logEvent('sync', 'Latency window elapsed. Payload received from remote edge sites.');

    // 1. Analyze Causal Vector Clocks for visual clarity
    const pState = parisNode.getFullState()['username'];
    const tState = tokyoNode.getFullState()['username'];

    if (pState && tState) {
      const pClock = new VectorClock('paris_node', pState.clock);
      const tClock = new VectorClock('tokyo_node', tState.clock);
      const comparison = pClock.compare(tClock);

      logEvent('crdt', `[PARIS] Vector Clock: ${JSON.stringify(pClock.getState())}`);
      logEvent('crdt', `[TOKYO] Vector Clock: ${JSON.stringify(tClock.getState())}`);

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

    logEvent('sync', `Synchronization Complete. Converged state: "${convergedParisVal}"`);

    // Reset button states
    syncBtn.disabled = false;
    syncBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 22px; height: 22px;">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
      Force Global Edge Sync
    `;

    // Clean up temporary spinner CSS animations
    const styleToRemove = document.getElementById('spin-style');
    if (styleToRemove) styleToRemove.remove();

    // Fade out progress bar
    setTimeout(() => {
      syncBar.style.display = 'none';
      syncFill.style.width = '0%';
    }, 1000);
  });
};