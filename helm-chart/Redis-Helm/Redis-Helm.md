# Redis Helm Chart for Production

This Helm chart deploys a production-ready Redis setup on a Kubernetes cluster, providing in-memory data storage and caching capabilities for the E-Commerce application.

This chart is designed for production environments and includes features like:
- Redis Master-Slave replication for high availability
- Password authentication for security
- Persistent storage for data durability
- Configurable resource limits and requests
- Network policies for security

---

## Prerequisites

-   Kubernetes 1.19+
-   Helm 3.2.0+
-   A default StorageClass for dynamic provisioning of PersistentVolumes, or pre-provisioned PersistentVolumes
-   kubectl configured to connect to your cluster

---

## 1. Create Required Secrets

Before installing the chart, you must create a secret containing the Redis password that will be used for authentication.

### Create the Redis Password Secret

This secret stores the password for Redis authentication. The backend application will use this password to connect to Redis.

Replace `<your-secure-password>` with a secure password.

```bash
kubectl create secret generic redis \
  --from-literal=redis-password='<your-secure-password>'
```

> **Note**: The key inside the secret must be `redis-password` as the Redis StatefulSet is configured to look for this key.

---

## 2. Add the Bitnami Helm Repository

Run the following command to add the Bitnami Helm repository which contains the official Redis chart:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

---

## 3. Install the Redis Chart

Once the secrets are created, you can install the Redis Helm chart with production-ready settings.

### Production Configuration Values

Create a `production-values.yaml` file with the following production-ready settings:

```yaml
# Redis authentication settings
auth:
  enabled: true
  sentinel: false
  existingSecret: "redis"
  existingSecretPasswordKey: "redis-password"

# Master configuration
master:
  persistence:
    enabled: true
    size: 8Gi
    storageClass: ""
  resources:
    limits:
      cpu: 1000m
      memory: 512Mi
    requests:
      cpu: 500m
      memory: 256Mi
  service:
    type: ClusterIP
    ports:
      redis: 6379
    nodePorts:
      redis: ""

# Replicas configuration for high availability
replica:
  replicaCount: 2
  persistence:
    enabled: true
    size: 8Gi
    storageClass: ""
  resources:
    limits:
      cpu: 500m
      memory: 256Mi
    requests:
      cpu: 250m
      memory: 128Mi

# Sentinel configuration (disabled for simpler setup, enable in production if needed)
sentinel:
  enabled: false

# Network policies for security
networkPolicy:
  enabled: true
  allowExternal: false

# Metrics and monitoring
metrics:
  enabled: true
  serviceMonitor:
    enabled: false

# Service settings
service:
  type: ClusterIP
  ports:
    redis: 6379
```

#### Configuration Breakdown

*   **Authentication (`auth`)**: Enables password authentication and references the existing secret for the password.
*   **Master (`master`)**: Configures the Redis master with persistent storage of 8GB and appropriate resource limits.
*   **Replica (`replica`)**: Sets up 2 replicas for high availability with persistent storage and resource configuration.
*   **Network Policy (`networkPolicy`)**: Restricts external access to Redis for security.
*   **Metrics**: Enables metrics collection for monitoring.

### Install with Custom Values

Save the configuration above to `production-values.yaml` and deploy Redis using this command:

```bash
helm install redis-release bitnami/redis -f production-values.yaml
```

> **Note**: The release name `redis-release` should match the expected service name configuration in your backend. If your backend expects `redis-master.default.svc.cluster.local`, you might want to install with a name that creates the appropriate service name.

---

## 4. Alternative: Install with Default Bitnami Redis

As an alternative, if you want to do a quick install with default settings:

```bash
helm install redis bitnami/redis \
  --set architecture=replication \
  --set auth.enabled=true \
  --set auth.password=yourStrongPassword \
  --set master.persistence.enabled=true \
  --set master.persistence.size=8Gi \
  --set replica.replicaCount=2 \
  --set resources.requests.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.limits.memory=1Gi \
  --set resources.limits.cpu=1
```

---

## 5. Verify the Deployment

After the installation, you can check the status of your Redis pods.

```bash
kubectl get pods -l app.kubernetes.io/name=redis
```

You should see the pods being created. Wait until they are in the `Running` state. It might take a few minutes for the images to be pulled and the containers to start.

Check the services created:

```bash
kubectl get svc -l app.kubernetes.io/name=redis
```

You should see services like `redis-release-redis-master` and potentially `redis-release-redis-replicas` depending on your configuration.

---

## 6. Test Redis Connection

To test if Redis is working properly, you can connect to the Redis master pod and run Redis commands:

```bash
kubectl exec -it <redis-master-pod-name> -- redis-cli -a <your-password> --no-auth-warning ping
```

You should receive a `PONG` response if the connection is successful.

---

## 7. Backend Integration

Your Backend service expects to connect to Redis at:
- Host: `redis-master.default.svc.cluster.local`
- Port: 6379
- Password: Retrieved from the `redis` secret with key `redis-password`

Make sure your Redis installation creates the appropriate service name that matches what's expected in your Backend deployment.

---

## 8. Scaling Redis

If you need to scale your Redis replicas after installation:

```bash
kubectl scale statefulset <redis-release-name>-redis-replicas --replicas=3
```

---

## 9. Backup and Recovery

For production environments, implement regular backup strategies:

### Manual Backup
```bash
kubectl exec -it <redis-master-pod-name> -- redis-cli -a <your-password> --no-auth-warning BGSAVE
```

### Automated Backup
Consider implementing a sidecar container or a cron job that periodically creates Redis snapshots.

---

## 10. Security Considerations

- Always use strong passwords for Redis authentication
- Implement network policies to restrict access to Redis from only necessary services
- Regularly rotate the Redis password
- Monitor Redis logs for any unusual activity
- Enable TLS encryption if data in transit security is required (configure with `tls` settings in the chart)

---

## Troubleshooting

### Pods not starting
Check the logs of failed pods:
```bash
kubectl logs <redis-pod-name>
```

### Connection issues
Verify the service name matches what's expected in your Backend:
```bash
kubectl get svc -l app.kubernetes.io/name=redis
```

### Resource constraints
Check if there are sufficient resources in your cluster:
```bash
kubectl describe nodes
```

### Password issues
If authentication is failing, verify your secret:
```bash
kubectl get secret redis -o yaml
```
> Note: The password is base64 encoded in the secret.

---

## Uninstalling Redis

To uninstall/delete the Redis release:

```bash
helm uninstall redis-release
```

This command removes all the Kubernetes components associated with the chart and deletes the release.

> **Warning**: This will delete all data stored in Redis. Make sure to back up any important data before uninstalling.