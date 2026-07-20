# product_service/product_service.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from urllib.parse import quote_plus
from bson.objectid import ObjectId # Import ObjectId
import redis
from flask_bcrypt import Bcrypt
import uuid


app = Flask(__name__)
# Enable CORS for a specific origin. This is crucial for allowing your frontend to communicate with the backend.
# In a production environment, you should restrict this to your frontend's domain.
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3001",
            "http://192.168.100.17:3001",
            "http://localhost:5000",
            "http://backend-service:5000"
        ],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})

# mongo_port = int(os.getenv("MONGO_PORT", 27017))
mongo_db = os.getenv("MONGO_DB", "clothing_ecom")

username = os.getenv("MONGO_INITDB_ROOT_USERNAME", "")
password = os.getenv("MONGO_INITDB_ROOT_PASSWORD", "")

# Encode special characters (like @, !, $, etc.)
encoded_password = quote_plus(password)

# Use the MONGO_URL from .env file
MONGO_URI = os.getenv("MONGO_URL", "")
if not MONGO_URI:
    # Fallback to old method if MONGO_URL is not set
    username = os.getenv("MONGO_INITDB_ROOT_USERNAME", "")
    password = os.getenv("MONGO_INITDB_ROOT_PASSWORD", "")
    # Encode special characters (like @, !, $, etc.)
    encoded_password = quote_plus(password)
    #MONGO_URI = f"mongodb+srv://{username}:{encoded_password}@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    MONGO_URI = f"mongodb://{username}:{encoded_password}@mongodb:27017/?authSource=admin"
else:
    MONGO_URI = MONGO_URI

#MONGO_URI = f"mongodb://{username}:{encoded_password}@mongodb-service:27017/clothing_ecom?authSource=admin&replicaSet=rs0"

# Bcrypt for password hashing
bcrypt = Bcrypt(app)

# Mongo client connection
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[mongo_db]
products_collection = db['products']
users_collection = db['users'] # Need users collection to verify seller email if session is not passed

# --- MongoDB Indexing ---
# Create an index on the 'category' field for faster filtering
products_collection.create_index("category")
print("MongoDB index on 'category' for products collection ensured.")

# Redis Setup (for session management and potential caching in the future)
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis_password = os.getenv("REDIS_PASSWORD")
redis_client = redis.Redis(host=redis_host, port=redis_port,password=redis_password ,db=0, decode_responses=True)
#redis_client = redis.Redis(host=redis_host, port=redis_port,db=0, decode_responses=True)


# Helper function to get user email from session ID stored in Redis
# This function also verifies if the user has the 'seller' role
def get_user_email_from_session(session_id):
    user_id_str = redis_client.get(f"session:{session_id}")
    if user_id_str:
        try:
            # Convert user_id_str back to ObjectId for MongoDB lookup
            user = users_collection.find_one({"_id": ObjectId(user_id_str)})
            # Ensure the user exists and has the 'seller' role
            if user and user.get('role') == 'seller':
                return user.get('email')
        except Exception as e:
            print(f"Error fetching user by ObjectId in Product Service: {e}")
    return None

def get_cart_key(session_id):
    return f"cart:{session_id}"


