# Kubernetes Setup Guide for Phase IV

## ⚠️ IMPORTANT: Enable Kubernetes in Docker Desktop

Before proceeding with Phase IV implementation, Kubernetes must be enabled in Docker Desktop.

### Step 1: Open Docker Desktop

1. Look for the Docker icon in your system tray (Windows taskbar)
2. Right-click the Docker icon
3. Click "Dashboard" or double-click to open Docker Desktop

### Step 2: Enable Kubernetes

1. In Docker Desktop, click the **Settings** gear icon (⚙️) in the top-right
2. Click **Kubernetes** in the left sidebar
3. Check the box "**Enable Kubernetes**"
4. Click "**Apply & Restart**"
5. Wait 2-3 minutes for Kubernetes to initialize

Docker Desktop will download Kubernetes components and start a local cluster.

### Step 3: Verify Installation

After Docker Desktop restarts, open PowerShell and run:

```powershell
# Check if Kubernetes is running
kubectl get nodes

# Expected output:
# NAME             STATUS   ROLES           AGE   VERSION
# docker-desktop   Ready    control-plane   1m    v1.29.1

# Check current context
kubectl config current-context

# Expected output:
# docker-desktop
```

If you see the `docker-desktop` node with STATUS `Ready`, you're all set!

### Troubleshooting

#### Problem: Kubernetes option is grayed out or missing

**Solution**:
1. Update Docker Desktop to the latest version:
   - Settings > Software Updates > Check for updates
2. On Windows, ensure WSL 2 is enabled:
   - Open PowerShell as Administrator
   - Run: `wsl --install`
   - Restart your computer
3. Try enabling Kubernetes again

#### Problem: Kubernetes fails to start

**Solution**:
1. Reset Kubernetes:
   - Settings > Kubernetes > Reset Kubernetes Cluster
   - Click "Reset" and wait for it to reinstall
2. If still failing, check Docker Desktop logs:
   - Settings > Troubleshoot > View logs
   - Look for Kubernetes-related errors
3. Ensure you have enough resources:
   - Settings > Resources
   - Recommended: 4 CPUs, 8GB RAM for Kubernetes

#### Problem: kubectl commands still fail after enabling

**Solution**:
```powershell
# Switch to docker-desktop context explicitly
kubectl config use-context docker-desktop

# Verify it's set
kubectl config current-context

# Test connection
kubectl get nodes
```

---

## Current Status Check

Run these commands to verify your setup:

```powershell
# 1. Docker version (should be v28.5.1 or higher)
docker --version

# 2. kubectl version (should be v1.34.1 or higher)
kubectl version --client

# 3. Helm version (should be v4.1.0 or higher)
helm version

# 4. Kubernetes cluster (should show docker-desktop node)
kubectl get nodes

# 5. Current context (should be docker-desktop)
kubectl config current-context
```

### Expected Output:

```
Docker version 28.5.1, build e180ab8
Client Version: v1.34.1
version.BuildInfo{Version:"v4.1.0", ...}
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   5m    v1.29.1
docker-desktop
```

---

## Next Steps

Once Kubernetes is enabled and verified:

1. ✅ **Phase IV Task 000 is complete** (Kubernetes enabled)
2. ✅ Ready to start Phase IV implementation
3. ✅ I will now create Dockerfiles, Helm charts, and deploy to Kubernetes

---

## What I'll Do Next (Automated)

Once you confirm Kubernetes is enabled, I will:

1. **Create Backend Dockerfile** (`backend/Dockerfile`)
   - Multi-stage build with Python 3.12
   - Install all dependencies
   - Run FastAPI on port 8000

2. **Create Frontend Dockerfile** (`frontend/Dockerfile`)
   - Multi-stage build with Node 20
   - Next.js production build
   - Serve on port 3000

3. **Create docker-compose.yml** (root directory)
   - Link frontend and backend
   - Test locally before Kubernetes

4. **Create Helm Charts** (`helm-charts/taskmaster/`)
   - Deployments (frontend, backend)
   - Services (LoadBalancer, ClusterIP)
   - ConfigMaps and Secrets
   - Values configuration

5. **Deploy to Kubernetes**
   - Create taskmaster namespace
   - Install Helm chart
   - Verify all pods running
   - Test all Phase III features

6. **Document Everything**
   - Deployment guide
   - Troubleshooting guide
   - Commands reference

---

## Important Note

**Do NOT manually edit any application code.** All containerization will be done through:
- Dockerfiles (separate from app code)
- Helm charts (separate configuration)
- Environment variables (no code changes)

All Phase III features (chat, voice, multi-language, recurring tasks) will work identically in Kubernetes.

---

**Ready?** Once Kubernetes is enabled in Docker Desktop, tell me:

"Kubernetes is enabled" or just run `kubectl get nodes` and show me the output.

Then I'll immediately start Phase IV implementation! 🚀
