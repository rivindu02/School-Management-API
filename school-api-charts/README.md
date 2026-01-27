# School Management API Helm Chart

A comprehensive Helm chart for deploying the School Management API with MongoDB on Kubernetes.

## Features

- ✅ **Complete K8s Resource Coverage**
  - Namespace creation
  - API Deployment with health checks
  - MongoDB StatefulSet with persistent storage
  - ConfigMap and Secrets management
  - Services (ClusterIP and NodePort)
  - Ingress configuration
  - Resource Quotas

- ✅ **Production-Ready**
  - Health probes (startup, liveness, readiness)
  - Security contexts and non-root containers
  - Resource limits and requests
  - Persistent storage for MongoDB
  - Rolling updates support

- ✅ **Highly Configurable**
  - All parameters in `values.yaml`
  - Easy environment switching
  - Flexible resource allocation

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- kubectl configured to access your cluster
- Storage class available (e.g., `microk8s-hostpath`)

## Installation

### 1. Install the Chart

```bash
# From the chart directory
helm install school-api ./school-api-charts

# Or with custom values
helm install school-api ./school-api-charts -f custom-values.yaml

# Install in a specific namespace
helm install school-api ./school-api-charts --create-namespace
```

### 2. Verify Installation

```bash
# Check all resources
kubectl get all -n school-api

# Check pods
kubectl get pods -n school-api

# Check services
kubectl get svc -n school-api

# Check ingress
kubectl get ingress -n school-api
```

### 3. Access the API

```bash
# Via NodePort (default: 30080)
curl http://<node-ip>:30080/health

# Via Ingress (after configuring DNS/hosts)
curl http://school-api.local/health
```

## Configuration

### Key Configuration Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `namespace` | Kubernetes namespace | `school-api` |
| `environment` | Environment label | `production` |
| `api.replicaCount` | Number of API replicas | `1` |
| `api.image` | API Docker image | `rivindu02/school-management-api:latest` |
| `api.port` | API container port | `3000` |
| `api.nodePort` | NodePort for external access | `30080` |
| `api.healthChecks.enabled` | Enable health checks | `true` |
| `mongodb.image` | MongoDB Docker image | `mongo:7.0-jammy` |
| `mongodb.storageSize` | PVC storage size | `1Gi` |
| `mongodb.storageClassName` | Storage class name | `microk8s-hostpath` |
| `ingress.enabled` | Enable Ingress | `true` |
| `ingress.host` | Ingress hostname | `school-api.local` |
| `resourceQuota.enabled` | Enable ResourceQuota | `true` |

### Example Custom Values

Create a `custom-values.yaml`:

```yaml
# Override defaults
api:
  replicaCount: 3
  nodePort: 32000
  resources:
    requests:
      cpu: "100m"
      memory: "256Mi"
    limits:
      cpu: "500m"
      memory: "512Mi"

mongodb:
  storageSize: 5Gi
  resources:
    requests:
      cpu: "200m"
      memory: "512Mi"

ingress:
  host: api.myschool.com

secrets:
  jwtSecret: "your-secure-jwt-secret-here"
  mongoUsername: "admin"
  mongoPassword: "your-secure-password-here"
```

Then install:
```bash
helm install school-api ./school-api-charts -f custom-values.yaml
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade school-api ./school-api-charts -f custom-values.yaml

# Force recreate pods
helm upgrade school-api ./school-api-charts --recreate-pods

# Upgrade and wait for completion
helm upgrade school-api ./school-api-charts --wait
```

## Uninstalling

```bash
# Uninstall the release
helm uninstall school-api

# Delete the namespace (optional)
kubectl delete namespace school-api
```

## Comparison with Manual K8s Manifests

This Helm chart provides **100% feature parity** with the manual K8s manifests in the `k8s/` folder:

| Feature | Manual K8s | Helm Chart | Status |
|---------|-----------|------------|--------|
| Namespace | ✓ | ✓ | ✅ |
| API Deployment | ✓ | ✓ | ✅ |
| MongoDB Deployment | ✓ | ✓ | ✅ |
| PersistentVolumeClaim | ✓ | ✓ | ✅ |
| ConfigMap | ✓ | ✓ | ✅ |
| Secrets | ✓ | ✓ | ✅ |
| Services | ✓ | ✓ | ✅ |
| Ingress | ✓ | ✓ | ✅ |
| ResourceQuota | ✓ | ✓ | ✅ |
| Health Probes | ✓ | ✓ | ✅ |
| Security Contexts | ✓ | ✓ | ✅ |
| Named Ports | ✓ | ✓ | ✅ |

### Advantages Over Manual Manifests

1. **Single Source of Truth**: All configuration in `values.yaml`
2. **Easy Updates**: Change values and upgrade with one command
3. **Version Control**: Track chart versions and rollback easily
4. **Reusability**: Deploy to multiple environments with different values
5. **Templating**: DRY principle - no repeated namespace/label definitions
6. **Package Management**: Install/uninstall everything as a single unit



## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n school-api
kubectl describe pod <pod-name> -n school-api
kubectl logs <pod-name> -n school-api
```

### Check Services
```bash
kubectl get svc -n school-api
kubectl describe svc school-api-service -n school-api
```

### Check Persistent Volume
```bash
kubectl get pvc -n school-api
kubectl describe pvc mongo-pvc -n school-api
```

### Test API Connectivity
```bash
# Port-forward for testing
kubectl port-forward svc/school-api-service 3000:80 -n school-api

# Test in another terminal
curl http://localhost:3000/health
```

## Development

### Lint the Chart
```bash
helm lint ./school-api-charts
```

### Dry Run (see generated manifests)
```bash
helm install school-api ./school-api-charts --dry-run --debug
```

### Template Output
```bash
helm template school-api ./school-api-charts
```

## Production Recommendations

1. **Secrets Management**
   - Use external secrets management (Sealed Secrets, External Secrets Operator, Vault)
   - Never commit secrets to version control

2. **Resource Limits**
   - Adjust based on actual usage patterns
   - Monitor and optimize over time

3. **Persistent Storage**
   - Use production-grade storage class
   - Configure backup strategies

4. **Monitoring**
   - Add Prometheus ServiceMonitor
   - Configure alerting rules

5. **Ingress**
   - Configure TLS certificates
   - Use proper DNS records
   - Enable rate limiting

## License

This Helm chart is part of the School Management API project.
