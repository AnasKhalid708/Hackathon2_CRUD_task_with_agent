# Tasks: Phase IV - Local Kubernetes Deployment

**Input**: Design documents from `/specs/002-kubernetes-deployment/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Tests**: No automated tests required - manual validation against acceptance criteria for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each containerization and deployment increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are absolute from repository root

## Path Conventions

- Backend: `backend/Dockerfile`, `backend/.dockerignore`
- Frontend: `frontend/Dockerfile`, `frontend/.dockerignore`
- Docker Compose: `docker-compose.yml` (repository root)
- Helm Charts: `helm-charts/taskmaster/` (repository root)
- Documentation: `docs/kubernetes-deployment.md`, `docs/troubleshooting.md`

---

## Phase 0: Prerequisites (Environment Verification)

**Purpose**: Verify all required tools are installed and configured before starting containerization work.

- [ ] T000 **PREREQUISITE**: Enable Kubernetes in Docker Desktop (Settings > Kubernetes > Enable Kubernetes) and wait for "Kubernetes is running" status
- [ ] T001 Verify Docker v28.5.1+ installed with `docker --version`
- [ ] T002 Verify kubectl v1.34.1+ installed with `kubectl version --client`
- [ ] T003 Verify Helm v4.1.0+ installed with `helm version`
- [ ] T004 Verify Docker Desktop Kubernetes is running with `kubectl cluster-info`
- [ ] T005 Switch kubectl context to docker-desktop with `kubectl config use-context docker-desktop`

**Checkpoint**: All tools verified - ready to start containerization

---

## Phase 1: Setup (Docker Infrastructure)

**Purpose**: Create base Docker infrastructure for both backend and frontend applications. No application code changes required.

- [ ] T006 [P] Create backend/.dockerignore excluding __pycache__/, *.pyc, .env, .git/, *.md, tests/, .pytest_cache/
- [ ] T007 [P] Create frontend/.dockerignore excluding node_modules/, .next/, .git/, *.md, .env*.local, coverage/
- [ ] T008 [P] Create .helmignore in future helm-charts/taskmaster/ directory excluding .git/, *.swp, *.bak, *.tmp

**Checkpoint**: Ignore files created - ready for Dockerfile creation

---

## Phase 2: Foundational (Core Containerization)

**Purpose**: Core Docker infrastructure that MUST be complete before Kubernetes deployment can proceed.

**⚠️ CRITICAL**: No Kubernetes work can begin until Docker images build successfully.

- [ ] T009 Research Python 3.12.4 base image options (python:3.12.4-slim vs python:3.12.4-alpine) and document recommendation in specs/002-kubernetes-deployment/research.md
- [ ] T010 Research Node.js 20 base image options (node:20-alpine vs node:20-slim) and document recommendation in specs/002-kubernetes-deployment/research.md
- [ ] T011 Document multi-stage build strategy for minimal image size in specs/002-kubernetes-deployment/research.md

**Checkpoint**: Research complete - ready to create Dockerfiles

---

## Phase 3: User Story 1 - Containerized Application (Priority: P1) 🎯 MVP

**Goal**: Containerize TaskMaster frontend and backend so they run consistently in Docker containers with all Phase III features functional.

**Independent Test**: Build Docker images and run containers with `docker run`, verify http://localhost:8000/docs (backend) and http://localhost:3000 (frontend) are accessible and all features work.

**Acceptance Criteria**:
1. Backend Dockerfile builds successfully in <5 minutes
2. Frontend Dockerfile builds successfully in <5 minutes
3. Backend container starts in <30 seconds
4. Frontend container starts in <45 seconds
5. Backend health check endpoint returns 200 OK
6. Frontend UI loads and connects to backend
7. All Phase III features work (CRUD, AI chat, voice, recurring tasks)

### Backend Dockerfiles (User Story 1)

- [ ] T012 [US1] Create backend/Dockerfile with multi-stage build: Stage 1 (builder) using python:3.12.4-slim, install dependencies from requirements.txt
- [ ] T013 [US1] Add Stage 2 (runtime) to backend/Dockerfile: copy only necessary files from builder, set up non-root user 'appuser', expose port 8000
- [ ] T014 [US1] Configure backend/Dockerfile CMD to run uvicorn with host=0.0.0.0 port=8000 for FastAPI application
- [ ] T015 [US1] Add HEALTHCHECK to backend/Dockerfile: `curl -f http://localhost:8000/health || exit 1` every 30s

