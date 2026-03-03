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
   - Redis cloud (sessions, cart)
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

### 6. **Redis Cloud**
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

### Prerequisites for Deployment
- AWS CLI installed and configured
- AWS Lambda execution role with permissions for:
  - SSM Parameter Store access
  - VPC access (if using VPC)
  - CloudWatch Logs
  - X-Ray tracing (optional)

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
