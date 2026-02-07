# Research: Phase V Event-Driven Architecture and Cloud Deployment

## Research Questions

### 1. Kafka Options: Redpanda Cloud vs Confluent vs Strimzi
**Question**: Which Kafka option is best for the hackathon (cost, ease, features)?

**Comparison**:

| Option | Cost | Ease of Setup | Pros | Cons |
|--------|------|---------------|------|------|
| **Redpanda Cloud Serverless** | ✅ Free tier (5GB/month) | ⭐⭐⭐⭐⭐ Easy | No Zookeeper, Fast, Kafka-compatible, 5 min setup | Newer ecosystem, less mature |
| **Confluent Cloud** | ❌ $400 credit (expires) | ⭐⭐⭐⭐ Moderate | Industry standard, Schema Registry, Great docs | Credit expires, complex pricing |
| **Self-hosted Strimzi** | ✅ Free (compute only) | ⭐⭐ Complex | Full control, K8s native, Learning experience | Steep learning curve, requires K8s knowledge |
| **CloudKarafka** | ✅ Free "Developer Duck" plan | ⭐⭐⭐⭐ Easy | Simple UI, 5 topics free | Limited throughput (10MB/s) |

**Research Results**:
- **Redpanda Cloud Serverless**: ✅ **RECOMMENDED**
  - Sign up: https://redpanda.com/cloud
  - Serverless tier completely free (no credit card required after trial)
  - Kafka-compatible API (use standard kafka-python)
  - WebConsole included for topic management
  - SASL/SCRAM authentication

**Decision**: Use Redpanda Cloud for Phase V

**Setup Steps**:
```bash
# 1. Sign up at redpanda.com/cloud
# 2. Create serverless cluster
# 3. Create topics: task-events, reminders, task-updates
# 4. Copy connection details (bootstrap server, credentials)
# 5. Test connection:
pip install kafka-python
python -c "from kafka import KafkaProducer; p = KafkaProducer(bootstrap_servers='<cluster>.cloud.redpanda.com:9092', security_protocol='SASL_SSL', sasl_mechanism='SCRAM-SHA-256', sasl_plain_username='<user>', sasl_plain_password='<pass>'); p.send('task-events', b'test'); print('OK')"
```

---

### 2. Dapr: Adoption Strategy
**Question**: Should we use Dapr fully or selectively?

**Dapr Building Blocks Analysis**:

| Building Block | Priority | Justification |
|----------------|----------|---------------|
| **Pub/Sub** | 🔴 P1 - MUST | Core requirement for Kafka abstraction |
| **Jobs API** | 🟡 P2 - SHOULD | Better than cron polling for reminders |
| **State Management** | 🟢 P3 - NICE | Keep Neon DB as primary, Dapr as cache layer |
| **Secrets** | 🟢 P3 - NICE | K8s Secrets sufficient, Dapr adds portability |
| **Service Invocation** | ⚪ P4 - OPTIONAL | Not needed, services use REST directly |

**Research Results**:
- **Selective Dapr** is **RECOMMENDED** for hackathon:
  - Start with Pub/Sub only (core requirement)
  - Add Jobs API for reminders (significant improvement over polling)
  - Skip State Management initially (Neon DB works fine)
  - Skip Secrets API (K8s Secrets sufficient)
  - Skip Service Invocation (REST is simpler)

**Benefits of Selective Approach**:
- ✅ Faster implementation (less to learn)
- ✅ Demonstrates Dapr understanding
- ✅ Preserves Phase III functionality
- ✅ Can expand later if time permits

**Implementation Strategy**:
```
Phase 1: Pub/Sub only (2-3 days)
  - Install Dapr on Minikube
  - Create Dapr Pub/Sub component for Kafka
  - Publish events via Dapr HTTP API
  - Subscribe to events via Dapr
  
Phase 2: Add Jobs API (1-2 days)
  - Schedule reminders via Dapr Jobs
  - Handle job callbacks
  
Phase 3 (Optional): State Management (1-2 days)
  - Add Dapr state component
  - Cache conversation state
```

---

### 3. Cloud Provider: Oracle vs Azure vs Google Cloud
**Question**: Which cloud provider is best for students/hackathon?

**Detailed Comparison**:

