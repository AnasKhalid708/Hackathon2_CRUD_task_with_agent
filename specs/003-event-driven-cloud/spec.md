# Feature Specification: Phase V - Event-Driven Cloud Deployment

**Feature Branch**: `003-event-driven-cloud`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: Hackathon Phase V Requirements - Advanced event-driven architecture with Kafka, Dapr, and cloud deployment (Oracle OKE/Azure AKS/Google GKE)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Event-Driven Task Operations (Priority: P1)

As a user, I want all task operations (create, update, delete, complete) to be published as events so that other services can react to my actions without blocking the main application flow.

**Why this priority**: This is the foundation of event-driven architecture. Without event publishing, we cannot build decoupled microservices for notifications, recurring tasks, or audit logs.

**Independent Test**: Can be fully tested by performing task operations and verifying events are published to Kafka topics using Kafka console consumer.

**Acceptance Scenarios**:

1. **Given** user creates a new task, **When** task is saved to database, **Then** "task.created" event is published to "task-events" Kafka topic with task details
2. **Given** user updates a task, **When** task is updated in database, **Then** "task.updated" event is published with old and new values
3. **Given** user marks task as complete, **When** task status changes, **Then** "task.completed" event is published for recurring task processing
4. **Given** user deletes a task, **When** task is removed from database, **Then** "task.deleted" event is published with task ID and user ID
5. **Given** event publishing fails, **When** Kafka is unavailable, **Then** main task operation still succeeds (non-blocking) and error is logged

---

### User Story 2 - Automated Recurring Task Creation (Priority: P2)

As a user, I want recurring tasks to automatically create the next instance when I complete one, so I don't have to manually recreate tasks that repeat daily, weekly, or monthly.

**Why this priority**: This enhances the existing recurring task feature by making it fully automated and event-driven, eliminating manual intervention.

**Independent Test**: Can be fully tested by creating a recurring task, completing it, and verifying the next instance is automatically created via event consumer.

**Acceptance Scenarios**:

1. **Given** user completes a daily recurring task, **When** "task.completed" event is consumed by recurring task service, **Then** new task instance is created for next day
2. **Given** user completes a weekly recurring task on Monday, **When** event is processed, **Then** new task is created for next Monday
3. **Given** recurring task has end date, **When** end date is reached, **Then** no new instance is created and series ends
4. **Given** user modifies recurring task pattern, **When** next instance is created, **Then** new pattern is applied
5. **Given** recurring task service crashes during processing, **When** service restarts, **Then** Kafka consumer resumes from last committed offset (no lost events)

---

### User Story 3 - Scheduled Task Reminders via Dapr Jobs (Priority: P3)

As a user, I want to receive notifications for tasks approaching their due dates, so I can stay on top of my deadlines without manually checking.

**Why this priority**: This enhances user experience by proactively notifying users about upcoming deadlines using Dapr's scheduling capabilities.

**Independent Test**: Can be fully tested by creating a task with due date, scheduling a reminder via Dapr Jobs API, and verifying notification is sent at the scheduled time.

**Acceptance Scenarios**:

1. **Given** user creates task with due date tomorrow at 3 PM, **When** task is saved, **Then** reminder job is scheduled via Dapr Jobs API for tomorrow at 2:45 PM (15 min before)
2. **Given** reminder job fires at scheduled time, **When** Dapr calls the webhook endpoint, **Then** notification event is published to "reminders" topic
3. **Given** notification service consumes reminder event, **When** event is processed, **Then** push notification or email is sent to user
4. **Given** user updates task due date, **When** new due date is saved, **Then** old reminder job is canceled and new job is scheduled
5. **Given** user deletes task with pending reminder, **When** task is deleted, **Then** associated reminder job is canceled

---

### User Story 4 - Real-Time Task Sync Across Clients (Priority: P4)

As a user, I want task changes to appear instantly on all my open devices/tabs, so I have a consistent view of my tasks without manual refresh.

**Why this priority**: This provides a modern, real-time user experience similar to collaborative apps like Google Docs.

**Independent Test**: Can be fully tested by opening two browser tabs, making a change in one, and verifying the other updates instantly via WebSocket.

**Acceptance Scenarios**:

