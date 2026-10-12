# LAB 01 — Crypto Asset Discovery: Implementation & Testing

**Project:** TaskFlow Security Automation Lab    
**Technology:** n8n, Docker, Mockoon, REST APIs  
**Status:** Completed and tested  
**Environment:** Local simulation

## 1. Overview

LAB 01 — Crypto Asset Discovery is the first security detection workflow in the TaskFlow Security Automation Lab.

Its purpose is to automate cryptographic inventory assessment and create security review tasks for identified findings.

The workflow retrieves records from a simulated REST API, classifies cryptographic algorithm labels, saves the resulting assessments, and calls a reusable security task handler.

**Important Disclaimer:** TaskFlow is an invented website and fictional application created specifically for cybersecurity automation learning. All cryptographic assets, services, findings, and security tasks are simulated. No real infrastructure is scanned or modified.

## 2. Objectives

The workflow was designed to:

1. Retrieve the cryptographic asset inventory.
2. Process each asset individually.
3. Classify its cryptographic algorithm label.
4. Identify assets requiring security review.
5. Update inventory records with their assessments.
6. Create remediation tasks through LAB 00.
7. Prevent duplicate tasks on repeated executions.

## 3. Workflow Architecture

```text
Manual Trigger
       |
       v
Get Crypto Assets (HTTP GET)
       |
       v
Split Collection
       |
       v
Classify Algorithms (Switch)
       |
       +--- RSA --------> PATCH RSA --------+
       |                                   |
       +--- ECDSA ------> PATCH ECDSA ------|
       |                                   |
       +--- Ed25519 ----> PATCH Ed25519 ----|
       |                                   |
       +--- RS256 ------> PATCH RS256 ------+ 
       |                                   |
       +--- ECDH -------> PATCH ECDH -------|
       |                                   |
       +--- Unknown ----> PATCH Unknown ----|
       |                                   |
       |                                   v
       |                       Prepare Security Finding
       |                                   |
       |                                   v
       |                       LAB 00 — Upsert Security Task
       |
       +--- AES --------> PATCH AES
                              |
                              v
                      Assessment Saved
                      (No Review Task)
```

The workflow uses native n8n nodes instead of standalone JavaScript Code nodes for classification and task preparation.

## 4. Cryptographic Inventory

The initialized TaskFlow environment contains eight simulated cryptographic assets.

| Asset ID | Service | Algorithm | Owner |
|---|---|---|---|
| cert-001 | TaskFlow API | RSA-2048 | Platform |
| cert-002 | TaskFlow Web | ECDSA-P256 | Platform |
| cert-003 | RDS | RSA-2048 | Database |
| ssh-001 | GitHub Actions | Ed25519 | DevOps |
| jwt-001 | TaskFlow Authentication | RS256 | Identity |
| sym-001 | Application Storage | AES-256-GCM | Platform |
| unknown-001 | Legacy Connector | unknown | Unassigned |
| tls-001 | RDS | ECDHE | Database |

All records are fictional and supplied for testing.

## 5. Implementation

### Step 1 — Retrieve the Inventory

An HTTP Request node retrieves records from:

`GET http://mock-api:3000/crypto-assets`

The response contains eight cryptographic assets.

### Step 2 — Split the Collection

A Split Out node separates the response's `body` array into eight independent items.

This allows each asset to be processed individually.

### Step 3 — Classify Algorithms

A Switch node routes records according to their algorithm labels.

The working implementation uses case-insensitive String → contains conditions.

| Classification | Matching Condition | Asset Count |
|---|---|---:|
| RSA | RSA | 2 |
| ECDSA | ECDSA | 1 |
| Ed25519 | Ed25519 | 1 |
| RS256 | RS256 | 1 |
| ECDH / ECDHE | ECDH | 1 |
| Symmetric | AES | 1 |
| Unknown | Fallback | 1 |

Total: **8 assets classified.**

### Step 4 — Save Assessments

Each classification branch sends an HTTP PATCH request to update its corresponding inventory record.

Three assessment fields are stored:

- `assessmentStatus`
- `quantumRisk`
- `lastSeenAt`

The public-key-related categories receive the status `PQC assessment required` and the flag `quantumRisk: true`.

AES receives `Separate symmetric/hash assessment` with `quantumRisk: null`.

Unknown algorithms receive `Unknown algorithm; investigate` with `quantumRisk: null`.

The `quantumRisk` field represents a simulated review classification, not evidence of an exploitable vulnerability.

### Step 5 — Prepare Security Findings

Six PATCH branches connect to a shared Edit Fields node named `Prepare Security finding`.

The node prepares structured security task data containing:

| Field | Purpose |
|---|---|
| dedupeKey | Stable identifier for the finding |
| ruleId | Identifier of the detection rule |
| assetId | Affected cryptographic asset |
| title | Human-readable review task title |
| priority | Initial task priority |
| owner | Responsible team |
| reason | Description of the assessment |
| observedAt | Assessment timestamp |

