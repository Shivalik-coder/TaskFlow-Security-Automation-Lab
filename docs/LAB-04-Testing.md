
# LAB 04 — PQC Readiness Scanner: Implementation & Testing

**Project:** TaskFlow Security Automation Lab  
**Technology:** n8n, Docker, Mockoon, REST APIs  
**Status:** Completed and tested  
**Environment:** Local simulation

## 1. Overview

LAB 04 — PQC Readiness Scanner is an evidence-based service assessment workflow in the TaskFlow Security Automation Lab.

Its purpose is to evaluate the readiness of simulated services for post-quantum cryptography (PQC) migration, identify their next missing action, and create security review tasks where work remains.

The workflow retrieves service records from a simulated REST API, checks ordered migration evidence, calculates a readiness score, assigns a status, updates the service records, and passes structured findings to the reusable LAB 00 workflow.

**Important Disclaimer:** TaskFlow is an invented website and fictional application created specifically for cybersecurity automation learning. All services, vendors, migration evidence, blockers, assessments, and security tasks are simulated. Evidence references are fictional identifiers, not independently validated records of real-world PQC migration.

## 2. Objectives

The workflow was designed to:

1. Retrieve the simulated service inventory.
2. Process each service individually.
3. Inspect migration evidence in the required order.
4. Calculate a readiness score from 0 to 5.
5. Limit simulated services to a maximum score of 4.
6. Assign a readiness status using the service's score, vendor dependency, and blockers.
7. Identify the next missing migration action or an existing blocker.
8. Save readiness assessments to the service records.
9. Create next-step security review tasks through LAB 00.
10. Prevent duplicate tasks on repeated executions.
11. Test evidence progression, missing prerequisites, and restoration of sample data.

## 3. Workflow Architecture

```text
Manual Trigger
       |
       v
Get Services (HTTP GET /services)
       |
       v
Split Services
       |
       v
Check Readiness Evidence (Edit Fields)
       |
       v
Calculate Readiness Score (Edit Fields)
       |
       v
Assign Readiness Status (Edit Fields)
       |
       v
Prepare Next PQC Action (Edit Fields)
       |
       v
Save PQC Assessment (HTTP PATCH /services/ID)
       |
       v
PQC Review Needed? (IF)
       |
       +--- TRUE ---> Prepare PQC Finding
       |                     |
       |                     v
       |          LAB 00 — Upsert Security Task
       |
       +--- FALSE --> No new readiness finding
```

The implementation uses visual n8n nodes and field expressions rather than standalone JavaScript Code nodes.

## 4. PQC Readiness Assessment Model

The TaskFlow guide requires migration evidence to be present in this order:

| Stage | Evidence Field | Next Action When Missing |
|---|---|---|
| 1 | `inventory` | Identify cryptographic assets, scope and owner |
| 2 | `roadmap` | Document the vendor roadmap or internal migration decision |
| 3 | `testEnvironment` | Prepare a non-production test environment |
| 4 | `hybridTest` | Run hybrid/PQC compatibility, performance and rollback tests |
| 5 | `production` | Prepare an approved production change and verification plan |

Only consecutive, nonempty string references count toward the score. If an earlier stage is missing, later references do not increase the score.

Records marked `simulated: true` are capped at score 4, even when a production evidence reference is populated.

### Readiness Status Rules

| Status | Condition |
|---|---|
| Blocked | At least one blocker exists |
| Migrated | Score is 5 and there are no blockers |
| Unknown | Score is 0 and there are no blockers |
| Vendor-dependent | Vendor-controlled service with score below 4 and no higher-priority condition |
| Testing | Score is 3 or 4 and no higher-priority condition applies |
| Inventoried | Remaining services with score 1 or 2 |

The status is a classification of the fictional service's recorded evidence, not a certification of PQC security.

## 5. Implementation

### Step 1 — Retrieve Services

An HTTP Request node named `Get Services` retrieves the records from:

`GET http://mock-api:3000/services`

The full JSON response contains the services inside the `body` array.

### Step 2 — Split the Service Collection

The `Split Services` node separates the `body` array into individual n8n items.

Each service can then be assessed and updated independently.

### Step 3 — Check Migration Evidence

The `Check Readiness Evidence` Edit Fields node creates five Boolean fields:

- `hasInventory`
- `hasRoadmap`
- `hasTestEnvironment`
- `hasHybridTest`
- `hasProduction`

Each Boolean is true only when its corresponding evidence property is a nonempty string. Existing input fields are preserved for later steps.

### Step 4 — Calculate the Readiness Score

The `Calculate Readiness Score` node evaluates the five Boolean fields in sequence.

| Score | Meaning |
|---|---|
| 0 | Inventory evidence missing |
| 1 | Inventory evidence present |
| 2 | Inventory and roadmap evidence present |
| 3 | First three stages present |
| 4 | First four stages present, or simulated production evidence is capped |
| 5 | All five stages present for a non-simulated record |