| Provider | Free Tier | Credits | Pros | Cons | Recommendation |
|----------|-----------|---------|------|------|----------------|
| **Oracle Cloud (OKE)** | ✅ Always Free (4 OCPU, 24GB RAM, no expiry) | - | No time pressure, No credit card charge, Best for learning | Smaller ecosystem, Complex console | ⭐⭐⭐⭐⭐ **BEST** |
| **Azure (AKS)** | ❌ Limited | $200 (30 days) | Good docs, Great Dapr support (Microsoft owns Dapr) | Credit expires, Requires credit card | ⭐⭐⭐ Good |
| **Google Cloud (GKE)** | ❌ Limited | $300 (90 days) | Best K8s experience (Google invented it), Generous credit | Credit expires, Complex pricing | ⭐⭐⭐⭐ Very Good |

**Research Results**:
- **Oracle Cloud OKE**: ✅ **STRONGLY RECOMMENDED**
  - Sign up: https://www.oracle.com/cloud/free/
  - Always Free tier includes:
    - 2 VMs (1 OCPU, 1GB RAM each) - sufficient for K8s nodes
    - OR 1 VM (4 OCPU, 24GB RAM) - better for K8s
    - 200GB block storage
    - 10GB object storage
  - No credit card charge after trial period
  - Perfect for hackathon (no time pressure)

**Setup Steps**:
```bash
# 1. Sign up at oracle.com/cloud/free
# 2. Create compartment: "taskmaster-hackathon"
# 3. Create OKE cluster:
#    - Quick Create (simplest)
#    - Public nodes (for external access)
#    - Always Free eligible nodes
# 4. Download kubeconfig
# 5. Configure kubectl:
mkdir -p ~/.kube
mv ~/Downloads/kubeconfig ~/.kube/config-oke
export KUBECONFIG=~/.kube/config-oke
kubectl get nodes  # Should show 2-3 nodes
```

---

### 4. Event Schema Design
**Question**: What should event payloads look like?

**Best Practices Research**:
1. Include event metadata (timestamp, event_id, version)
2. Include full entity data (avoid additional DB lookups)
3. Use consistent structure across all events
4. Version events for schema evolution

**Proposed Event Schema**:

```json
{
  "event_id": "uuid-v4",
  "event_type": "task.created",
  "event_version": "1.0",
  "timestamp": "2026-02-07T17:30:00Z",
  "user_id": "user-123",
  "correlation_id": "request-456",
  "data": {
    "task_id": 789,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "priority": "medium",
    "tags": ["shopping", "urgent"],
    "due_at": "2026-02-08T18:00:00Z",
    "recurrence_pattern": "daily",
    "created_at": "2026-02-07T17:30:00Z"
  },
  "metadata": {
    "source": "taskmaster-backend",
    "trace_id": "distributed-trace-id"
  }
}
```

**Event Types**:
- `task.created` - New task created
- `task.updated` - Task modified
- `task.completed` - Task marked done
- `task.deleted` - Task removed
- `reminder.due` - Reminder triggered
- `task.recurring.next` - Next recurring instance

---

### 5. Architecture Decision: Layered vs Full Refactor
**Question**: Should we refactor the entire backend to be event-driven, or layer Kafka on top?

**Option A: Full Refactor (Event Sourcing)**
```
User creates task
  ↓
Publish "task.created" event to Kafka
  ↓
Event handler writes to database
  ↓
Return response
```
- ✅ Fully event-driven
- ✅ Audit trail by default
- ❌ Breaking change (Phase III features might break)
- ❌ Much more complex
- ❌ Timeline: 3-4 weeks

**Option B: Layered Approach (Recommended)**
```
User creates task
  ↓
Write to database (existing code)
  ↓
Return 201 response
  ↓
Async: Publish event to Kafka (non-blocking)
```
- ✅ Non-breaking (Phase III features preserved)
- ✅ Simpler implementation
- ✅ Event publishing is fire-and-forget
- ⚠️ Not "pure" event-driven
- ✅ Timeline: 1-2 weeks

**Decision**: ✅ **Layered Approach** for hackathon

**Implementation Pattern**:
```python
# backend/api/routes.py
from fastapi import APIRouter, BackgroundTasks
from .events import publish_event

@router.post("/tasks")
async def create_task(task: TaskCreate, background_tasks: BackgroundTasks):
    # 1. Save to DB (existing code - blocking)
    new_task = await task_service.create_task(task)
    
    # 2. Publish event (non-blocking)
    background_tasks.add_task(
        publish_event,
        topic="task-events",
        event_type="task.created",
        data=new_task.dict()
    )
    
    # 3. Return response immediately
    return new_task
```

---

### 6. CI/CD: GitHub Actions vs GitLab CI vs Jenkins
**Question**: Which CI/CD tool is best for the hackathon?

