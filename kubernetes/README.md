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

## MongoDB Replica Set Operations

This section provides example commands and configurations for setting up MongoDB with replica sets.

---

## MongoDB Replica Set Operations

### Connect to MongoDB Pod
```sh
kubectl exec -it mongodb-0 -- mongosh -u <user_name> -p <password> --authenticationDatabase admin
```

- **replicaSet=rs0**: Assumes your MongoDB StatefulSet has been initialized with a replica set named `rs0`.
- **authSource=admin**: Assuming users are created in the `admin` database (change if needed).
- **retryWrites=true&w=majority**: Good practice for production reliability.

### Check Replica Set Status
```js
rs.status()
```

### Initiate Replica Set (for HA, Security, Data Redundancy, Read Scalability)
```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "<pod_name>.<mongodb_service>.<namespace>.svc.cluster.local:27017" },
    { _id: 1, host: "<pod_name>.<mongodb_service>.<namespace>.svc.cluster.local:27017" }
  ]
})
```

### Add New Member to Replica Set
```js
rs.add("<pod_name>.<mongodb_service>.<namespace>.svc.cluster.local:27017")
```

### Modify Host of a Replica Set Member
```js
cfg = rs.conf()
cfg.members[0].host = "<pod_name>.<mongodb_service>.<namespace>.svc.cluster.local:27017"
rs.reconfig(cfg)
```

---

## MongoDB Database & Collection Operations

### Use/Create Database
```js
use <DB_name>
```

### List All Databases
```js
show dbs
```

### Create Collection
```js
db.createCollection("products")
db.createCollection("users")
```

### Find Documents in a Collection
```js
db.products.find({ 'category': 'women' })
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