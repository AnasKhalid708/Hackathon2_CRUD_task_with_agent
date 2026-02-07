# Implementation Plan: Phase IV - Local Kubernetes Deployment

**Branch**: `002-kubernetes-deployment` | **Date**: 2026-02-07 | **Spec**: [specs/002-kubernetes-deployment/spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-kubernetes-deployment/spec.md`

**Note**: This implementation plan provides a complete roadmap for containerizing and deploying TaskMaster AI to local Kubernetes using Docker Desktop, Helm charts, and standard tooling.

## Summary

Deploy the TaskMaster AI full-stack application (FastAPI backend + Next.js frontend) to local Kubernetes cluster using Docker Desktop. Create production-ready Dockerfiles with multi-stage builds, docker-compose for local testing, and Helm charts for Kubernetes deployment. All Phase III features (AI chat, voice commands, multi-language support, recurring tasks) must remain fully functional in the containerized environment. Use standard Docker CLI and kubectl (not Gordon, kubectl-ai, or kagent). Deploy to Docker Desktop Kubernetes with proper namespace isolation, ConfigMaps for configuration, and Secrets for sensitive data.

## Technical Context

**Language/Version**: 
- Backend: Python 3.12.4 (EXACT version required per constitution)
- Frontend: Node.js 20 (Alpine for production)

**Primary Dependencies**: 
- Backend: FastAPI 0.109.0+, SQLModel 0.0.14+, Google ADK 1.15.0, bcrypt 4.1.0+
- Frontend: Next.js 14.0.4, React 18.2, CopilotKit 1.51.2, Web Speech API

**Storage**: 
- PostgreSQL via Neon Serverless (external, not containerized)
- Connection via SSL required
- Multi-user isolation enforced at application layer

**Testing**: 
- Manual validation against acceptance criteria
- All Phase III features must pass regression testing
- Container testing via docker-compose before Kubernetes deployment

**Target Platform**: 
- Docker Desktop Kubernetes (not Minikube - user confirmed)
- kubectl v1.34.1
- Helm v4.1.0
- Docker v28.5.1
- Windows environment with Docker Desktop

**Project Type**: Web application (FastAPI backend + Next.js frontend)

**Performance Goals**: 
- Docker images build time: <5 minutes
- Backend container startup: <30 seconds
- Frontend container startup: <45 seconds
- Kubernetes deployment: <2 minutes
- Health check response: <2 seconds
- Backend image size: <500MB (target ~300MB)
- Frontend image size: <200MB (target ~150MB)

**Constraints**: 
- All Phase III features must remain functional (AI chat, voice, multi-language, recurring tasks)
- No cloud deployment (local Kubernetes only)
- No custom Ingress controllers (LoadBalancer/NodePort sufficient)
- No SSL/TLS certificates (local HTTP acceptable)
- Secrets must NOT be committed to Git
- Use standard Docker CLI (no Gordon)
- Use standard kubectl (no kubectl-ai or kagent)

**Scale/Scope**: 
- Single developer local deployment
- Support 1-3 replicas per service for testing horizontal scaling
- taskmaster namespace for resource isolation
- ConfigMaps for non-sensitive config (API URLs)
- Secrets for sensitive data (OpenAI keys, DB passwords)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle 1: Multi-Language Inclusivity ✅
**Status**: PASS  
**Verification**: Urdu and English support already implemented in Phase III. Containers will preserve this functionality through environment variable configuration and external Gemini AI integration.

### Principle 2: Accessibility Through Voice ✅
**Status**: PASS  
**Verification**: Web Speech API runs in browser client-side. Containerization does not affect voice functionality as it's a frontend browser feature.

### Principle 3: User Experience Excellence ✅
**Status**: PASS  
**Verification**: UI remains unchanged. Kubernetes deployment is transparent to end users. All existing UX patterns preserved.

### Principle 4: Code Quality & Maintainability ✅
**Status**: PASS  
**Verification**: 
- Minimal changes: Adding Dockerfiles, docker-compose.yml, Helm charts only
- No modification to existing backend/frontend application code
- New infrastructure code properly documented
- Dockerfiles use multi-stage builds for maintainability

### Principle 5: Documentation Completeness ✅
**Status**: PASS  
**Verification**: Will create comprehensive documentation including:
- README.md in helm-charts/ directory
- Deployment guide with step-by-step instructions
- Troubleshooting guide for common issues
- NOTES.txt in Helm chart for post-install instructions

### Principle 6: Privacy & Security ✅
**Status**: PASS  
**Verification**:
- Secrets stored in Kubernetes Secrets (base64 encoded)
- No secrets in Git via .dockerignore and .helmignore
- Environment variables for sensitive configuration
- Containers run as non-root user
- Existing JWT and bcrypt authentication preserved

### Principle 7: Reliability & Error Handling ✅
**Status**: PASS  
**Verification**:
- Liveness and readiness probes in Kubernetes
- Automatic pod restart on failure (restartPolicy: Always)
- Health check endpoints in both services
- Rolling update strategy for zero-downtime deployments
- Graceful degradation if Neon DB unavailable

### Architecture Alignment ✅
**Status**: PASS  
**Verification**: Maintains existing web application architecture (backend + frontend). Adds containerization layer without architectural changes.

### **GATE RESULT**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-kubernetes-deployment/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Docker/Kubernetes best practices research
├── data-model.md        # Phase 1: Container configuration models
├── quickstart.md        # Phase 1: Quick deployment guide
└── contracts/           # Phase 1: Kubernetes resource definitions
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── configmap.yaml
    └── secret-template.yaml
```

### Source Code (repository root)

```text
# Backend containerization
backend/
├── Dockerfile           # NEW: Multi-stage Python 3.12.4 build
├── .dockerignore        # NEW: Exclude unnecessary files from image
├── src/                 # EXISTING: Application code (unchanged)
├── api/                 # EXISTING: FastAPI routes (unchanged)
├── requirements.txt     # EXISTING: Dependencies (unchanged)
└── alembic/             # EXISTING: Database migrations (unchanged)

# Frontend containerization
frontend/
├── Dockerfile           # NEW: Multi-stage Next.js 14 build
├── .dockerignore        # NEW: Exclude node_modules, .next from build
├── src/                 # EXISTING: Next.js application (unchanged)
├── public/              # EXISTING: Static assets (unchanged)
└── package.json         # EXISTING: Dependencies (unchanged)

# Docker Compose for local testing
docker-compose.yml       # NEW: Multi-container local testing

# Helm charts for Kubernetes deployment
helm-charts/
└── taskmaster/
    ├── Chart.yaml       # NEW: Helm chart metadata
    ├── values.yaml      # NEW: Configurable values
    ├── README.md        # NEW: Helm chart documentation
    ├── .helmignore      # NEW: Exclude files from chart package
    └── templates/
        ├── _helpers.tpl             # NEW: Template helpers
        ├── deployment-backend.yaml  # NEW: Backend Kubernetes Deployment
        ├── deployment-frontend.yaml # NEW: Frontend Kubernetes Deployment
        ├── service-backend.yaml     # NEW: Backend ClusterIP Service
        ├── service-frontend.yaml    # NEW: Frontend LoadBalancer Service
        ├── configmap.yaml           # NEW: Application configuration
        ├── secret.yaml              # NEW: Sensitive data (templated)
        └── NOTES.txt                # NEW: Post-install instructions

# Kubernetes deployment documentation
docs/
├── kubernetes-deployment.md   # NEW: Complete deployment guide
└── troubleshooting.md         # NEW: Common issues and solutions
```

**Structure Decision**: Web application structure with containerization layer added. All existing backend and frontend code remains untouched. New files are exclusively infrastructure-related (Dockerfiles, Helm charts, docker-compose). This maintains separation of concerns between application logic and deployment configuration.

## Complexity Tracking

**No constitutional violations detected. This section intentionally left empty.**

All complexity is justified by the feature requirements:
- Docker Desktop Kubernetes is the specified platform (not introducing new complexity)
- Helm charts follow industry standard for Kubernetes package management
- Multi-stage Dockerfiles optimize image size and build efficiency
- Namespace isolation (taskmaster) is a Kubernetes best practice

---

## Phase 0: Research & Analysis

### Research Objectives

1. **Docker Multi-Stage Builds Best Practices**
   - Task: Research optimal base images for Python 3.12.4 and Node.js 20
   - Task: Investigate layer caching strategies for faster rebuilds
   - Task: Research security best practices (non-root users, minimal attack surface)
   - Output: Base image recommendations and Dockerfile patterns

2. **Next.js Containerization**
   - Task: Research Next.js 14 standalone output mode for production
   - Task: Investigate optimal build-time vs runtime environment variables
   - Task: Research static file serving strategies in containers
   - Output: Next.js Docker configuration patterns

3. **FastAPI Containerization**
   - Task: Research Python package installation optimization (pip cache, wheel builds)
   - Task: Investigate uvicorn production configuration in containers
   - Task: Research health check endpoint patterns for containerized FastAPI
   - Output: FastAPI Docker configuration patterns

4. **Kubernetes ConfigMaps and Secrets**
   - Task: Research best practices for separating sensitive vs non-sensitive config
   - Task: Investigate secret rotation strategies (out of scope but document future consideration)
   - Task: Research environment variable injection patterns
   - Output: Configuration management strategy

5. **Helm Chart Best Practices**
   - Task: Research Chart.yaml metadata requirements
   - Task: Investigate values.yaml structure for flexibility
   - Task: Research template helper functions (_helpers.tpl patterns)
   - Task: Research resource limits and requests recommendations
   - Output: Helm chart structure and naming conventions

6. **Health Checks and Probes**
   - Task: Research liveness vs readiness probe differences
   - Task: Investigate optimal probe timing (initialDelaySeconds, periodSeconds)
   - Task: Research health check endpoint implementations
   - Output: Probe configuration recommendations

7. **Docker Desktop Kubernetes Specifics**
   - Task: Research LoadBalancer vs NodePort service types in Docker Desktop
   - Task: Investigate localhost access patterns
   - Task: Research resource allocation on Docker Desktop
   - Output: Docker Desktop Kubernetes configuration notes

### Research Output

**File**: `specs/002-kubernetes-deployment/research.md`

**Structure**:
```markdown
# Phase IV Kubernetes Deployment Research

## 1. Docker Base Images
Decision: [python:3.12.4-slim for backend, node:20-alpine for frontend]
Rationale: [size vs functionality tradeoff]
Alternatives: [python:3.12.4-alpine (too minimal), python:3.12.4 (too large)]

## 2. Multi-Stage Build Patterns
Decision: [builder stage + runtime stage]
Rationale: [separate build dependencies from runtime]
Implementation: [specific Dockerfile pattern]

## 3. Next.js Production Configuration
Decision: [standalone output mode]
Rationale: [minimal bundle size, optimal startup time]
Configuration: [next.config.js settings]

## 4. Configuration Management
Decision: [ConfigMap for API_URL, Secret for OPENAI_API_KEY, DATABASE_URL]
Rationale: [separation of concerns, security]
Implementation: [kubectl create secret pattern]

## 5. Helm Chart Structure
Decision: [standard Helm 3 structure with _helpers.tpl]
Rationale: [reusability, maintainability]
Templates: [deployment, service, configmap, secret patterns]

## 6. Health Checks
Decision: [/health endpoint on both services]
Rationale: [simple, effective, standard pattern]
Configuration: [liveness: /health every 10s, readiness: /health after 5s]

## 7. Docker Desktop Kubernetes
Decision: [LoadBalancer for frontend, ClusterIP for backend]
Rationale: [external access vs internal only]
Access: [http://localhost:3000 via LoadBalancer]
```

---

## Phase 1: Design & Contracts

### 1.1 Data Model

**File**: `specs/002-kubernetes-deployment/data-model.md`

```markdown
# Container Configuration Data Model

## Backend Container Environment Variables

| Variable | Type | Source | Required | Example |
|----------|------|--------|----------|---------|
| DATABASE_URL | string | Secret | Yes | postgresql://user:pass@host/db |
| OPENAI_API_KEY | string | Secret | Yes | sk-... |
| JWT_SECRET_KEY | string | Secret | Yes | random-secret-key |
| APP_ENV | string | ConfigMap | No | production |
| PORT | number | ConfigMap | No | 8000 |

## Frontend Container Environment Variables

| Variable | Type | Source | Required | Example |
|----------|------|--------|----------|---------|
| NEXT_PUBLIC_API_URL | string | ConfigMap | Yes | http://backend-service:8000 |
| NEXT_PUBLIC_APP_ENV | string | ConfigMap | No | production |

## Docker Compose Configuration

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment: [DATABASE_URL, OPENAI_API_KEY, JWT_SECRET_KEY]
    healthcheck: [GET /health]
  
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment: [NEXT_PUBLIC_API_URL]
    depends_on: [backend]
```

## Kubernetes Resources

### Deployment Spec
- Replicas: 1 (default), configurable via values.yaml
- Strategy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- Resources: requests (cpu: 100m, memory: 256Mi), limits (cpu: 500m, memory: 512Mi)

### Service Spec
- Backend: ClusterIP, port 8000
- Frontend: LoadBalancer, port 3000

### ConfigMap
- Non-sensitive application configuration
- API URLs, feature flags

### Secret
- Sensitive credentials (base64 encoded)
- Database passwords, API keys
```

### 1.2 API Contracts

**Directory**: `specs/002-kubernetes-deployment/contracts/`

**Files to Generate**:

1. **backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "taskmaster.fullname" . }}-backend
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      app: taskmaster-backend
  template:
    metadata:
      labels:
        app: taskmaster-backend
    spec:
      containers:
      - name: backend
        image: {{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: taskmaster-secret
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
```

2. **frontend-deployment.yaml** (similar structure)
3. **backend-service.yaml** (ClusterIP)
4. **frontend-service.yaml** (LoadBalancer)
5. **configmap.yaml** (application config)
6. **secret-template.yaml** (secret structure, values not included)

### 1.3 Quickstart Guide

**File**: `specs/002-kubernetes-deployment/quickstart.md`

```markdown
# TaskMaster Kubernetes Quickstart

## Prerequisites
- Docker Desktop installed and running
- Kubernetes enabled in Docker Desktop
- kubectl v1.34.1+
- Helm v4.1.0+

## Quick Deploy (5 minutes)

### Step 1: Build Images
```bash
docker build -t taskmaster-backend:1.0.0 ./backend
docker build -t taskmaster-frontend:1.0.0 ./frontend
```

### Step 2: Create Namespace
```bash
kubectl create namespace taskmaster
kubectl config set-context --current --namespace=taskmaster
```

### Step 3: Create Secrets
```bash
kubectl create secret generic taskmaster-secret \
  --from-literal=database-url="postgresql://..." \
  --from-literal=openai-api-key="sk-..." \
  --from-literal=jwt-secret="your-secret"
```

### Step 4: Deploy with Helm
```bash
helm install taskmaster ./helm-charts/taskmaster
```

### Step 5: Access Application
```bash
kubectl get services
# Access frontend at http://localhost:3000
```

## Verify Deployment
```bash
kubectl get pods
kubectl logs -f deployment/taskmaster-backend
kubectl logs -f deployment/taskmaster-frontend
```
```

### 1.4 Agent Context Update

**Action**: Run update script to add Kubernetes tools to agent context

```powershell
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

**Technologies to Add**:
- Docker (containerization)
- Kubernetes (orchestration)
- Helm (package management)
- Docker Desktop Kubernetes (local cluster)

---

## Phase 2: Implementation Tasks (Preview)

*Note: Detailed task breakdown created by `/sp.tasks` command*

### Task Categories

1. **Docker Infrastructure** (P0)
   - Create backend Dockerfile with multi-stage build
   - Create frontend Dockerfile with standalone output
   - Create .dockerignore files
   - Create docker-compose.yml
   - Test local Docker builds

2. **Helm Chart Creation** (P1)
   - Initialize Helm chart structure
   - Create Chart.yaml and values.yaml
   - Create deployment templates (backend, frontend)
   - Create service templates
   - Create ConfigMap and Secret templates
   - Create _helpers.tpl and NOTES.txt

3. **Kubernetes Deployment** (P2)
   - Enable Kubernetes in Docker Desktop
   - Create taskmaster namespace
   - Create Kubernetes secrets
   - Deploy Helm chart
   - Verify pod health
   - Test service connectivity

4. **Feature Validation** (P3)
   - Test all Phase III CRUD operations
   - Test AI chat functionality (English and Urdu)
   - Test voice commands
   - Test recurring tasks
   - Test authentication flow
   - Verify database connectivity

5. **Documentation** (P4)
   - Write deployment guide
   - Write troubleshooting guide
   - Document Dockerfile build process
   - Document Helm chart customization
   - Update main README with Kubernetes instructions

---

## Success Criteria

### Phase 0 Complete When:
- [ ] research.md exists with all 7 research areas covered
- [ ] All NEEDS CLARIFICATION items resolved
- [ ] Docker base images selected with rationale
- [ ] Health check patterns documented

### Phase 1 Complete When:
- [ ] data-model.md created with container environment variables
- [ ] All 6 Kubernetes manifest contracts created in contracts/
- [ ] quickstart.md provides working 5-step deployment
- [ ] Agent context updated with Kubernetes technologies
- [ ] Constitution check re-validated (all principles still passing)

### Phase 2 Complete When:
- [ ] `/sp.tasks` command generates detailed task breakdown
- [ ] Tasks categorized by Red-Green-Refactor workflow
- [ ] Each task has clear acceptance criteria
- [ ] Task dependencies identified

### Overall Feature Complete When:
- [ ] Docker images build successfully (<5 min)
- [ ] docker-compose up runs both services
- [ ] Helm chart deploys without errors
- [ ] All pods reach Running state
- [ ] Frontend accessible at http://localhost:3000
- [ ] All Phase III features functional
- [ ] Complete documentation published

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Docker Desktop not running | Medium | High | Pre-flight check script, clear error messages |
| Kubernetes not enabled | Medium | High | Documentation includes enablement instructions |
| Port conflicts (3000, 8000) | Low | Medium | Configurable ports via values.yaml |
| Image build failures | Low | High | Multi-stage builds with clear error messages |
| Neon DB connection issues | Low | High | Connection string validation, retry logic |
| Resource exhaustion | Low | Medium | Document minimum system requirements |

---

## Next Steps

1. **Phase 0**: Run research tasks, populate research.md
2. **Phase 1**: Generate all design artifacts (data-model, contracts, quickstart)
3. **Phase 1**: Update agent context with Kubernetes technologies
4. **Phase 2**: Run `/sp.tasks` to generate implementation tasks
5. **Implementation**: Execute tasks in Red-Green-Refactor workflow
6. **Validation**: Test all features in Kubernetes environment
7. **Documentation**: Complete user-facing guides
8. **PHR**: Record this plan execution in prompt history

---

**Plan Status**: ✅ READY FOR PHASE 0 EXECUTION  
**Constitution Compliance**: ✅ ALL PRINCIPLES ALIGNED  
**Estimated Timeline**: 2-3 days (research + implementation + testing)
