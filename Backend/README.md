# E-Commerce Backend - AWS Serverless Architecture

A scalable, serverless e-commerce backend API built with Python/Flask, deployed on AWS infrastructure using Lambda, API Gateway, CloudFront CDN, S3, MongoDB Atlas, Redis, and SSM Parameter Store.

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          AWS Cloud Infrastructure                         │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     AWS CloudFront (CDN)                         │    │
│  │              (Global Edge Locations + SSL/TLS)                   │    │
│  └────────────────────────┬────────────────────────────────────────┘    │
│                           │                                              │
│         ┌─────────────────┴─────────────────┐                           │
│         │                                   │                            │
│         ▼                                   ▼                            │
│  ┌─────────────────┐               ┌─────────────────┐                  │
│  │   Amazon S3     │               │   API Gateway   │                  │
│  │   (Frontend)    │               │   (REST API)    │                  │
│  │  Static Assets  │               │  Request Router │                  │
│  │  HTML/CSS/JS    │               │  Auth & Rate    │                  │
│  └─────────────────┘               └────────┬────────┘                  │
│                                             │                             │
│                                             ▼                             │
│                                    ┌─────────────────┐                   │
│                                    │   AWS Lambda    │                   │
│                                    │  (Flask App)    │                   │
│                                    │  Serverless     │                   │
│                                    └────────┬────────┘                   │
│                                             │                             │
│                    ┌────────────────────────┼────────────────────┐      │
│                    │                        │                    │       │
│                    ▼                        ▼                    ▼       │
│           ┌─────────────────┐    ┌─────────────────┐   ┌──────────────┐ │
│           │  MongoDB Atlas  │    │ Amazon Elasti   │   │  AWS SSM     │ │
│           │   (Database)    │    │   Cache Redis   │   │  Parameter   │ │
│           │  User Data,     │    │  Sessions,      │   │    Store     │ │
│           │  Products,      │    │  Shopping Cart  │   │  (Secrets)   │ │
│           │  Orders         │    │                 │   │  Encryption  │ │
│           └─────────────────┘    └─────────────────┘   └──────────────┘ │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Request** → CloudFront CDN (Edge Location)
2. **Frontend Assets** → CloudFront serves from S3 (HTML/CSS/JS)
3. **API Calls** → CloudFront forwards to API Gateway
4. **API Gateway** → Routes request to Lambda function
5. **Lambda Function** → Executes Flask application
6. **Data Access** → Lambda connects to:
   - MongoDB Atlas (database operations)
   - Amazon ElastiCache Redis (sessions, cart)
   - AWS SSM Parameter Store (secrets retrieval)
7. **Response** → Returns through Lambda → API Gateway → CloudFront → User

## 🚀 AWS Services Used

### 1. **Amazon CloudFront (CDN)**
- Global content delivery network
- Edge caching for frontend assets and API responses
- Reduced latency for end users worldwide
- DDoS protection with AWS Shield
- Custom SSL certificates via ACM
- Custom domain support

### 2. **Amazon S3 (Frontend Hosting)**
- Static website hosting for React/frontend application
- Product images and media storage
- Pre-signed URLs for secure access
- Version control for assets
- Lifecycle policies for cost optimization
- Cross-Origin Resource Sharing (CORS) for API access

### 3. **Amazon API Gateway**
- RESTful API endpoints management
- Lambda proxy integration
- Request/response transformation
- Authentication and authorization
- Rate limiting and throttling
- CORS configuration
- API versioning support

### 4. **AWS Lambda**
- Serverless compute for running the Flask backend
- Automatic scaling based on demand
- Pay-per-execution pricing model
- Python 3.12 runtime environment
- Handler: `app.lambda_handler`
- Configurable memory and timeout

### 5. **MongoDB Atlas**
- Fully managed MongoDB database
- Global cluster deployment
- Automatic backups and point-in-time recovery
- Scalable storage and compute
- VPC peering with AWS
- Connection string stored in SSM

### 6. **Amazon ElastiCache (Redis)**
- Session management with auto-expiry
- Shopping cart caching
- API response caching
- Real-time data processing
- High availability with Multi-AZ
- Password stored in SSM

