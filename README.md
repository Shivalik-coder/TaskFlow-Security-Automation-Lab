# TaskFlow Security Automation Lab

**Cryptographic Security Automation & Post-Quantum Cryptography (PQC) Readiness**

**Created by:** Shubham Uniyal  
**Project Guide:** [TaskFlow Security Automation Lab Guide (PDF)](docs/TaskFlow-Security-Automation-Lab-Guide.pdf)  
**Development Assistance:** AI Large Language Models (LLMs)  
**Project Status:** Work in Progress  
**Technologies:** n8n, Docker, Mockoon, REST APIs, JavaScript

---

## Project Overview

TaskFlow Security Automation Lab is a hands-on cybersecurity automation project created by Shubham Uniyal with assistance from AI Large Language Models (LLMs).

The project explores cryptographic asset discovery, security monitoring, automated task management, and post-quantum cryptography readiness using n8n, Docker, and Mockoon.

It demonstrates how automated workflows can retrieve security information, classify cryptographic algorithms, identify findings, create remediation tasks, prevent duplicate alerts, and track security-related changes.

The project includes an original technical guide, a local Docker and Mockoon starter environment, reference scripts, and implemented n8n workflows with testing documentation.

## Original Project Guide

The **TaskFlow Security Automation Lab Guide** was created by **Shubham Uniyal**, with assistance from AI Large Language Models (LLMs).

This guide provides the technical foundation and step-by-step instructions for building the fictional TaskFlow cybersecurity automation environment.

It covers Docker, Mockoon, n8n, cryptographic asset assessment, certificate monitoring, automated security tasks, and post-quantum cryptography readiness exercises.

The repository documents the actual implementation, testing, troubleshooting, and progress of the project.

**Implementation Status:** LAB 00 and LAB 01 are completed and tested. Remaining exercises are planned or in progress.

[Read the Complete TaskFlow Security Automation Lab Guide (PDF)](docs/TaskFlow-Security-Automation-Lab-Guide.pdf)

---

## Important Disclaimer — Fictional Environment

**TaskFlow is an invented website and fictional application used exclusively for educational and simulation purposes.**

The TaskFlow website, its business environment, cryptographic assets, certificates, vendors, security findings, and incidents are simulated.

The website functions as a local demonstration dashboard, while Mockoon provides simulated REST API endpoints.

No real company infrastructure, production cryptographic keys, or customer systems are being scanned, monitored, or modified.

This project demonstrates cybersecurity automation concepts and is not a production-ready security monitoring platform.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| n8n | Security workflow automation |
| Docker | Local containerized environment |
| Docker Compose | Running connected services |
| Mockoon | Simulated REST API and data collections |
| JavaScript | Workflow logic and reference scripts |
| REST APIs | Retrieving and updating simulated records |
| JSON | Structured data and workflow exports |
| GitHub | Documentation and version control |

---

## Local Development Environment

The TaskFlow Local Docker and Mockoon Starter Kit provides the simulated infrastructure required to run the exercises.

### Repository Components

| Folder or File | Description |
|---|---|
| `compose.yaml` | Docker Compose configuration |
| `mockoon/` | Fictional TaskFlow website, API configuration, and seed data |
| `code/` | JavaScript reference scripts from the project guide |
| `examples/` | Simulated JSON records and API request examples |
| `events/` | Sample webhook event payloads |
| `practice/` | Beginner Mockoon practice exercises |
| `workflows/` | Completed n8n workflow exports |
| `docs/` | Project guide, setup instructions, and testing documentation |
| `screenshots/` | Workflow screenshots and visual evidence |

Scripts for future labs are reference material and do not indicate that those labs have been implemented or tested.

### Getting Started

1. Install Docker Desktop and Docker Compose.
2. Clone or download this GitHub repository.
3. Open the repository folder in Terminal.
4. Check the Docker Compose configuration using `docker compose config`.
5. Start the local services using `docker compose up -d`.
6. Open n8n at `http://localhost:5678`.
7. Open the fictional TaskFlow website at `http://localhost:3000`.
8. Initialize the simulated records using the website's **Initialize / reset demo** button.
9. Follow the project guide to configure and test the n8n workflows.

**Important:** Initialize/reset replaces the mock records, so avoid using it when you need to preserve your existing test results. Follow the starter-kit instructions for saving and restoring your mock data.

For complete installation details, refer to:

[TaskFlow Starter Kit Setup Instructions](docs/Starter-Kit-Setup.md)

The environment is designed for local educational use only. Its development settings should not be exposed to the public internet.

---

## Current Development Progress

**Project Status:** Work in Progress

