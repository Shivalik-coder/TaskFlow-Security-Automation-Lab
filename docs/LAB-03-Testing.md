# LAB 03 — JWT Key Rotation Simulator: Implementation & Testing

**Project:** TaskFlow Security Automation Lab  
**Technology:** n8n, Docker, Mockoon, REST APIs  
**Status:** Implemented and tested locally; additional verification improvements identified  
**Environment:** Local simulation

## 1. Overview

LAB 03 — JWT Key Rotation Simulator is a security automation workflow in the TaskFlow Security Automation Lab.

Its purpose is to simulate the secure lifecycle of a JSON Web Token (JWT) signing key, including detection, approval, replacement, verification, retirement, and rollback.

The workflow identifies JWT signing keys that exceed their rotation policy, creates security review tasks, and requires manual approval before proceeding with the rotation process.

The implementation consists of five separate n8n workflows that work together to demonstrate controlled security operations.

**Important Disclaimer:** TaskFlow is an invented website and fictional application created specifically for cybersecurity automation learning. All JWT keys, rotation requests, findings, and security tasks are simulated. No real cryptographic keys are generated, no JWTs are signed, and no production authentication systems are modified.

## 2. Objectives

The workflows were designed to:

1. Retrieve and inspect JWT signing-key records.
2. Identify keys that exceed their configured rotation policy.
3. Validate JWT metadata before processing.
4. Create security review tasks through LAB 00.
5. Prevent duplicate rotation requests.
6. Require manual approval before key replacement.
7. Create and publish replacement-key metadata.
8. Verify the replacement key's health before enabling signing.
9. Maintain a verification-overlap period for the original key.
10. Retire the original key after the required safety checks.
11. Verify saved records before closing security tasks.
12. Simulate refusal scenarios and manual rollback.

## 3. Workflow Components

LAB 03 consists of five n8n workflows.

### LAB 03A — Detect JWT Rotation

Identifies signing keys that exceed their configured rotation policy.

**Main Nodes:**

- Manual Trigger — Starts the workflow.
- Get JWT Keys — Retrieves JWT records from Mockoon.
- Split JWT Keys — Processes each JWT record individually.
- Is Signing Key? — Checks whether the key is currently used for signing.
- Valid JWT Metadata? — Validates the key's creation date and rotation policy.
- Calculate JWT Key Age — Calculates how long the key has existed.
- JWT Rotation Overdue? — Determines whether the key exceeds its rotation policy.
- Prepare JWT Rotation Finding — Prepares the security finding.
- Create JWT Rotation Task — Sends the finding to LAB 00.
- Is JWT Rotation Finding? — Confirms that the finding requires rotation.
- Find JWT Rotation Request — Searches for an existing rotation request.
- Rotation Request Missing? — Determines whether a new request is needed.
- Create Pending JWT Rotation Request — Creates a request awaiting approval.
- Exactly One Request Exists? — Checks for unexpected duplicate records.
- Stop and Error — Stops processing when the request count is invalid.

### LAB — Approve JWT Request

Provides a separate manual approval step before rotation.

**Main Nodes:**

- Manual Trigger — Starts the approval process.
- Approve JWT Rotation Request — Updates the request with its approval status, approver, and approval timestamp.

### LAB 03B — Approved JWT Cutover

Simulates the controlled replacement of an existing JWT signing key.

**Main Nodes:**

- Manual Trigger — Starts the workflow.
- Get JWT Rotation Request — Retrieves the rotation request.
- Is JWT Rotation Approved? — Verifies the required approval information.
- Get Original JWT Key — Retrieves the existing signing-key record.
- Is Original Key Signing? — Confirms that the original key is active for signing.
- Find Replacement JWT Key — Checks whether a replacement already exists.
- Replacement Key Missing? — Prevents duplicate replacement creation.
- Update Rotation Request to Running — Records rotation progress.
- Create Staged JWT Key — Creates replacement metadata without enabling signing.
- Wait for JWKS Propagation — Represents a propagation delay.
- Get Staged JWT Key — Retrieves the staged replacement.
- Verify Staged JWT Key — Checks publishing, verification, and health status.
- Activate New JWT Signing Key — Enables signing on the replacement.
- Move Original JWT Key to Overlap — Keeps the original key available for verification.
- Update Rotation Request to Overlap — Records the overlap stage.

### LAB 03C — Retire JWT Key

Handles the simulated retirement of the original signing key.

**Main Nodes:**

