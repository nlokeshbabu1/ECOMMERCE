# Kubernetes Setup for E-Commerce Application

This guide provides example commands and configurations for setting up various components of the e-commerce application in a Kubernetes environment.

## Ingress Configuration

The ingress.yaml file configures routing for the application:
- Requests to `/api/` are routed to the backend-service on port 5000
- All other requests are routed to the frontend-service on port 80

To install or update the ingress, run the installation script:
```bash
./install_ingress.sh
```

---

## MongoDB (DB-Service)

### Architecture

MongoDB runs as a **2-node replica set** (`rs0`) on a StatefulSet with:
- Persistent storage (gp2, 2Gi per node)
- Keyfile-based internal authentication (`--auth --keyFile`)
- Root user credentials stored in Kubernetes Secrets

### Directory Structure
```
kubernetes/DB-Service/
├── statefullset.yaml     # StatefulSet + PVC + initContainer for keyfile
├── service.yaml          # Headless service for stable DNS
└── mongo-keyfile         # Reference keyfile (not used directly)
```

### Prerequisites — Create Secrets

Before deploying, create two secrets:

#### 1. Credentials Secret
```bash
kubectl create secret generic mongo \
  --from-literal=user-name='admin' \
  --from-literal=password='yourStrongPassword'
```

#### 2. Keyfile Secret (for replica set auth)
```bash
openssl rand -base64 756 > /tmp/mongo-keyfile
chmod 400 /tmp/mongo-keyfile
kubectl create secret generic mongo-keyfile-secret \
  --from-file=mongo-keyfile=/tmp/mongo-keyfile
```

> **Important:** The keyfile must be a single continuous base64 string (no newlines) and under 1024 bytes.

### Deploy
```bash
kubectl apply -f service.yaml
kubectl apply -f statefullset.yaml
```

### Initialize Replica Set

After both pods are Running, initialize the replica set from `mongodb-0`:
```bash
kubectl exec mongodb-0 -- mongosh -u admin -p yourStrongPassword --authenticationDatabase admin --eval '
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb-0.mongodb-service.default.svc.cluster.local:27017", priority: 2 },
    { _id: 1, host: "mongodb-1.mongodb-service.default.svc.cluster.local:27017", priority: 1 }
  ]
})
'
```

### Connect to MongoDB Pod
```bash
kubectl exec -it mongodb-0 -- mongosh -u admin -p yourStrongPassword --authenticationDatabase admin
```

### Verify Replica Set
```bash
kubectl exec mongodb-0 -- mongosh -u admin -p yourStrongPassword --authenticationDatabase admin --eval 'rs.status()'
```

### Key Design Decisions

#### Keyfile Permission Fix (initContainer)
MongoDB requires the keyfile to be readable **only** by the `mongodb` user (uid 999) with mode `0400`. Kubernetes secret volumes are owned by root (uid 0), which the mongod process (running as uid 999) cannot read.

An **initContainer** solves this by:
1. Copying the keyfile from the secret mount
2. Setting ownership to `999:999` and permissions to `0400`

#### Liveness vs Readiness Probes
| Probe | Type | Why |
|-------|------|-----|
| **Liveness** | `tcpSocket:27017` | Fast, lightweight. Kills and restarts the pod if mongod stops listening. |
| **Readiness** | `exec mongosh ping` | Authenticates and runs `db.adminCommand("ping")`. Removes pod from service until MongoDB is fully ready. |

Previous exec-based liveness probe used `$(MONGO_INITDB_ROOT_USERNAME)` / `$(MONGO_INITDB_ROOT_PASSWORD)` shell expansion which resolved to empty strings in the probe context, causing authentication failures and pod restarts (exit code 137 during `kubectl exec` sessions).

### MongoDB Operations

#### Use/Create Database
```js
use <DB_name>
```

#### List All Databases
```js
show dbs
```

#### Create Collection
```js
db.createCollection("products")
db.createCollection("users")
```

#### Find Documents in a Collection
```js
db.products.find({ 'category': 'women' })
```

#### Add New Member to Replica Set
```js
rs.add("mongodb-2.mongodb-service.default.svc.cluster.local:27017")
```

#### Modify Host of a Replica Set Member
```js
cfg = rs.conf()
cfg.members[0].host = "mongodb-0.mongodb-service.default.svc.cluster.local:27017"
rs.reconfig(cfg)
```

---

## Redis Production Installation (Helm)

### Install Redis with Replication and Production Settings

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

```sh
helm install redis bitnami/redis \
  --set architecture=replication \
  --set auth.enabled=true \
  --set auth.password=yourStrongPassword \
  --set master.persistence.enabled=true \
  --set master.persistence.storageClass=gp2 \
  --set master.persistence.size=8Gi \
  --set replica.replicaCount=2 \
  --set resources.requests.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.limits.memory=1Gi \
  --set resources.limits.cpu=1
```

- **architecture=replication**: Enables Redis replication for HA.
- **auth.enabled=true**: Enables password authentication.
- **master.persistence.enabled=true**: Enables persistence for the master node.
- **master.persistence.size=8Gi**: Sets disk size for Redis master.
- **replica.replicaCount=2**: Sets 2 Redis replicas.
- **resources**: Sets requests and limits for CPU and memory.

---

**Note**: Replace passwords and values as per your security and sizing requirements.
