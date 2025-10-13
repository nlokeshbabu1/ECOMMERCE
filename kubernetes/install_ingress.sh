#!/bin/bash

# Script to install or update the ingress for the e-commerce application

echo "Installing/Updating Nginx Ingress Controller..."

# Install the Nginx Ingress Controller if not already installed
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Wait for the ingress controller to be ready
echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo "Applying ingress configuration..."

# Apply the ingress configuration
kubectl apply -f ingress.yaml

echo "Ingress installation/update complete!"
echo "Your ingress is now available at the external IP shown below:"
kubectl get ingress myapp-ingress