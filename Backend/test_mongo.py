from pymongo import MongoClient


uri= f"mongodb+srv://admin:g6XptAeuHn3Tvhwf@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
#f"mongodb+srv://admin:g6XptAeuHn3Tvhwf@cluster0.uyzde7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


print(uri)




mongo_client = MongoClient(uri)
db = mongo_client['clothing_ecom']
products_collection = db['products']
users_collection = db['users'] # Need users collection to verify seller email if session is not passed