- Manual Trigger — Starts the retirement process.
- Get Original JWT Key — Retrieves the original key.
- Safe to Retire? — Checks the key's overlap state and retirement metadata.
- Get Replacement JWT Key — Retrieves the replacement key.
- Replacement Key Healthy? — Verifies that the replacement is functioning correctly.
- Retire Original JWT Key — Disables signing, verification, and publishing for the original key.
- Get Retired JWT Key — Retrieves the updated record.
- Is Old JWT Key Retired? — Confirms the saved retirement fields.
- Complete JWT Rotation Request — Marks the rotation request as completed.
- Find JWT Security Task — Locates the original security task.
- Exactly One JWT Task? — Confirms that one matching task exists.
- Close JWT Rotation Task — Closes the security finding.
- Verify JWT Task Closure — Retrieves the task after closure.
- Stop and Error — Stops processing when the task lookup is invalid.

**Implementation Note:** The exported workflow still requires an additional time comparison in the `Safe to Retire?` node to enforce the full overlap deadline.

### LAB — Manual JWT Rollback

Simulates restoring the original signing state when a rotation cannot safely continue.

**Main Nodes:**

- Manual Trigger — Starts the rollback.
- Restore Original JWT Key — Restores the original key's signing and verification settings.
- Disable New JWT Signing — Disables signing on the replacement.
- Mark JWT Rotation Rolled Back — Updates the rotation request.
- Verify JWT Rotation Task — Retrieves the security task for inspection.

This rollback process applies only to the fictional, non-compromise exercise.

## 4. Workflow Architecture

### 4.1 LAB 03A — JWT Rotation Detection

**Workflow Sequence:**

Manual Trigger → Get JWT Keys → Split JWT Keys → Is Signing Key? → Valid JWT Metadata? → Calculate JWT Key Age → JWT Rotation Overdue? → Prepare JWT Rotation Finding → Create JWT Rotation Task → Is JWT Rotation Finding? → Find JWT Rotation Request → Rotation Request Missing?

**Conditional Routing:**

- **Rotation not required:** Processing stops.
- **Rotation required:** A security finding is sent to LAB 00.
- **Request missing:** A pending rotation request is created.
- **Request already exists:** The existing record is preserved.
- **Unexpected request count:** Processing stops with an error.

### 4.2 Manual Approval

**Workflow Sequence:**

Manual Trigger → Approve JWT Rotation Request

The approval workflow updates the request with:

- Status: `approved`
- Approved By: `Lab Operator`
- Approved At: Current UTC timestamp

The rotation process cannot continue through its approval gate until the required information is present.

### 4.3 LAB 03B — Approved JWT Cutover

**Workflow Sequence:**

Manual Trigger → Get JWT Rotation Request → Is JWT Rotation Approved? → Get Original JWT Key → Is Original Key Signing? → Find Replacement JWT Key → Replacement Key Missing? → Update Rotation Request to Running → Create Staged JWT Key → Wait for JWKS Propagation → Get Staged JWT Key → Verify Staged JWT Key → Activate New JWT Signing Key → Move Original JWT Key to Overlap → Update Rotation Request to Overlap

**Conditional Routing:**

- **Approval missing:** Rotation stops.
- **Original key not signing:** Rotation stops.
- **Replacement already exists:** Rotation stops to prevent duplicate creation.
- **Replacement health check fails:** Signing is not switched.
- **All checks pass:** The replacement becomes the simulated signer and the original enters overlap.

### 4.4 LAB 03C — JWT Retirement

**Workflow Sequence:**

Manual Trigger → Get Original JWT Key → Safe to Retire? → Get Replacement JWT Key → Replacement Key Healthy? → Retire Original JWT Key → Get Retired JWT Key → Is Old JWT Key Retired? → Complete JWT Rotation Request → Find JWT Security Task → Exactly One JWT Task? → Close JWT Rotation Task → Verify JWT Task Closure

**Conditional Routing:**

- **Retirement conditions not met:** Processing stops.
- **Replacement health check fails:** The original key is not retired.
- **Retirement verification fails:** The rotation request is not completed.
- **Security task lookup is invalid:** Processing stops.
- **Required checks pass:** The rotation request is completed and the security task is closed.

### 4.5 Manual JWT Rollback

**Workflow Sequence:**

Manual Trigger → Restore Original JWT Key → Disable New JWT Signing → Mark JWT Rotation Rolled Back → Verify JWT Rotation Task

The rollback workflow restores the original key's signing state, disables replacement signing, and records the rollback.

The original security task remains open because the rotation was not completed.

## 5. Test Environment

