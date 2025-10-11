# How to log in to the MongoDB pod

The MongoDB credentials (username and password) are not hardcoded in the `statefullset.yaml` file. They are stored in a Kubernetes secret named `mongo`.

## 0. Create the MongoDB secret (if it doesn't exist)

Before you can connect to MongoDB, you need to create a secret that contains the username and password.

**Choose a username and password** and use the following command to create the secret. Replace `<your-username>` and `<your-password>` with your chosen credentials.

```bash
kubectl create secret generic mongo --from-literal=user-name='<your-username>' --from-literal=password='<your-password>'
```

To log in to the `mongodb-0` pod, you first need to retrieve the username and password from the secret.

## 1. Retrieve the username and password

You can get the username and password using the following commands. These commands decode the base64 encoded secrets.

**Get the username:**
```bash
kubectl get secret mongo -o jsonpath='{.data.user-name}' | base64 --decode
```

**Get the password:**
```bash
kubectl get secret mongo -o jsonpath='{.data.password}' | base64 --decode
```

## 2. Log in to the MongoDB pod

Once you have the username and password, you can use them to log in to the `mongodb-0` pod. Replace `<username>` and `<password>` in the command below with the values you retrieved in the previous step.

```bash
kubectl exec -it mongodb-0 -- mongosh -u <username> -p <password> --authenticationDatabase admin
```

## Alternative Method: Using environment variables inside the pod

The `statefullset.yaml` file defines the environment variables `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` inside the `mongo` container. You can get a shell into the pod and then use these variables to connect.

1.  **Get a shell into the pod:**
    ```bash
    kubectl exec -it mongodb-0 -- /bin/bash
    ```

2.  **Connect to MongoDB using the environment variables:**
    ```bash
    mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin
    ```

## Troubleshooting Login Issues

If you have already created the `mongo` secret and are still unable to log in, the problem might be with the keys used in the secret. The `statefullset.yaml` expects the keys `user-name` and `password`.

### 1. Verify the secret's keys

Run the following command to inspect the `mongo` secret:

```bash
kubectl get secret mongo -o yaml
```

In the output, look at the `data` section. The keys should be `user-name` and `password`.

**Example of a correct secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongo
type: Opaque
data:
  password: <base64-encoded-password>
  user-name: <base64-encoded-username>
```

If your secret has different keys (e.g., `username` instead of `user-name`), you need to delete the secret and create it again with the correct keys.

### 2. Recreate the secret (if necessary)

If the keys are incorrect, delete the old secret:

```bash
kubectl delete secret mongo
```

Then, create the secret again with the correct keys:

```bash
kubectl create secret generic mongo --from-literal=user-name='<your-username>' --from-literal=password='<your-password>'
```

**Important Note about Data:** If the MongoDB database was already initialized with incorrect credentials (or no credentials), you might need to delete the persistent volume claims (PVCs) associated with the MongoDB pods to force a fresh initialization. This will delete all your data.

To delete the PVCs:
```bash
kubectl delete pvc -l app=mongodb
```