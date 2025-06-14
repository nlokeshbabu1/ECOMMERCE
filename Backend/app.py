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
SellerRegister = db['SellerRegister']

# Bcrypt setup
bcrypt = Bcrypt(app)

# Redis Setup
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Helper Functions
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

# GET PRODUCTS — with optional category filter
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    query = {"category": category} if category else {}
    products = list(products_collection.find(query, {"_id": 0}))
    return jsonify(products)

#add product to Databases
@app.route('/api/addproducts', methods=['POST'])
def addproducts():
    data = request.json
    #adding productes into Mongodb
    products_collection.insert_one({
        "name": data['name'],
        "description": data['description'],
        "price": data['price'],
        "category": data['category'],
        "image_url": data.get('image_url', ''),
        "StockAvailable": data['StockAvailable'] 
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
