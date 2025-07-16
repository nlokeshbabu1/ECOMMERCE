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
CORS(app) # Enable CORS for frontend communication

# MongoDB Setup (Product Service specific collections)
#os.getenv("MONGO_HOST", "localhost:27017")

#uri = os.getenv("MONGO_HOST")

# Using the provided hardcoded MongoDB URI.
# In a production environment, this should ideally be managed via environment variables for security.
uri = "mongodb+srv://admin:NGmKTeRyyEDi6zXy@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


#Bcrypt
bcrypt=Bcrypt(app)


mongo_client = MongoClient(uri)
db = mongo_client['clothing_ecom']
products_collection = db['products']
users_collection = db['users'] # Need users collection to verify seller email if session is not passed

# --- MongoDB Indexing ---
# Create an index on the 'category' field for faster filtering
products_collection.create_index("category")
print("MongoDB index on 'category' for products collection ensured.")

# Redis Setup (for session management and potential caching in the future)
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis_client = redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)


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

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    users_collection.insert_one({
        "email": data['email'],
        "password": hashed_pw,
        "name": data['email'].split("@")[0],
        "role": "user" # Explicitly set role for regular users
    })
    return jsonify({"message": "User registered successfully"}), 201

# GET PRODUCTS — with optional category filter and seller filter
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    session_id = request.args.get('session_id') # Pass session ID for role-based filtering

    query = {}
    
    # Optional filter by category
    if category:
        query["category"] = category

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
    
    products_cursor = products_collection.find(query)
    products = []
    for product in products_cursor:
        product['_id'] = str(product['_id']) # Convert ObjectId to string
        products.append(product)

    return jsonify(products)


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


@app.route('/healthz')
def healthz():
    return "OK", 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) # Product Service on port 5000 (Monolithic)