1. **Given** user has TaskMaster open on laptop and phone, **When** user creates task on laptop, **Then** task appears on phone within 2 seconds
2. **Given** user completes task on one device, **When** "task.completed" event is published, **Then** WebSocket service broadcasts update to all connected clients
3. **Given** multiple users collaborate on shared tasks (future feature), **When** one user updates task, **Then** all collaborators see update in real-time
4. **Given** user loses internet connection, **When** connection is restored, **Then** client resyncs and shows all missed updates
5. **Given** WebSocket connection drops, **When** client detects disconnection, **Then** client automatically reconnects and resubscribes

---

### User Story 5 - Dapr Pub/Sub Abstraction (Priority: P5)

As a developer, I want to use Dapr Pub/Sub instead of direct Kafka client libraries, so I can swap Kafka for another message broker (RabbitMQ, Redis) without changing application code.

**Why this priority**: This provides flexibility and decoupling, making the architecture more maintainable and cloud-portable.

**Independent Test**: Can be fully tested by switching Dapr Pub/Sub component from Kafka to Redis and verifying application continues working without code changes.

**Acceptance Scenarios**:

1. **Given** backend publishes event via Dapr HTTP API, **When** event is sent to `http://localhost:3500/v1.0/publish/kafka-pubsub/task-events`, **Then** event is delivered to Kafka without backend importing kafka-python
2. **Given** notification service subscribes via Dapr, **When** Dapr component is configured, **Then** service receives events without Kafka client library
3. **Given** Dapr Pub/Sub component is swapped from Kafka to Redis, **When** component YAML is updated, **Then** application continues working with zero code changes
4. **Given** Kafka cluster is down, **When** Dapr retries publishing, **Then** events are queued and delivered when Kafka recovers (built-in resiliency)
5. **Given** developer deploys to different cloud provider, **When** Dapr components are reconfigured, **Then** same application code works on AWS, Azure, or GCP

---

### User Story 6 - Cloud Kubernetes Deployment (Priority: P6)

As a DevOps engineer, I want to deploy the application to a cloud Kubernetes cluster (Oracle OKE/Azure AKS/Google GKE) so users can access it from anywhere with production-grade reliability.

**Why this priority**: This is the final deployment target for the hackathon, moving from local Minikube to production-ready cloud infrastructure.

**Independent Test**: Can be fully tested by deploying Helm charts to cloud K8s cluster and verifying all features work from public internet.

**Acceptance Scenarios**:

1. **Given** Oracle Cloud OKE cluster is provisioned, **When** Helm chart is deployed, **Then** all pods start successfully and are accessible via public load balancer
2. **Given** application is deployed to cloud, **When** user accesses public URL, **Then** all Phase III features work (chat, voice, tasks)
3. **Given** application is deployed with Dapr, **When** Dapr components are configured for cloud services, **Then** Pub/Sub, State, Jobs, and Secrets work correctly
4. **Given** Kafka is deployed on Redpanda Cloud, **When** backend publishes events, **Then** events are delivered to cloud Kafka cluster
5. **Given** cloud deployment is updated via Helm, **When** `helm upgrade` is executed, **Then** rolling update completes with zero downtime

---

### User Story 7 - CI/CD Pipeline with GitHub Actions (Priority: P7)

As a DevOps engineer, I want an automated CI/CD pipeline that builds Docker images, runs tests, and deploys to Kubernetes whenever code is pushed to GitHub.

**Why this priority**: This automates deployment and ensures consistent, reliable releases following DevOps best practices.

**Independent Test**: Can be fully tested by pushing code to GitHub and verifying GitHub Actions workflow builds, tests, and deploys automatically.

**Acceptance Scenarios**:

1. **Given** code is pushed to main branch, **When** GitHub Actions workflow triggers, **Then** Docker images are built and pushed to container registry
2. **Given** Docker images are built, **When** tests pass, **Then** Helm chart is deployed to staging environment
3. **Given** staging deployment succeeds, **When** manual approval is given, **Then** production deployment is triggered
4. **Given** deployment fails, **When** error is detected, **Then** pipeline fails and sends notification to developer
5. **Given** deployment succeeds, **When** pipeline completes, **Then** deployment status is reported and application is accessible

---

### Edge Cases

