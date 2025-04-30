import pymongo


MONGODB_URI="mongodb+srv://ritanshu:Qwertyuiop%401@csis3750.auwttdg.mongodb.net/?retryWrites=true&w=majority&appName=csis3750"
DB_NAME = "test"  # Replace with your actual DB name

def fetch_data():
    # Connect to MongoDB
    client = pymongo.MongoClient(MONGODB_URI)
    db = client[DB_NAME]

    try:
        # Fetch all users
        users_collection = db["users"]
        users = list(users_collection.find({}))

        # Print the user documents
        print("Users:", users)

    except Exception as e:
        print("Error fetching data:", e)
    finally:
        # Close the connection
        client.close()

if __name__ == "__main__":
    fetch_data()
