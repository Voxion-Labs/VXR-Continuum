var K=Object.defineProperty;var Q=(o,a,e)=>a in o?K(o,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[a]=e;var b=(o,a,e)=>(Q(o,typeof a!="symbol"?a+"":a,e),e);(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const d of l.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function e(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function t(s){if(s.ep)return;s.ep=!0;const l=e(s);fetch(s.href,l)}})();var k=(o=>(o.LESS="LESS",o.EQUAL="EQUAL",o.GREATER="GREATER",o.CONCURRENT="CONCURRENT",o))(k||{});class y{constructor(a,e={}){b(this,"clock");b(this,"nodeId");this.nodeId=a,this.clock={...e},this.nodeId in this.clock||(this.clock[this.nodeId]=0)}increment(){this.clock[this.nodeId]=(this.clock[this.nodeId]||0)+1}merge(a){const e=a.getState();for(const[t,s]of Object.entries(e))this.clock[t]=Math.max(this.clock[t]||0,s)}compare(a){let e=!1,t=!1;const s=a.getState(),l=new Set([...Object.keys(this.clock),...Object.keys(s)]);for(const d of l){const u=this.clock[d]||0,g=s[d]||0;u>g?e=!0:u<g&&(t=!0)}return e&&t?"CONCURRENT":e&&!t?"GREATER":!e&&t?"LESS":"EQUAL"}getState(){return{...this.clock}}}class V{constructor(a,e){b(this,"state");b(this,"localClock");b(this,"nodeId");if(this.nodeId=a,this.state=new Map,this.localClock=new y(a),e)for(const[t,s]of Object.entries(e)){this.state.set(t,{value:s.value,clock:{...s.clock},timestamp:s.timestamp});const l=new y(a,s.clock);this.localClock.merge(l)}}set(a,e){this.localClock.increment(),this.state.set(a,{value:e,clock:this.localClock.getState(),timestamp:Date.now()})}get(a){var e;return(e=this.state.get(a))==null?void 0:e.value}getFullState(){const a={};return this.state.forEach((e,t)=>{a[t]={value:e.value,clock:{...e.clock},timestamp:e.timestamp}}),a}merge(a){for(const[e,t]of Object.entries(a)){const s=this.state.get(e);if(!s){this.state.set(e,{value:t.value,clock:{...t.clock},timestamp:t.timestamp});const f=new y(this.nodeId,t.clock);this.localClock.merge(f);continue}const l=new y(this.nodeId,s.clock),d=new y("remote",t.clock),u=l.compare(d);if(u===k.LESS)this.state.set(e,{value:t.value,clock:{...t.clock},timestamp:t.timestamp});else if(u===k.CONCURRENT){if(t.timestamp>s.timestamp)this.state.set(e,{value:t.value,clock:{...t.clock},timestamp:t.timestamp});else if(t.timestamp===s.timestamp){const f=JSON.stringify(s.value);JSON.stringify(t.value)>f&&this.state.set(e,{value:t.value,clock:{...t.clock},timestamp:t.timestamp})}}const g=new y(this.nodeId,t.clock);this.localClock.merge(g)}}getLocalClockState(){return this.localClock.getState()}}const Y=o=>new Promise(a=>setTimeout(a,o)),v={saveState:o=>{try{localStorage.setItem("vxr_continuum_cookie",JSON.stringify(o))}catch(a){console.error("Failed to save state to Edge Cookie storage:",a)}},loadState:()=>{try{const o=localStorage.getItem("vxr_continuum_cookie");return o?JSON.parse(o):null}catch(o){return console.error("Failed to load state from Edge Cookie storage:",o),null}},clearState:()=>{try{localStorage.removeItem("vxr_continuum_cookie")}catch(o){console.error("Failed to clear Edge Cookie storage:",o)}}},q=o=>{const a=document.getElementById(o);if(!a)return;a.innerHTML=`
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
  `;const e=new V("paris_node"),t=new V("tokyo_node"),s=document.getElementById("paris-card"),l=document.getElementById("tokyo-card"),d=document.getElementById("paris-input"),u=document.getElementById("tokyo-input"),g=document.getElementById("paris-status"),f=document.getElementById("tokyo-status"),x=document.getElementById("paris-status-text"),_=document.getElementById("tokyo-status-text"),D=document.getElementById("paris-clock-val"),J=document.getElementById("tokyo-clock-val"),z=document.getElementById("paris-time-val"),W=document.getElementById("tokyo-time-val"),H=document.getElementById("paris-raw-val"),j=document.getElementById("tokyo-raw-val"),S=document.getElementById("sync-btn"),B=document.getElementById("sync-bar"),N=document.getElementById("sync-fill"),I=document.getElementById("terminal-logs"),F=document.getElementById("telemetry-latency"),P=document.getElementById("telemetry-payload"),M=document.getElementById("telemetry-drift"),n=(m,i)=>{const c=new Date,p=c.toTimeString().split(" ")[0]+"."+String(c.getMilliseconds()).padStart(3,"0"),r=document.createElement("div");r.className="log-line",r.innerHTML=`
      <span class="log-time">[${p}]</span>
      <span class="log-tag ${m}">${m.toUpperCase()}</span>
      <pre class="log-text" style="margin: 0; font-family: inherit; font-size: inherit; color: inherit; white-space: pre-wrap; word-break: break-all; display: inline;">${i}</pre>
    `,I.appendChild(r),I.scrollTop=I.scrollHeight},h=(m,i,c)=>{const p=i.getLocalClockState(),r=Object.entries(p).map(([O,R])=>`<span class="clock-badge">${O.split("_")[0]}: ${R}</span>`).join(" "),w=i.getFullState(),T=w.username,E=T?new Date(T.timestamp).toISOString().split("T")[1].replace("Z",""):"-",C=JSON.stringify(w,null,2);m==="paris"?(D.innerHTML=r,z.innerText=E,H.innerText=C,c?(s.classList.add("active-mutation"),g.className="status-badge unsynced",x.innerText="Unsynced Local Mutations"):(s.classList.remove("active-mutation"),g.className="status-badge synced",x.innerText="Synced")):(J.innerHTML=r,W.innerText=E,j.innerText=C,c?(l.classList.add("active-mutation"),f.className="status-badge unsynced",_.innerText="Unsynced Local Mutations"):(l.classList.remove("active-mutation"),f.className="status-badge synced",_.innerText="Synced"))};n("system","Voxion Edge Simulator Booted successfully."),n("system","Two isolated replica clusters ready in Paris and Tokyo."),n("crdt","CRDT State initialized. Vector Clocks started at zero."),h("paris",e,!1),h("tokyo",t,!1),d.addEventListener("input",()=>{const m=d.value;e.set("username",m);const i=v.loadState()||{paris_node:null,tokyo_node:null};i.paris_node=e.getFullState(),v.saveState(i),h("paris",e,!0);const c=JSON.stringify(e.getFullState(),null,2);n("crdt",`[PARIS] Local mutation event registered. Current Node State:
${c}`)}),u.addEventListener("input",()=>{const m=u.value;t.set("username",m);const i=v.loadState()||{paris_node:null,tokyo_node:null};i.tokyo_node=t.getFullState(),v.saveState(i),h("tokyo",t,!0);const c=JSON.stringify(t.getFullState(),null,2);n("crdt",`[TOKYO] Local mutation event registered. Current Node State:
${c}`)}),S.addEventListener("click",async()=>{n("system","Force Sync trigger clicked. Preparing causal data transfer..."),n("system","Establishing undersea fiber-optic carrier link... 🌊"),S.disabled=!0;const m=S.innerHTML;S.innerHTML=`
      <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 22px; height: 22px; animation: spin 1.5s linear infinite; margin-right: 0.5rem; display: inline-block; vertical-align: middle;">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Syncing over ocean...
    `,F.innerText="Calculating...",P.innerText="Staging...",M.innerText="Syncing...",B.style.display="block",N.style.width="0%",setTimeout(()=>{N.style.width="100%"},50);const i=Math.floor(Math.random()*650+750);await Y(i);const c=v.loadState()||{paris_node:null,tokyo_node:null};n("sync",`Latency window of ${i}ms elapsed. Delta payload received.`);const p=e.getFullState().username,r=t.getFullState().username;if(p&&r){const A=new y("paris_node",p.clock),U=new y("tokyo_node",r.clock),L=A.compare(U);n("crdt",`[PARIS] Clock Payload: ${JSON.stringify(A.getState())}`),n("crdt",`[TOKYO] Clock Payload: ${JSON.stringify(U.getState())}`),L===k.LESS?n("sync","Causal ordering: Tokyo is strictly newer than Paris. Adopt Tokyo."):L===k.GREATER?n("sync","Causal ordering: Paris is strictly newer than Tokyo. Adopt Paris."):L===k.EQUAL?n("sync","Causal ordering: Clocks are identical. No-op."):L===k.CONCURRENT&&(n("sync","⚠️ Causal conflict: Clocks are CONCURRENT! Deploying LWW fallback..."),n("sync",`[LWW Evaluation] Paris: ${p.timestamp} | Tokyo: ${r.timestamp}`),p.timestamp>r.timestamp?n("sync","LWW Outcome: Paris has a newer physical timestamp. Paris wins."):r.timestamp>p.timestamp?n("sync","LWW Outcome: Tokyo has a newer physical timestamp. Tokyo wins."):(n("sync","LWW Outcome: Timestamps identical! Lexical tie-breaker initiated."),JSON.stringify(r.value)>JSON.stringify(p.value)?n("sync","Tie-Breaker: Tokyo value is lexically dominant. Tokyo wins."):n("sync","Tie-Breaker: Paris value is lexically dominant. Paris wins.")))}c.tokyo_node&&e.merge(c.tokyo_node),c.paris_node&&t.merge(c.paris_node);const w={paris_node:e.getFullState(),tokyo_node:t.getFullState()};v.saveState(w);const T=e.get("username")||"",E=t.get("username")||"";d.value=T,u.value=E,h("paris",e,!1),h("tokyo",t,!1);const C=JSON.stringify(e.getFullState(),null,2);n("sync",`Convergence achieved. Synchronized State Frame:
${C}`);const O=`${i} ms`,R=(Math.random()*.2+.9).toFixed(2)+" KB",G=(Math.random()*.05).toFixed(3)+"%";F.innerText=O,P.innerText=R,M.innerText=G,S.disabled=!1,S.innerHTML=m,setTimeout(()=>{B.style.display="none",N.style.width="0%"},1e3)})};console.log("🚀 VXR-Continuum Engine Started!");v.clearState();const $=()=>{q("app")};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",$):$();
