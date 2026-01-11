#!/bin/bash

# Script to fix the evicted pods issue

echo "Cleaning up evicted pods..."

# Delete all evicted pods in all namespaces
for ns in $(microk8s kubectl get namespaces -o name | cut -d/ -f2); do
    echo "Cleaning namespace: $ns"
    microk8s kubectl get pods -n $ns --field-selector=status.phase=Failed -o name | while read pod; do
        if [ ! -z "$pod" ]; then
            microk8s kubectl delete $pod -n $ns
        fi
    done
done

echo "Restarting hostpath-provisioner deployment..."
microk8s kubectl rollout restart deployment hostpath-provisioner -n kube-system

echo "Waiting for hostpath-provisioner to be ready..."
microk8s kubectl rollout status deployment hostpath-provisioner -n kube-system --timeout=300s

echo "Deleting existing MongoDB PVC to recreate with new size..."
microk8s kubectl delete pvc mongo-pvc -n school-api --ignore-not-found

echo "Applying updated configurations..."
microk8s kubectl apply -f /home/rivindu/Documents/GitHub/School-Management-API/k8s/

echo "Checking pod status..."
microk8s kubectl get pods -n school-api
microk8s kubectl get pods -n kube-system | grep hostpath

echo "Setup complete!"