The score reflects consecutive evidence references, not a percentage of cryptographic security.

### Step 5 — Assign the Readiness Status

The `Assign Readiness Status` node uses `score`, `vendorControlled`, and `blockers` to set `readinessStatus`.

Blockers take priority. The remaining cases follow the configured status rules described in Section 4.

### Step 6 — Prepare the Next Action

The `Prepare Next PQC Action` node sets `nextAction`.

If `blockers` contains values, the node joins their descriptions into one string. Otherwise, it selects the next missing migration action from the stage sequence.

### Step 7 — Save the Assessment

The `Save PQC Assessment` node uses a dynamic PATCH URL:

`http://mock-api:3000/services/` followed by the URL-encoded service ID.

The request saves these fields:

| Field | Purpose |
|---|---|
| `score` | Calculated readiness score |
| `readinessStatus` | Assigned readiness classification |
| `assessedAt` | UTC assessment timestamp |

The HTTP Request node uses **JSON → Using Fields Below** for the request body. The original `evidence`, `blockers`, and service identity fields are not intentionally overwritten.

### Step 8 — Determine Whether a Task Is Needed

The `PQC Review Needed?` IF node routes a service to task preparation when its score is below 5 or it has one or more blockers.

A score-5 service with no blockers does not create a new readiness finding.

### Step 9 — Prepare and Submit the Security Finding

The `Prepare PQC Finding` Edit Fields node builds the following fields:

| Field | Purpose |
|---|---|
| `dedupeKey` | Stable identifier: `readiness:<service-id>` |
| `ruleId` | `readiness` |
| `assetId` | Affected service ID |
| `title` | `Plan next PQC step: <service name>` |
| `priority` | `MEDIUM` |
| `owner` | Service owner or `Security` |
| `reason` | Missing action or blocker description |
| `observedAt` | UTC timestamp |

The `Create PQC Security Task` node sends each finding to **LAB 00 — Upsert Security Task**.

LAB 00 creates a task if no matching deduplication key exists or updates the existing task if the same finding is processed again.

## 6. Testing and Results

The following tests were completed in the local n8n and TaskFlow simulation.

### Test 1 — Retrieve and Split Services

**Expected:** The service collection is retrieved and split into separate items.

**Observed:** TaskFlow API, Auth0, and Stripe were processed as separate service records.

**Result:** PASS

### Test 2 — Initial Readiness Scores

**Expected:** The initialized sample records produce scores of 3, 2, and 1.

| Service | Expected Score | Observed Score |
|---|---:|---:|
| TaskFlow API (`svc-api`) | 3 | 3 |
| Auth0 (`svc-auth0`) | 2 | 2 |
| Stripe (`svc-stripe`) | 1 | 1 |

**Result:** PASS

### Test 3 — Security Task Creation

**Expected:** Three separate readiness tasks, each with a stable deduplication key.

**Observed:** LAB 00 produced tasks with these identifiers:

| Service | Task Dedupe Key |
|---|---|
| TaskFlow API | `readiness:svc-api` |
| Auth0 | `readiness:svc-auth0` |
| Stripe | `readiness:svc-stripe` |

Each task contained a service-specific title and next-action or blocker reason.

**Result:** PASS

### Test 4 — Duplicate Prevention

**Procedure:**

1. Execute LAB 04 and inspect the three readiness tasks.
2. Execute LAB 04 again without changing the service data.
3. Compare the task IDs and timestamps.

**Expected:** The existing task IDs remain unchanged, with updated observation timestamps and no new duplicate tasks.

**Observed:** All three task IDs remained unchanged, and the existing tasks were updated.

**Result:** PASS

### Test 5 — Hybrid Test Evidence Progression

**Procedure:**

1. Load `svc-api` in the TaskFlow Services collection.
2. Add `LAB-HYBRID-TEST-001` as the `evidence.hybridTest` reference.
3. Save the service and execute LAB 04.
4. Inspect the updated readiness score and task reason.

**Expected:** Score increases from 3 to 4 and the existing task describes production-change planning as the next step.

**Observed:** The score increased to 4, and the existing task's reason changed to:

`Prepare an approved production change and verification plan`

**Result:** PASS

### Test 6 — Simulated Production Evidence Limit

**Procedure:**

1. Add `LAB-PRODUCTION-001` to `evidence.production` on `svc-api`.
2. Keep `simulated` set to true.
3. Save and execute LAB 04 again.

**Expected:** Score remains 4 instead of increasing to 5.

**Observed:** The service remained at score 4.

**Result:** PASS

### Test 7 — Missing Earlier Evidence

**Procedure:**

1. Save the current inventory reference for restoration.
2. Clear `evidence.inventory` on `svc-api`.
3. Preserve the other evidence fields and execute LAB 04.