| Component | Technology |
|---|---|
| Automation | n8n |
| API Backend | Mockoon |
| Container Runtime | Docker |
| Data Format | JSON |
| HTTP Operations | GET, POST, PATCH |
| Local Website | TaskFlow |
| Security Task Handler | LAB 00 |

**Simulated Test Records:**

| Record | Identifier |
|---|---|
| Original JWT Key | `jwt-001` |
| Replacement JWT Key | `jwt-001-next` |
| Rotation Request | `rotate-jwt-001` |
| Security Task | `jwt-rotation:jwt-001` |

All operations were performed in a local testing environment using fictional records.

## 6. Test Cases and Results

The results below reflect the workflow exports and the local testing reported during development. Tests without confirmed execution results are identified separately.

### Test 1 — JWT Rotation Detection

**Objective:** Verify that the workflow identifies signing keys exceeding their rotation policy.

**Test Input:**

| Field | Value |
|---|---|
| Key ID | `jwt-001` |
| Signing Enabled | `true` |
| Rotation Policy | 90 days |
| Approximate Key Age | 100 days |

**Observed Result:**

- The original JWT key exceeded the configured rotation policy.
- A HIGH-priority security finding was prepared.
- The finding was sent to LAB 00.
- A pending rotation request was created.

**Result: PASS — Reported during local testing**

### Test 2 — Manual JWT Approval

**Objective:** Verify that rotation requires manual approval before proceeding.

**Procedure:**

1. Retrieve the pending rotation request.
2. Inspect the request information.
3. Execute the manual approval workflow.
4. Verify the updated approval fields.

**Observed Result:**

- The request was updated to `approved`.
- The approver was recorded as `Lab Operator`.
- An approval timestamp was recorded.
- LAB 03B could proceed when the approval requirements were satisfied.

**Result: PASS — Reported during local testing**

### Test 3 — Approved JWT Cutover

**Objective:** Verify that an approved rotation can stage a replacement and switch simulated signing.

**Procedure:**

1. Approve the pending rotation request.
2. Execute LAB 03B.
3. Create the replacement JWT metadata.
4. Verify the replacement's publishing and health fields.
5. Enable signing on the replacement.
6. Move the original key into overlap.

**Observed Result:**

- Replacement metadata was created.
- The replacement passed its staged-key health checks.
- The replacement became the simulated signing key.
- The original key entered the overlap state.
- The rotation request was updated to `overlap`.

**Result: PASS — Reported during local testing**

### Test 4 — JWT Retirement and Task Closure

**Objective:** Verify that the original JWT key can be retired and the corresponding security task closed.

**Procedure:**

1. Retrieve the original key.
2. Check its retirement conditions.
3. Retrieve and inspect the replacement key.
4. Retire the original key.
5. Retrieve the original key again.
6. Verify the saved retirement fields.
7. Complete the rotation request.
8. Find and close the matching security task.

**Observed Result:**

- The original key's state changed to `retired`.
- Signing and verification were disabled on the original key.
- The saved retirement fields were checked.
- The request was marked `completed`.
- The JWT rotation task was closed.

**Result: PASS — Reported for the executed workflow path**

**Additional Verification Required:** The exported retirement IF node does not yet enforce the retirement deadline. The missing condition must be added and tested.

### Test 5 — Refusal Without Approval

**Objective:** Verify that rotation cannot proceed when approval is missing.

**Procedure:**

1. Create a pending rotation request.
2. Leave the request unapproved.
3. Execute LAB 03B.
4. Inspect the approval IF node.

**Observed Result:**

- The approval condition returned FALSE.
- The workflow stopped before replacement creation.
- The signing cutover was not executed.

**Result: PASS — Approval refusal confirmed during testing**

### Test 6 — Replacement Health Failure

**Objective:** Verify that a staged replacement cannot become the signer when its health status is `fail`.

**Procedure:**

1. Approve the rotation request.
2. Stage the replacement JWT key.
3. Set `consumerHealth` to `fail`.
4. Execute the staged-key verification.
5. Inspect the resulting workflow branch.

**Reported Result:**

- The replacement health check rejected the unhealthy key.
- The signing cutover did not proceed.

**Result: PASS — User-reported completion**

### Test 7 — Health Failure During Overlap

**Objective:** Verify that an unhealthy replacement cannot authorize retirement of the original key.

**Procedure:**

1. Complete an approved cutover.
2. Confirm the original key is in overlap.
3. Set the replacement's `consumerHealth` to `fail`.
4. Execute LAB 03C after the overlap deadline.
5. Inspect the replacement-health check.