### Frontend Dockerfiles (User Story 1)

- [ ] T016 [US1] Create frontend/Dockerfile with multi-stage build: Stage 1 (deps) using node:20-alpine, copy package*.json and run npm ci
- [ ] T017 [US1] Add Stage 2 (builder) to frontend/Dockerfile: copy source code, run `npm run build` with Next.js standalone output
- [ ] T018 [US1] Add Stage 3 (runtime) to frontend/Dockerfile: copy standalone build, set up non-root user 'nextjs', expose port 3000
- [ ] T019 [US1] Configure frontend/Dockerfile CMD to run `node server.js` for Next.js standalone server

### Docker Build and Test (User Story 1)

- [ ] T020 [US1] Build backend Docker image: `docker build -t taskmaster-backend:1.0.0 -f backend/Dockerfile ./backend`
- [ ] T021 [US1] Build frontend Docker image: `docker build -t taskmaster-frontend:1.0.0 -f frontend/Dockerfile ./frontend`
- [ ] T022 [US1] Test backend container: `docker run -p 8000:8000 -e DATABASE_URL=<neon-url> -e OPENAI_API_KEY=<key> taskmaster-backend:1.0.0` and verify /docs loads
- [ ] T023 [US1] Test frontend container: `docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 taskmaster-frontend:1.0.0` and verify UI loads
- [ ] T024 [US1] Verify backend container health check: `docker inspect --format='{{json .State.Health}}' <container-id>` shows "healthy" status
- [ ] T025 [US1] Test CRUD operations in containerized app: create task, update task, delete task via UI
- [ ] T026 [US1] Test AI chat feature (English and Urdu) in containerized app
- [ ] T027 [US1] Test voice commands in containerized app (browser feature, should work unchanged)
- [ ] T028 [US1] Test recurring tasks feature in containerized app

### Docker Compose for Multi-Container Testing (User Story 1)

- [ ] T029 [US1] Create docker-compose.yml at repository root with services: backend (build: ./backend, ports: 8000:8000) and frontend (build: ./frontend, ports: 3000:3000, depends_on: backend)
- [ ] T030 [US1] Add environment variables to docker-compose.yml: DATABASE_URL, OPENAI_API_KEY for backend; NEXT_PUBLIC_API_URL for frontend
- [ ] T031 [US1] Add healthchecks to docker-compose.yml services: backend (GET /health), frontend (GET /)
- [ ] T032 [US1] Test docker-compose: `docker-compose up --build` and verify both services start and communicate correctly
- [ ] T033 [US1] Test docker-compose stop and restart: `docker-compose down && docker-compose up` to verify clean startup
- [ ] T034 [US1] Document docker-compose.yml usage in README section "Local Docker Testing"

**Checkpoint**: Docker containers running successfully via docker-compose - User Story 1 complete and independently testable

---

## Phase 4: User Story 2 - Helm Chart Deployment (Priority: P2)

**Goal**: Create production-ready Helm charts for deploying TaskMaster to Kubernetes with proper configuration management (ConfigMaps and Secrets).

**Independent Test**: Deploy Helm chart to Docker Desktop Kubernetes with `helm install`, verify all resources created, pods running, and application accessible.

**Acceptance Criteria**:
1. Helm chart structure follows best practices (Chart.yaml, values.yaml, templates/)
2. `helm lint` passes without warnings
3. ConfigMap contains non-sensitive configuration (API URLs)
4. Secrets template shows structure (values NOT committed to Git)
5. Deployment resources define proper health probes
6. Services enable internal (ClusterIP) and external (LoadBalancer) access
7. NOTES.txt provides clear post-installation instructions

### Helm Chart Structure (User Story 2)

- [ ] T035 [US2] Create helm-charts/taskmaster/ directory structure
- [ ] T036 [US2] Create helm-charts/taskmaster/Chart.yaml with name: taskmaster, version: 1.0.0, appVersion: 1.0.0, description: TaskMaster AI - Full-stack task management with AI assistance
- [ ] T037 [US2] Create helm-charts/taskmaster/values.yaml with configurable values: replicaCount, image repository/tag, resources, service types
- [ ] T038 [US2] Create helm-charts/taskmaster/.helmignore to exclude .git/, *.swp, *.tmp, *.bak

