# LAB 00 — Security Task Automation Testing

**Project:** TaskFlow Security Automation Lab    
**Status:** Completed and tested  
**Environment:** Local Docker, n8n, Mockoon

## 1. Objective

The objective of LAB 00 is to create a reusable security task management workflow that automatically creates, updates, verifies, and escalates security findings.

TaskFlow is an invented website used exclusively for educational and cybersecurity automation simulations. All data in this lab is fictional.

## 2. Workflow Components

The workflow uses the following n8n nodes:

- Execute Sub-workflow Trigger — Receives a finding.
- Validate Task — Verifies required fields and task priority.
- Find Task — Searches Mockoon for an existing finding.
- Choose Write — Determines whether to create or update.
- IF — Routes existing tasks to PATCH and new tasks to POST.
- POST Task — Creates a new security task.
- PATCH Task — Updates an existing task.
- Verify Saved Task — Retrieves the saved record.
- Check Saved Task — Confirms the saved data matches expectations.
- Send Notification? — Determines whether an alert is needed.
- POST Notification — Records a simulated notification.
- Return Saved Task — Returns the final security task.

## 3. Test Environment

| Component | Technology |
|---|---|
| Automation | n8n |
| API Backend | Mockoon |
| Container Runtime | Docker |
| Data Format | JSON |
| HTTP Operations | GET, POST, PATCH |

## 4. Test Cases and Results

### Test 1 — Security Task Creation

**Objective:** Verify that the workflow creates a new task when no matching task exists.

**Test Input:**

```json
{
  "dedupeKey": "smoke:task-001",
  "ruleId": "smoke",
  "assetId": "cert-001",
  "title": "Practice task creation",
  "priority": "HIGH",
  "owner": "Lab Operator",
  "reason": "Testing the reusable task handler"
}
```

**Observed Result:**

- A new security task was created.
- The task received a unique ID.
- The priority was HIGH.
- A simulated notification was generated.

**Result: PASS**

### Test 2 — Duplicate Prevention

**Objective:** Verify that running the same finding again does not create a duplicate task.

**Procedure:**

1. Execute the workflow with the original input.
2. Execute it again without changing the dedupe key.
3. Inspect the task records in Mockoon.

**Observed Result:**

- The existing task was updated.
- The same task ID was preserved.
- No duplicate task was created.
- No additional initial notification was generated.

**Result: PASS**

### Test 3 — Priority Escalation

**Objective:** Verify that an existing finding can be escalated.

**Procedure:**

1. Change the incoming priority from HIGH to CRITICAL.
2. Keep the same dedupe key.
3. Execute the workflow.
4. Inspect the saved task and notifications.

**Observed Result:**

- The existing task priority increased to CRITICAL.
- The existing task ID was preserved.
- A second notification was generated for the escalation.

**Result: PASS**

### Test 4 — Read-Back Verification

**Objective:** Confirm that saved task records can be retrieved and checked against the requested data.

**Observed Result:**

- The workflow retrieved the task after the write operation.
- The saved data passed the workflow's validation checks.
- The saved task was returned successfully.

**Result: PASS**

## 5. Testing Summary

| Test | Result |
|---|---|
| New task creation | PASS |
| Duplicate prevention | PASS |
| Priority escalation | PASS |
| Simulated notification generation | PASS |
| Read-back verification | PASS |

## 6. Problems Encountered

### Problem — PATCH Request Returned 404

The workflow initially attempted to PATCH a task when the existing task ID was null.

**Solution:**

An IF condition was configured to distinguish between new and existing records.

- Existing task ID → PATCH
- No existing task ID → POST

### Problem — Priority Validation

The workflow requires exact priority values:

`LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.

Invalid values are rejected.

## 7. Key Learning Outcomes

This exercise strengthened my understanding of:

- REST API integration.
- Workflow input validation.
- HTTP GET, POST, and PATCH operations.
- Conditional routing in n8n.
- Task deduplication.
- Security finding escalation.
- Reusable sub-workflows.
- Data verification and troubleshooting.

## 8. Conclusion

LAB 00 successfully demonstrated automated security task creation, duplicate prevention, priority escalation, simulated notifications, and read-back verification.

This reusable workflow forms the foundation for additional security automation detectors, including LAB 01 — Crypto Asset Discovery.

**Note:** Testing was performed against simulated TaskFlow data. The implementation is a learning exercise and is not presented as a production-ready, concurrency-safe task management system.
