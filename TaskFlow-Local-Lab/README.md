# TaskFlow Local Lab

Use this kit with the local Docker + Mockoon edition of
TaskFlow_Security_Automation_Lab_Guide.pdf, dated 9 October 2026.
Do not combine its files with the older cloud or Supabase kits.

## What is here
- compose.yaml: runs local n8n and the Mockoon API in Docker.
- mockoon/taskflow.mockoon.json: native Mockoon environment; open it in
  Mockoon Desktop with Open environment, not OpenAPI import.
- mockoon/index.html, styles.css, app.js: complete local mock website.
- mockoon/seed-data.json: invented records initialized by the website.
- code/: individual n8n Code-node scripts. These are NOT workflow imports.
- events/: sample webhook request files.
- examples/: individual data collections and request examples.
- practice/certificate.json: the small Desktop learning exercise.
- VALIDATION.txt: exactly what was and was not tested.

## First-time setup (full instructions are in the PDF)
1. Install Docker Desktop for your Mac's chip. Open it and wait for the
   engine to run. Verify docker info and docker compose version.
2. Extract this entire folder into Documents. Stop an older n8n container
   using host port 5678; do not delete its data.
3. In Terminal:

   cd "$HOME/Documents/TaskFlow-Local-Lab"
   docker compose config
   docker compose up -d n8n
   docker compose port n8n 5678

4. Open http://localhost:5678 in Safari. Create the local owner account.
   This is a separate instance from your existing n8n Cloud account.
5. Install Mockoon Desktop and complete the port-3001 practice exercise
   in Chapter 7. Stop that Desktop practice server afterward.
6. Open mockoon/taskflow.mockoon.json in Mockoon Desktop. Allow a needed
   format migration, save in the same folder, and leave Desktop stopped.
7. In Terminal:

   docker compose up -d mock-api
   docker compose port mock-api 3000

8. Open http://localhost:3000/health and then http://localhost:3000.
   Click Initialize / reset demo. This clears mock progress and creates
   the starting rows with dates relative to now.
9. Follow Chapter 9 to edit, save and read back a certificate. Then build
   the shared task helper in Chapter 10 before the eight workflows.

## Three different addresses
- Safari -> n8n: http://localhost:5678
- Safari -> mock website/API: http://localhost:3000
- n8n HTTP Request -> mock API: http://mock-api:3000

Inside n8n's container, localhost is NOT the other container.

## Saving and stopping
n8n data is stored in the named volume taskflow_local_n8n_data, separate
from an older n8n_data volume. The PDF explains full backup and recovery.
Mockoon's live bucket changes reset when its server stops/restarts.
Use the website's Export fresh snapshot before stopping. Restore that
snapshot to resume, or initialize again to begin a new practice run.

Stop safely with docker compose stop. Resume with docker compose start.
Never use docker compose down -v or volume pruning as routine cleanup.
A sleeping Mac or stopped Docker cannot provide an always-on scheduler.

## Safety and scope
Use only invented data. Never add private keys, real API credentials,
customer records or production infrastructure details to this mock API.
The website is an unauthenticated local exercise, not a secure admin app.
Do not publish its ports to a public interface or expose it by a tunnel.
N8N_SECURE_COOKIE=false and internal runners are local single-user lab
choices, not hardened public deployment guidance.

A new row or flag simulates a change; it does not sign JWTs, rotate vendor
credentials, deploy PQC, block GitHub merges or send an on-call page.

## Version notes
The initial image tags are latest. Record the installed versions after
successful startup, then pin compatible release tags before controlled
updates. Opening/saving the environment in a compatible Mockoon Desktop
release may be necessary for its native file format. Test the live stack
on your Mac; offline checks do not replace that installation test.