Every generated task uses the rule identifier `crypto-review` and initial priority `MEDIUM`.

### Step 6 — Create or Update Tasks

The prepared findings are passed to the reusable workflow:

**LAB 00 — Upsert Security Task**

LAB 00 checks whether a corresponding task exists.

If it does not exist, LAB 00 creates it.

If the same finding has already been recorded, LAB 00 updates the existing task.

The AES branch intentionally stops after saving its assessment and does not produce a review task in this detector.

## 6. Testing and Results

The following execution outcomes were reported after testing in the local n8n and Mockoon environment.

### Test 1 — Retrieve Inventory

**Expected:** 8 assets.

**Observed:** 8 records retrieved and separated successfully.

**Result:** PASS

### Test 2 — Algorithm Classification

**Expected:** 6 public-key-related assets, 1 symmetric asset, and 1 unknown asset.

**Observed:** All eight records were routed to their intended classification outputs.

**Result:** PASS

### Test 3 — Assessment Updates

**Expected:** All eight records receive assessment fields.

**Observed:** All seven PATCH branches completed successfully and updated the eight corresponding records.

**Result:** PASS

### Test 4 — Security Task Generation

**Expected:** Seven crypto-review tasks.

**Observed:** Seven review tasks were generated through LAB 00.

The expected task identifiers are:

| Asset ID | Task Dedupe Key |
|---|---|
| cert-001 | crypto-review:cert-001 |
| cert-002 | crypto-review:cert-002 |
| cert-003 | crypto-review:cert-003 |
| ssh-001 | crypto-review:ssh-001 |
| jwt-001 | crypto-review:jwt-001 |
| tls-001 | crypto-review:tls-001 |
| unknown-001 | crypto-review:unknown-001 |

No task is generated for `sym-001` under this detector.

**Result:** PASS

### Test 5 — Duplicate Prevention

**Procedure:**

1. Execute LAB 01.
2. Confirm seven crypto-review tasks exist.
3. Execute LAB 01 again using the same inventory.
4. Inspect the task records.

**Expected:** The number of crypto-review tasks remains seven.

**Observed:** The second execution did not create additional crypto-review tasks.

**Result:** PASS

## 7. Overall Test Summary

| Test | Result |
|---|---|
| API inventory retrieval | PASS |
| Split into individual assets | PASS |
| Algorithm classification | PASS |
| Inventory assessment updates | PASS |
| Seven security review tasks | PASS |
| AES excluded from task creation | PASS |
| Duplicate prevention on rerun | PASS |

The workflow configuration was also reviewed through its exported n8n JSON. The execution results are based on local testing reported by the project creator.

## 8. Problems Encountered

### Problem 1 — Switch Classification Failed

Initially, all eight records were routed to Unknown.

**Resolution:** The data structure was inspected, and the matching rules were simplified to case-insensitive String → contains conditions.

### Problem 2 — HTTP PATCH Returned 404

An attempted PATCH operation returned a resource-not-found error.

**Resolution:** The target resource and dynamic request URL were checked, and the PATCH configuration was corrected.

### Problem 3 — Unnecessary Node Duplication

The original implementation plan used separate task-preparation nodes for different classification branches.

**Improvement:** Multiple branches were connected to one shared Edit Fields node, which feeds the reusable LAB 00 workflow.

### Problem 4 — AES Task Routing

The AES branch initially appeared connected to task preparation.

**Resolution:** The AES branch was disconnected from the shared task path so it only saves the assessment.

## 9. Limitations

- TaskFlow is a fictional website.
- All security records are simulated.
- The workflow does not perform real cryptographic discovery.
- Classification relies on a limited set of algorithm labels.
- PQC-labelled algorithms such as ML-KEM and ML-DSA are not yet explicitly classified.
- The workflow uses a Manual Trigger rather than an active daily schedule.
- Task creation relies on the separately imported LAB 00 workflow.
- Algorithm-name matching alone cannot establish cryptographic security or PQC compliance.

## 10. Learning Outcomes

This exercise provided practical experience with:

- REST API integration.
- JSON data processing.
- n8n Switch routing.
- Conditional security automation.
- HTTP PATCH operations.
- Dynamic n8n expressions.
- Reusable sub-workflows.
- Finding deduplication.
- Simulated cryptographic asset management.
- Post-quantum cryptography readiness concepts.
- Troubleshooting and verifying workflow results.

## 11. Conclusion

LAB 01 demonstrates a working, simulated cryptographic inventory assessment and security task automation process.

The workflow successfully processes eight sample assets, records their assessments, and generates seven security review tasks through a reusable task-management workflow.

Repeated execution updates existing findings without introducing duplicate crypto-review tasks.

**Project created by Shubham Uniyal with assistance from AI Large Language Models (LLMs).**

**Next workflow:** LAB 02 — Certificate Expiry Automation.
