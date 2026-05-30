var W=Object.defineProperty;var j=(s,a,o)=>a in s?W(s,a,{enumerable:!0,configurable:!0,writable:!0,value:o}):s[a]=o;var w=(s,a,o)=>(j(s,typeof a!="symbol"?a+"":a,o),o);(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&e(d)}).observe(document,{childList:!0,subtree:!0});function o(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(t){if(t.ep)return;t.ep=!0;const i=o(t);fetch(t.href,i)}})();var v=(s=>(s.LESS="LESS",s.EQUAL="EQUAL",s.GREATER="GREATER",s.CONCURRENT="CONCURRENT",s))(v||{});class y{constructor(a,o={}){w(this,"clock");w(this,"nodeId");this.nodeId=a,this.clock={...o},this.nodeId in this.clock||(this.clock[this.nodeId]=0)}increment(){this.clock[this.nodeId]=(this.clock[this.nodeId]||0)+1}merge(a){const o=a.getState();for(const[e,t]of Object.entries(o))this.clock[e]=Math.max(this.clock[e]||0,t)}compare(a){let o=!1,e=!1;const t=a.getState(),i=new Set([...Object.keys(this.clock),...Object.keys(t)]);for(const d of i){const p=this.clock[d]||0,u=t[d]||0;p>u?o=!0:p<u&&(e=!0)}return o&&e?"CONCURRENT":o&&!e?"GREATER":!o&&e?"LESS":"EQUAL"}getState(){return{...this.clock}}}class P{constructor(a,o){w(this,"state");w(this,"localClock");w(this,"nodeId");if(this.nodeId=a,this.state=new Map,this.localClock=new y(a),o)for(const[e,t]of Object.entries(o)){this.state.set(e,{value:t.value,clock:{...t.clock},timestamp:t.timestamp});const i=new y(a,t.clock);this.localClock.merge(i)}}set(a,o){this.localClock.increment(),this.state.set(a,{value:o,clock:this.localClock.getState(),timestamp:Date.now()})}get(a){var o;return(o=this.state.get(a))==null?void 0:o.value}getFullState(){const a={};return this.state.forEach((o,e)=>{a[e]={value:o.value,clock:{...o.clock},timestamp:o.timestamp}}),a}merge(a){for(const[o,e]of Object.entries(a)){const t=this.state.get(o);if(!t){this.state.set(o,{value:e.value,clock:{...e.clock},timestamp:e.timestamp});const k=new y(this.nodeId,e.clock);this.localClock.merge(k);continue}const i=new y(this.nodeId,t.clock),d=new y("remote",e.clock),p=i.compare(d);if(p===v.LESS)this.state.set(o,{value:e.value,clock:{...e.clock},timestamp:e.timestamp});else if(p===v.CONCURRENT){if(e.timestamp>t.timestamp)this.state.set(o,{value:e.value,clock:{...e.clock},timestamp:e.timestamp});else if(e.timestamp===t.timestamp){const k=JSON.stringify(t.value);JSON.stringify(e.value)>k&&this.state.set(o,{value:e.value,clock:{...e.clock},timestamp:e.timestamp})}}const u=new y(this.nodeId,e.clock);this.localClock.merge(u)}}getLocalClockState(){return this.localClock.getState()}}const H=s=>new Promise(a=>setTimeout(a,s)),f={saveState:s=>{try{localStorage.setItem("vxr_continuum_cookie",JSON.stringify(s))}catch(a){console.error("Failed to save state to Edge Cookie storage:",a)}},loadState:()=>{try{const s=localStorage.getItem("vxr_continuum_cookie");return s?JSON.parse(s):null}catch(s){return console.error("Failed to load state from Edge Cookie storage:",s),null}},clearState:()=>{try{localStorage.removeItem("vxr_continuum_cookie")}catch(s){console.error("Failed to clear Edge Cookie storage:",s)}}},D=s=>{const a=document.getElementById(s);if(!a)return;const o=document.createElement("style");o.textContent=`
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
  `,document.head.appendChild(o),a.innerHTML=`
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
  `;const e=new P("paris_node"),t=new P("tokyo_node"),i=document.getElementById("paris-card"),d=document.getElementById("tokyo-card"),p=document.getElementById("paris-input"),u=document.getElementById("tokyo-input"),k=document.getElementById("paris-status"),L=document.getElementById("tokyo-status"),R=document.getElementById("paris-status-text"),B=document.getElementById("tokyo-status-text"),z=document.getElementById("paris-clock-val"),M=document.getElementById("tokyo-clock-val"),A=document.getElementById("paris-time-val"),F=document.getElementById("tokyo-time-val"),U=document.getElementById("paris-raw-val"),$=document.getElementById("tokyo-raw-val"),S=document.getElementById("sync-btn"),_=document.getElementById("sync-bar"),N=document.getElementById("sync-fill"),I=document.getElementById("terminal-logs"),n=(l,r)=>{const c=new Date,m=c.toTimeString().split(" ")[0]+"."+String(c.getMilliseconds()).padStart(3,"0"),g=document.createElement("div");g.className="log-line",g.innerHTML=`
      <span class="log-time">[${m}]</span>
      <span class="log-tag ${l}">${l.toUpperCase()}</span>
      <span>${r}</span>
    `,I.appendChild(g),I.scrollTop=I.scrollHeight},h=(l,r,c)=>{const m=r.getLocalClockState(),g=Object.entries(m).map(([T,x])=>`<span class="clock-badge">${T.split("_")[0]}: ${x}</span>`).join(" "),b=r.getFullState().username,E=b?`"${b.value}"`:'""',C=b?new Date(b.timestamp).toISOString().split("T")[1].replace("Z",""):"-";l==="paris"?(z.innerHTML=g,A.innerText=C,U.innerText=E,c?(i.classList.add("active-mutation"),k.className="status-badge unsynced",R.innerText="Unsynced Local Mutations"):(i.classList.remove("active-mutation"),k.className="status-badge synced",R.innerText="Synced")):(M.innerHTML=g,F.innerText=C,$.innerText=E,c?(d.classList.add("active-mutation"),L.className="status-badge unsynced",B.innerText="Unsynced Local Mutations"):(d.classList.remove("active-mutation"),L.className="status-badge synced",B.innerText="Synced"))};n("system","Voxion Edge Simulator Booted successfully."),n("system","Two isolated replica clusters ready in Paris and Tokyo."),n("crdt","CRDT State initialized. Vector Clocks started at zero."),h("paris",e,!1),h("tokyo",t,!1),p.addEventListener("input",()=>{const l=p.value;e.set("username",l);const r=f.loadState()||{paris_node:null,tokyo_node:null};r.paris_node=e.getFullState(),f.saveState(r),h("paris",e,!0),n("crdt",`[PARIS] Local input mutation: username = "${l}" (Vector Clock incremented).`)}),u.addEventListener("input",()=>{const l=u.value;t.set("username",l);const r=f.loadState()||{paris_node:null,tokyo_node:null};r.tokyo_node=t.getFullState(),f.saveState(r),h("tokyo",t,!0),n("crdt",`[TOKYO] Local input mutation: username = "${l}" (Vector Clock incremented).`)}),S.addEventListener("click",async()=>{n("system","Force Sync trigger clicked. Preparing causal data transfer..."),n("system","Establishing undersea fiber-optic carrier link... 🌊"),S.disabled=!0,S.innerHTML=`
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 22px; height: 22px; animation: spin 1.5s linear infinite; margin-right: 0.5rem;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Syncing over ocean...
    `;const l=document.createElement("style");l.id="spin-style",l.textContent="@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",document.head.appendChild(l),_.style.display="block",N.style.width="0%",setTimeout(()=>{N.style.width="100%"},50),await H(800);const r=f.loadState()||{paris_node:null,tokyo_node:null};n("sync","Latency window elapsed. Payload received from remote edge sites.");const c=e.getFullState().username,m=t.getFullState().username;if(c&&m){const C=new y("paris_node",c.clock),T=new y("tokyo_node",m.clock),x=C.compare(T);n("crdt",`[PARIS] Vector Clock: ${JSON.stringify(C.getState())}`),n("crdt",`[TOKYO] Vector Clock: ${JSON.stringify(T.getState())}`),x===v.LESS?n("sync","Causal ordering: Tokyo is strictly newer than Paris. Adopt Tokyo."):x===v.GREATER?n("sync","Causal ordering: Paris is strictly newer than Tokyo. Adopt Paris."):x===v.EQUAL?n("sync","Causal ordering: Clocks are identical. No-op."):x===v.CONCURRENT&&(n("sync","⚠️ Causal conflict: Clocks are CONCURRENT! Deploying LWW fallback..."),n("sync",`[LWW Evaluation] Paris: ${c.timestamp} | Tokyo: ${m.timestamp}`),c.timestamp>m.timestamp?n("sync","LWW Outcome: Paris has a newer physical timestamp. Paris wins."):m.timestamp>c.timestamp?n("sync","LWW Outcome: Tokyo has a newer physical timestamp. Tokyo wins."):(n("sync","LWW Outcome: Timestamps identical! Lexical tie-breaker initiated."),JSON.stringify(m.value)>JSON.stringify(c.value)?n("sync","Tie-Breaker: Tokyo value is lexically dominant. Tokyo wins."):n("sync","Tie-Breaker: Paris value is lexically dominant. Paris wins.")))}r.tokyo_node&&e.merge(r.tokyo_node),r.paris_node&&t.merge(r.paris_node);const g={paris_node:e.getFullState(),tokyo_node:t.getFullState()};f.saveState(g);const O=e.get("username")||"",b=t.get("username")||"";p.value=O,u.value=b,h("paris",e,!1),h("tokyo",t,!1),n("sync",`Synchronization Complete. Converged state: "${O}"`),S.disabled=!1,S.innerHTML=`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 22px; height: 22px;">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
      Force Global Edge Sync
    `;const E=document.getElementById("spin-style");E&&E.remove(),setTimeout(()=>{_.style.display="none",N.style.width="0%"},1e3)})};console.log("🚀 VXR-Continuum Engine Started!");f.clearState();const V=()=>{D("app")};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",V):V();