**Comparison**:

| Tool | Cost | Ease of Setup | Integration with GitHub | Recommendation |
|------|------|---------------|------------------------|----------------|
| **GitHub Actions** | ✅ Free (2000 min/month public repos) | ⭐⭐⭐⭐⭐ Native | ✅ Perfect | ⭐⭐⭐⭐⭐ **BEST** |
| **GitLab CI** | ✅ Free (400 min/month) | ⭐⭐⭐ Moderate | ❌ Requires mirroring | ⭐⭐ Okay |
| **Jenkins** | ✅ Free (self-hosted) | ⭐ Complex | ⚠️ Manual setup | ❌ Overkill |

**Decision**: ✅ **GitHub Actions**

**Workflow Structure**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t taskmaster-backend:${{ github.sha }} backend/
          docker build -t taskmaster-frontend:${{ github.sha }} frontend/
      - name: Run tests
        run: |
          cd backend && pytest
          cd frontend && npm test
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push taskmaster-backend:${{ github.sha }}
          docker push taskmaster-frontend:${{ github.sha }}
  
  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          kubectl config use-context staging
          helm upgrade --install taskmaster-staging ./helm-charts/taskmaster --set image.tag=${{ github.sha }}
  
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Deploy to production
        run: |
          kubectl config use-context production
          helm upgrade --install taskmaster-prod ./helm-charts/taskmaster --set image.tag=${{ github.sha }}
```

---

### 7. Monitoring: What's Required for Hackathon?
**Question**: Do we need full observability stack (Prometheus, Grafana, Jaeger)?

**Analysis**:
- **Minimum Viable Monitoring for Hackathon**:
  - ✅ Kubernetes Dashboard (basic pod/resource monitoring)
  - ✅ kubectl logs (debugging)
  - ✅ Application-level logging (JSON logs to stdout)
  - ❌ Prometheus/Grafana (overkill for hackathon)
  - ❌ Jaeger/OpenTelemetry (nice-to-have, not required)

**Decision**: ✅ **Kubernetes Dashboard + JSON Logging**

**Setup**:
```bash
# Install Kubernetes Dashboard
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# Create admin user
kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin

# Get token
kubectl -n kubernetes-dashboard create token dashboard-admin

# Access
kubectl proxy
# Open: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

---

## Implementation Roadmap

### Phase IV: Local Kubernetes (Week 1-2)
1. **Day 1-2**: Create Dockerfiles, docker-compose.yml, build images
2. **Day 3-4**: Create Helm charts with all templates
3. **Day 5-6**: Deploy to Docker Desktop K8s, test all features
4. **Day 7**: Documentation, troubleshooting guide

### Phase V Part A: Event-Driven Architecture (Week 3-4)
1. **Day 8-9**: Set up Redpanda Cloud, create topics
2. **Day 10-11**: Implement event publishing in backend (layered approach)
3. **Day 12-13**: Create recurring task service, deploy as separate pod
4. **Day 14**: Create notification service, test end-to-end

### Phase V Part B: Dapr Integration (Week 5-6)
1. **Day 15-16**: Install Dapr on Minikube, create Pub/Sub component
2. **Day 17-18**: Refactor event publishing to use Dapr HTTP API
3. **Day 19-20**: Implement Dapr Jobs API for reminders
4. **Day 21**: Test Dapr abstraction (swap Kafka for Redis, verify it works)

### Phase V Part C: Cloud Deployment (Week 7-8)
1. **Day 22-23**: Set up Oracle Cloud OKE cluster
2. **Day 24-25**: Deploy application to OKE with Helm
3. **Day 26-27**: Configure Dapr on OKE, connect to Redpanda Cloud
4. **Day 28-29**: Create GitHub Actions CI/CD pipeline
5. **Day 30**: Final testing, documentation, demo video

**Total Timeline**: 30 days (7-8 weeks part-time)

---

## Key Takeaways

1. ✅ **Use Redpanda Cloud** (free, simple, Kafka-compatible)
2. ✅ **Use Oracle Cloud OKE** (always free, no time pressure)
3. ✅ **Selective Dapr adoption** (Pub/Sub + Jobs only)
4. ✅ **Layered architecture** (preserve Phase III, add events on top)
5. ✅ **GitHub Actions** (native, free, easy)
6. ✅ **Kubernetes Dashboard** (sufficient monitoring for hackathon)

**Status**: Research complete, ready to proceed with implementation plan.