- What happens when Kafka cluster is down? Dapr should queue events and retry with exponential backoff
- How does system handle duplicate events? Should implement idempotency keys to prevent duplicate processing
- What happens when event consumer crashes mid-processing? Kafka consumer groups should rebalance and another consumer picks up
- How does system handle event schema changes? Should version events (e.g., "task.created.v2") and maintain backward compatibility
- What happens when Dapr sidecar crashes? Kubernetes should restart sidecar automatically; app should handle temporary unavailability
- How does system handle high event volume? Should implement rate limiting and backpressure mechanisms
- What happens when cloud load balancer health check fails? Kubernetes should remove unhealthy pod from service endpoints
- How does system handle database connection pool exhaustion? Should implement connection pooling and circuit breakers

## Requirements *(mandatory)*

### Functional Requirements

#### Event-Driven Architecture Requirements

- **FR-001**: System MUST publish "task.created" event to Kafka when task is created (non-blocking)
- **FR-002**: System MUST publish "task.updated" event to Kafka when task is updated (non-blocking)
- **FR-003**: System MUST publish "task.completed" event to Kafka when task is marked complete (non-blocking)
- **FR-004**: System MUST publish "task.deleted" event to Kafka when task is deleted (non-blocking)
- **FR-005**: Event payload MUST include event_type, task_id, user_id, timestamp, and full task_data
- **FR-006**: Event publishing MUST NOT block main REST API response (async/fire-and-forget)
- **FR-007**: System MUST log event publishing failures without failing the main operation
- **FR-008**: Events MUST be published to correct Kafka topics: "task-events", "reminders", "task-updates"

#### Recurring Task Service Requirements

- **FR-009**: System MUST run a separate recurring task service that consumes "task.completed" events
- **FR-010**: Service MUST create next task instance when recurring task is completed
- **FR-011**: Service MUST calculate next due date based on recurrence pattern (daily, weekly, monthly)
- **FR-012**: Service MUST stop creating instances when end date is reached
- **FR-013**: Service MUST handle consumer group rebalancing without losing events
- **FR-014**: Service MUST implement idempotency to prevent duplicate task creation

#### Notification Service Requirements

- **FR-015**: System MUST run a separate notification service that consumes "reminders" events
- **FR-016**: Service MUST send notifications via configured channel (browser push, email, webhook)
- **FR-017**: Service MUST handle notification delivery failures gracefully
- **FR-018**: Service MUST track notification delivery status
- **FR-019**: Service MUST support multiple notification channels per user

#### Dapr Integration Requirements

- **FR-020**: System MUST use Dapr Pub/Sub component for Kafka abstraction (no direct Kafka client in app code)
- **FR-021**: System MUST publish events via Dapr HTTP API: `POST http://localhost:3500/v1.0/publish/{pubsub}/{topic}`
- **FR-022**: System MUST subscribe to events via Dapr subscription endpoint
- **FR-023**: System MUST use Dapr Jobs API for scheduling reminders: `POST http://localhost:3500/v1.0-alpha1/jobs/{name}`
- **FR-024**: System SHOULD use Dapr State API for conversation state (optional, Neon DB is primary)
- **FR-025**: System SHOULD use Dapr Secrets API for managing API keys (optional, K8s Secrets is primary)
- **FR-026**: System MUST define Dapr component YAML for Kafka Pub/Sub
- **FR-027**: System MUST define Dapr component YAML for state store (if used)
- **FR-028**: System MUST define Dapr component YAML for secrets store (if used)

#### Kafka Requirements

- **FR-029**: System MUST use Kafka topics: "task-events", "reminders", "task-updates"
- **FR-030**: System MUST configure Kafka with appropriate retention policies (7 days minimum)
- **FR-031**: System MUST use consumer groups for load balancing
- **FR-032**: System MUST commit offsets after successful event processing
- **FR-033**: System MUST use Redpanda Cloud serverless tier OR self-hosted Strimzi on Kubernetes
- **FR-034**: Kafka cluster MUST be accessible from Kubernetes pods

#### Cloud Deployment Requirements

- **FR-035**: System MUST deploy to Azure AKS (using Azure Student account) OR Oracle Cloud OKE OR Google GKE
- **FR-036**: System MUST use Helm charts from Phase IV for cloud deployment
- **FR-037**: System MUST configure Dapr on cloud Kubernetes cluster
- **FR-038**: System MUST use cloud load balancer for external access
- **FR-039**: System MUST use managed Kubernetes services (not self-managed)
- **FR-040**: System MUST connect to Neon DB from cloud cluster (existing Phase III database)

