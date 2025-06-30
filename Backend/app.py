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
username = quote_plus(os.getenv("MONGO_USER", "admin"))
#password = quote_plus(os.getenv("MONGO_PASS", "admin@123"))
#mongo_host = os.getenv("MONGO_HOST", "localhost:27017")
#uri = f"mongodb://{username}:{password}@{mongo_host}/?retryWrites=true&w=majority&authSource=admin"

#os.getenv("MONGO_HOST", "localhost:27017")

#uri = os.getenv("MONGO_HOST")

uri= f"mongodb+srv://admin:g6XptAeuHn3Tvhwf@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
#f"mongodb+srv://admin:g6XptAeuHn3Tvhwf@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

#Bcrypt
bcrypt=Bcrypt(app)

# uri = os.getenv("MONGO_URL")
# print(f"Connecting to MongoDB at: {uri}")  # For debug



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



def get_user_email_from_session(session_id):
    user_id_str = redis_client.get(f"session:{session_id}")
    if user_id_str:
        try:
            user = users_collection.find_one({"_id": ObjectId(user_id_str)})
            if user and user.get('role') == 'admin': # Ensure only admins can add products
                return user.get('email')
        except Exception as e:
            print(f"Error fetching user by ObjectId in Product Service: {e}")
    return None

def get_cart_key(session_id):
    return f"cart:{session_id}"

# LOgin route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({"email": data['email']})
    
    if user and bcrypt.check_password_hash(user['password'], data['password']):
        session_id = str(uuid.uuid4())
        redis_client.set(f"session:{session_id}", str(user['_id']))
        return jsonify({"session_id": session_id}), 200
    
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
        "name": data['email'].split("@")[0]
    })
    return jsonify({"message": "User registered"}), 201

# GET PRODUCTS — with optional category filter and seller filter
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    seller_email = request.args.get('seller_email') 
    
    query = {}
    if category:
        query["category"] = category
    if seller_email:
        query["seller_email"] = seller_email 

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
        return jsonify({"error": "Unauthorized: Invalid session or not logged in as admin"}), 403

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

@app.route('/healthz')
def healthz():
    return "OK", 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) # Product Service on port 5002