**Expected:** Score drops to 0 because the required first stage is missing.

**Observed:** The score dropped to 0 after the inventory change was saved and the workflow was rerun.

**Result:** PASS

### Test 8 — Restore the Original Sample Data

**Procedure:**

1. Restore the original inventory reference.
2. Restore the original `null` values for `hybridTest` and `production`.
3. Leave `roadmap` and `testEnvironment` unchanged.
4. Execute LAB 04 again.

**Expected:** TaskFlow API, Auth0, and Stripe return to scores 3, 2, and 1.

**Observed:** The original scores and TaskFlow API next-action task were restored.

**Result:** PASS

## 7. Overall Test Summary

| Test | Result |
|---|---|
| Service retrieval and individual processing | PASS |
| Initial evidence-based scores (3, 2, 1) | PASS |
| Three PQC readiness tasks created | PASS |
| Duplicate prevention on rerun | PASS |
| Hybrid evidence increases score from 3 to 4 | PASS |
| Simulated production evidence capped at 4 | PASS |
| Missing inventory evidence reduces score to 0 | PASS |
| Original service evidence and scores restored | PASS |

The workflow configuration was reviewed using the exported n8n JSON. The test results reflect the completed local TaskFlow exercise; they do not constitute tests against real vendor systems.

## 8. Problems Encountered

### Problem 1 — HTTP Request JSON Body Error

The `Save PQC Assessment` node initially rejected its JSON body as invalid.

**Resolution:** The node was switched to **Body Content Type: JSON** with **Specify Body: Using Fields Below**, mapping `score`, `readinessStatus`, and `assessedAt` individually.

### Problem 2 — IF Node Boolean Type Error

The `PQC Review Needed?` condition initially treated a true/false result as a string.

**Resolution:** Type conversion was enabled in the IF node, and the conditional expression was checked. All three sample services then followed the TRUE output.

### Problem 3 — Placeholder Fields in Initial Findings

The first task results contained placeholder text such as `Service ID`, `Service name`, and `Current UTC timestamp`.

**Resolution:** The finding fields were mapped to the actual service values using n8n expressions. Three unique deduplication keys were then generated.

### Problem 4 — Old Task Creation Timestamp

The existing `readiness:svc-api` task retained `createdAt: "Current UTC timestamp"` from the initial incorrect run.

**Status:** This historical mock-record field was not corrected during LAB 04. It does not prevent the current evidence score and task deduplication logic from operating, but it remains a data-quality issue.

### Problem 5 — Evidence Change Not Initially Reflected

After clearing inventory evidence, an execution initially still showed score 4.

**Resolution:** The saved service value and evidence-check output were inspected. The missing-inventory test was then repeated successfully, producing score 0.

## 9. Limitations

- TaskFlow is a fictional website and all service records are simulated.
- The workflow checks whether evidence references are nonempty strings. It does not inspect or authenticate the referenced evidence.
- Readiness scores describe an ordered exercise stage, not a quantitative security measure or certification.
- The simulated scoring cap intentionally prevents a simulated service from reaching score 5.
- The workflow uses Manual Trigger rather than a schedule.
- Task creation depends on the separately imported LAB 00 workflow.
- The exported IF configuration contains a redundant empty-string condition, which was not removed before documentation.
- The exported finding node uses `=ruleId` as its configured field name; its resulting task output was observed with `ruleId: readiness`, but the configuration should be reviewed before reuse.
- Not every possible combination of blockers, vendor ownership, and readiness statuses was separately tested.
- A legacy invalid creation timestamp remains on one fictional security task.
- The lab does not scan production services, validate cryptographic deployments, or perform real PQC migration.

## 10. Learning Outcomes

This exercise provided practical experience with:

- REST API collection retrieval and record updates.
- JSON data splitting in n8n.
- Sequential evidence validation.
- Dynamic Boolean expressions.
- Evidence-based readiness scoring.
- Status classification and blocker prioritization.
- HTTP PATCH requests for simulated service assessments.
- Preparing security findings with Edit Fields nodes.
- Reusing LAB 00 for task creation and deduplication.
- Testing state changes and restoring sample records.
- Troubleshooting input types, expressions, and placeholder data.
- Distinguishing simulation results from verified PQC readiness.

## 11. Conclusion

LAB 04 demonstrates an evidence-based PQC readiness assessment process using visual n8n workflows and a simulated TaskFlow service inventory.

The workflow processes three fictional services, saves readiness scores, and creates or updates three next-step security review tasks through LAB 00.

Testing confirmed correct initial scoring, duplicate prevention, readiness progression, the simulated maximum score, rejection of missing earlier evidence, and restoration of original sample data.

The workflow remains an educational simulation; a real PQC migration assessment would require verified evidence, scoped cryptographic discovery, and human review.