### 7. **AWS Systems Manager (SSM) Parameter Store**
- Secure storage of environment variables and secrets
- Encryption with AWS KMS
- Version control for configurations
- No hardcoded secrets in code
- Hierarchical parameter organization
- IAM-based access control

## 📋 Features

- **User Authentication**: Login, registration, password reset with email
- **Product Management**: CRUD operations for products with seller verification
- **Shopping Cart**: Redis-based cart management with session persistence
- **Order Processing**: Complete order lifecycle management
- **Seller Portal**: Seller registration and product management
- **Role-based Access**: User and seller roles with session validation
- **Session Management**: Redis-based session handling with expiry
- **Search & Filter**: Category-based and text search with pagination
- **AI Chatbot**: Enhanced AI-powered customer support chatbot
- **Product Recommendations**: Personalized recommendations based on user behavior

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | User login |
| POST | `/api/register` | User registration |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| DELETE | `/api/user` | Delete user account |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get products (with filters) |
| POST | `/api/addproducts` | Add new product (seller only) |
| GET | `/api/products/<product_id>/recommendations` | Get product recommendations |
| GET | `/api/products/recommendations` | Get personalized user recommendations |

### Seller
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/selleregister` | Seller registration |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart` | Add item to cart |
| GET | `/api/cart/<session_id>` | Get cart contents |
| PUT | `/api/cart` | Update cart item quantity |
| DELETE | `/api/cart` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | Get user orders |
| GET | `/api/orders/<order_id>` | Get specific order |
| PUT | `/api/orders/<order_id>` | Update order status |

### AI Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | AI-powered chatbot for customer support |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Health check endpoint |

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.12+
- MongoDB Atlas account
- Redis instance (local or ElastiCache)
- AWS CLI configured
- AWS credentials with SSM access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Create a `.env` file with:
```env
# MongoDB Atlas
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email (for password reset)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Application
APP_DOMAIN=http://localhost:3001
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
API_GATEWAY_DOMAIN=your-api-id.execute-api.us-east-1.amazonaws.com
```

5. **Run the application**

For local testing (Flask development server):
```bash
python app.py
```

Or with Gunicorn:
```bash
gunicorn --workers 2 --bind 0.0.0.0:5000 app:app
```

## ☁️ AWS Deployment

### Complete Deployment Workflow

#### Option 1: CLI Deployment (Recommended for Automation)

```bash
# Step 1: Clone the project
git clone <repository-url>
cd ECOMMERCE-

# Step 2: Build and deploy frontend to S3
cd Frontend
npm install
npm run build
aws s3 sync build/ s3://your-ecommerce-frontend-bucket

# Step 3: Deploy backend to Lambda
cd ../Backend
pip install -r requirements.txt -t .
zip -r deployment.zip .
aws lambda update-function-code --function-name ecommerce-backend --zip-file fileb://deployment.zip
```

#### Option 2: AWS Console Deployment (Manual Setup)

Follow these steps to create all AWS resources using the AWS Management Console:

---

### AWS Console Setup Guide

#### Step 1: Create SSM Parameters (Secrets Store)

1. Go to **AWS Systems Manager** → **Parameter Store** → **Create parameter**

2. Create the following parameters:

| Name | Type | Value |
|------|------|-------|
| `/app/website/MONGO_INITDB_ROOT_USERNAME` | SecureString | Your MongoDB username |
| `/app/website/MONGO_INITDB_ROOT_PASSWORD` | SecureString | Your MongoDB password |
| `/app/website/MONGO_URL` | SecureString | `cluster0.uyzde7y.mongodb.net` |
| `/app/website/MONGO_DB` | String | `clothing_ecom` |
| `/app/website/redis/REDIS_HOST` | SecureString | Your Redis endpoint |
| `/app/website/redis/REDIS_PORT` | String | `6379` |
| `/app/website/redis/REDIS_PASSWORD` | SecureString | Your Redis password |

3. For each parameter:
   - Select **SecureString** for sensitive data
   - Choose default KMS key or your custom key
   - Click **Create parameter**