#### CI/CD Requirements

- **FR-041**: System MUST implement GitHub Actions workflow for CI/CD
- **FR-042**: Workflow MUST build Docker images on every push to main branch
- **FR-043**: Workflow MUST run tests before deployment
- **FR-044**: Workflow MUST push Docker images to container registry (Docker Hub or GitHub Container Registry)
- **FR-045**: Workflow MUST deploy to Kubernetes using Helm upgrade
- **FR-046**: Workflow MUST support manual approval for production deployment
- **FR-047**: Workflow MUST notify on deployment success or failure

### Non-Functional Requirements

#### Performance Requirements

- **NFR-001**: Event publishing MUST NOT add more than 50ms latency to REST API responses
- **NFR-002**: Recurring task service MUST process events with latency < 5 seconds
- **NFR-003**: Notification service MUST deliver notifications within 10 seconds of event
- **NFR-004**: WebSocket message broadcast MUST have latency < 2 seconds
- **NFR-005**: Cloud deployment MUST handle 100 concurrent users with <1s response time

#### Reliability Requirements

- **NFR-006**: Event consumers MUST automatically recover from crashes (Kubernetes restart + Kafka offset resume)
- **NFR-007**: System MUST maintain 99.5% uptime in cloud environment
- **NFR-008**: Kafka MUST not lose events (replication factor ≥ 2 if self-hosted)
- **NFR-009**: Dapr sidecar restart MUST NOT cause data loss

#### Scalability Requirements

- **NFR-010**: System MUST support horizontal scaling of event consumers
- **NFR-011**: Kafka consumer groups MUST rebalance automatically when replicas scale
- **NFR-012**: Cloud deployment MUST support auto-scaling based on CPU/memory usage
- **NFR-013**: System MUST handle 1000 events per second

#### Security Requirements

- **NFR-014**: Kafka communication MUST use SASL/SSL for authentication (Redpanda Cloud)
- **NFR-015**: Dapr component secrets MUST be stored in Kubernetes Secrets
- **NFR-016**: API keys MUST NOT be hardcoded in Docker images
- **NFR-017**: Cloud load balancer MUST support HTTPS (future SSL certificate setup)

#### Maintainability Requirements

- **NFR-018**: Event schema MUST be documented with examples
- **NFR-019**: Dapr components MUST include descriptive comments
- **NFR-020**: CI/CD pipeline MUST include deployment rollback capability
- **NFR-021**: System MUST include monitoring dashboards (Kubernetes Dashboard or Grafana)

#### Compatibility Requirements

- **NFR-022**: Dapr components MUST be compatible with Dapr 1.12+
- **NFR-023**: Kafka setup MUST be compatible with Kafka 3.0+ or Redpanda 23.0+
- **NFR-024**: GitHub Actions MUST work with GitHub Free tier
- **NFR-025**: All Phase III features MUST remain functional after Phase V changes

## Technical Architecture *(optional)*

