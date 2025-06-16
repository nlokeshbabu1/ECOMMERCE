# Flask Backend Code (server/app.py)
from datetime import date
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
import redis
import uuid
import os
from urllib.parse import quote_plus
from flask_bcrypt import Bcrypt
from bson.objectid import ObjectId # Import ObjectId for querying by _id

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("API_SECRETS_KEY", "fallback-secret")

# MongoDB Setup
username = quote_plus(os.getenv("MONGO_USER", "admin"))
password = quote_plus(os.getenv("MONGO_PASS", "admin@123"))
uri = f"mongodb+srv://{username}:{password}@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongo_client = MongoClient(uri)
db = mongo_client['clothing_ecom']
users_collection = db['users']
products_collection = db['products']
seller_collection = db['SellerRegister'] # This collection is not used in the provided routes.

# Bcrypt setup
bcrypt = Bcrypt(app)

# Redis Setup
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Helper Functions
def get_cart_key(session_id):
    return f"cart:{session_id}"

# Helper to get user email from session ID
def get_user_email_from_session(session_id):
    user_id_str = redis_client.get(f"session:{session_id}")
    if user_id_str:
        try:
            # MongoDB stores _id as ObjectId, so convert string back to ObjectId for lookup
            user = users_collection.find_one({"_id": ObjectId(user_id_str)})
            if user:
                return user.get('email')
        except Exception as e:
            print(f"Error fetching user by ObjectId: {e}")
    return None

# Login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({"email": data['email']})
    
    if user and bcrypt.check_password_hash(user['password'], data['password']):
        session_id = str(uuid.uuid4())
        # Store user's MongoDB _id in Redis, associated with the session_id
        redis_client.set(f"session:{session_id}", str(user['_id']))
        return jsonify({
            "session_id": session_id,
            "role": user.get('role', "user"), # Safely get role, default to "user"
            "user_email": user.get('email') # Return user's email for frontend use
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

# REGISTER ROUTE 
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 409

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    users_collection.insert_one({
        "email": data['email'],
        "password": hashed_pw,
        "name": data['email'].split("@")[0],
        "role": "user" # Explicitly set role for regular users
    })
    return jsonify({"message": "User registered"}), 201

# Registration for seller 
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
        'role': 'admin',   # Changed role from 'seller' to 'admin' to match frontend expectation
        'SellerName': data['SellerName'],
        'SellerPhone': data['SellerPhone'],
        'SellerGSTNumber': data['SellerGSTNumber'],
        'SellerAddres': data['SellerAddres']
    })
    return jsonify({"message": "Seller registered successfully"}), 201


# GET PRODUCTS — with optional category filter and seller filter
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    seller_email = request.args.get('seller_email') # New parameter for seller-specific products
    
    query = {}
    if category:
        query["category"] = category
    if seller_email:
        query["seller_email"] = seller_email # Filter by seller email

    # Fetch products, convert ObjectId to string for JSON serialization
    products_cursor = products_collection.find(query)
    products = []
    for product in products_cursor:
        product['_id'] = str(product['_id']) # Convert ObjectId to string
        products.append(product)
    
    return jsonify(products)

#add product to Databases
@app.route('/api/addproducts', methods=['POST'])
def addproducts():
    data = request.json
    session_id = data.get('session_id') # Get session_id from frontend
    
    # Authenticate and get seller's email using session_id
    seller_email = get_user_email_from_session(session_id)
    if not seller_email:
        return jsonify({"error": "Unauthorized: Invalid session or not logged in as seller"}), 403

    # Adding products into Mongodb
    products_collection.insert_one({
        "name": data['name'],
        "description": data['description'],
        "price": data['price'],
        "category": data['category'],
        "image": data.get('image', ''), 
        "stockavailable": data['stockAvailable'], 
        "size": data.get('size', ''),
        "seller_email": seller_email # Associate product with the seller's email
    })
    return jsonify({"message": "Product added successfully"}), 201

# ADD TO CART
@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    session_id = data['session_id']
    product_id = data['product_id']
    quantity = int(data['quantity'])
    cart_key = get_cart_key(session_id)
    redis_client.hincrby(cart_key, product_id, quantity)
    return jsonify({"message": "Item added to cart"})

# GET CART
@app.route('/api/cart/<session_id>', methods=['GET'])
def get_cart(session_id):
    cart_key = get_cart_key(session_id)
    cart = redis_client.hgetall(cart_key)
    return jsonify(cart)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