### Helm Chart Templates - Helpers (User Story 2)

- [ ] T039 [US2] Create helm-charts/taskmaster/templates/_helpers.tpl with template functions: taskmaster.name, taskmaster.fullname, taskmaster.chart, taskmaster.labels

### Helm Chart Templates - Backend (User Story 2)

- [ ] T040 [P] [US2] Create helm-charts/taskmaster/templates/deployment-backend.yaml with Deployment: 1 replica, backend image from values, env vars from ConfigMap/Secret, liveness/readiness probes for /health
- [ ] T041 [P] [US2] Add resource limits to deployment-backend.yaml: requests (cpu: 100m, memory: 256Mi), limits (cpu: 500m, memory: 512Mi)
- [ ] T042 [P] [US2] Configure rolling update strategy in deployment-backend.yaml: maxSurge: 1, maxUnavailable: 0
- [ ] T043 [P] [US2] Create helm-charts/taskmaster/templates/service-backend.yaml with Service: ClusterIP type, port 8000, selector: app=taskmaster-backend

### Helm Chart Templates - Frontend (User Story 2)

- [ ] T044 [P] [US2] Create helm-charts/taskmaster/templates/deployment-frontend.yaml with Deployment: 1 replica, frontend image from values, env vars from ConfigMap, liveness/readiness probes for /
- [ ] T045 [P] [US2] Add resource limits to deployment-frontend.yaml: requests (cpu: 50m, memory: 128Mi), limits (cpu: 200m, memory: 256Mi)
- [ ] T046 [P] [US2] Configure rolling update strategy in deployment-frontend.yaml: maxSurge: 1, maxUnavailable: 0
- [ ] T047 [P] [US2] Create helm-charts/taskmaster/templates/service-frontend.yaml with Service: LoadBalancer type, port 3000, selector: app=taskmaster-frontend

### Helm Chart Templates - Configuration (User Story 2)

- [ ] T048 [P] [US2] Create helm-charts/taskmaster/templates/configmap.yaml with data: APP_ENV=production, NEXT_PUBLIC_API_URL=http://taskmaster-backend:8000
- [ ] T049 [P] [US2] Create helm-charts/taskmaster/templates/secret.yaml with template structure for: DATABASE_URL, OPENAI_API_KEY, JWT_SECRET_KEY (base64 encoded, values from helm install --set)
- [ ] T050 [P] [US2] Create helm-charts/taskmaster/templates/NOTES.txt with post-install instructions: how to get service URL, how to check pod status, how to view logs

### Helm Chart Documentation (User Story 2)

- [ ] T051 [US2] Create helm-charts/taskmaster/README.md with: chart description, prerequisites, installation instructions, configuration options, upgrade/rollback commands
- [ ] T052 [US2] Document secret creation command in README: `kubectl create secret generic taskmaster-secret --from-literal=database-url=<url> --from-literal=openai-api-key=<key> --from-literal=jwt-secret=<secret>`
- [ ] T053 [US2] Add values.yaml documentation comments explaining each configurable parameter

### Helm Chart Validation (User Story 2)

- [ ] T054 [US2] Run `helm lint helm-charts/taskmaster` and fix any warnings or errors
- [ ] T055 [US2] Run `helm template helm-charts/taskmaster` to preview generated Kubernetes manifests and verify correctness
- [ ] T056 [US2] Validate generated manifests with `helm template helm-charts/taskmaster | kubectl apply --dry-run=client -f -`

**Checkpoint**: Helm chart passes validation - User Story 2 complete and ready for deployment

---

## Phase 5: User Story 3 - Local Kubernetes Deployment (Priority: P3)

**Goal**: Deploy TaskMaster application to Docker Desktop Kubernetes cluster using Helm charts, with proper namespace isolation and secret management.

**Independent Test**: Access application via http://localhost:3000, perform full regression test of all Phase III features (CRUD, AI chat, voice, recurring tasks), verify all work in Kubernetes environment.