### Event-Driven Microservices Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       KUBERNETES CLUSTER (Oracle OKE)                       │
│                                                                             │
│  ┌───────────────────────┐         ┌─────────────────────────────────────┐│
│  │  Frontend Pod         │         │        Backend Pod                   ││
│  │  ┌─────────────────┐  │         │  ┌──────────────────────────────┐   ││
│  │  │   Next.js App   │  │         │  │      FastAPI + MCP           │   ││
│  │  │   CopilotKit    │◄─┼─────────┼─►│      Task Agent              │   ││
│  │  │   Voice Chat    │  │         │  │                              │   ││
│  │  └─────────────────┘  │         │  │  ┌──────────────────────┐    │   ││
│  │  ┌─────────────────┐  │         │  │  │ Event Publisher      │    │   ││
│  │  │  Dapr Sidecar   │  │         │  │  │ (Dapr Pub/Sub)      │───┼───┐││
│  │  └─────────────────┘  │         │  │  └──────────────────────┘    │  │││
│  └───────────────────────┘         │  └──────────────────────────────┘  │││
│                                     │  ┌─────────────────┐               │││
│                                     │  │  Dapr Sidecar   │               │││
│                                     │  └─────────────────┘               │││
│                                     └──────────────────────────────────────┘│
│                                                        │                    │
│                                                        ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                       KAFKA CLUSTER (Redpanda Cloud)                  │ │
│  │   Topics: task-events, reminders, task-updates                        │ │
│  └──────────────┬────────────────────────────┬──────────────────────────┘ │
│                 │                            │                             │
│                 ▼                            ▼                             │
│  ┌───────────────────────────┐   ┌────────────────────────────────────┐  │
│  │  Recurring Task Service   │   │   Notification Service             │  │
│  │  ┌─────────────────────┐  │   │   ┌─────────────────────────────┐  │  │
│  │  │  Event Consumer     │  │   │   │   Event Consumer            │  │  │
│  │  │  (task.completed)   │  │   │   │   (reminders)               │  │  │
│  │  └─────────────────────┘  │   │   └─────────────────────────────┘  │  │
│  │  ┌─────────────────────┐  │   │   ┌─────────────────────────────┐  │  │
│  │  │  Task Creator       │  │   │   │   Email/Push Sender         │  │  │
│  │  └─────────────────────┘  │   │   └─────────────────────────────┘  │  │
│  │  ┌─────────────────────┐  │   │   ┌─────────────────────────────┐  │  │
│  │  │  Dapr Sidecar       │  │   │   │   Dapr Sidecar              │  │  │
│  │  └─────────────────────┘  │   │   └─────────────────────────────┘  │  │
│  └───────────────────────────┘   └────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                        DAPR COMPONENTS                                │ │
│  │  - pubsub.kafka (Redpanda Cloud connection)                           │ │
│  │  - state.postgresql (Neon DB - optional)                              │ │
│  │  - secretstore.kubernetes                                             │ │
│  │  - jobs (Dapr Jobs API for scheduled reminders)                       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  External:                                                                 │
│  - Neon DB (PostgreSQL - existing Phase III database)                     │
│  - Load Balancer (Oracle Cloud LB / Azure LB / GCP LB)                    │
└────────────────────────────────────────────────────────────────────────────┘
```

### Event Flow Architecture

```
User Action (Create Task)
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. REST API Call: POST /tasks                                │
│    - Save to Neon DB (blocking)                              │
│    - Return 201 Created to user immediately                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Async Event Publishing (non-blocking)                     │
│    POST http://localhost:3500/v1.0/publish/kafka-pubsub/     │
│         task-events                                          │
│    Body: {"event_type": "created", "task_id": 123, ...}      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Dapr Pub/Sub Component                                    │
│    - Publishes to Kafka "task-events" topic                  │
│    - Handles retries if Kafka is down                        │
└──────────────────────────┬───────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌────────────────────────┐    ┌────────────────────────────┐
│ 4a. Audit Service      │    │ 4b. Analytics Service      │
│     (Future)           │    │     (Future)               │
│  - Logs all events     │    │  - Aggregates metrics      │
│  - Creates audit trail │    │  - Generates insights      │
└────────────────────────┘    └────────────────────────────┘

User Completes Recurring Task
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. REST API Call: PATCH /tasks/{id}                          │
│    - Update task.completed = true in Neon DB                 │
│    - Return 200 OK to user                                   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Publish "task.completed" Event                            │
│    - Check if task has recurrence_pattern                    │
│    - Publish event with recurrence metadata                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Recurring Task Service (Consumer)                         │
│    - Consume from Kafka consumer group                       │
│    - Calculate next_due_date (e.g., today + 1 day)           │
│    - Create new task via REST API or direct DB insert        │
│    - Commit Kafka offset                                     │
└──────────────────────────────────────────────────────────────┘

