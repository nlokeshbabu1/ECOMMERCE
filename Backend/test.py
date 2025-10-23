from pymongo import MongoClient
import os

# Get Mongo URL from environment variable or hardcode for testing
MONGO_URL = f"mongodb+srv://admin:LWTHHRv5HTvcRIXQ@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URL)
db = client['clothing_ecom']
#collection = db['products']

collection = db['users']

# Fetch all products
#products = collection.find()

users = collection.find()

print("users:")
#for product in products:
#    print(product)


for user in users:
    print(user)