**Acceptance Criteria**:
1. Namespace "taskmaster" created and active
2. Secrets created successfully (not committed to Git)
3. Helm chart installs without errors
4. All pods reach "Running" and "Ready" state within 2 minutes
5. Backend service accessible internally via ClusterIP
6. Frontend service accessible externally via LoadBalancer on port 3000
7. All Phase III features functional in Kubernetes
8. `kubectl get pods` shows healthy status

### Kubernetes Namespace and Secrets (User Story 3)

- [ ] T057 [US3] Create taskmaster namespace: `kubectl create namespace taskmaster`
- [ ] T058 [US3] Set taskmaster namespace as default: `kubectl config set-context --current --namespace=taskmaster`
- [ ] T059 [US3] Create Kubernetes secret from environment variables: `kubectl create secret generic taskmaster-secret --from-literal=database-url=$DATABASE_URL --from-literal=openai-api-key=$OPENAI_API_KEY --from-literal=jwt-secret=$JWT_SECRET_KEY -n taskmaster`
- [ ] T060 [US3] Verify secret created: `kubectl get secrets -n taskmaster` shows taskmaster-secret

### Helm Deployment (User Story 3)

- [ ] T061 [US3] Install Helm chart: `helm install taskmaster ./helm-charts/taskmaster -n taskmaster --set backend.image.tag=1.0.0 --set frontend.image.tag=1.0.0`
- [ ] T062 [US3] Wait for deployment to complete: `kubectl wait --for=condition=available --timeout=120s deployment/taskmaster-backend deployment/taskmaster-frontend -n taskmaster`
- [ ] T063 [US3] Verify all pods are running: `kubectl get pods -n taskmaster` shows all pods in Running state
- [ ] T064 [US3] Check pod health: `kubectl get pods -n taskmaster -o wide` shows READY column as 1/1 for all pods
- [ ] T065 [US3] Verify backend service: `kubectl get svc taskmaster-backend -n taskmaster` shows ClusterIP
- [ ] T066 [US3] Verify frontend service: `kubectl get svc taskmaster-frontend -n taskmaster` shows LoadBalancer with EXTERNAL-IP localhost

### Application Testing in Kubernetes (User Story 3)

- [ ] T067 [US3] Access frontend in browser: http://localhost:3000 and verify UI loads correctly
- [ ] T068 [US3] Test user registration/login in Kubernetes deployment
- [ ] T069 [US3] Test task creation (CRUD - Create): Add new task via UI, verify it appears in list
- [ ] T070 [US3] Test task update (CRUD - Update): Edit task title and description, verify changes persist
- [ ] T071 [US3] Test task completion toggle (CRUD - Update): Mark task as complete/incomplete, verify status changes
- [ ] T072 [US3] Test task deletion (CRUD - Delete): Delete task, verify it's removed from list
- [ ] T073 [US3] Test AI chat feature with English prompt: "Create a task to buy groceries tomorrow"
- [ ] T074 [US3] Test AI chat feature with Urdu prompt: "کل کے لیے گروسری خریدنے کا ٹاسک بنائیں"
- [ ] T075 [US3] Test voice commands: Click microphone icon, speak "Add task to call doctor", verify task created
- [ ] T076 [US3] Test recurring tasks: Create daily recurring task, verify recurrence pattern set correctly
- [ ] T077 [US3] Test task priorities: Set task priority to High/Medium/Low, verify priority displayed
- [ ] T078 [US3] Test task tags: Add tags to task, verify tags displayed and filterable
- [ ] T079 [US3] Test task filters: Filter by status (completed/pending), priority, tags
- [ ] T080 [US3] Test task due dates: Set due date, verify reminder system works
- [ ] T081 [US3] Verify backend logs: `kubectl logs -f deployment/taskmaster-backend -n taskmaster` shows no errors during testing
- [ ] T082 [US3] Verify frontend logs: `kubectl logs -f deployment/taskmaster-frontend -n taskmaster` shows no errors during testing

### Kubernetes Operations Testing (User Story 3)

