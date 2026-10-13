# LAB 02 — Certificate Expiry Automation: Testing & Validation

## 1. Objective

Build and test an automated certificate-expiry monitoring workflow using n8n, Docker, Mockoon, and the fictional TaskFlow Security Lab.

The workflow identifies certificates approaching expiration, assigns risk-based priorities, creates security tasks, and prevents duplicate findings through the existing LAB 00 task-upsert workflow.

**Implementation:** Visual n8n workflow using HTTP Request, Split Out, IF, Switch, Edit Fields, and Execute Sub-workflow nodes. No standalone Code nodes.

## 2. Testing Environment

- **Environment:** Local Docker-based simulation
- **Automation Platform:** n8n
- **Mock API:** Mockoon
- **Website:** TaskFlow Local Lab
- **API Endpoint:** `GET /certificates`
- **Task Management:** LAB 00 — Upsert Security Task

All certificates, fingerprints, services, and tasks are fictional.

## 3. Certificate Expiry Classification

| Remaining Lifetime | Priority |
|---|---|
| Less than 7 days, including expired | CRITICAL |
| 7 to less than 14 days | HIGH |
| 14 to less than 30 days | MEDIUM |
| 30 days or more | No expiry finding |
| Invalid or missing expiry date | HIGH — Data Quality |

The workflow calculates fractional days remaining rather than rounding before classification.

## 4. Baseline Test Cases

| Certificate | Original Fixture | Expected Result |
|---|---|---|
| cert-001 | Approximately 6 days | CRITICAL |
| cert-002 | Approximately 25 days | MEDIUM |
| cert-003 | Approximately 10 days | HIGH |
| cert-004 | Approximately 90 days | No expiry task |
| cert-005 | Invalid expiry date | HIGH data-quality task |

**Expected baseline:** Four findings from five certificate records.

Actual priorities depend on the remaining lifetime when the workflow is executed.

## 5. Duplicate Prevention

LAB 02 uses stable deduplication keys:

- `certificate-expiry:<certificate-id>`
- `certificate-data-quality:<certificate-id>`

Findings are sent to LAB 00, which searches for existing tasks before creating or updating them.

Repeated sequential executions should update existing findings rather than create duplicate tasks.

## 6. Priority Escalation Test

**Certificate:** `cert-002`

**Procedure:**
1. Load the certificate in the TaskFlow website.
2. Change its expiration date to six days in the future.
3. Save the updated record.
4. Execute LAB 02 again.
5. Inspect the existing certificate-expiry task.

**Observed result:** The certificate task escalated from MEDIUM to CRITICAL.

The task retains the same deduplication key.

## 7. Certificate Renewal Test

**Certificate:** `cert-001`

**Procedure:**
1. Record the certificate's original expiry and fingerprint.
2. Change the expiry date to approximately 90 days in the future.
3. Change the fingerprint to a new simulated value.
4. Save the certificate.
5. Reload the certificate to verify the saved values.
6. Execute LAB 02 again.
7. Inspect the certificate-expiry Switch results.

**Observed result:** The renewed certificate was routed to the HEALTHY output and no longer generated an expiry finding.

## 8. Verified Task Closure

After verifying the renewed certificate, the existing `certificate-expiry:cert-001` task was manually closed.

The task was updated with:

- `status: closed`
- `verifiedAt`: verification timestamp
- `closureReason`: explanation of the verified renewal

The separate `crypto-review:cert-001` task was not resolved by the certificate renewal.

## 9. Implementation Limitations

- This lab uses simulated certificate inventory, not certificates served by production systems.
- The visual date-validation condition is simpler than the strict UTC timestamp validation in the reference guide.
- A healthy certificate does not automatically close an existing task.
- Renewal verification was performed against fresh mock API records.
- Production certificate verification would also require checks of the deployed certificate, trust chain, hostname, and connectivity.
- Concurrent task-upsert operations are not guaranteed to be atomic.

## 10. Conclusion

LAB 02 demonstrates certificate-expiry classification, simulated security-task generation, priority escalation, renewal verification, and controlled task closure.

The workflow integrates with LAB 00 and provides a practical foundation for security automation exercises in the TaskFlow Security Automation Lab.
