# MongoDB Migration: Atlas to Kubernetes

This document covers migrating the `clothing_ecom` database from MongoDB Atlas to the self-managed Kubernetes replica set.

## Migration Summary

| Item | Value |
|------|-------|
| **Source** | MongoDB Atlas (mongodump) |
| **Target** | K8s StatefulSet `mongodb` (replica set `rs0`) |
| **Database** | `clothing_ecom` |
| **Users collection** | 31 documents |
| **Products collection** | 14 documents |
| **Total documents** | 45 |
| **Tool** | `mongorestore` (bundled in `mongo:8.0` image) |

---

## Prerequisites

- MongoDB replica set deployed and initialized on Kubernetes
- `mongorestore` available inside the `mongo:8.0` container
- Root credentials stored in K8s secret `mongo` (`user-name` / `password`)
- Atlas backup dump in `~/atlas-backup/clothing_ecom/` (BSON format)

---

## Step-by-Step Migration

### 1. Export from Atlas (already done)

Atlas backup was exported using `mongodump`:

```
~/atlas-backup/
└── clothing_ecom/
    ├── prelude.json              # mongodump metadata (tool version, server version)
    ├── products.bson             # 3.0K - 14 documents
    ├── products.metadata.json    # Indexes: _id_, category_1
    ├── users.bson               # 5.3K - 31 documents
    └── users.metadata.json       # Indexes: _id_
```

### 2. Copy Dump into the PRIMARY Pod

Copy the dump directory into the running `mongodb-0` pod (the PRIMARY):

```bash
kubectl cp ~/atlas-backup/clothing_ecom mongodb-0:/tmp/clothing_ecom
```

### 3. Restore with mongorestore

Run `mongorestore` inside the pod against the `clothing_ecom` database:

```bash
kubectl exec mongodb-0 -- mongorestore \
  -u admin -p <password> --authenticationDatabase admin \
  --db clothing_ecom /tmp/clothing_ecom
```

Expected output:
```
restoring `clothing_ecom.users` from `/tmp/clothing_ecom/users.bson`
restoring `clothing_ecom.products` from `/tmp/clothing_ecom/products.bson`
finished restoring `clothing_ecom.users` (31 documents, 0 failures)
finished restoring `clothing_ecom.products` (14 documents, 0 failures)
restoring indexes for collection `clothing_ecom.products` from metadata
45 document(s) restored successfully. 0 document(s) failed to restore.
```

### 4. Verify on PRIMARY

```bash
kubectl exec mongodb-0 -- mongosh -u admin -p <password> --authenticationDatabase admin --eval '
  use clothing_ecom
  db.products.countDocuments()   # expect 14
  db.users.countDocuments()      # expect 31
  db.products.getIndexes()       # should show _id_ and category_1
'
```

### 5. Verify Replication on SECONDARY

```bash
kubectl exec mongodb-1 -- mongosh -u admin -p <password> --authenticationDatabase admin --eval '
  db.getSiblingDB("clothing_ecom").products.countDocuments()   # expect 14
  db.getSiblingDB("clothing_ecom").users.countDocuments()      # expect 31
'
```

### 6. Clean Up

Remove the temp dump files from the pod:

```bash
kubectl exec mongodb-0 -- rm -rf /tmp/clothing_ecom
```

---

## Database Schema

### `clothing_ecom.products`

| Field | Type | Example |
|-------|------|---------|
| `_id` | ObjectId | `684bba156f0aeab954379960` |
| `name` | string | `Men's Denim Jeans` |
| `description` | string | `Slim fit, stretchable denim jeans.` |
| `price` | double | `39.99` |
| `category` | string | `men`, `women`, `kids` |
| `image` | string | URL to image |
| `size` | string | `M` |
| `stockavailable` | string | `5` |

**Indexes:** `_id_` (default), `category_1` (for category-based filtering)

**Category distribution:**
| Category | Count |
|----------|-------|
| men | 5 |
| women | 3 |
| kids | 2 |
| mixed (multi-category) | 4 |

### `clothing_ecom.users`

| Field | Type | Example |
|-------|------|---------|
| `_id` | ObjectId | `684d18ef7c6b47d64ff040b6` |
| `email` | string | `test4@example.com` |
| `password` | string | bcrypt hash (`$2b$12$...`) |
| `name` | string | `test4` |
| `role` | string | `seller` (optional) |
| `SellerName` | string | `lokesh traders` (optional) |
| `SellerPhone` | string | (optional) |
| `SellerGSTNumber` | string | (optional) |
| `SellerAddres` | string | (optional) |

**Indexes:** `_id_` (default)

---

## Connection Strings

### From inside the cluster (for backend services)

```
mongodb://admin:<password>@mongodb-0.mongodb-service.default.svc.cluster.local:27017,mongodb-1.mongodb-service.default.svc.cluster.local:27017/clothing_ecom?authSource=admin&replicaSet=rs0
```

### From inside a pod

```bash
kubectl exec -it mongodb-0 -- mongosh \
  -u admin -p <password> --authenticationDatabase admin \
  clothing_ecom
```

### For the Flask backend (env variable)

```
MONGO_URI=mongodb://admin:<password>@mongodb-0.mongodb-service.default.svc.cluster.local:27017,mongodb-1.mongodb-service.default.svc.cluster.local:27017/clothing_ecom?authSource=admin&replicaSet=rs0
```

---

## Troubleshooting

### mongorestore fails with "auth failed"
Ensure credentials match the K8s secret:
```bash
kubectl get secret mongo -o jsonpath='{.data.user-name}' | base64 -d
kubectl get secret mongo -o jsonpath='{.data.password}' | base64 -d
```

### Data not appearing on SECONDARY
Force a read from secondary:
```bash
kubectl exec mongodb-1 -- mongosh -u admin -p <password> --authenticationDatabase admin --eval '
  db.getMongo().setReadPref("secondaryPreferred")
  db.getSiblingDB("clothing_ecom").products.countDocuments()
'
```

### "not authorized" on secondary reads
By default, secondaries don't allow direct reads. Use `rs.secondaryOk()` or `setReadPref`:
```bash
kubectl exec mongodb-1 -- mongosh -u admin -p <password> --authenticationDatabase admin --eval '
  rs.secondaryOk()
  db.getSiblingDB("clothing_ecom").products.find()
'
```

### Pod restarts during migration
Ensure the liveness probe timeout is sufficient (minimum 10s). Check probe config:
```bash
kubectl describe pod mongodb-0 | grep -A3 "Liveness\|Readiness"
```