- [ ] T083 [US3] Test pod restart resilience: `kubectl delete pod <backend-pod> -n taskmaster`, verify Kubernetes auto-restarts pod and application recovers
- [ ] T084 [US3] Test horizontal scaling: `kubectl scale deployment taskmaster-backend --replicas=2 -n taskmaster`, verify 2 backend pods running
- [ ] T085 [US3] Test scale down: `kubectl scale deployment taskmaster-backend --replicas=1 -n taskmaster`, verify back to 1 pod
- [ ] T086 [US3] Test Helm upgrade: Make minor change to values.yaml (e.g., add annotation), run `helm upgrade taskmaster ./helm-charts/taskmaster -n taskmaster`, verify rolling update completes
- [ ] T087 [US3] Test Helm rollback: `helm rollback taskmaster -n taskmaster`, verify previous version restored

### Troubleshooting and Debugging (User Story 3)

- [ ] T088 [US3] Document common issues in docs/troubleshooting.md: pod stuck in Pending state (resource limits), ImagePullBackOff (image not found), CrashLoopBackOff (application error)
- [ ] T089 [US3] Add debugging commands to troubleshooting guide: `kubectl describe pod`, `kubectl logs`, `kubectl get events`, `kubectl exec -it <pod> -- /bin/sh`
- [ ] T090 [US3] Document how to check resource usage: `kubectl top nodes`, `kubectl top pods -n taskmaster`

**Checkpoint**: Application fully functional in Kubernetes - User Story 3 complete and all features validated

---

## Phase 6: Polish & Documentation

**Purpose**: Comprehensive documentation for deployment, usage, and troubleshooting. No code changes.

- [ ] T091 [P] Create docs/kubernetes-deployment.md with complete deployment guide: prerequisites, Docker image building, Helm installation, Kubernetes deployment, verification steps
- [ ] T092 [P] Add "Quick Start - Kubernetes" section to main README.md with 5-step deployment process
- [ ] T093 [P] Document environment variables in docs/kubernetes-deployment.md: required vs optional, where to configure (ConfigMap vs Secret)
- [ ] T094 [P] Add architecture diagram to docs/kubernetes-deployment.md showing Docker containers, Kubernetes pods, services, ConfigMaps, Secrets
- [ ] T095 [P] Document Helm chart customization in helm-charts/taskmaster/README.md: how to override values, example custom values.yaml
- [ ] T096 [P] Create docs/troubleshooting.md with common issues and solutions: port conflicts, resource limits, image pull errors, secret misconfiguration
- [ ] T097 [P] Add Dockerfile documentation comments explaining multi-stage build strategy and layer optimization
- [ ] T098 [P] Document Kubernetes commands cheat sheet in docs/kubernetes-deployment.md: kubectl, helm, docker commands
- [ ] T099 [P] Add section "Differences from Vercel Deployment" in docs/kubernetes-deployment.md
- [ ] T100 [P] Document how to clean up Kubernetes resources: `helm uninstall taskmaster -n taskmaster`, `kubectl delete namespace taskmaster`
- [ ] T101 Update main README.md with badge "Kubernetes Ready ✅" and link to deployment guide
- [ ] T102 Run full documentation review and fix any broken links or formatting issues

**Checkpoint**: Complete documentation published - Phase IV ready for handoff to Phase V (Cloud Deployment)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Prerequisites (Phase 0)**: No dependencies - MUST complete before any other work
- **Setup (Phase 1)**: Depends on Prerequisites - Creates ignore files
- **Foundational (Phase 2)**: Depends on Setup - Research phase, BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Containerization (MVP)
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion - Helm charts require Docker images
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion - Kubernetes deployment requires Helm charts
- **Polish (Phase 6)**: Depends on User Story 3 completion - Documentation of working deployment

### Critical Path

```
Prerequisites → Setup → Foundational → User Story 1 (Docker) → User Story 2 (Helm) → User Story 3 (K8s) → Polish
```

**Note**: User stories in this feature are sequential by nature (must containerize before deploying to Kubernetes), unlike typical feature development where stories can be parallel.

### User Story Dependencies

- **User Story 1 (Containerization)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Helm Charts)**: MUST complete User Story 1 first - Helm charts reference Docker images
- **User Story 3 (Kubernetes Deployment)**: MUST complete User Story 2 first - Deployment requires Helm charts

### Within Each User Story

