# Kubernetes Manifests for School Management API


## Deployment Order

Apply manifests in this order:

```bash
microk8s kubectl apply -f namespace.yaml
microk8s kubectl apply -f configmap-secret.yaml
microk8s kubectl apply -f mongodb-pvc.yaml
microk8s kubectl apply -f mongodb-deployment.yaml
# Wait for MongoDB to be ready
microk8s kubectl apply -f api-deployment.yaml
```

Or apply all at once:

```bash
microk8s kubectl apply -f .
```


## Resource Requests and Limits

### API Pods
- Requests: 256Mi RAM, 250m CPU
- Limits: 512Mi RAM, 500m CPU

### MongoDB
- Requests: 256Mi RAM, 250m CPU
- Limits: 512Mi RAM, 500m CPU

## Scaling

### Manual Scaling

```bash
# Scale API to 3 replicas
microk8s kubectl scale deployment/school-api --replicas=3 -n school-api
```

### Horizontal Pod Autoscaler (HPA)

To enable auto-scaling based on CPU usage:

```bash
# Enable metrics-server
microk8s enable metrics-server

# Create HPA
microk8s kubectl autoscale deployment school-api \
  --cpu-percent=70 \
  --min=2 \
  --max=5 \
  -n school-api
```


## Monitoring

```bash
# Watch pod status
microk8s kubectl get pods -n school-api -w

# View logs
microk8s kubectl logs -f deployment/school-api -n school-api

# View MongoDB logs
microk8s kubectl logs -f deployment/mongo -n school-api

# Get events
microk8s kubectl get events -n school-api --sort-by='.lastTimestamp'

# Resource usage
microk8s kubectl top pods -n school-api
```

## Updating the Application

When you push a new image to Docker Hub:

```bash
# Rollout new version
microk8s kubectl rollout restart deployment/school-api -n school-api

# Check rollout status
microk8s kubectl rollout status deployment/school-api -n school-api

# View rollout history
microk8s kubectl rollout history deployment/school-api -n school-api

# Rollback if needed
microk8s kubectl rollout undo deployment/school-api -n school-api
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
microk8s kubectl describe pod <pod-name> -n school-api

# Check logs
microk8s kubectl logs <pod-name> -n school-api
```

### Cannot connect to MongoDB

```bash
# Check if MongoDB is running
microk8s kubectl get pods -l app=mongo -n school-api

# Check MongoDB logs
microk8s kubectl logs deployment/mongo -n school-api

# Test connection from API pod
microk8s kubectl exec -it <api-pod-name> -n school-api -- sh
# Inside the pod:
ping mongo-service
```

## Cleanup

To remove everything:

```bash
# Delete namespace (removes all resources)
microk8s kubectl delete namespace school-api

# Or delete individual resources
microk8s kubectl delete -f .    # ⚠️ **Warning**: This will delete all data including the MongoDB persistent volume!
```


## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────┐
│           Security Boundaries                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Pod Security Context:                          │
│  ├─ runAsNonRoot: true                          │
│  ├─ runAsUser: 1001                             │
│  ├─ fsGroup: 1001                               │
│  └─ allowPrivilegeEscalation: false             │
│                                                 │
│  Container Security:                            │
│  ├─ readOnlyRootFilesystem: false               │
│  ├─ capabilities.drop: [ALL]                    │
│  └─ No privileged mode                          │
│                                                 │
│  Network Policy:                                │
│  ├─ MongoDB: ClusterIP (internal only)          │
│  ├─ API: NodePort (external access)             │
│  └─ Ingress: Optional external routing          │
│                                                 │
│  Secret Management:                             │
│  ├─ JWT Secret (from Secret)                    │
│  ├─ MongoDB credentials (from Secret)           │
│  └─ Recommend: External Secrets Operator        │
│                                                 │
│  Resource Quotas:                               │
│  ├─ CPU limits prevent resource exhaustion      │
│  └─ Memory limits prevent OOM attacks           │
│                                                 │
└─────────────────────────────────────────────────┘
```
## Advanced Configuration

### Adding Ingress (for domain names and TLS)

```bash
# Enable ingress
microk8s enable ingress

# Create ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: school-api-ingress
  namespace: school-api
spec:
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: school-api-service
            port:
              number: 80
```

### Adding Persistent MongoDB with StatefulSet

For production, consider using StatefulSet instead of Deployment for MongoDB to ensure stable network identity and ordered deployment.

## Health Checks

### API Health Checks

- **Startup Probe**: 15s initial delay, checks every 5s (prevents early kills)
- **Liveness Probe**: 45s initial delay, checks every 15s (restarts unhealthy pods)
- **Readiness Probe**: 30s initial delay, checks every 10s (controls traffic routing)

### MongoDB Health Checks

- **Liveness Probe**: 120s initial delay, checks every 60s (restarts if unresponsive)
- **Readiness Probe**: 60s initial delay, checks every 60s (ready for connections)

## Security

- **Non-root containers**: Runs as user 1001
- **Read-only root filesystem**: Where applicable
- **No privilege escalation**: Security hardened
- **Dropped capabilities**: Minimal permissions
- **Secrets management**: Use external secrets in production (Sealed Secrets, Vault)