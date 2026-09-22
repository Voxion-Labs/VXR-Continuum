# VXR-Continuum Operational & Contribution Protocols

VXR-Continuum operates under strict mathematical and distributed state synchronization protocols. We do not accept arbitrary state mutations, non-deterministic conflict resolutions, or unoptimized payload processing. This repository is maintained for high-performance, client-side eventual consistency research.

If you intend to submit a Pull Request, you must adhere strictly to the following institutional directives.

## 1. Architectural Standards
All code submitted to VXR-Continuum must meet our baseline synchronization and memory metrics:
* **CvRDT Mathematical Compliance:** Any modification to state structures must mathematically guarantee idempotency, commutativity, and associativity. Non-monotonic state regressions will result in instant rejection.
* **Payload Constraints:** HTTP document cookies are restricted to 4096 bytes. All state deltas must undergo gzip compression and Base64-URL encoding. Submissions that risk overflowing the 4KB boundary will not be merged.
* **Cryptographic Integrity:** The HMAC-SHA256 signature chain is absolute. Any logic altering the `vxr_payload` must correctly update the cryptographic signature using the designated LocalStorage key boundary.

## 2. Pull Request (PR) Governance
Before initiating a merge request, ensure your PR adheres to this exact structure:
1. **[METRIC] Benchmark Data:** You must provide before/after execution telemetry (e.g., BroadcastChannel latency, gzip serialization overhead, total cookie byte size).
2. **[LOGIC] State Transition:** Explicitly document the changes to the Vector Clocks, Hybrid Logical Clocks (HLC), or Last-Write-Wins (LWW) tie-breaker logic.
3. **[ISOLATION] Threat Model:** Prove that your modifications do not expose the HMAC signing key to Cross-Site Scripting (XSS) or allow untrusted peers to inject unverified state supersets.

*Note: PRs failing to provide empirical telemetry or violating mathematical CRDT constraints will be closed immediately without review.*

## 3. Vulnerability Disclosure
**DO NOT** open public issues for state poisoning attacks, HMAC bypasses, or physical clock drift exploits. Public disclosure of consensus vulnerabilities compromises the integrity of the peer network.
* All security reports must be routed internally.
* Contact the Lead Architect directly for secure transmission protocols.

## 4. Code of Conduct
We evaluate algorithmic efficiency and mathematical determinism, not intentions. Your submissions will be scrutinized ruthlessly based on TypeScript optimization and distributed systems logic. Keep discussions clinical, objective, and exclusively focused on CRDT synchronization architecture.