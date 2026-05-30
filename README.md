<p align="center">
  <img src="./research/Voxion_Labs_Logo.png" alt="Voxion Labs Logo" width="100" />
</p>

# <p align="center">VXR-Continuum 🌌</p>
<h3 align="center">Voxion eXperimental Research</h3>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/CRDT-CvRDT-ea580c" alt="CRDT" />
  <img src="https://img.shields.io/badge/Architecture-P2P--Edge-39ff8a" alt="P2P Edge" />
  <img src="https://img.shields.io/badge/Project-Applied%20Research-00d4ff" alt="Applied Research" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

<p align="center">
  <strong>Distributed Peer-to-Peer Edge State Synchronization via CRDT Cookies.</strong><br/>
  A <em>zero-backend</em> research prototype demonstrating lock-free eventual consistency directly within web browsers.
</p>

---

<p align="center">
  <a href="./public/paper/VXR-Continuum_IEEE.pdf" target="_blank"><strong>Read 10-Page Research Paper (PDF)</strong></a> · 
  <a href="#run-locally"><strong>Run Locally</strong></a> · 
  <a href="#core-architecture"><strong>Core Architecture</strong></a>
</p>

---

## <p align="center">Core Architecture</p>

VXR-Continuum is a browser-native synchronization engine designed to achieve eventual consistency across disconnected peer tabs and edge runtimes. By serializing conflict-free data deltas into cryptographic HTTP cookies, synchronization executes transparently during standard navigation and browser interactions—completely bypassing traditional central databases.

```text
       ┌────────────────────────┐             ┌────────────────────────┐
       │   Browser Client A     │             │   Browser Client B     │
       │  (Replica State x_A)   │             │  (Replica State x_B)   │
       └───────────┬────────────┘             └───────────┬────────────┘
                   │                                      │
                   │ write state                          │ read state
                   ▼                                      ▼
       ┌────────────────────────┐  BroadcastChannel   ┌────────────────────────┐
       │   HTTP Cookie Space    ├────────────────────►│   HTTP Cookie Space    │
       │  (Compressed CvRDT)    │  (Sub-50ms Sync)    │  (Compressed CvRDT)    │
       └────────────────────────┘                     └────────────────────────┘
```

### <p align="center">How it Works</p>

1. **Local Mutation**: Changes generated inside a tab update the local State-based CRDT (CvRDT) register and increment the corresponding node's counter in the Vector Clock.
2. **Delta Compression**: The engine extracts modified state slices, compresses them using custom delta logic, and formats them into a compact Base64-URL string.
3. **Cookie Marshaling**: The base64 buffer is written to the browser's document cookie under a cryptographically signed signature block.
4. **Active Broadcast**: Synchronization across parallel active tabs occurs in real-time (sub-50ms) using a BroadcastChannel API, falling back to document cookie updates on page reload.
5. **Idempotent Merge**: Peer clients read incoming cookies, verify signatures, compare vector clocks, and execute join-semilattice merges to converge on the supremum state.

---

## <p align="center">Key Academic Foundations</p>

### <p align="center">1. Join-Semilattice Model</p>
Replica states converge deterministically because mutations operate as a join-semilattice `(S, ⊔, ≤, ⊥)`. The join operator (`⊔`) guarantees that merges are:
* **Idempotent**: `x ⊔ x = x` (Duplicate updates cause no side-effects)
* **Commutative**: `x ⊔ y = y ⊔ x` (Order of message delivery is irrelevant)
* **Associative**: `x ⊔ (y ⊔ z) = (x ⊔ y) ⊔ z` (Network partitioning does not prevent convergence)

### <p align="center">2. Causal Ordering via Vector Clocks</p>
To detect concurrent conflicts, each node maintains clock states `V`. Updates are ordered using strict causality rules:
* `V_1 < V_2` indicates that `V_1` causally preceded `V_2`.
* `V_1 || V_2` indicates concurrency (mutually independent edits), which triggers hybrid logical clock last-write-wins (LWW) resolution.

---

## <p align="center">Telemetry & Performance</p>

Under continuous evaluation (N=10,000 simulations), client-side in-memory CRDT cookie merges execute in the microsecond regime. This achieves a **300x synchronization latency speedup** compared to central remote database connections.

| Performance Phase | Remote Cloud Database | VXR-Continuum Cookie | Net Advantage |
| --- | --- | --- | --- |
| **State Ingress / Read** | 45.80 ms | 0.02 ms | Avoids connection overhead |
| **Conflict Resolution** | 12.40 ms | 0.05 ms | Idempotent in-memory join |
| **Serialization & Signing** | 8.20 ms | 0.15 ms | Local SHA-256 validation |
| **Total Sync Latency** | **66.40 ms** | **0.22 ms** | **Microsecond-level edge convergence** |

---

## <p align="center">Run Locally</p>

Run a local development node to explore the peer synchronization visualization interface:

```bash
# 1. Install project dependencies
npm install

# 2. Run Vite local development server
npm run dev
```

Open the local browser interface (usually at [http://localhost:5173](http://localhost:5173)) and open a second concurrent browser window to visualize real-time state synchronization.

---

## <p align="center">Author</p>

<table align="center" style="border: none;">
<tr style="border: none;">
<td width="130" align="center" style="border: none; padding-right: 15px;">
  <img src="./research/rudranarayan_jena.png" alt="Rudranarayan Jena" width="120" style="border-radius: 50%; border: 3px solid #dc2626; box-shadow: 0 4px 6px rgba(0,0,0,0.15);" />
</td>
<td style="border: none; vertical-align: middle;">
  <strong><font size="4">Rudranarayan Jena</font></strong><br/>
  <em>Founder, <a href="https://github.com/Voxion-Labs" target="_blank">Voxion Labs</a></em><br/>
  <em>D.Y. Patil International University, Pune, India</em><br/><br/>
  <p style="margin: 0; color: #4b5563; font-size: 0.9em; max-width: 460px;">
    Applied researcher in distributed systems security and edge computing. Currently directing the <strong>VXR-Continuum</strong> initiative to study high-integrity eventual convergence and conflict-free replicated data types in sandboxed client layers.
  </p>
</td>
</tr>
</table>

---

## <p align="center">License & Academic Citation</p>

This repository is licensed under the **MIT License**.

```text
Copyright (c) 2026 Voxion Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---
<p align="center">
  <strong>Voxion Labs</strong> · Applied Research · Zero-Backend · CRDT Edge Cookies · TypeScript · Vite
</p>