# Login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({"email": data['email']})

    if user and bcrypt.check_password_hash(user['password'], data['password']):
        session_id = str(uuid.uuid4())
        # Store user's MongoDB _id in Redis, associated with the session_id
        redis_client.set(f"session:{session_id}", str(user['_id']))
        # Set session expiry (e.g., 1 hour)
        redis_client.expire(f"session:{session_id}", 3600)
        return jsonify({
            "session_id": session_id,
            "role": user.get('role', 'user'), # Safely get role, default to "user"
            "user_email": user.get('email') # IMPORTANT: Added user_email to the response
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401


# User Registration route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password are required"}), 400

    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 409
    
    if "@" not in data['email'] or "." not in data['email']:
      return jsonify({"error": "Invalid mail_id"}), 401


    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    users_collection.insert_one({
        "email": data['email'],
        "password": hashed_pw,
        "name": data['email'].split("@")[0],
        "role": "user" # Explicitly set role for regular users
    })
    return jsonify({"message": "User registered successfully"}), 201


# FORGOT PASSWORD ROUTE
@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import secrets
    import datetime
    
    data = request.json
    if not data or 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    # Find user by email
    user = users_collection.find_one({"email": data['email']})
    if not user:
        # For security, we don't reveal if email exists or not
        return jsonify({"message": "If your email is registered, you will receive a password reset link shortly."}), 200

    # Generate secure token
    token = secrets.token_urlsafe(32)
    expiry_time = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour

    # Store token in user document with expiration
    users_collection.update_one(
        {"_id": user['_id']},
        {"$set": {
            "reset_token": token,
            "reset_token_expiry": expiry_time
        }}
    )

    # Send email with reset link
    try:
        # Email configuration (these should be environment variables in production)
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_username = os.getenv('SMTP_USERNAME')
        smtp_password = os.getenv('SMTP_PASSWORD')
        app_domain = os.getenv('APP_DOMAIN', 'http://localhost:3001')

        # Skip email sending in development if credentials not provided
        if not smtp_username or not smtp_password:
            print("SMTP credentials not provided. Skipping email sending in development.")
            return jsonify({"message": "If your email is registered, you will receive a password reset link shortly."}), 200

        # Create reset link
        reset_link = f"{app_domain}/reset-password?token={token}"

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = data['email']
        msg['Subject'] = "Password Reset Request"

        body = f"""
        Hello,

        You have requested to reset your password. Please click the link below to reset your password:

        {reset_link}

        This link will expire in 1 hour.

        If you did not request this, please ignore this email.

        Best regards,
        Fashion Store Team
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, data['email'], text)
        server.quit()

        return jsonify({"message": "If your email is registered, you will receive a password reset link shortly."}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        # Even if email fails, we still return success for security
        return jsonify({"message": "If your email is registered, you will receive a password reset link shortly."}), 200


# RESET PASSWORD ROUTE
@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    import datetime
    
    data = request.json
    if not data or 'token' not in data or 'password' not in data:
        return jsonify({"error": "Token and password are required"}), 400

    # Validate password strength
    if len(data['password']) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    # Find user by reset token
    user = users_collection.find_one({"reset_token": data['token']})
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    # Check if token is expired
    if user.get('reset_token_expiry') and user['reset_token_expiry'] < datetime.datetime.utcnow():
        return jsonify({"error": "Reset token has expired"}), 400

    # Hash new password
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # Update user password and remove reset token
    users_collection.update_one(
        {"_id": user['_id']},
        {"$set": {
            "password": hashed_pw
        }, "$unset": {
            "reset_token": "",
            "reset_token_expiry": ""
        }}
    )

    return jsonify({"message": "Password reset successfully"}), 200

# GET PRODUCTS — with optional category filter and seller filter
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search_query = request.args.get('q')
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
    except ValueError:
        return jsonify({"error": "Invalid page or limit parameter"}), 400

    skip = (page - 1) * limit
    session_id = request.args.get('session_id') # Pass session ID for role-based filtering

    query = {}
    
    # Optional filter by category
    if category:
        query["category"] = category

    # Optional filter by search query (case-insensitive search on name and description)
    if search_query:
        query["$or"] = [{"name": {"$regex": search_query, "$options": "i"}}, {"description": {"$regex": search_query, "$options": "i"}}]

    # Role-based product filtering
    if session_id:
        user_id_str = redis_client.get(f"session:{session_id}")
        if user_id_str:
            user = users_collection.find_one({"_id": ObjectId(user_id_str)})
            # If user is a 'seller', filter products by their email
            if user and user.get("role") == "seller":
                query["seller_email"] = user["email"]
            # If user is not a 'seller' (e.g., 'user' role or no role), no seller_email filter is applied,
            # so they will see all products (unless category filter is present).
    
    # Get total count for pagination
    total_count = products_collection.count_documents(query)

    # Apply pagination to the query
    products_cursor = products_collection.find(query).skip(skip).limit(limit)
    products = []
    for product in products_cursor:
        product['_id'] = str(product['_id']) # Convert ObjectId to string
        products.append(product)

    return jsonify({
        "products": products,
        "total_count": total_count
    })


# Add product to Databases
@app.route('/api/addproducts', methods=['POST'])
def addproducts():
    data = request.json
    session_id = data.get('session_id') 
    
    seller_email = get_user_email_from_session(session_id)
    if not seller_email:
        return jsonify({"error": "Unauthorized: Invalid session or not logged in as seller"}), 403 # Changed message

    required_fields = ['name', 'price', 'category', 'stockAvailable']
    for field in required_fields:
        if field not in data or data[field] is None:
            return jsonify({"error": f"{field} is required"}), 400

    try:
        price = float(data['price'])
        stock_available = int(data['stockAvailable'])
    except ValueError:
        return jsonify({"error": "Price and Stock Available must be valid numbers"}), 400

    products_collection.insert_one({
        "name": data['name'],
        "description": data.get('description', ''),
        "price": price,
        "category": data['category'],
        "image": data.get('image', ''), 
        "stockavailable": stock_available, 
        "size": data.get('size', ''),
        "seller_email": seller_email # Associate product with the seller's email
    })
    return jsonify({"message": "Product added successfully"}), 201

# Seller Registration route
@app.route('/api/selleregister', methods=['POST'])
def selleregister():
    data = request.json
    required_fields = ['email', 'password', 'SellerName', 'SellerPhone', 'SellerGSTNumber', 'SellerAddres']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} is required"}), 400

    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    

    users_collection.insert_one({
        'email': data['email'],
        'password': hashed_pw,
        'role': 'seller',   # Set role to 'seller' for sellers
        'SellerName': data['SellerName'],
        'SellerPhone': data['SellerPhone'],
        'SellerGSTNumber': data['SellerGSTNumber'],
        'SellerAddres': data['SellerAddres']
    })
    return jsonify({"message": "Seller registered successfully"}), 201


# ADD TO CART
@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    session_id = data.get('session_id') # Use .get for safety
    product_id = data.get('product_id') # Use .get for safety
    quantity = int(data.get('quantity', 1)) # Default to 1 if quantity not provided

    if not session_id or not product_id:
        return jsonify({"error": "session_id and product_id are required"}), 400

    cart_key = get_cart_key(session_id)
    redis_client.hincrby(cart_key, product_id, quantity)
    redis_client.expire(cart_key, 3600 * 24 * 7) # Cart expires in 7 days if not active
    return jsonify({"message": "Item added to cart"})

# GET CART
@app.route('/api/cart/<session_id>', methods=['GET'])
def get_cart(session_id):
    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    cart_key = get_cart_key(session_id)
    cart_data = redis_client.hgetall(cart_key)
    # Convert quantities to integers
    processed_cart = {pid: int(qty) for pid, qty in cart_data.items()}
    return jsonify(processed_cart)

# UPDATE CART ITEM QUANTITY (for example, if user changes quantity in cart view)
@app.route('/api/cart', methods=['PUT'])
def update_cart_item():
    data = request.json
    session_id = data.get('session_id')
    product_id = data.get('product_id')
    new_quantity = int(data.get('quantity'))

    if not session_id or not product_id or new_quantity is None:
        return jsonify({"error": "session_id, product_id, and quantity are required"}), 400

    cart_key = get_cart_key(session_id)

    if new_quantity <= 0:
        redis_client.hdel(cart_key, product_id) # Remove item if quantity is 0 or less
        return jsonify({"message": "Item removed from cart"}), 200
    else:
        redis_client.hset(cart_key, product_id, new_quantity) # Set exact quantity
        return jsonify({"message": "Cart item quantity updated"}), 200

# REMOVE FROM CART
@app.route('/api/cart', methods=['DELETE'])
def remove_from_cart():
    data = request.json
    session_id = data.get('session_id')
    product_id = data.get('product_id')

    if not session_id or not product_id:
        return jsonify({"error": "session_id and product_id are required"}), 400

    cart_key = get_cart_key(session_id)
    deleted_count = redis_client.hdel(cart_key, product_id)

    if deleted_count > 0:
        return jsonify({"message": "Item removed from cart"}), 200
    else:
        return jsonify({"message": "Item not found in cart"}), 404


# DELETE USER ACCOUNT
@app.route('/api/user', methods=['DELETE'])
def delete_account():
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    # Get user info from Redis session
    user_id_str = redis_client.get(f"session:{session_id}")
    if not user_id_str:
        return jsonify({"error": "Invalid session, please log in again"}), 401

    try:
        user_object_id = ObjectId(user_id_str)
    except Exception as e:
        return jsonify({"error": "Invalid user ID format"}), 400

    # Find user in MongoDB to verify existence and get email for any additional cleanup
    user = users_collection.find_one({"_id": user_object_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Begin a transaction or implement proper error handling
    try:
        # Delete user from MongoDB
        result = users_collection.delete_one({"_id": user_object_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete user from database"}), 500

        # Clear user's Redis session
        redis_client.delete(f"session:{session_id}")

        # Clear user's cart if exists (using the session_id to identify cart)
        cart_key = get_cart_key(session_id)
        redis_client.delete(cart_key)

        # If user has other associated data in Redis, clear it here
        # For example, if there are other session-related data with patterns like "user_data:*"
        # This is a placeholder for any future user-specific Redis data cleanup
        
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        # If there was an error, try to rollback any partial changes
        print(f"Error during account deletion: {str(e)}")
        return jsonify({"error": "An error occurred during account deletion"}), 500


# ORDERS COLLECTION
orders_collection = db['orders']

# Create Order API
@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    # Get user info from Redis session
    user_id_str = redis_client.get(f"session:{session_id}")
    if not user_id_str:
        return jsonify({"error": "Invalid session, please log in again"}), 401

    try:
        user_object_id = ObjectId(user_id_str)
    except Exception as e:
        return jsonify({"error": "Invalid user ID format"}), 400

    # Find user in MongoDB to verify existence
    user = users_collection.find_one({"_id": user_object_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get cart items for the user
    cart_key = get_cart_key(session_id)
    cart_data = redis_client.hgetall(cart_key)
    
    if not cart_data:
        return jsonify({"error": "Cart is empty"}), 400

    # Process cart items and get product details
    cart_items = []
    total_amount = 0.0
    product_ids = list(cart_data.keys())
    
    for product_id in product_ids:
        quantity = int(cart_data[product_id])
        
        # Verify product exists and get its details
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"error": f"Product with ID {product_id} not found"}), 404
        
        # Check if requested quantity is available
        available_stock = product.get('stockavailable', 0)
        if quantity > available_stock:
            return jsonify({"error": f"Insufficient stock for {product['name']}. Requested: {quantity}, Available: {available_stock}"}), 400
        
        item_total = float(product['price']) * quantity
        cart_items.append({
            "product_id": str(product['_id']),
            "name": product['name'],
            "price": float(product['price']),
            "quantity": quantity,
            "total": item_total
        })
        total_amount += item_total
        
        # Update product stock (decrease available quantity)
        new_stock = available_stock - quantity
        if new_stock < 0:
            # This shouldn't happen due to the check above, but just in case
            return jsonify({"error": f"Insufficient stock for {product['name']}"}), 400
            
        products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"stockavailable": new_stock}}
        )

    import time
    # Create order object
    order = {
        "user_id": user_object_id,
        "user_email": user['email'],
        "items": cart_items,
        "total_amount": total_amount,
        "status": "pending",
        "shipping_address": data.get('shipping_address'),
        "payment_method": data.get('payment_method', 'cod'),  # Default to Cash on Delivery
        "created_at": {"$date": {"$numberLong": str(int(time.time() * 1000))}}
    }

    # Insert order into database
    result = orders_collection.insert_one(order)
    
    if result.inserted_id:
        # Clear user's cart after order creation
        redis_client.delete(cart_key)
        
        # Return success response with order ID
        return jsonify({
            "message": "Order created successfully",
            "order_id": str(result.inserted_id),
            "total_amount": total_amount
        }), 201
    else:
        return jsonify({"error": "Failed to create order"}), 500


# GET USER ORDERS
@app.route('/api/orders', methods=['GET'])
def get_user_orders():
    session_id = request.args.get('session_id')
    
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    # Get user info from Redis session
    user_id_str = redis_client.get(f"session:{session_id}")
    if not user_id_str:
        return jsonify({"error": "Invalid session, please log in again"}), 401

    try:
        user_object_id = ObjectId(user_id_str)
    except Exception as e:
        return jsonify({"error": "Invalid user ID format"}), 400

    # Find user's orders
    user_orders = list(orders_collection.find({"user_id": user_object_id}))
    
    # Convert ObjectIds to strings
    for order in user_orders:
        order['_id'] = str(order['_id'])
        order['user_id'] = str(order['user_id'])
    
    return jsonify({"orders": user_orders}), 200


# GET ORDER BY ID
@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    session_id = request.args.get('session_id')
    
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    # Get user info from Redis session
    user_id_str = redis_client.get(f"session:{session_id}")
    if not user_id_str:
        return jsonify({"error": "Invalid session, please log in again"}), 401

    try:
        user_object_id = ObjectId(user_id_str)
    except Exception as e:
        return jsonify({"error": "Invalid user ID format"}), 400

    try:
        order_object_id = ObjectId(order_id)
    except Exception as e:
        return jsonify({"error": "Invalid order ID format"}), 400

    # Find the specific order for the user
    order = orders_collection.find_one({
        "_id": order_object_id,
        "user_id": user_object_id
    })
    
    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Convert ObjectId to string
    order['_id'] = str(order['_id'])
    order['user_id'] = str(order['user_id'])
    
    return jsonify({"order": order}), 200


# UPDATE ORDER STATUS
@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order_status(order_id):
    data = request.json
    session_id = data.get('session_id')
    new_status = data.get('status')
    
    if not session_id or not new_status:
        return jsonify({"error": "Session ID and new status are required"}), 400

    # Get user info from Redis session
    user_id_str = redis_client.get(f"session:{session_id}")
    if not user_id_str:
        return jsonify({"error": "Invalid session, please log in again"}), 401

    try:
        user_object_id = ObjectId(user_id_str)
    except Exception as e:
        return jsonify({"error": "Invalid user ID format"}), 400

    try:
        order_object_id = ObjectId(order_id)
    except Exception as e:
        return jsonify({"error": "Invalid order ID format"}), 400

    # Check if the order belongs to the user (for security)
    order = orders_collection.find_one({
        "_id": order_object_id,
        "user_id": user_object_id
    })
    
    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Update order status
    result = orders_collection.update_one(
        {"_id": order_object_id},
        {"$set": {"status": new_status}}
    )
    
    if result.modified_count > 0:
        return jsonify({"message": f"Order status updated to {new_status}"}), 200
    else:
        return jsonify({"error": "Failed to update order status"}), 500


# PRODUCT RECOMMENDATIONS API
@app.route('/api/products/<product_id>/recommendations', methods=['GET'])
def get_product_recommendations(product_id):
    try:
        # Convert product_id to ObjectId
        product_object_id = ObjectId(product_id)
    except Exception as e:
        return jsonify({"error": "Invalid product ID format"}), 400
    
    # Find the main product
    main_product = products_collection.find_one({"_id": product_object_id})
    if not main_product:
        return jsonify({"error": "Product not found"}), 404
    
    # Get category-based recommendations (first priority)
    category = main_product.get('category', '')
    recommendations = []
    
    # Find products in the same category (excluding the current product)
    if category:
        category_products = list(products_collection.find({
            "category": category,
            "_id": {"$ne": product_object_id},
            "stockavailable": {"$gt": 0}  # Only include products that are in stock
        }).limit(10))
        
        for product in category_products:
            product['_id'] = str(product['_id'])  # Convert ObjectId to string
            recommendations.append(product)
    
    # If we don't have enough recommendations from the same category,
    # find other products based on name similarity
    if len(recommendations) < 5:
        # Simple text-based similarity using name or description
        main_product_text = (main_product.get('name', '') + ' ' + main_product.get('description', '')).lower()
        other_products = list(products_collection.find({
            "_id": {"$ne": product_object_id},
            "category": {"$ne": category},  # Exclude same category since we already added those
            "stockavailable": {"$gt": 0}
        }).limit(20))
        
        # Sort products based on text similarity
        scored_products = []
        for product in other_products:
            product_text = (product.get('name', '') + ' ' + product.get('description', '')).lower()
            
            # Calculate simple similarity score (common words)
            main_words = set(main_product_text.split())
            product_words = set(product_text.split())
            common_words = main_words.intersection(product_words)
            similarity_score = len(common_words)
            
            if similarity_score > 0:  # Only include if there's some similarity
                product['_id'] = str(product['_id'])  # Convert ObjectId to string
                scored_products.append((product, similarity_score))
        
        # Sort by similarity score (descending) and add to recommendations
        scored_products.sort(key=lambda x: x[1], reverse=True)
        for product, score in scored_products:
            if len(recommendations) < 10:  # Limit total recommendations
                recommendations.append(product)
    
    # Limit to 5-10 recommendations
    recommendations = recommendations[:10]
    
    return jsonify({
        "product_id": str(main_product['_id']),
        "product_name": main_product['name'],
        "recommendations": recommendations
    }), 200


# PERSONALIZED RECOMMENDATIONS FOR HOMEPAGE (based on user session)
@app.route('/api/products/recommendations', methods=['GET'])
def get_user_recommendations():
    session_id = request.args.get('session_id')
    
    recommendations = []
    
    if session_id:
        # Get user info from Redis session
        user_id_str = redis_client.get(f"session:{session_id}")
        if user_id_str:
            try:
                user_object_id = ObjectId(user_id_str)
            except Exception as e:
                return jsonify({"error": "Invalid user ID format"}), 400
            
            # For personalized recommendations, we would typically look at:
            # 1. User's purchase history
            # 2. User's browsing history
            # 3. User's cart history
            # For now, we'll implement a simple approach based on commonly purchased together items
            
            # Get user's orders to determine preferences
            user_orders = list(orders_collection.find({"user_id": user_object_id}))
            
            if user_orders:
                # Get all products from user's orders
                purchased_product_ids = set()
                for order in user_orders:
                    for item in order.get('items', []):
                        purchased_product_ids.add(item.get('product_id'))
                
                # Find other products that are often purchased together with these items
                # This is a simplified version - in a real application, you'd have more sophisticated algorithms
                all_user_orders = list(orders_collection.find({}))
                
                # Create a simple co-purchasing matrix
                co_purchased = {}
                for order in all_user_orders:
                    order_products = [item.get('product_id') for item in order.get('items', [])]
                    for pid in purchased_product_ids:
                        if pid in order_products:
                            for other_pid in order_products:
                                if other_pid != pid and other_pid not in purchased_product_ids:
                                    if other_pid not in co_purchased:
                                        co_purchased[other_pid] = 0
                                    co_purchased[other_pid] += 1
                
                # Get top co-purchased products
                sorted_co_purchased = sorted(co_purchased.items(), key=lambda x: x[1], reverse=True)
                
                for pid, count in sorted_co_purchased[:10]:
                    try:
                        product = products_collection.find_one({"_id": ObjectId(pid)})
                        if product and product.get('stockavailable', 0) > 0:
                            product['_id'] = str(product['_id'])  # Convert ObjectId to string
                            recommendations.append(product)
                    except:
                        continue
                
                # If we still don't have enough personalized recommendations, 
                # fall back to popular products
                if len(recommendations) < 5:
                    popular_products = list(products_collection.find({
                        "stockavailable": {"$gt": 0}
                    }).sort("sales_count", -1).limit(10))  # Assuming there's a sales_count field
                    
                    for product in popular_products:
                        product['_id'] = str(product['_id'])  # Convert ObjectId to string
                        if product['_id'] not in [r['_id'] for r in recommendations]:
                            recommendations.append(product)
            
            # If no orders or not enough personalized recommendations, 
            # return popular products or trending items
            if len(recommendations) < 5:
                trending_products = list(products_collection.find({
                    "stockavailable": {"$gt": 0}
                }).sort("created_at", -1).limit(10))
                
                for product in trending_products:
                    product['_id'] = str(product['_id'])  # Convert ObjectId to string
                    if product['_id'] not in [r['_id'] for r in recommendations]:
                        recommendations.append(product)
    else:
        # For non-logged in users, return popular/trending products
        trending_products = list(products_collection.find({
            "stockavailable": {"$gt": 0}
        }).sort("created_at", -1).limit(10))
        
        for product in trending_products:
            product['_id'] = str(product['_id'])  # Convert ObjectId to string
            recommendations.append(product)
    
    # Limit to 10 recommendations
    recommendations = recommendations[:10]
    
    return jsonify({
        "recommendations": recommendations,
        "total_count": len(recommendations)
    }), 200


# ENHANCED AI-POWERED CHATBOT API
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').lower().strip()
    session_id = data.get('session_id')  # Optional session ID for user context
    
    # Initialize user context
    user_context = {}
    if session_id:
        user_id_str = redis_client.get(f"session:{session_id}")
        if user_id_str:
            try:
                user_object_id = ObjectId(user_id_str)
                user = users_collection.find_one({"_id": user_object_id})
                if user:
                    user_context = {
                        "user_id": user_object_id,
                        "email": user.get('email'),
                        "name": user.get('name', user.get('email', '').split('@')[0]),
                        "role": user.get('role', 'user')
                    }
                    # Get user's purchase history for personalization
                    user_orders = list(orders_collection.find({"user_id": user_object_id}))
                    user_context["orders"] = user_orders
                    user_context["order_count"] = len(user_orders)
            except Exception as e:
                print(f"Error getting user context: {e}")
    
    # Advanced NLP-style keyword detection
    product_keywords = ['product', 'item', 'shirt', 'dress', 'pants', 'shoes', 'clothing', 'size', 'color', 'price', 'cost', 'available', 'stock', 'cheap', 'expensive', 'best']
    order_keywords = ['order', 'status', 'delivery', 'shipment', 'tracking', 'shipped', 'arrive', 'when', 'get', 'ordered', 'purchase']
    return_keywords = ['return', 'refund', 'exchange', 'policy', 'send back']
    account_keywords = ['account', 'login', 'password', 'profile', 'register', 'sign up', 'my info', 'details']
    recommendation_keywords = ['recommend', 'suggest', 'best', 'cheapest', 'affordable', 'budget', 'good deal', 'low price']
    
    # Extract entities from message
    entities = extract_entities(user_message)
    
    # Determine intent and generate response
    response = ""
    
    # Check for product recommendations (new enhanced capability)
    if any(keyword in user_message for keyword in recommendation_keywords) or 'recommend' in user_message:
        response = generate_product_recommendations(user_message, user_context, entities)
    
    # Check for account-related queries (enhanced)
    elif any(keyword in user_message for keyword in account_keywords) or 'my' in user_message:
        response = generate_account_response(user_message, user_context)
    
    # Check for order-related queries (enhanced)
    elif any(keyword in user_message for keyword in order_keywords) or 'order' in user_message:
        response = generate_order_response(user_message, user_context)
    
    # Check for product-related queries (enhanced)
    elif any(keyword in user_message for keyword in product_keywords) or 'product' in user_message:
        response = generate_product_response(user_message, entities)
    
    # Check for return/refund queries (enhanced)
    elif any(keyword in user_message for keyword in return_keywords):
        response = generate_return_response(user_message, user_context)
    
    # Common greetings with personalization
    elif any(greeting in user_message for greeting in ['hello', 'hi ', 'hey', 'good morning', 'good afternoon', 'good evening']):
        user_name = user_context.get('name', 'there')
        response = f"Hello {user_name}! I'm your AI shopping assistant. How can I help you today? You can ask about products, orders, recommendations, or account information."
    
    # Shipping information
    elif 'shipping' in user_message or 'delivery' in user_message or 'arrive' in user_message or 'when' in user_message:
        response = "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Shipping costs depend on your location and selected method."
    
    # Help or general questions
    elif 'help' in user_message or 'support' in user_message or '?' in user_message:
        response = "I can help with: \n- Product information (prices, sizes, stock)\n- Order status and tracking\n- Return policies\n- Account issues\n- Product recommendations\n- Shipping information\n\nWhat specific information do you need?"
    
    # Default response
    else:
        response = "I'm your AI assistant. I can help with product information, order status, return policies, account support, and personalized recommendations. Could you please be more specific about what you need help with?"
    
    return jsonify({
        "reply": response,
        "timestamp": __import__('time').time(),
        "context": {
            "user_authenticated": bool(session_id and user_context),
            "intent_detected": detect_intent(user_message)
        }
    }), 200


# Helper functions for enhanced chatbot with security and authentication
def extract_entities(message):
    """Extract entities like product names, categories, prices from message"""
    entities = {
        "categories": [],
        "price_range": None,
        "keywords": []
    }
    
    # Common categories
    categories = ['men', 'women', 'kids', 'shirts', 'pants', 'dresses', 'shoes', 'accessories']
    for category in categories:
        if category in message:
            entities["categories"].append(category)
    
    # Extract price range if mentioned
    import re
    price_matches = re.findall(r'\$(\d+)', message)
    if price_matches:
        try:
            prices = [int(p) for p in price_matches]
            entities["price_range"] = {"min": min(prices), "max": max(prices)}
        except:
            pass
    
    # Extract keywords
    words = message.split()
    entities["keywords"] = [word for word in words if len(word) > 3]
    
    return entities


def detect_intent(message):
    """Detect the intent behind the user's message"""
    intents = []
    
    if any(word in message for word in ['recommend', 'suggest', 'best', 'good', 'affordable']):
        intents.append('recommendation')
    if any(word in message for word in ['order', 'status', 'tracking']):
        intents.append('order_status')
    if any(word in message for word in ['return', 'refund', 'exchange']):
        intents.append('return')
    if any(word in message for word in ['account', 'login', 'password']):
        intents.append('account')
    if any(word in message for word in ['product', 'item', 'price', 'stock']):
        intents.append('product_info')
        
    return intents if intents else ['general']


def authenticate_user_for_sensitive_data(session_id):
    """Authenticate user for accessing sensitive data"""
    if not session_id:
        return None, False  # No session, not authenticated
    
    user_id_str = redis_client.get(f"session:{session_id}")
    if not user_id_str:
        return None, False  # Invalid session
    
    try:
        user_object_id = ObjectId(user_id_str)
        user = users_collection.find_one({"_id": user_object_id})
        if user:
            return user, True  # Authenticated
        else:
            return None, False  # User not found
    except Exception as e:
        print(f"Error authenticating user: {e}")
        return None, False  # Error during authentication


def sanitize_output(text):
    """Sanitize output to prevent XSS and other security issues"""
    import html
    # Escape HTML characters
    sanitized = html.escape(text)
    # Limit output length to prevent abuse
    if len(sanitized) > 2000:
        sanitized = sanitized[:2000] + "... (response truncated)"
    return sanitized


def generate_product_recommendations(message, user_context, entities):
    """Generate personalized product recommendations"""
    try:
        # Get all products
        all_products = list(products_collection.find({"stockavailable": {"$gt": 0}}))
        
        # Filter by categories if mentioned
        filtered_products = all_products
        if entities.get("categories"):
            filtered_products = [p for p in all_products if any(cat in p.get('category', '').lower() for cat in entities["categories"])]
        
        # Sort by price (lowest first for budget queries)
        if 'cheap' in message or 'budget' in message or 'low price' in message:
            sorted_products = sorted(filtered_products, key=lambda x: x.get('price', 0))
            response = "Here are some affordable options for you:\n\n"
        # Sort by price (highest first for premium queries)
        elif 'expensive' in message or 'premium' in message:
            sorted_products = sorted(filtered_products, key=lambda x: x.get('price', 0), reverse=True)
            response = "Here are some premium options for you:\n\n"
        # Sort by best value (price/stock ratio or other heuristics)
        else:
            sorted_products = sorted(filtered_products, key=lambda x: x.get('price', 0))
            response = "Here are some great deals for you:\n\n"
        
        # Limit to top 5 recommendations
        top_products = sorted_products[:5]
        
        if not top_products:
            return sanitize_output("I couldn't find any products matching your criteria. Would you like me to search for something else?")
        
        # Format response with product details
        for i, product in enumerate(top_products, 1):
            stock_status = "In stock" if product.get('stockavailable', 0) > 10 else f"Only {product.get('stockavailable', 0)} left!"
            response += f"{i}. **{product['name']}** - ${product['price']:.2f}\n"
            response += f"   Category: {product.get('category', 'N/A')} | {stock_status}\n\n"
        
        response += "Would you like more details about any of these products?"
        return sanitize_output(response)
        
    except Exception as e:
        print(f"Error in product recommendations: {e}")
        return sanitize_output("I'm having trouble finding product recommendations right now. Please try again later.")


def generate_account_response(message, user_context):
    """Generate response for account-related queries"""
    if not user_context:
        return sanitize_output("To access account information, please log in to your account first.")
    
    try:
        user_name = user_context.get('name', 'there')
        role = user_context.get('role', 'user')
        
        # Handle different account queries
        if 'password' in message or 'reset' in message:
            return sanitize_output(f"Hi {user_name}, to reset your password, please use the 'Forgot Password' link on the login page. I can't directly access or change your password for security reasons.")
        elif 'details' in message or 'info' in message:
            order_count = user_context.get('order_count', 0)
            return sanitize_output(f"Here's your account information:\n\n- Name: {user_name}\n- Email: {user_context.get('email')}\n- Role: {role.capitalize()}\n- Total Orders: {order_count}\n\nYou can update your information in the settings section.")
        elif 'delete' in message:
            return sanitize_output(f"{user_name}, if you want to delete your account, you can do so in the settings section. Please note that this action is irreversible.")
        else:
            return sanitize_output(f"Hello {user_name}! What specific account information would you like to know? You can ask about your details, orders, or password reset.")
            
    except Exception as e:
        print(f"Error in account response: {e}")
        return sanitize_output("I'm having trouble accessing account information right now. Please try again later.")


def generate_order_response(message, user_context):
    """Generate response for order-related queries with proper authentication"""
    if not user_context:
        return sanitize_output("To access your order information, please log in to your account first.")
    
    try:
        user_orders = user_context.get('orders', [])
        
        if not user_orders:
            return sanitize_output("I don't see any orders associated with your account. Have you placed an order recently?")
        
        # Handle different order queries
        if 'status' in message or 'where' in message or 'track' in message:
            latest_order = user_orders[0]  # Assuming orders are sorted by date
            return sanitize_output(f"Your latest order (#{str(latest_order['_id'])[:8]}...) is currently **{latest_order.get('status', 'processing').capitalize()}**. Total amount: ${latest_order.get('total_amount', 0):.2f}")
        elif 'history' in message or 'all' in message:
            order_count = len(user_orders)
            response = f"You have {order_count} order(s) in your history:\n\n"
            for i, order in enumerate(user_orders[:5]):  # Show last 5 orders
                status = order.get('status', 'unknown').capitalize()
                amount = order.get('total_amount', 0)
                response += f"{i+1}. Order #{str(order['_id'])[:8]}... - ${amount:.2f} ({status})\n"
            return sanitize_output(response)
        else:
            return sanitize_output(f"I can help you with your order information. You have {len(user_orders)} order(s). Would you like to know the status of your latest order or see your order history?")
            
    except Exception as e:
        print(f"Error in order response: {e}")
        return sanitize_output("I'm having trouble accessing your order information right now. Please try again later.")


def generate_product_response(message, entities):
    """Generate response for product-related queries"""
    try:
        # Search for specific products if mentioned
        search_terms = entities.get("keywords", [])
        
        if search_terms:
            query = {"$or": []}
            for term in search_terms:
                query["$or"].extend([
                    {"name": {"$regex": term, "$options": "i"}},
                    {"description": {"$regex": term, "$options": "i"}},
                    {"category": {"$regex": term, "$options": "i"}}
                ])
            
            matching_products = list(products_collection.find(query).limit(10))
        else:
            # Get random products if no specific search terms
            matching_products = list(products_collection.find({"stockavailable": {"$gt": 0}}).limit(5))
        
        if not matching_products:
            return sanitize_output("I couldn't find any products matching your search. Could you try different keywords?")
        
        # Format response with product details
        if len(matching_products) == 1:
            product = matching_products[0]
            stock_status = "In stock" if product.get('stockavailable', 0) > 10 else f"Only {product.get('stockavailable', 0)} left!"
            return sanitize_output(f"Here's information about {product['name']}:\n\n- Price: ${product['price']:.2f}\n- Category: {product.get('category', 'N/A')}\n- {stock_status}\n- Description: {product.get('description', 'No description available.')[:100]}...")
        else:
            response = f"I found {len(matching_products)} product(s) that might interest you:\n\n"
            for i, product in enumerate(matching_products[:5]):
                stock_status = "In stock" if product.get('stockavailable', 0) > 10 else f"({product.get('stockavailable', 0)} left)"
                response += f"{i+1}. {product['name']} - ${product['price']:.2f} {stock_status}\n"
            return sanitize_output(response)
            
    except Exception as e:
        print(f"Error in product response: {e}")
        return sanitize_output("I'm having trouble finding product information right now. Please try again later.")


def generate_return_response(message, user_context):
    """Generate response for return-related queries"""
    return_policy = ("Our return policy allows returns within 30 days of purchase. "
                     "Items must be in original condition with tags attached. "
                     "To initiate a return:\n\n"
                     "1. Go to your order history\n"
                     "2. Select the order you want to return\n"
                     "3. Click 'Request Return'\n"
                     "4. Follow the instructions to ship the item back\n\n"
                     "Once we receive the item, we'll process your refund within 5-7 business days.")
    
    if 'how long' in message or 'when' in message:
        return sanitize_output("Refunds are typically processed within 5-7 business days after we receive the returned item.")
    elif 'shipping' in message:
        return sanitize_output("You're responsible for return shipping costs unless the return is due to our error. We recommend using a trackable shipping service.")
    else:
        return sanitize_output(return_policy)


@app.route('/healthz')
def healthz():
    return "OK", 200