**Expected Result:**

- The replacement-health condition returns FALSE.
- The original key remains available for verification.
- The retirement operation does not execute.
- The security task remains open.

**Result: NOT CONFIRMED — Final test evidence not recorded**

### Test 8 — Manual JWT Rollback

**Objective:** Verify that the original signing state can be restored after a failed non-compromise rotation.

**Procedure:**

1. Execute the manual rollback workflow.
2. Restore signing and verification on the original key.
3. Disable signing on the replacement.
4. Update the rotation request to `rolled-back`.
5. Inspect the security task.

**Expected Result:**

- Original key signing is restored.
- Replacement signing is disabled.
- The rotation request is marked `rolled-back`.
- The security task remains open.

**Result: WORKFLOW IMPLEMENTED — Final execution verification not confirmed**

## 7. Testing Summary

| Test | Result |
|---|---|
| JWT rotation detection | Reported PASS |
| Manual approval | Reported PASS |
| Approved JWT cutover | Reported PASS |
| Retirement and task closure | Reported PASS; deadline check pending |
| Refusal without approval | PASS |
| Replacement health failure | Reported PASS |
| Health failure during overlap | Not confirmed |
| Manual rollback | Implemented; final verification pending |

## 8. Problems Encountered

### Problem 1 — LAB 03B Stopped at JWT Approval

During testing, LAB 03B stopped at the `Is JWT Rotation Approved?` node.

**Cause:**

The rotation request did not satisfy the approval conditions after the mock environment was reset.

**Solution:**

The request was inspected and the separate manual approval procedure was used before attempting the cutover.

The approval condition was preserved rather than bypassed.

### Problem 2 — Replacement Health Failure

A replacement JWT key with `consumerHealth: fail` was not allowed to proceed through the health verification stage.

**Explanation:**

The workflow correctly treats a failed health check as a reason to stop the rotation.

This behavior protects the simulated process from switching to an unhealthy replacement.

### Problem 3 — Missing Retirement Deadline Condition

The exported LAB 03C workflow checks the original key's overlap state and validates its retirement timestamp.

However, it does not yet compare that timestamp with the current time.

**Required Improvement:**

Add a Boolean condition confirming that the retirement deadline has passed:

`{{ DateTime.fromISO($json.body.retireAfter || '').toMillis() <= $now.toMillis() }}`

This must be combined with the existing conditions using AND.

The workflow should then be retested to verify that early retirement is rejected.

### Problem 4 — Wait Node Configuration

The exported LAB 03B workflow contains a Wait node intended to represent a five-second propagation delay.

**Required Improvement:**

Confirm that the Wait node is explicitly configured for five seconds and save the updated workflow.

### Problem 5 — Additional Verification Improvements

Some final record checks currently require manual inspection.

**Recommended Improvements:**

- Add final read-back checks for both JWT keys after cutover.
- Add an IF condition to verify the saved task closure fields.
- Add read-back checks for the manual rollback results.
- Handle invalid JWT metadata with a separate data-quality finding instead of silently stopping processing.

These improvements would make the workflow more reliable and easier to test.

## 9. Key Learning Outcomes

This exercise strengthened my understanding of:

- JWT signing and verification concepts.
- Cryptographic key rotation and lifecycle management.
- Security approval workflows.
- Conditional routing and validation in n8n.
- HTTP GET, POST, and PATCH operations.
- REST API integration using Mockoon.
- JWT metadata validation and age calculations.
- Security task creation using reusable sub-workflows.
- Duplicate request prevention.
- Simulated key staging and publishing.
- Verification-overlap periods.
- Security task closure and read-back verification.
- Failure handling and rollback procedures.
- Testing security automation workflows using fictional data.

## 10. Conclusion

LAB 03 demonstrated an approval-gated JWT key rotation simulation using n8n, Docker, Mockoon, and REST APIs.

The exercise implemented overdue-key detection, security task creation, manual approval, replacement staging, signing cutover, verification overlap, original-key retirement, and task closure.

Additional testing covered approval refusal and replacement-key health failure. A separate manual rollback workflow was also implemented.

The exported workflows have identified areas for further improvement, particularly retirement deadline enforcement and additional verification checks.

This lab builds on LAB 00 — Security Task Automation and demonstrates how reusable security automation workflows can support controlled cryptographic lifecycle operations.

**Note:** All JWT records, keys, requests, and security findings are simulated. The implementation is an educational exercise and is not presented as a production-ready JWT rotation system or a post-quantum cryptography migration solution.
