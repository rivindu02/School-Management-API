# Deployment Commands Reference

## 📝 Installation Commands

### Basic Installation (Default Values)
```bash
# From repository root
helm install school-api ./school-api-charts

# With custom release name
helm install my-school-api ./school-api-charts

# Dry run (see what will be created)
helm install school-api ./school-api-charts --dry-run --debug
```

### Environment-Specific Deployments
```bash
# Development
helm install school-api-dev ./school-api-charts \
  -f ./school-api-charts/values-dev.yaml

# Staging
helm install school-api-staging ./school-api-charts \
  -f ./school-api-charts/values-staging.yaml

# Production
helm install school-api-prod ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml
```

### Custom Values
```bash
# With inline overrides
helm install school-api ./school-api-charts \
  --set api.replicaCount=3 \
  --set mongodb.storageSize=5Gi \
  --set ingress.host=api.example.com

# With custom values file
helm install school-api ./school-api-charts \
  -f my-custom-values.yaml

# Multiple values files (later files override earlier)
helm install school-api ./school-api-charts \
  -f ./school-api-charts/values.yaml \
  -f ./school-api-charts/values-prod.yaml \
  -f ./my-overrides.yaml
```

## 🔄 Upgrade Commands

### Basic Upgrade
```bash
# Upgrade with new values
helm upgrade school-api ./school-api-charts

# Upgrade with specific values file
helm upgrade school-api ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml
```

### Advanced Upgrades
```bash
# Upgrade and wait for completion
helm upgrade school-api ./school-api-charts --wait --timeout 5m

# Upgrade with atomic rollback on failure
helm upgrade school-api ./school-api-charts --atomic

# Force recreation of pods
helm upgrade school-api ./school-api-charts --force

# Upgrade specific values
helm upgrade school-api ./school-api-charts \
  --set api.image=rivindu02/school-management-api:v2.0.0 \
  --set api.replicaCount=5
```

### Upgrade or Install
```bash
# Install if not exists, upgrade if exists
helm upgrade --install school-api ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml
```

## 🔍 Inspection Commands

### List Releases
```bash
# List all releases
helm list

# List releases in all namespaces
helm list --all-namespaces

# List releases with specific status
helm list --failed
helm list --deployed
```

### Get Release Info
```bash
# Get release status
helm status school-api

# Get release values
helm get values school-api

# Get all values (including defaults)
helm get values school-api --all

# Get release manifest
helm get manifest school-api

# Get release notes
helm get notes school-api
```

### View History
```bash
# Show release history
helm history school-api

# Show specific revision
helm history school-api --max 5
```

## 🔙 Rollback Commands

### Basic Rollback
```bash
# Rollback to previous revision
helm rollback school-api

# Rollback to specific revision
helm rollback school-api 2

# Rollback and wait
helm rollback school-api --wait --timeout 5m
```

## 🗑️ Uninstallation Commands

### Basic Uninstall
```bash
# Uninstall release
helm uninstall school-api

# Uninstall and keep history
helm uninstall school-api --keep-history

# Uninstall with timeout
helm uninstall school-api --timeout 5m
```

### Complete Cleanup
```bash
# Uninstall Helm release
helm uninstall school-api

# Delete namespace (removes all resources)
kubectl delete namespace school-api

# Or delete specific resources if namespace shared
kubectl delete all -l app=school-api -n school-api
kubectl delete pvc -l app=mongo -n school-api
kubectl delete configmap school-api-config -n school-api
kubectl delete secret school-api-secret -n school-api
```

## 🔧 Testing Commands

### Template Validation
```bash
# Render templates locally (no installation)
helm template school-api ./school-api-charts

# Render with specific values
helm template school-api ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml

# Save rendered templates to file
helm template school-api ./school-api-charts > rendered-manifests.yaml
```

### Lint and Validate
```bash
# Lint chart for issues
helm lint ./school-api-charts

# Lint with specific values
helm lint ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml

# Validate against Kubernetes API
helm install school-api ./school-api-charts --dry-run --debug
```

### Test Release
```bash
# Run tests (if defined in chart)
helm test school-api

# Run tests and keep test pods for debugging
helm test school-api --logs
```