---

#### Step 2: Create IAM Role for Lambda

1. Go to **IAM** → **Roles** → **Create role**

2. **Trusted entity type**: Select **AWS service**
   - **Use case**: Select **Lambda**
   - Click **Next**

3. **Add permissions**: Search and attach these policies:
   - `AWSLambdaBasicExecutionRole`
   - `AWSXRayDaemonWriteAccess` (optional, for tracing)
   - Create custom policy for SSM access:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "ssm:GetParameter",
             "ssm:GetParameters",
             "ssm:GetParametersByPath"
           ],
           "Resource": "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/app/website/*"
         }
       ]
     }
     ```

4. **Name, review, and create**:
   - Role name: `lambda-ecommerce-backend-role`
   - Click **Create role**

---

#### Step 3: Create Lambda Function

1. Go to **Lambda** → **Create function**

2. **Function configuration**:
   - **Function name**: `ecommerce-backend`
   - **Runtime**: Python 3.12
   - **Architecture**: x86_64
   - **Permissions**: Choose "Use an existing role" → Select `lambda-ecommerce-backend-role`
   - Click **Create function**

3. **Configure function settings**:
   - **General configuration**:
     - Memory: 512 MB
     - Timeout: 30 seconds
   - Click **Save**

4. **Upload code**:
   - In the **Code** tab, click **Upload from** → **.zip file**
   - Create deployment package locally:
     ```bash
     cd Backend
     pip install -r requirements.txt -t .
     zip -r deployment.zip .
     ```
   - Upload `deployment.zip`
   - Click **Save**

5. **Set handler**:
   - Runtime settings → Edit
   - Handler: `app.lambda_handler`
   - Click **Save**

---

#### Step 4: Create API Gateway

1. Go to **Amazon API Gateway** → **Create API** → **REST API** → **Build**

2. **Create API**:
   - **Choose protocol**: REST
   - **Create new API**: Yes
   - **API name**: `E-Commerce API`
   - **Description**: E-Commerce Backend API
   - Click **Create API**

3. **Create Resource**:
   - In the left menu, click **Resources**
   - Click **Create Resource**
   - Resource name: `proxy`
   - Resource path: `{proxy+}`
   - Enable **Configure as proxy resource**: Yes
   - Click **Create Resource**

4. **Create Method**:
   - Select the `{proxy+}` resource
   - Action: **Create Method** → Select **ANY**
   - Checkmark appears → Click it
   - Integration type: **Lambda Function**
   - Check **Use Lambda Proxy integration**
   - Select your region
   - Enter function name: `ecommerce-backend`
   - Click **Save**
   - Grant permission when prompted

5. **Create OPTIONS Method** (for CORS):
   - Select the `{proxy+}` resource
   - Action: **Create Method** → Select **OPTIONS**
   - Integration type: **Mock**
   - Click **Save**

6. **Enable CORS**:
   - Select the root resource `/`
   - Click **Enable CORS**
   - Add your frontend domain: `https://your-cloudfront-domain.cloudfront.net`
   - Click **Enable CORS and replace existing CORS headers**
   - Click **Yes, replace existing values**