- **User Story 1**: Backend Dockerfile → Frontend Dockerfile → Build images → Test containers → docker-compose
- **User Story 2**: Chart structure → Template files (can be parallel) → Validation
- **User Story 3**: Namespace/Secrets → Helm install → Pod verification → Feature testing → Operations testing

### Parallel Opportunities

**Phase 1 (Setup)**: All 3 ignore file creation tasks can run in parallel [T006, T007, T008]

**Phase 3 (User Story 1)**:
- Backend and Frontend Dockerfile creation can be parallel initially (T012-T019)
- Backend image build and Frontend image build can be parallel (T020, T021)

**Phase 4 (User Story 2)**:
- All template files can be created in parallel once _helpers.tpl exists (T040-T050)
- Documentation tasks can run in parallel with validation (T051-T053)

**Phase 6 (Polish)**:
- All documentation tasks can run in parallel (T091-T102)

---

## Parallel Example: User Story 2 (Helm Templates)

```bash
# After _helpers.tpl is created, launch all template files together:
Task T040: "Create deployment-backend.yaml"
Task T044: "Create deployment-frontend.yaml"  
Task T043: "Create service-backend.yaml"
Task T047: "Create service-frontend.yaml"
Task T048: "Create configmap.yaml"
Task T049: "Create secret.yaml"
Task T050: "Create NOTES.txt"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 0: Prerequisites (verify tools installed)
2. Complete Phase 1: Setup (create ignore files)
3. Complete Phase 2: Foundational (research Docker base images)
4. Complete Phase 3: User Story 1 (Docker containers)
5. **STOP and VALIDATE**: Run docker-compose up, test all features
6. **Decision Point**: Can deploy Phase IV MVP (containerized app) or continue to Kubernetes

### Incremental Delivery

1. **Docker MVP** (Phase 0-3): Containerized application running locally via docker-compose → Testable, deployable increment
2. **Helm Charts** (Phase 4): Add Kubernetes package management → Enhanced deployment capability
3. **Kubernetes Deployment** (Phase 5): Full orchestration on local Kubernetes → Production-like environment
4. **Polished Documentation** (Phase 6): Complete user guides → Ready for team handoff

Each phase builds on the previous one without breaking functionality.

### Testing Strategy

**No automated tests** - Manual validation against acceptance criteria:

- **User Story 1**: Docker container functionality (all Phase III features work in containers)
- **User Story 2**: Helm chart validation (helm lint, helm template, dry-run)
- **User Story 3**: Kubernetes deployment verification (full feature regression test in K8s)

---

## Task Summary

| Phase | Task Count | Parallelizable | Can Start After |
|-------|-----------|----------------|-----------------|
| Phase 0: Prerequisites | 6 | No (sequential checks) | Immediately |
| Phase 1: Setup | 3 | Yes (all 3) | Phase 0 |
| Phase 2: Foundational | 3 | No (research) | Phase 1 |
| Phase 3: User Story 1 | 28 | Partial (6 tasks) | Phase 2 |
| Phase 4: User Story 2 | 22 | Partial (10 tasks) | Phase 3 |
| Phase 5: User Story 3 | 33 | Partial (2 tasks) | Phase 4 |
| Phase 6: Polish | 12 | Yes (all 12) | Phase 5 |
| **TOTAL** | **107 tasks** | **31 parallelizable** | - |

**Estimated Timeline**: 2-3 days for solo developer (research + implementation + testing)

**Parallel Opportunities**: 31 tasks can run in parallel if multiple developers available, reducing timeline by ~30%

**Independent Test Criteria**:
- **US1**: Docker containers run with docker-compose, all features work → MVP ready
- **US2**: Helm chart validates with helm lint, templates generate correctly → Ready to deploy
- **US3**: Application runs in Kubernetes, all features tested → Production-ready

**Suggested MVP Scope**: Phase 0-3 (containerized application with docker-compose) provides immediate value and testable increment before investing in Kubernetes complexity.

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1, US2, US3)
- Each user story builds on the previous (sequential dependency due to technology stack)
- Verify Docker builds before proceeding to Helm charts
- Verify Helm charts before deploying to Kubernetes
- All Phase III features MUST remain functional throughout containerization
- No application code changes - only infrastructure files added
- Secrets MUST NOT be committed to Git (documented in troubleshooting)
- Stop at any checkpoint to validate independently before proceeding
