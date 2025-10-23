# MongoDB Replica Set Helm Chart

This Helm chart deploys a production-ready MongoDB Replica Set on a Kubernetes cluster using a StatefulSet.

This chart is designed for production environments and includes features like:
-   StatefulSet for stable network identifiers and persistent storage.
-   Replica Set for high availability and data redundancy.
-   Password authentication and inter-replica authentication using a keyfile.
-   Configurable resource limits and requests.
-   Persistent Volume Claims for data storage.

---

## Prerequisites

-   Kubernetes 1.19+
-   Helm 3.2.0+
-   A default StorageClass for dynamic provisioning of PersistentVolumes, or pre-provisioned PersistentVolumes.

---

## 1. Create Required Secrets

Before installing the chart, you must create two secrets: one for the MongoDB root user credentials and another for the replica set keyfile, which is used for internal authentication between replica set members.

### a. Create the Root User Secret

This secret stores the username and password for the MongoDB root user. The backend application will use these credentials to connect to the database.

Replace `<your-username>` and `<your-password>` with secure credentials.

```bash
kubectl create secret generic mongo \
  --from-literal=user-name='<your-username>' \
  --from-literal=password='<your-password>'
```

> **Note**: The keys inside the secret must be `user-name` and `password` as the StatefulSet is configured to look for them.

### b. Create the Replica Set Keyfile Secret

This keyfile is used by replica set members to authenticate with each other. It must be a file with 6 to 1024 characters and stored as a secret.

1.  **Generate a keyfile:**

    ```bash
    openssl rand -base64 756 > mongo-keyfile
    ```

2.  **Create the secret from the keyfile:**

    ```bash
    kubectl create secret generic mongo-keyfile-secret --from-file=mongo-keyfile
    ```

3.  **Clean up the local keyfile (optional but recommended):**

    ```bash
    rm mongo-keyfile
    ```

---

## 2. Install the Chart

Once the secrets are created, you can install the Helm chart.

Run the following command from the `helm-chart` directory to add  the MongoDB chart into your cluster and Update the helm repo

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

Replace `name if requried` with a name for your release, for example `my-mongodb`.

**Example:**
```bash
helm install my-mongodb bitnami/mongodb
  --namespace mongodb \
  --create-namespace \
  --set architecture=replicaset \
  --set replicaCount=3 \
  --set auth.rootUser=admin \
  --set auth.rootPassword=StrongPassword123 \
  --set persistence.enabled=true \
  --set persistence.size=20Gi
```

This command deploys MongoDB with the default configuration specified in the chart's `values.yaml` file. You can customize the installation by creating your own `values.yaml` file and passing it with the `--values` flag.

---

## 3. Verify the Deployment

After the installation, you can check the status of your MongoDB pods.

```bash
kubectl get pods -l app=mongodb
```

You should see the pods being created. Wait until they are in the `Running` state. It might take a few minutes for the images to be pulled and the containers to start.

---

## 4. Initialize the Replica Set

The MongoDB pods are running, but the replica set is not yet initialized. You need to connect to one of the pods and run the initiation command.

1.  **Exec into the first MongoDB pod (`-0`):**

    ```bash
    kubectl exec -it <release-name>-mongodb-0 -- mongosh
    ```
    *Replace `<release-name>` with the name you used during installation (e.g., `mongodb-mongodb-0`).*

2.  **Initiate the replica set:**

    Inside the `mongosh` shell, run the `rs.initiate()` command with the configuration for your replica set. The configuration below assumes a release name of `mongodb`, a service name of `mongodb-service`, and a replica count of 2. Adjust the hostnames and number of members according to your `values.yaml`.

    ```javascript
    rs.initiate({
      _id: "rs0",
      members: [
        { _id: 0, host: "mongodb-mongodb-0.mongodb-service.default.svc.cluster.local:27017" },
        { _id: 1, host: "mongodb-mongodb-1.mongodb-service.default.svc.cluster.local:27017" }
      ]
    })
    ```

3.  **Check the replica set status:**

    After a few moments, you can check the status. One member should be `PRIMARY` and the others `SECONDARY`.

    ```javascript
    rs.status()
    ```

Your MongoDB replica set is now fully deployed and configured for production use.

---

## Alternative: Using the Bitnami MongoDB Helm Chart

As an alternative to this custom chart, you can use the popular and well-maintained MongoDB chart from Bitnami.

### 1. Add the Bitnami Helm Repository

Bitnami offers a wide range of Helm charts. Add their repository with the following commands:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### 2. Deploy MongoDB

You can deploy MongoDB using Bitnami’s Helm chart by running:

```bash
helm install my-mongodb bitnami/mongodb
```

### 3. Deploy with Custom Configuration

To customize the MongoDB deployment, you can create a `values.yaml` file and specify your settings.

**Example `values.yaml` for Bitnami Chart:**

```yaml
# Authentication settings
auth:
  enabled: true
  rootPassword: changeme
  username: root
  password: changeme
  database: ryze

# Persistent storage settings
persistence:
  enabled: true
  size: 8Gi

# Disable replica set for a single instance
replicaSet:
  enabled: false
```

#### Configuration Breakdown

*   **Authentication (`auth`)**: Enables authentication, sets the root password, and creates an additional user and database.
*   **Persistence (`persistence`)**: Enables persistent storage using a PersistentVolumeClaim with a specified size.
*   **Replica Set (`replicaSet`)**: This example disables the replica set to deploy a standalone instance. For production, you would typically set `replicaSet.enabled: true`.

#### Deploy with the Custom `values.yaml`

Save the configuration above to a file (e.g., `bitnami-values.yaml`) and deploy MongoDB using this command:

```bash
helm install my-mongodb -f bitnami-values.yaml bitnami/mongodb
```
