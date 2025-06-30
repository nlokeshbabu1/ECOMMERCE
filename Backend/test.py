from pymongo import MongoClient
import os

# Get Mongo URL from environment variable or hardcode for testing
MONGO_URL = f"mongodb+srv://admin:g6XptAeuHn3Tvhwf@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URL)
db = client['clothing_ecom']
collection = db['products']

# Fetch all products
products = collection.find()

print("Products:")
for product in products:
    print(product)