User Creates Task with Due Date
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. REST API Call: POST /tasks                                │
│    - Save task with due_at = "2026-02-10T15:00:00Z"          │
│    - Calculate remind_at = due_at - 15 minutes               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Schedule Reminder via Dapr Jobs API                       │
│    POST http://localhost:3500/v1.0-alpha1/jobs/              │
│         reminder-task-123                                    │
│    Body: {                                                   │
│      "dueTime": "2026-02-10T14:45:00Z",                      │
│      "data": {"task_id": 123, "user_id": "user-456"}         │
│    }                                                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼ (wait until scheduled time)
┌──────────────────────────────────────────────────────────────┐
│ 3. Dapr Fires Job at Scheduled Time                          │
│    POST /api/jobs/trigger (webhook endpoint in backend)      │
│    Body: {"data": {"task_id": 123, "user_id": "user-456"}}   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Backend Publishes "reminder.due" Event                    │
│    - Publish to "reminders" topic                            │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Notification Service Consumes Event                       │
│    - Fetch task details from DB                              │
│    - Send browser push notification / email                  │
│    - Commit Kafka offset                                     │
└──────────────────────────────────────────────────────────────┘
```

### Dapr Component Configuration

**pubsub.kafka.yaml** (Redpanda Cloud):
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "your-cluster.cloud.redpanda.com:9092"
    - name: authType
      value: "password"
    - name: saslUsername
      secretKeyRef:
        name: kafka-secrets
        key: username
    - name: saslPassword
      secretKeyRef:
        name: kafka-secrets
        key: password
    - name: consumerGroup
      value: "taskmaster-group"
```

**state.postgresql.yaml** (Optional - Neon DB):
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: db-secrets
        key: connection-string