7. **Deploy API**:
   - Click **Actions** → **Deploy API**
   - Deployment stage: **New Stage**
   - Stage name: `prod`
   - Click **Deploy**
   - Note the **Invoke URL** (you'll need this for CloudFront)

---

#### Step 5: Create S3 Bucket for Frontend

1. Go to **S3** → **Create bucket**

2. **Bucket configuration**:
   - **Bucket name**: `your-ecommerce-frontend-unique-name`
   - **Region**: Same as Lambda (us-east-1)
   - Uncheck "Block all public access" (for static website)
   - Click **Create bucket**

3. **Upload frontend files**:
   - Build your frontend locally:
     ```bash
     cd Frontend
     npm install
     npm run build
     ```
   - In S3 Console, open your bucket
   - Click **Upload** → **Add files**
   - Select all files from `Frontend/build/` folder
   - Click **Upload**

4. **Configure static website hosting**:
   - Go to **Properties** tab
   - Scroll to **Static website hosting**
   - Click **Edit**
   - Enable static website hosting
   - Index document: `index.html`
   - Error document: `index.html`
   - Click **Save changes**

5. **Add bucket policy** (for public access):
   - Go to **Permissions** tab
   - Scroll to **Bucket policy**
   - Click **Edit**
   - Add this policy (replace bucket name):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::your-ecommerce-frontend-unique-name/*"
         }
       ]
     }
     ```
   - Click **Save changes**

6. **Configure CORS** (for API access):
   - In **Permissions** tab
   - Scroll to **Cross-origin resource sharing (CORS)**
   - Add this configuration:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": []
       }
     ]
     ```
   - Click **Save changes**

---

#### Step 6: Create CloudFront Distribution

1. Go to **CloudFront** → **Create distribution**

2. **Origin settings**:
   - **Origin domain**: Select your S3 bucket from dropdown
   - **Origin path**: Leave blank
   - **Origin access**: Use legacy OAI (or OAC for new accounts)
   - **Bucket policy**: Yes, update bucket policy
   - Click **Add origin** (for API Gateway)
   - **Origin domain**: Paste your API Gateway URL (from Step 4)
   - **Origin path**: Leave blank
   - **Origin ID**: `api-gateway-origin`

3. **Default cache behavior** (S3 - Frontend):
   - **Origin**: Select your S3 bucket
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache key and origin requests**:
     - Select **Cache policy** → CachingOptimized
     - Select **Origin request policy** → AllViewer
   - Click **Add cache behavior**

4. **Add cache behavior for API** (`/api/*`):
   - **Path pattern**: `/api/*`
   - **Origin**: Select API Gateway origin
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache key and origin requests**:
     - Select **Cache policy** → CachingDisabled
     - Select **Origin request policy** → AllViewer
   - Click **Add**

5. **Settings**:
   - **Price class**: Use Only U.S., Canada, and Europe (or All)
   - **Default root object**: `index.html`
   - **Compress objects automatically**: Yes
   - Click **Create distribution**

6. **Wait for deployment** (Status changes from "In Progress" to "Deployed")

7. **Note your CloudFront domain name**: `xxxxxxxxxxxx.cloudfront.net`

---

#### Step 7: Update Lambda Environment Variables

1. Go to **Lambda** → Select `ecommerce-backend` function

2. Go to **Configuration** → **Environment variables**

3. Add these variables:
   - `CLOUDFRONT_DOMAIN`: `your-cloudfront-domain.cloudfront.net`
   - `API_GATEWAY_DOMAIN`: `your-api-id.execute-api.us-east-1.amazonaws.com`
   - `AWS_REGION`: `us-east-1`

4. Click **Save**

---

#### Step 8: Test Your Deployment

1. **Test Frontend**:
   - Open browser
   - Navigate to: `https://your-cloudfront-domain.cloudfront.net`
   - You should see your React/frontend application

2. **Test API**:
   - Test health endpoint:
     ```bash
     curl https://your-cloudfront-domain.cloudfront.net/healthz
     ```
   - Should return: `OK`

3. **Test API Endpoint**:
   ```bash
   curl https://your-cloudfront-domain.cloudfront.net/api/products
   ```

---

### Troubleshooting Console Setup

| Issue | Solution |
|-------|----------|
| Lambda returns 502 Bad Gateway | Check Lambda handler name is `app.lambda_handler` |
| CORS errors in browser | Verify API Gateway CORS configuration and CloudFront cache behavior |
| S3 shows Access Denied | Check bucket policy and public access settings |
| Lambda can't access SSM | Verify IAM role has SSM GetParameter permissions |
| CloudFront shows 503 | Wait for distribution deployment to complete |
| API returns timeout | Increase Lambda timeout to 30 seconds |

---

### Prerequisites for Deployment
- AWS CLI installed and configured (for CLI deployment)
- AWS account with appropriate permissions
- MongoDB Atlas cluster created
- Redis instance (ElastiCache or external)

### SSM Parameter Store Setup

Store your secrets in AWS SSM Parameter Store:

```bash
# MongoDB credentials
aws ssm put-parameter \
  --name "/app/website/MONGO_INITDB_ROOT_USERNAME" \
  --value "your-username" \
  --type SecureString \
  --region us-east-1

aws ssm put-parameter \
  --name "/app/website/MONGO_INITDB_ROOT_PASSWORD" \
  --value "your-password" \
  --type SecureString \
  --region us-east-1

aws ssm put-parameter \
  --name "/app/website/MONGO_URL" \
  --value "cluster0.uyzde7y.mongodb.net" \
  --type SecureString \
  --region us-east-1

aws ssm put-parameter \
  --name "/app/website/MONGO_DB" \
  --value "clothing_ecom" \
  --type String \
  --region us-east-1

# Redis credentials
aws ssm put-parameter \
  --name "/app/website/redis/REDIS_HOST" \
  --value "your-redis-host.amazonaws.com" \
  --type SecureString \
  --region us-east-1

aws ssm put-parameter \
  --name "/app/website/redis/REDIS_PORT" \
  --value "6379" \
  --type String \
  --region us-east-1

aws ssm put-parameter \
  --name "/app/website/redis/REDIS_PASSWORD" \
  --value "your-redis-password" \
  --type SecureString \
  --region us-east-1
```

### Deployment Steps

#### Step 1: Package dependencies
```bash
# Install dependencies in a folder for Lambda
mkdir -p python
pip install -r requirements.txt -t python/

# Create deployment package
zip -r deployment.zip . python/
```

#### Step 2: Create Lambda Function
```bash
aws lambda create-function \
  --function-name ecommerce-backend \
  --runtime python3.12 \
  --handler app.lambda_handler \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://deployment.zip \
  --timeout 30 \
  --memory-size 512 \
  --region us-east-1
```

#### Step 3: Update Lambda Function (for subsequent deployments)
```bash
aws lambda update-function-code \
  --function-name ecommerce-backend \
  --zip-file fileb://deployment.zip
```

#### Step 4: Configure API Gateway

Create REST API with Lambda proxy integration:
```bash
# Create API
aws apigateway create-rest-api \
  --name "E-Commerce API" \
  --description "E-Commerce Backend API" \
  --region us-east-1

# Create proxy resource
aws apigateway create-resource \
  --rest-api-id YOUR_API_ID \
  --parent-id ROOT_RESOURCE_ID \
  --path-part "{proxy+}"

# Create method
aws apigateway put-method \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method ANY \
  --authorization-type NONE

# Create Lambda integration
aws apigateway put-integration \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:ACCOUNT_ID:function:ecommerce-backend/invocations

# Deploy API
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

#### Step 5: Add Lambda Permission for API Gateway
```bash
aws lambda add-permission \
  --function-name ecommerce-backend \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:us-east-1:ACCOUNT_ID:YOUR_API_ID/*/*/*
```

#### Step 6: Configure S3 for Frontend
```bash
# Create S3 bucket
aws s3 mb s3://your-ecommerce-frontend

# Upload frontend files
aws s3 sync ../Frontend/build s3://your-ecommerce-frontend

# Enable static website hosting
aws s3 website s3://your-ecommerce-frontend \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read
aws s3api put-bucket-policy \
  --bucket your-ecommerce-frontend \
  --policy file://bucket-policy.json
```

#### Step 7: Configure CloudFront Distribution
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json
```

CloudFront origins:
- **Origin 1**: S3 bucket (frontend assets)
- **Origin 2**: API Gateway (backend API)

Cache behaviors:
- `/api/*` → API Gateway origin
- `/*` → S3 origin (default)

### AWS SAM Template (Recommended)

Use AWS SAM for easier deployment:

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  ECommerceAPI:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: ecommerce-backend
      CodeUri: .
      Handler: app.lambda_handler
      Runtime: python3.12
      Timeout: 30
      MemorySize: 512
      Environment:
        Variables:
          AWS_REGION: !Ref AWS::Region
      Policies:
        - SSMParameterReadPolicy:
            ParameterName: /app/website/*
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
```

Deploy with:
```bash
sam build
sam deploy --guided
```

## 📊 Monitoring & Logging

### Amazon CloudWatch
- View Lambda function logs
- Monitor API Gateway metrics
- Set up alarms for errors and latency
- Custom dashboards for API performance

### AWS X-Ray
- Enable X-Ray tracing for Lambda
- Trace requests through API Gateway
- Identify performance bottlenecks
- Service map visualization

### MongoDB Atlas
- Monitor database performance
- Set up alerts for slow queries
- Track connection pool usage
- Real-time metrics dashboard

### ElastiCache
- Monitor Redis memory usage
- Track cache hit/miss ratios
- Set up CloudWatch alarms
- Node health monitoring

## 🔒 Security Best Practices

- ✅ Environment variables stored in AWS SSM Parameter Store
- ✅ Secrets encrypted with AWS KMS
- ✅ API Gateway authentication and authorization
- ✅ CORS configured for specific origins
- ✅ Password hashing with bcrypt
- ✅ Session management with Redis (auto-expiry)
- ✅ Input validation on all endpoints
- ✅ Principle of least privilege for Lambda IAM roles
- ✅ VPC configuration for Lambda (if needed)
- ✅ HTTPS enforced through CloudFront and API Gateway
- ✅ S3 bucket policies for frontend hosting
- ✅ CloudFront signed URLs for private content

## 📈 Scalability Features

- **Auto-scaling**: Lambda functions scale automatically with demand
- **Caching**: Redis for sessions and frequently accessed data
- **CDN**: CloudFront for edge caching and reduced latency
- **Database**: MongoDB Atlas with auto-scaling storage
- **Connection Pooling**: Efficient database connections
- **Stateless Design**: Lambda functions are stateless for optimal scaling
- **API Gateway**: Automatic scaling to handle traffic spikes

## 🧪 Testing

Run tests:
```bash
python -m pytest
```

Or run individual test files:
```bash
python test_app.py
python test_mongo.py
python test_delete_account.py
python python_backend_test.py
python simple_test.py
```

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| flask | 3.x | Web framework |
| flask-cors | 4.x | Cross-origin resource sharing |
| pymongo | 4.x | MongoDB driver |
| redis | 5.x | Cache and session store |
| flask-Bcrypt | 1.x | Password hashing |
| gunicorn | 21.x | WSGI server (local testing) |
| python-dotenv | 1.x | Environment variable management |
| aws-lambda-wsgi | 0.2.x | Lambda-Flask integration |
| boto3 | 1.34.x | AWS SDK for Python |
| botocore | 1.34.x | AWS core SDK |

## 🐛 Troubleshooting

### Common Issues

1. **Lambda timeout errors**
   - Increase Lambda timeout (default is 3 seconds)
   - Check MongoDB and Redis connectivity
   - Enable VPC if resources are in VPC
   - Increase Lambda memory for better performance

2. **SSM Parameter access denied**
   - Verify Lambda execution role has SSM read permissions
   - Check parameter names match exactly
   - Ensure region is correct
   - Verify KMS key access for SecureString parameters

3. **CORS errors**
   - Verify CORS configuration in `app.py`
   - Check API Gateway CORS settings
   - Ensure CloudFront forwards CORS headers
   - Update S3 CORS configuration

4. **Database connection issues**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure network connectivity from Lambda
   - Verify VPC configuration if using VPC

5. **CloudFront caching issues**
   - Invalidate CloudFront cache after deployments
   - Configure proper cache behaviors
   - Set appropriate TTL values
   - Use cache invalidation for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`python -m pytest`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

[Specify your license here]

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check CloudWatch logs for errors
- Review AWS service quotas and limits
- Check MongoDB Atlas logs

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [SSM Parameter Store Documentation](https://docs.aws.amazon.com/systems-manager/)

---

**Architecture Summary**:
```
User → CloudFront CDN → S3 (Frontend) / API Gateway → Lambda → MongoDB Atlas + Redis
                                              ↓
                                          SSM (Secrets)
```

**Note**: This backend is part of a larger e-commerce platform. Ensure proper configuration of all AWS services before production deployment. Always test in a staging environment first.