| Component | Status |
|---|---|
| Docker and Mockoon environment | Completed |
| TaskFlow simulated website and REST API | Working |
| LAB 00 — Upsert Security Task | Completed and tested |
| LAB 00 — Deduplication and priority escalation | Passed |
| LAB 01 — Crypto Asset Discovery | Completed and tested |
| LAB 01 — Eight cryptographic asset assessments | Passed |
| LAB 01 — Seven automated security review tasks | Passed |
| LAB 01 — Duplicate prevention on rerun | Passed |
| LAB 02 — Certificate Expiry Automation | Next |
| LAB 03–08 | Planned |

---

## Completed Security Automation Workflows

### LAB 00 — Upsert Security Task

**Status: Completed and Tested**

A reusable n8n workflow that validates security findings, creates or updates tasks, prevents duplicates, verifies stored information, and records simulated notifications.

#### Workflow Architecture

![LAB 00 Workflow Overview](screenshots/LAB-00-Workflow-Overview.png)

#### Features

- Validates incoming security findings.
- Checks whether a matching task already exists.
- Creates new tasks using HTTP POST.
- Updates existing tasks using HTTP PATCH.
- Prevents duplicate security findings.
- Escalates task priorities when necessary.
- Generates simulated security notifications.
- Verifies task updates through API read-back.

#### Testing Results

| Test | Result |
|---|---|
| New task creation | PASS |
| Duplicate prevention | PASS |
| Priority escalation | PASS |
| Simulated notifications | PASS |
| Saved task verification | PASS |

**Testing Status:** Completed and verified using fictional TaskFlow data.

#### Project Files

- [View LAB 00 Workflow](workflows/LAB-00-Upsert-Security-Task.json)
- [View LAB 00 Testing Documentation](docs/LAB-00-Testing.md)

---

### LAB 01 — Crypto Asset Discovery

**Status: Completed and Tested**

An automated cryptographic inventory assessment workflow built with n8n's visual nodes.

The workflow retrieves simulated cryptographic assets, classifies their algorithm labels, updates their assessment records, and generates security review tasks through LAB 00.

#### Workflow Architecture

![LAB 01 Crypto Asset Discovery Workflow](screenshots/LAB-01-Workflow-Overview.png)

#### Implementation

Visual n8n workflow using Manual Trigger, HTTP Request, Split Out, Switch, Edit Fields, and Execute Sub-workflow nodes.

The implemented LAB 01 uses visual routing and n8n expressions rather than standalone JavaScript Code nodes for classification.

#### Verified Results

- 8 cryptographic assets assessed.
- 6 public-key-related assets flagged for review.
- 1 unknown-algorithm asset flagged for investigation.
- 1 AES asset assessed separately without a review task.
- 7 security review tasks created.
- No duplicate crypto-review tasks created on repeated execution.

#### Testing Results

| Test | Result |
|---|---|
| Inventory retrieval | PASS |
| Eight assets processed | PASS |
| Algorithm classification | PASS |
| Inventory assessment updates | PASS |
| Seven security review tasks created | PASS |
| AES excluded from review task creation | PASS |
| Duplicate prevention on rerun | PASS |

**Environment:** Fictional TaskFlow website and simulated Mockoon API.

These classification rules are designed for the sample dataset and do not constitute a comprehensive cryptographic security assessment.

#### Project Files

- [View LAB 01 Workflow](workflows/LAB-01-Crypto-Asset-Discovery.json)
- [View LAB 01 Implementation and Testing](docs/LAB-01-Testing.md)

---

## Next Milestone — LAB 02

### Certificate Expiry Automation

The next workflow will evaluate certificate expiry dates, identify approaching or expired certificates, and create or update remediation tasks through LAB 00.

**Planned Features:**

- Retrieve simulated certificate inventory records.
- Evaluate certificate expiration dates.
- Detect certificates nearing expiry.
- Detect invalid expiry-date information.
- Assign priorities based on the findings.
- Generate or update security tasks.
- Prevent duplicate remediation tasks.

**Status:** Not yet implemented.

---

## Project Goals

- Discover and inventory simulated cryptographic assets.
- Identify algorithms requiring post-quantum security assessment.
- Generate and update security review tasks automatically.
- Avoid creating duplicate findings.
- Simulate security notifications and remediation workflows.
- Build reusable and maintainable automation components.
- Develop practical cybersecurity automation and PQC-readiness skills.
- Document implementation, troubleshooting, and testing progress.

---

## Project Limitations

This project operates entirely within a fictional, locally simulated environment.

The workflows do not perform production cryptographic scanning, real key rotation, live certificate replacement, or verified post-quantum cryptography deployment.

Security classifications and remediation tasks are educational simulations.

Future workflows and reference scripts should not be considered completed implementations until they are separately configured and tested.

---

## Project Author

**Shubham Uniyal**

This project and its accompanying TaskFlow Security Automation Lab Guide were created by Shubham Uniyal with assistance from AI Large Language Models for research, technical guidance, documentation, and troubleshooting.

Development, workflow configuration, and testing progress are documented as the project evolves.

---

*All TaskFlow assets, services, certificates, and security events are fictional and used only for controlled cybersecurity automation simulations.*