## 📦 Package Commands

### Create Package
```bash
# Package chart into archive
helm package ./school-api-charts

# Package with version override
helm package ./school-api-charts --version 1.1.0

# Package to specific directory
helm package ./school-api-charts --destination ./packages/
```

### Install from Package
```bash
# Install from local package
helm install school-api ./school-api-1.0.0.tgz

# Install from URL
helm install school-api https://example.com/charts/school-api-1.0.0.tgz
```

## 🔐 Secrets Management

### Override Secrets at Install
```bash
# Override secrets from environment variables
helm install school-api ./school-api-charts \
  --set secrets.jwtSecret=$JWT_SECRET \
  --set secrets.mongoPassword=$MONGO_PASSWORD

# Use secrets file (gitignored)
helm install school-api ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml \
  -f ./secrets.yaml  # Not in version control!
```

### Using External Secrets
```bash
# Install with placeholder values
helm install school-api ./school-api-charts \
  --set secrets.jwtSecret=PLACEHOLDER \
  --set secrets.mongoPassword=PLACEHOLDER

# Then replace with actual secrets using External Secrets Operator
# or Sealed Secrets
```

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Install dev environment
helm install school-api-dev ./school-api-charts \
  -f ./school-api-charts/values-dev.yaml

# 2. Make changes to chart

# 3. Upgrade to test changes
helm upgrade school-api-dev ./school-api-charts \
  -f ./school-api-charts/values-dev.yaml

# 4. If something breaks, rollback
helm rollback school-api-dev
```

### Production Deployment
```bash
# 1. Test in staging first
helm install school-api-staging ./school-api-charts \
  -f ./school-api-charts/values-staging.yaml

# 2. Verify staging
kubectl get all -n school-api-staging
curl http://staging-api:30081/health

# 3. Deploy to production
helm install school-api-prod ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml \
  --atomic --wait --timeout 10m

# 4. Monitor deployment
kubectl get pods -n school-api -w

# 5. If issues, rollback immediately
helm rollback school-api-prod
```

### Update Application Image
```bash
# Method 1: Update values file and upgrade
# Edit values-prod.yaml: api.image: new-image:tag
helm upgrade school-api ./school-api-charts \
  -f ./school-api-charts/values-prod.yaml

# Method 2: Override at command line
helm upgrade school-api ./school-api-charts \
  --set api.image=rivindu02/school-management-api:v2.0.0 \
  --reuse-values
```

### Scale Application
```bash
# Scale up
helm upgrade school-api ./school-api-charts \
  --set api.replicaCount=5 \
  --reuse-values

# Or edit values file and upgrade
# values.yaml: api.replicaCount: 5
helm upgrade school-api ./school-api-charts
```

## 📊 Monitoring Deployment

### Watch Pod Status
```bash
# Watch all pods in namespace
kubectl get pods -n school-api -w

# Watch deployment rollout
kubectl rollout status deployment/school-api -n school-api
kubectl rollout status deployment/mongo -n school-api
```

### Check Logs
```bash
# API logs
kubectl logs -n school-api -l app=school-api --tail=100 -f

# MongoDB logs
kubectl logs -n school-api -l app=mongo --tail=100 -f

# All pods logs
kubectl logs -n school-api --all-containers --tail=100 -f
```

### Debug Issues
```bash
# Describe pods
kubectl describe pod -n school-api -l app=school-api

# Get events
kubectl get events -n school-api --sort-by='.lastTimestamp'

# Check services
kubectl get svc -n school-api

# Check ingress
kubectl get ingress -n school-api
kubectl describe ingress school-api-ingress -n school-api

# Check PVC
kubectl get pvc -n school-api
kubectl describe pvc mongo-pvc -n school-api
```

## 🚀 Quick Reference

```bash
# Install
helm install school-api ./school-api-charts

# Upgrade
helm upgrade school-api ./school-api-charts

# Rollback
helm rollback school-api

# Uninstall
helm uninstall school-api

# Status
helm status school-api

# List all
helm list

# Dry run
helm install school-api ./school-api-charts --dry-run --debug
```