```

**secretstore.kubernetes.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

### CI/CD Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      GITHUB REPOSITORY                            │
│                                                                   │
│  Developer pushes code to main branch                             │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS WORKFLOW                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 1: Checkout Code                                    │   │
│  │  - actions/checkout@v3                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 2: Build Docker Images                              │   │
│  │  - Build frontend:${{ github.sha }}                       │   │
│  │  - Build backend:${{ github.sha }}                        │   │
│  │  - docker build --cache-from for faster builds            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 3: Run Tests                                        │   │
│  │  - pytest backend/tests                                   │   │
│  │  - npm test (frontend unit tests)                         │   │
│  │  - Fail pipeline if tests fail                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 4: Push Images to Registry                          │   │
│  │  - docker push to Docker Hub / GHCR                       │   │
│  │  - Tag with git commit SHA and 'latest'                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 5: Deploy to Kubernetes (Staging)                   │   │
│  │  - helm upgrade --install taskmaster-staging ./helm       │   │
│  │  - kubectl wait for pods to be ready                      │   │
│  │  - Run smoke tests                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 6: Manual Approval (Production)                     │   │
│  │  - environment: production (requires approval)            │   │
│  │  - Slack notification for approval                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 7: Deploy to Production                             │   │
│  │  - helm upgrade --install taskmaster-prod ./helm          │   │
│  │  - Rollout status check                                   │   │
│  │  - Post-deployment smoke tests                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Step 8: Notify Success/Failure                           │   │
│  │  - Slack webhook with deployment status                   │   │
│  │  - GitHub PR comment with deployment URL                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Message Broker | Kafka (Redpanda Cloud) | 3.0+ / 23.0+ | Free serverless tier |
| Event Abstraction | Dapr | 1.12+ | Pub/Sub, Jobs, State, Secrets |
| Cloud Provider | Oracle Cloud OKE | Free tier | 4 OCPU, 24GB RAM always free |
| Kubernetes | Managed K8s (OKE/AKS/GKE) | 1.28+ | Managed control plane |
| Container Registry | Docker Hub / GHCR | - | Free public repos |
| CI/CD | GitHub Actions | - | Free for public repos |
| Monitoring | Kubernetes Dashboard | - | Basic monitoring |

## Dependencies

### External Dependencies

- Phase IV completion (Docker images, Helm charts, Minikube deployment)
- Cloud provider account (Oracle Cloud / Azure / Google Cloud)
- Redpanda Cloud account (free tier) OR Strimzi setup
- Docker Hub account OR GitHub Container Registry
- kubectl configured for cloud cluster
- Dapr CLI installed (`dapr init -k`)
- Helm 3 installed

### Internal Dependencies

- All Phase III features must remain functional
- Existing Neon DB must be accessible from cloud cluster
- Environment variables for cloud deployment
- Cloud-specific secrets (kubeconfig, registry credentials)

## Success Criteria *(mandatory)*

### Definition of Done

1. **Event-Driven Architecture**:
   - [ ] Backend publishes events to Kafka via Dapr Pub/Sub
   - [ ] Events include task.created, task.updated, task.completed, task.deleted
   - [ ] Event publishing is non-blocking (does not slow down REST API)
   - [ ] All events logged for debugging

2. **Recurring Task Service**:
   - [ ] Separate microservice deployed to Kubernetes
   - [ ] Consumes task.completed events from Kafka
   - [ ] Automatically creates next task instance
   - [ ] Handles daily, weekly, monthly recurrence
   - [ ] Idempotent (no duplicate tasks)

3. **Notification Service**:
   - [ ] Separate microservice deployed to Kubernetes
   - [ ] Consumes reminders events from Kafka
   - [ ] Sends browser push notifications (or email placeholder)
   - [ ] Handles notification failures gracefully

4. **Dapr Integration**:
   - [ ] Dapr installed on Kubernetes cluster
   - [ ] Dapr Pub/Sub component configured for Kafka
   - [ ] Dapr Jobs API used for scheduling reminders
   - [ ] Dapr sidecars running alongside application pods
   - [ ] No direct Kafka client libraries in application code

5. **Kafka Deployment**:
   - [ ] Redpanda Cloud serverless cluster created OR Strimzi deployed
   - [ ] Topics created: task-events, reminders, task-updates
   - [ ] Consumer groups configured
   - [ ] Connectivity verified from Kubernetes

6. **Cloud Deployment**:
   - [ ] Application deployed to Oracle OKE (or AKS/GKE)
   - [ ] All pods running and healthy
   - [ ] Load balancer configured with public IP
   - [ ] Application accessible from public internet
   - [ ] All Phase III features working in cloud

7. **CI/CD Pipeline**:
   - [ ] GitHub Actions workflow created (.github/workflows/deploy.yml)
   - [ ] Docker images built and pushed on every commit
   - [ ] Tests run automatically
   - [ ] Staging deployment automated
   - [ ] Production deployment requires manual approval
   - [ ] Deployment notifications sent

8. **Documentation**:
   - [ ] Architecture diagrams updated
   - [ ] Event schema documented
   - [ ] Dapr component configuration documented
   - [ ] Cloud deployment guide
   - [ ] CI/CD setup instructions

### Acceptance Criteria

- All events published successfully to Kafka
- Recurring tasks created automatically without user intervention
- Reminders sent at scheduled times
- Zero code changes required when swapping Kafka for Redis (Dapr abstraction works)
- Application accessible from public internet via cloud load balancer
- CI/CD pipeline deploys to staging on every push
- All Phase III features functional in cloud environment
- No manual coding (all via spec-driven workflow)

## Out of Scope

- Multi-tenancy (each user has separate database)
- Custom domain and SSL certificates (use default cloud LB URL)
- Advanced monitoring (Prometheus, Grafana, Jaeger - basic K8s Dashboard only)
- Autoscaling policies (manual scaling only)
- Blue-green or canary deployments (basic rolling updates only)
- Multi-region deployment
- Disaster recovery and backup strategy
- Security hardening (pen testing, vulnerability scanning)
- Load testing and performance optimization
- WebSocket service for real-time sync (mentioned in user stories but optional for Phase V)

## Open Questions

1. **Cloud Provider**: Do you have access to Oracle Cloud (free tier, no credit card charge after trial), or prefer Azure ($200 credit) or Google Cloud ($300 credit)?
2. **Redpanda Cloud**: Can you create a Redpanda Cloud account and access serverless tier?
3. **GitHub Actions**: Does your repository need to be public for free GitHub Actions, or do you have paid plan?
4. **Container Registry**: Should we use Docker Hub (free public repos) or GitHub Container Registry?
5. **Kafka or Redis**: If Redpanda Cloud access fails, should we use Redis for Pub/Sub (simpler but less Kafka-like)?
6. **Dapr State Store**: Should we migrate from direct Neon DB queries to Dapr state management, or keep Neon as primary?
7. **Notification Channel**: Should we implement browser push notifications, email, or just log notification events?
8. **Cluster Size**: Should we deploy with minimum replicas (1 per service) or test horizontal scaling (2-3 replicas)?

## Next Steps

After this spec is approved:

1. Verify Phase IV completion (Docker images, Helm charts, Minikube deployment)
2. Research and sign up for cloud provider (Oracle Cloud recommended)
3. Research and sign up for Redpanda Cloud
4. Run `/sp.plan` to generate Phase V implementation plan
5. Run `/sp.tasks` to break down into actionable tasks
6. Begin implementation using Claude Code agent workflow
7. Deploy to Minikube first with Dapr + Kafka (local testing)
8. Deploy to cloud after local validation
