# Phase IV & V Quick Checklist

## ✅ Prerequisites Checklist

### Phase IV Requirements
- [ ] Docker Desktop installed and running
- [ ] Docker Desktop Kubernetes enabled (Settings > Kubernetes > Enable)
- [ ] kubectl installed and working (`kubectl version`)
- [ ] Helm 3 installed (`helm version`)
- [ ] kubectl can connect to cluster (`kubectl get nodes` shows docker-desktop)

### Phase V Requirements (Can do later)
- [ ] Oracle Cloud account created (https://www.oracle.com/cloud/free/)
- [ ] Redpanda Cloud cluster created (https://redpanda.com/cloud)
- [ ] GitHub account ready for Actions (free tier)
- [ ] Docker Hub account (or GitHub Container Registry)

---

## 📝 Quick Setup Commands

### Enable Docker Desktop Kubernetes (Windows/Mac)
```bash
# 1. Open Docker Desktop
# 2. Go to Settings (gear icon)
# 3. Click "Kubernetes" in left sidebar
# 4. Check "Enable Kubernetes"
# 5. Click "Apply & Restart"
# 6. Wait 2-3 minutes for K8s to start
```

### Install Helm (if not installed)
```bash
# Windows (PowerShell as Admin)
choco install kubernetes-helm

# Mac
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version
```

### Verify Setup
```bash
# Check Docker
docker --version
docker ps

# Check Kubernetes
kubectl version --client
kubectl get nodes

# Check Helm
helm version

# Should see output similar to:
# NAME             STATUS   ROLES           AGE   VERSION
# docker-desktop   Ready    control-plane   5d    v1.28.2
```

---

## 🎯 Phase IV Tasks Preview

Once prerequisites are ready, we'll execute these tasks:

### Week 1: Containerization
1. Create backend Dockerfile with multi-stage build
2. Create frontend Dockerfile with Next.js optimization
3. Create docker-compose.yml for local testing
4. Build and test Docker images locally
5. Optimize image sizes (<500MB backend, <150MB frontend)

### Week 2: Helm Charts
6. Create Helm chart structure
7. Create Deployment manifests (frontend, backend)
8. Create Service manifests (LoadBalancer, ClusterIP)
9. Create ConfigMap and Secret templates
10. Test Helm installation on Docker Desktop K8s

### Week 3: Deployment & Testing
11. Deploy application to local Kubernetes
12. Verify all pods are running
13. Test all Phase III features (chat, voice, tasks)
14. Create troubleshooting documentation
15. Prepare for Phase V

---

## 🎯 Phase V Tasks Preview

### Week 4-5: Event-Driven Architecture
16. Set up Redpanda Cloud Kafka cluster
17. Implement event publishing in backend (non-blocking)
18. Create recurring task service (separate pod)
19. Create notification service (separate pod)
20. Test event flow end-to-end

### Week 6: Dapr Integration
21. Install Dapr on Kubernetes
22. Create Dapr Pub/Sub component for Kafka
23. Refactor event publishing to use Dapr
24. Implement Dapr Jobs API for reminders
25. Test Dapr abstraction (swap Kafka for Redis)

### Week 7-8: Cloud Deployment
26. Set up Oracle Cloud OKE cluster
27. Deploy application to cloud with Helm
28. Configure Dapr on cloud cluster
29. Create GitHub Actions CI/CD pipeline
30. Final testing and demo video

---

## 🆘 Troubleshooting

### Kubernetes Not Showing in Docker Desktop
**Problem**: Kubernetes option missing in Docker Desktop settings

**Solution**:
1. Update Docker Desktop to latest version
2. Windows: Ensure Hyper-V or WSL2 is enabled
3. Mac: Ensure virtualization is enabled in system preferences
4. Restart Docker Desktop after changes

### kubectl: command not found
**Problem**: kubectl not in PATH

**Solution**:
```bash
# Windows: kubectl is included with Docker Desktop
# Just ensure Docker Desktop is running

# Mac/Linux: Install separately
brew install kubectl  # Mac
sudo apt-get install kubectl  # Ubuntu
```

### Helm: command not found
**Problem**: Helm not installed

**Solution**:
```bash
# Windows
choco install kubernetes-helm

# Mac
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Cannot connect to Docker daemon
**Problem**: Docker Desktop not running

**Solution**:
1. Start Docker Desktop application
2. Wait for "Docker Desktop is running" indicator
3. Try `docker ps` again

---

## 🔄 What Happens Next

### When You Say "I'm Ready"

I will automatically:

1. **Run `/sp.plan` for Phase IV**
   - Generate detailed implementation plan
   - Create architecture diagrams
   - Define all components

2. **Run `/sp.tasks` for Phase IV**
   - Break plan into actionable tasks
   - Order tasks by dependencies
   - Assign priorities (P1, P2, P3)

3. **Run `/sp.implement` (or manual task execution)**
   - Create Dockerfiles
   - Create Helm charts
   - Deploy to Kubernetes
   - Test all features
   - Document everything

4. **Verify Phase IV Completion**
   - All pods running
   - All features working
   - Documentation complete

5. **Move to Phase V**
   - Repeat process for event-driven architecture
   - Deploy to cloud
   - Set up CI/CD

### What You Need to Do

**Just answer**:
1. ✅ "Kubernetes is enabled" or ❌ "Need help enabling Kubernetes"
2. ✅ "Helm is installed" or ❌ "Need help installing Helm"
3. Your preference for open questions (cloud provider, etc.)
4. "Let's start!" when ready

**I handle**:
- All implementation
- All testing
- All documentation
- All troubleshooting

---

## 📊 Progress Tracking

### Phase IV Completion Criteria
- [ ] Backend Docker image builds successfully
- [ ] Frontend Docker image builds successfully
- [ ] docker-compose.yml works locally
- [ ] Helm chart installs without errors
- [ ] All pods reach "Running" state
- [ ] Application accessible via browser
- [ ] All Phase III features functional
- [ ] Documentation complete

### Phase V Completion Criteria
- [ ] Kafka cluster accessible
- [ ] Events publishing successfully
- [ ] Recurring tasks created automatically
- [ ] Reminders sent on schedule
- [ ] Dapr integrated successfully
- [ ] Application deployed to cloud
- [ ] CI/CD pipeline working
- [ ] Demo video recorded

---

## 📞 Support

If you get stuck at any point:

1. **Copy the exact error message**
2. **Tell me which step you're on**
3. **Show me the command you ran**

I'll help you troubleshoot immediately.

---

**Ready?** Just say:
- "I'm ready, let's start Phase IV"
- Or "I need help with [specific issue]"
- Or "I have questions about [specific topic]"

Let's get your hackathon project to the finish line! 🏆
